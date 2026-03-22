import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import './Viewbloodrequests.css';

const Viewbloodrequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view blood requests');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle both array response and object with requests property
        if (data.success !== undefined) {
          // Backend returns: { success: true, count: X, requests: [...] }
          setRequests(data.requests || []);
        } else if (Array.isArray(data)) {
          // Backend returns array directly
          setRequests(data);
        } else {
          setRequests([]);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch blood requests');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Network error. Please check your connection.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        const token = localStorage.getItem('token');
        
        // Use the cancel endpoint
        const response = await fetch(`http://localhost:5000/api/requests/${requestId}/cancel`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          alert('Request cancelled successfully.');
          fetchRequests(); // Refresh the list
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to cancel request.');
        }
      } catch (error) {
        console.error('Error cancelling request:', error);
        alert('An error occurred while cancelling the request.');
      }
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          alert('Request deleted successfully.');
          fetchRequests(); // Refresh the list
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete request.');
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('An error occurred while deleting the request.');
      }
    }
  };

  const isUserRequest = (request) => {
    // Check if the request belongs to the current user
    if (!user || !request.user) return false;
    
    // Handle both populated and non-populated user field
    const requestUserId = typeof request.user === 'object' ? request.user._id : request.user;
    return requestUserId === user._id;
  };

  const getUrgencyLevel = (request) => {
    // Return urgency level, with emergency cases treated as critical
    if (request.urgency === 'Critical') return 'Critical';
    return request.urgency || 'Medium';
  };

  if (loading) {
    return (
      <div className="requests-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading blood requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="requests-page">
        <div className="error-container">
          <AlertCircle size={48} color="#ef4444" />
          <h3>Error Loading Requests</h3>
          <p>{error}</p>
          <button onClick={fetchRequests} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="requests-page">
      <div className="requests-container">
        <div className="page-header">
          <h1>
            <FileText className="header-icon" />
            Active Blood Requests
          </h1>
          <p>Connect with people who need blood donations</p>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{requests.length}</span>
            <span className="stat-label">Total Requests</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {requests.filter(r => getUrgencyLevel(r) === 'Critical').length}
            </span>
            <span className="stat-label">Critical</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {requests.filter(r => r.status === 'Active').length}
            </span>
            <span className="stat-label">Active</span>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} color="#9ca3af" />
            <h3>No blood requests found</h3>
            <p>There are currently no active blood donation requests</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((request) => (
              <div 
                key={request._id} 
                className={`request-card ${getUrgencyLevel(request) === 'Critical' ? 'critical-card' : ''}`}
              >
                {getUrgencyLevel(request) === 'Critical' && (
                  <div className="emergency-badge">
                    <AlertCircle size={16} />
                    CRITICAL
                  </div>
                )}

                <div className="request-header">
                  <div>
                    <h3>{request.patientName}</h3>
                    <span className={`blood-badge blood-${request.bloodGroup.replace('+', 'pos').replace('-', 'neg')}`}>
                      {request.bloodGroup}
                    </span>
                  </div>
                  <span className={`urgency-badge urgency-${getUrgencyLevel(request).toLowerCase()}`}>
                    {getUrgencyLevel(request)}
                  </span>
                </div>

                <div className="request-body">
                  <div className="info-row">
                    <strong>Units Needed:</strong>
                    <span>{request.unitsRequired} {request.unitsRequired === 1 ? 'unit' : 'units'}</span>
                  </div>

                  <div className="info-row">
                    <strong>Required By:</strong>
                    <span>{new Date(request.requiredBy).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>

                  <div className="info-row">
                    <strong>Status:</strong>
                    <span className={`status-badge status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="hospital-info">
                    <h4>Hospital Details</h4>
                    <p><strong>{request.hospitalName}</strong></p>
                    <p className="address">
                      <MapPin size={16} />
                      {request.hospitalAddress.street}, {request.hospitalAddress.city}, {request.hospitalAddress.state} - {request.hospitalAddress.pincode}
                    </p>
                  </div>

                  <div className="contact-info">
                    <h4>Contact Person</h4>
                    <p><strong>{request.contactPerson.name}</strong></p>
                    <div className="contact-links">
                      <a href={`tel:${request.contactPerson.phone}`} className="contact-btn phone-btn">
                        <Phone size={16} />
                        {request.contactPerson.phone}
                      </a>
                      {request.contactPerson.email && (
                        <a href={`mailto:${request.contactPerson.email}`} className="contact-btn email-btn">
                          <Mail size={16} />
                          {request.contactPerson.email}
                        </a>
                      )}
                    </div>
                  </div>

                  {request.notes && (
                    <div className="notes-section">
                      <h4>Additional Notes</h4>
                      <p>{request.notes}</p>
                    </div>
                  )}

                  <div className="request-meta">
                    <small>Posted {new Date(request.createdAt).toLocaleDateString()}</small>
                    {isUserRequest(request) && (
                      <span className="my-request-tag">Your Request</span>
                    )}
                  </div>

                  {/* Action buttons for request owner */}
                  {user?.role === 'receiver' && isUserRequest(request) && request.status === 'Active' && (
                    <div className="request-actions">
                      <button 
                        className="cancel-btn"
                        onClick={() => handleCancelRequest(request._id)}
                      >
                        Cancel Request
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteRequest(request._id)}
                      >
                        Delete Request
                      </button>
                    </div>
                  )}

                  {/* Show delete option for cancelled/expired requests */}
                  {user?.role === 'receiver' && isUserRequest(request) && 
                   (request.status === 'Cancelled' || request.status === 'Expired') && (
                    <div className="request-actions">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteRequest(request._id)}
                      >
                        Delete Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewbloodrequests;