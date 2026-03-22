import React, { useState } from 'react';
import { Search as SearchIcon, MapPin, Phone, Mail, Droplets, AlertCircle } from 'lucide-react';
import { donorAPI } from '../services/api';

const openWhatsApp = (phone) => {
  window.open(`https://wa.me/${phone}`, '_blank');
};

const openEmailClient = (email) => {
  window.location.href = `mailto:${email}`;
};


const Search = () => {
  const [searchParams, setSearchParams] = useState({
    bloodGroup: '',
    city: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchParams.bloodGroup) {
      setError('Please select a blood group');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const params = {
        bloodGroup: searchParams.bloodGroup,
        ...(searchParams.city && { city: searchParams.city })
      };

      const response = await donorAPI.searchDonors(params);
      setResults(response.data.donors || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--app-bg)', padding: '48px 16px', transition: 'background-color 0.3s ease' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Search Blood Donors
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>
            Find blood donors near you by blood group and location
          </p>
        </div>

        {/* Search Form */}
        <div
          className="card"
          style={{
            marginBottom: '32px',
            maxWidth: '620px',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '32px',
            borderRadius: '28px',
            border: '1px solid var(--surface-border)',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
            background: 'linear-gradient(180deg, var(--surface-bg) 0%, var(--surface-muted) 100%)'
          }}
        >
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gap: '22px', marginBottom: '24px' }}>
              <div>
                <label
                  className="form-label"
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  Blood Group *
                </label>
                <select
                  name="bloodGroup"
                  value={searchParams.bloodGroup}
                  onChange={handleChange}
                  required
                  className="form-input"
                  style={{
                    width: '100%',
                    minHeight: '58px',
                    borderRadius: '18px',
                    border: '1.5px solid var(--surface-border)',
                    padding: '0 18px',
                    fontSize: '16px',
                    background: 'var(--surface-bg)',
                    color: 'var(--text-primary)',
                    boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="form-label"
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  City (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                  <input
                    name="city"
                    type="text"
                    value={searchParams.city}
                    onChange={handleChange}
                    className="form-input"
                    style={{
                      width: '100%',
                      minHeight: '58px',
                      paddingLeft: '46px',
                      borderRadius: '18px',
                      border: '1.5px solid var(--surface-border)',
                      fontSize: '16px',
                      background: 'var(--surface-bg)',
                      color: 'var(--text-primary)',
                      boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)'
                    }}
                    placeholder="Enter city name"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                <AlertCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: '58px',
                borderRadius: '18px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 45%, #991b1b 100%)',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 800,
                boxShadow: '0 18px 34px rgba(220, 38, 38, 0.22)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <SearchIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              {loading ? 'Searching...' : 'Search Donors'}
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Searching for donors...</p>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <Droplets style={{ width: '64px', height: '64px', color: '#9ca3af', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No Donors Found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              No donors found for {searchParams.bloodGroup}
              {searchParams.city && ` in ${searchParams.city}`}
            </p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Found {results.length} Donor{results.length !== 1 && 's'}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Results for {searchParams.bloodGroup}
                {searchParams.city && ` in ${searchParams.city}`}
              </p>
            </div>

            <div className="grid" style={{ display: 'grid', gap: '24px' }}>
              {results.map((donor) => (
                <div key={donor._id} className="card hover-shadow">
                  <div style={{ display: 'flex', flexDirection: window.innerWidth >= 768 ? 'row' : 'column', justifyContent: 'space-between', gap: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {donor.user?.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>
                            <MapPin style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                            <span>{donor.address?.city}, {donor.address?.state}</span>
                          </div>
                          {donor.distance && (
                            <span className="badge badge-blue" style={{ fontSize: '12px' }}>
                              {donor.distance} away
                            </span>
                          )}
                        </div>
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', borderRadius: '12px', padding: '16px', textAlign: 'center', minWidth: '100px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <Droplets style={{ width: '32px', height: '32px', color: '#dc2626', margin: '0 auto 8px' }} />
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>
                            {donor.bloodGroup}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 640 ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone</div>
                          <button
                            onClick={() => openWhatsApp(donor.user?.phone, `Hi ${donor.user?.name}, I need ${searchParams.bloodGroup} blood. Can you help?`)}
                            style={{ display: 'flex', alignItems: 'center', color: '#059669', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 0' }}
                          >
                            <Phone style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                            {donor.user?.phone}
                          </button>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</div>
                          <button
                            onClick={() => openEmailClient(donor.user?.email, 'Blood Donation Request', `Dear ${donor.user?.name},\n\nI need ${searchParams.bloodGroup} blood urgently. Can you please help?\n\nThank you.`)}
                            style={{ display: 'flex', alignItems: 'center', color: '#dc2626', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 0', wordBreak: 'break-all' }}
                          >
                            <Mail style={{ width: '16px', height: '16px', marginRight: '4px', flexShrink: 0 }} />
                            {donor.user?.email}
                          </button>
                        </div>
                      </div>

                      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--surface-border)' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          <strong>Address:</strong> {donor.address?.street}, {donor.address?.city}, {donor.address?.state} - {donor.address?.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;
