import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin, Search, Filter, AlertCircle } from 'lucide-react';
import { API_URL, requestAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Viewalldonors.css';

const Viewalldonors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [requestingDonorId, setRequestingDonorId] = useState('');

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view donors');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/donors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle both array response and object with donors property
        if (data.success !== undefined) {
          // Backend returns: { success: true, count: X, donors: [...] }
          setDonors(data.donors || []);
          setFilteredDonors(data.donors || []);
        } else if (Array.isArray(data)) {
          // Backend returns array directly
          setDonors(data);
          setFilteredDonors(data);
        } else {
          setDonors([]);
          setFilteredDonors([]);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch donors');
        setDonors([]);
        setFilteredDonors([]);
      }
    } catch (error) {
      console.error('Error fetching donors:', error);
      setError('Network error. Please check your connection.');
      setDonors([]);
      setFilteredDonors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterDonors = useCallback(() => {
    let filtered = donors;

    // Filter by blood group
    if (bloodGroupFilter !== 'All') {
      filtered = filtered.filter(donor => donor.bloodGroup === bloodGroupFilter);
    }

    // Filter by availability
    if (availabilityFilter === 'Available') {
      filtered = filtered.filter(donor => donor.isAvailable === true);
    } else if (availabilityFilter === 'Unavailable') {
      filtered = filtered.filter(donor => donor.isAvailable === false);
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(donor =>
        (donor.user?.name || donor.name || '').toLowerCase().includes(lowerSearchTerm) ||
        (donor.address?.city && donor.address.city.toLowerCase().includes(lowerSearchTerm)) ||
        (donor.address?.state && donor.address.state.toLowerCase().includes(lowerSearchTerm)) ||
        ((donor.user?.phone || donor.phone || '').includes(searchTerm))
      );
    }

    setFilteredDonors(filtered);
  }, [availabilityFilter, bloodGroupFilter, donors, searchTerm]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setBloodGroupFilter('All');
    setAvailabilityFilter('All');
  };

  useEffect(() => {
    if (user?.role && user.role !== 'receiver') {
      navigate('/donor-dashboard');
      return;
    }

    fetchDonors();
  }, [fetchDonors, navigate, user]);

  useEffect(() => {
    filterDonors();
  }, [filterDonors]);

  const handleRequestBlood = async (donorId) => {
    if (user?.role !== 'receiver') {
      alert('Only receivers can send donor requests.');
      return;
    }

    if (!donorId) {
      alert('Unable to send request because donor ID is missing.');
      return;
    }

    try {
      setRequestingDonorId(donorId);
      await requestAPI.createDonorRequest(donorId);
      alert('Blood request sent successfully.');
      navigate('/receiver-dashboard');
    } catch (error) {
      console.error('Error requesting blood:', error);
      alert(error.response?.data?.message || 'Failed to send blood request.');
    } finally {
      setRequestingDonorId('');
    }
  };

  if (loading) {
    return (
      <div className="donors-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading donors...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'receiver') {
    return null;
  }

  if (error) {
    return (
      <div className="donors-page">
        <div className="error-container">
          <AlertCircle size={48} color="#ef4444" />
          <h3>Error Loading Donors</h3>
          <p>{error}</p>
          <button onClick={fetchDonors} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="donors-page">
      <div className="donors-container">
        <div className="page-header">
          <h1>
            <Droplets className="header-icon" />
            All Blood Donors
          </h1>
          <p>Find and connect with blood donors in your area</p>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, location, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="blood-group-filters">
            <Filter size={20} />
            <span>Blood Group:</span>
            <div className="filter-buttons">
              {bloodGroups.map((group) => (
                <button
                  key={group}
                  className={`filter-btn ${bloodGroupFilter === group ? 'active' : ''}`}
                  onClick={() => setBloodGroupFilter(group)}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="availability-filters">
            <span>Availability:</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${availabilityFilter === 'All' ? 'active' : ''}`}
                onClick={() => setAvailabilityFilter('All')}
              >
                All
              </button>
              <button
                className={`filter-btn ${availabilityFilter === 'Available' ? 'active' : ''}`}
                onClick={() => setAvailabilityFilter('Available')}
              >
                Available
              </button>
              <button
                className={`filter-btn ${availabilityFilter === 'Unavailable' ? 'active' : ''}`}
                onClick={() => setAvailabilityFilter('Unavailable')}
              >
                Unavailable
              </button>
            </div>
          </div>

          {(searchTerm || bloodGroupFilter !== 'All' || availabilityFilter !== 'All') && (
            <button onClick={handleClearFilters} className="clear-filters-btn">
              Clear All Filters
            </button>
          )}
        </div>

        <div className="results-count">
          Showing {filteredDonors.length} of {donors.length} {filteredDonors.length === 1 ? 'donor' : 'donors'}
        </div>

        {filteredDonors.length === 0 ? (
          <div className="empty-state">
            <Droplets size={64} color="#9ca3af" />
            <h3>No donors found</h3>
            <p>
              {donors.length === 0 
                ? 'No donors registered yet' 
                : 'Try adjusting your search or filter criteria'}
            </p>
            {(searchTerm || bloodGroupFilter !== 'All' || availabilityFilter !== 'All') && (
              <button onClick={handleClearFilters} className="clear-btn">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="donors-grid">
            {filteredDonors.map((donor) => (
              <div key={donor._id} className="donor-card">
                <div className="donor-header">
                  <div className="donor-avatar">
                    <Droplets size={32} />
                  </div>
                  <div className="donor-info">
                    <h3>{donor.user?.name || donor.name}</h3>
                    <span className={`blood-badge blood-${donor.bloodGroup.replace('+', 'pos').replace('-', 'neg')}`}>
                      {donor.bloodGroup}
                    </span>
                  </div>
                </div>

                <div className="donor-details">
                  {/* Age and Gender */}
                  {(donor.age || donor.gender) && (
                    <div className="detail-row">
                      <span className="detail-label">
                        {donor.age && `${donor.age} years`}
                        {donor.age && donor.gender && ' • '}
                        {donor.gender}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {donor.address && (donor.address.city || donor.address.state) && (
                    <div className="detail-row">
                      <MapPin size={18} />
                      <span>
                        {donor.address.city}{donor.address.city && donor.address.state ? ', ' : ''}{donor.address.state}
                        {donor.address.pincode && ` - ${donor.address.pincode}`}
                      </span>
                    </div>
                  )}

                  {/* Phone */}
                  <div className="detail-row">
                    <Phone size={18} />
                    <a href={`tel:${donor.user?.phone || donor.phone}`} className="contact-link">
                      {donor.user?.phone || donor.phone}
                    </a>
                  </div>

                  {/* Email - Check both donor.user.email and donor.email */}
                  {(donor.user?.email || donor.email) && (
                    <div className="detail-row">
                      <Mail size={18} />
                      <a href={`mailto:${donor.user?.email || donor.email}`} className="contact-link">
                        {donor.user?.email || donor.email}
                      </a>
                    </div>
                  )}

                  {/* Donation Count */}
                  {donor.donationCount > 0 && (
                    <div className="detail-row donation-info">
                      <span className="donation-badge">
                        🩸 {donor.donationCount} {donor.donationCount === 1 ? 'donation' : 'donations'}
                      </span>
                    </div>
                  )}

                  {/* Last Donation Date */}
                  {donor.lastDonationDate && (
                    <div className="detail-row">
                      <span className="last-donation">
                        Last donated: {new Date(donor.lastDonationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {/* Availability Status */}
                  <div className="availability-status">
                    <span className={`status-indicator ${donor.isAvailable ? 'available' : 'unavailable'}`}>
                      {donor.isAvailable ? '● Available' : '● Not Available'}
                    </span>
                  </div>

                  {/* Verified Badge */}
                  {donor.isVerified && (
                    <div className="verified-badge">
                      ✓ Verified Donor
                    </div>
                  )}

                  <div className="detail-row">
                    <button
                      className="request-blood-btn"
                      onClick={() => handleRequestBlood(donor._id)}
                      disabled={!donor.isAvailable || requestingDonorId === donor._id}
                    >
                      <span className="request-blood-btn-text">
                        {requestingDonorId === donor._id ? 'Requesting...' : 'Request Blood'}
                      </span>
                      <span className="request-blood-btn-glow"></span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewalldonors;
