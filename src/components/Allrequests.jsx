import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllRequests.css';

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    urgency: '',
    status: ''
  });

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      
      if (filters.bloodGroup) queryParams.append('bloodGroup', filters.bloodGroup);
      if (filters.urgency) queryParams.append('urgency', filters.urgency);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await axios.get(`/api/requests?${queryParams.toString()}`);
      
      if (response.data.success) {
        // Filter out any requests without user data
        const validRequests = response.data.data.filter(req => req.user);
        setRequests(validRequests);
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Error fetching requests');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  // Format date
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get urgency badge color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'critical';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return '';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Approved': return 'approved';
      case 'Fulfilled': return 'fulfilled';
      case 'Rejected': return 'rejected';
      case 'Cancelled': return 'cancelled';
      default: return '';
    }
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = (phone, patientName, bloodGroup) => {
    if (!phone) {
      alert('Phone number not available');
      return;
    }
    const message = `Hi, I'm contacting you regarding the blood donation request for ${patientName} (${bloodGroup}). I'd like to help.`;
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle Email click
  const handleEmailClick = (email, patientName, bloodGroup, requestId) => {
    if (!email) {
      alert('Email address not available');
      return;
    }
    const subject = `Blood Donation Response - ${patientName} (${bloodGroup})`;
    const body = `Dear Sir/Madam,

I am writing in response to your blood donation request for ${patientName} requiring ${bloodGroup} blood.

Request ID: ${requestId}

I would like to help with this request. Please let me know the next steps.

Best regards`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      bloodGroup: '',
      urgency: '',
      status: ''
    });
  };

  if (loading) {
    return (
      <div className="all-requests-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading blood requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-requests-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchRequests} className="btn-retry">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="all-requests-container">
      <div className="header">
        <h1>
          <i className="fas fa-hand-holding-medical"></i>
          All Blood Requests
        </h1>
        <p className="subtitle">Help save lives by responding to blood donation requests</p>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="bloodGroup">Blood Group</label>
          <select 
            id="bloodGroup"
            name="bloodGroup" 
            value={filters.bloodGroup} 
            onChange={handleFilterChange}
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="urgency">Urgency</label>
          <select 
            id="urgency"
            name="urgency" 
            value={filters.urgency} 
            onChange={handleFilterChange}
          >
            <option value="">All Urgencies</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status">Status</label>
          <select 
            id="status"
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
        </div>

        <button onClick={clearFilters} className="btn-clear-filters">
          <i className="fas fa-times"></i>
          Clear Filters
        </button>
      </div>

      {/* Results Count */}
      <div className="results-count">
        <p>Showing <strong>{requests.length}</strong> request{requests.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="no-requests">
          <i className="fas fa-inbox"></i>
          <p>No blood requests found</p>
          <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => {
            // Safety checks for nested objects
            const userName = request.user?.name || 'Anonymous';
            const userEmail = request.user?.email || null;
            const contactPhone = request.contactPerson?.phone || '';
            const contactName = request.contactPerson?.name || 'N/A';
            const contactRelation = request.contactPerson?.relation || '';
            const hospitalName = request.hospital?.name || 'N/A';
            const hospitalCity = request.hospital?.city || 'N/A';

            return (
              <div key={request._id} className="request-card">
                <div className="card-header">
                  <div className="blood-group-badge">
                    <i className="fas fa-tint"></i>
                    <span>{request.bloodGroup}</span>
                  </div>
                  <div className="badges">
                    <span className={`badge urgency-${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                    <span className={`badge status-${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="patient-info">
                    <h3>{request.patientName}</h3>
                    <p className="reason">{request.reason}</p>
                  </div>

                  <div className="info-grid">
                    <div className="info-item">
                      <i className="fas fa-hospital"></i>
                      <div>
                        <strong>Hospital</strong>
                        <p>{hospitalName}</p>
                        <p className="address">{hospitalCity}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <i className="fas fa-flask"></i>
                      <div>
                        <strong>Units Required</strong>
                        <p>{request.unitsRequired} unit{request.unitsRequired > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <i className="fas fa-calendar-alt"></i>
                      <div>
                        <strong>Required By</strong>
                        <p>{formatDate(request.requiredBy)}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <i className="fas fa-user"></i>
                      <div>
                        <strong>Contact Person</strong>
                        <p>{contactName}</p>
                        {contactRelation && <p className="relation">({contactRelation})</p>}
                      </div>
                    </div>
                  </div>

                  {request.user && (
                    <div className="posted-info">
                      <p>
                        <i className="fas fa-clock"></i>
                        Posted by <strong>{userName}</strong> on {formatDate(request.createdAt)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button 
                    className="btn-contact whatsapp"
                    onClick={() => handleWhatsAppClick(
                      contactPhone, 
                      request.patientName, 
                      request.bloodGroup
                    )}
                    disabled={request.status === 'Fulfilled' || request.status === 'Cancelled' || !contactPhone}
                    title={!contactPhone ? 'Phone number not available' : 'Contact via WhatsApp'}
                  >
                    <i className="fab fa-whatsapp"></i>
                    WhatsApp
                  </button>

                  <button 
                    className="btn-contact email"
                    onClick={() => handleEmailClick(
                      userEmail, 
                      request.patientName, 
                      request.bloodGroup,
                      request._id
                    )}
                    disabled={request.status === 'Fulfilled' || request.status === 'Cancelled' || !userEmail}
                    title={!userEmail ? 'Email not available' : 'Send email'}
                  >
                    <i className="fas fa-envelope"></i>
                    Email
                  </button>

                  <a 
                    href={contactPhone ? `tel:${contactPhone}` : '#'}
                    className="btn-contact phone"
                    onClick={(e) => {
                      if (!contactPhone) {
                        e.preventDefault();
                        alert('Phone number not available');
                      }
                    }}
                    title={!contactPhone ? 'Phone number not available' : 'Call now'}
                  >
                    <i className="fas fa-phone"></i>
                    Call
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllRequests;