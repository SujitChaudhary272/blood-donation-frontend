import React, { useEffect, useRef, useState } from "react";
import { searchDonors, getNearbyBloodBanks } from "../services/api";
import "./SearchBlood.css";

const SearchBlood = () => {
  /* ===================== STATE ===================== */
  const [searchType, setSearchType] = useState("donors");
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useLocation, setUseLocation] = useState(false);

  /* ===================== REFS ===================== */
  const cityInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  /* ===================== CONSTANTS ===================== */
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  /* ===================== SEARCH LOGIC ===================== */
  const performSearch = async ({ latitude = null, longitude = null } = {}) => {
    try {
      const params = { bloodGroup };

      if (latitude && longitude) {
        params.latitude = latitude;
        params.longitude = longitude;
        params.maxDistance = 50000; // 50 km
      } else if (city) {
        params.city = city;
      }

      let response;

      if (searchType === "donors") {
        response = await searchDonors(params);
      } else {
        response = await getNearbyBloodBanks(params);
      }

      setResults(response?.data || []);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
    }
  };

  /* ===================== GOOGLE LOCATION AUTOCOMPLETE ===================== */
  useEffect(() => {
    if (useLocation) return;
    if (!cityInputRef.current) return;

    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || autocompleteRef.current) {
        return;
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        cityInputRef.current,
        {
          types: ["(cities)"], // city-level suggestions
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) return;

        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();

        setCity(place.formatted_address || "");
        performSearch({ latitude, longitude });
      });
    };

    initAutocomplete();
  }, [useLocation]);

  /* ===================== FORM SUBMIT ===================== */
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!bloodGroup) {
      alert("Please select a blood group");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      if (useLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await performSearch({ latitude, longitude });
            setLoading(false);
          },
          async () => {
            alert("Location access denied. Searching by city.");
            await performSearch();
            setLoading(false);
          }
        );
      } else {
        await performSearch();
        setLoading(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="search-blood">
      <h2>Search for Blood</h2>

      <form onSubmit={handleSearch} className="search-form">
        {/* SEARCH TYPE */}
        <div className="form-group">
          <label>Search Type:</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="form-control"
          >
            <option value="donors">Donors</option>
            <option value="bloodbanks">Blood Banks</option>
          </select>
        </div>

        {/* BLOOD GROUP */}
        <div className="form-group">
          <label>Blood Group: *</label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="form-control"
            required
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {/* CITY / LOCATION */}
        <div className="form-group">
          <label>City / Location:</label>
          <input
            ref={cityInputRef}
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Start typing city name..."
            className="form-control"
            disabled={useLocation}
          />
        </div>

        {/* USE CURRENT LOCATION */}
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={useLocation}
              onChange={(e) => setUseLocation(e.target.checked)}
            />{" "}
            Use my current location
          </label>
        </div>

        {/* SUBMIT */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="search-results">
          <h3>Search Results ({results.length})</h3>

          <div className="results-grid">
            {results.map((result) => (
              <div key={result._id} className="result-card">
                {searchType === "donors" ? (
                  <>
                    <h4>{result.name}</h4>
                    <p><strong>Blood Group:</strong> {result.bloodGroup}</p>
                    <p><strong>Age:</strong> {result.age}</p>
                    <p><strong>Gender:</strong> {result.gender}</p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {result.address?.city}, {result.address?.state}
                    </p>
                    <p><strong>Phone:</strong> {result.phone}</p>
                    <p>
                      <strong>Available:</strong>{" "}
                      {result.isAvailable ? "Yes" : "No"}
                    </p>
                  </>
                ) : (
                  <>
                    <h4>{result.name}</h4>
                    <p>
                      <strong>Location:</strong>{" "}
                      {result.address?.city}, {result.address?.state}
                    </p>
                    <p><strong>Phone:</strong> {result.phone}</p>
                    <p><strong>Email:</strong> {result.email}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && bloodGroup && (
        <div className="no-results">
          <p>No results found. Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SearchBlood;
