import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../services/api';
import { Heart, Users, FileText, PlusCircle, Phone, Mail } from 'lucide-react';
import './Receiverdashboard.css';

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [receiverRequests, setReceiverRequests] = useState([]);

  useEffect(() => {
    if (user?.role !== 'receiver') {
      navigate('/');
      return;
    }
    fetchMyRequests();
  }, [user, navigate]);

  const fetchMyRequests = async () => {
    try {
      const response = await requestAPI.getReceiverRequests();
      setReceiverRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const getNormalizedStatus = (status) => {
    switch (status) {
      case 'Active':
        return 'requested';
      case 'Accepted':
        return 'accepted';
      case 'Fulfilled':
        return 'completed';
      case 'pending':
        return 'requested';
      default:
        return status;
    }
  };

  const getAssignedDonorName = (request) => {
    return request.donor?.name || request.acceptedDonor?.name || request.fulfilledBy?.name || '';
  };

  const renderRequestAction = (request) => {
    const normalizedStatus = getNormalizedStatus(request.status);

    if (normalizedStatus === 'accepted') {
      return (
        <button
          className="cancel-request-btn"
          onClick={() => handleCompleteRequest(request._id)}
        >
          Received Blood
        </button>
      );
    }

    if (normalizedStatus === 'completed') {
      return (
        <button className="cancel-request-btn" disabled>
          Completed
        </button>
      );
    }

    if (normalizedStatus === 'Cancelled' || normalizedStatus === 'Expired') {
      return (
        <button className="cancel-request-btn" disabled>
          Request Closed
        </button>
      );
    }

    return null;
  };

  const handleCompleteRequest = async (requestId) => {
    if (!requestId) {
      alert('Unable to complete request because request ID is missing.');
      return;
    }

    try {
      await requestAPI.completeRequest(requestId);
      alert('Blood marked as received successfully. The donor can now retrieve the certificate from the donor dashboard.');
      await fetchMyRequests();
    } catch (error) {
      console.error('Error completing request:', error);
      alert(error.response?.data?.message || 'Failed to mark request as completed.');
    }
  };

  if (!user || user.role !== 'receiver') {
    return null;
  }

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'R';

  return (
    <div className="receiver-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              <Heart className="title-icon" />
              Receiver Dashboard
            </h1>
            <p className="dashboard-subtitle">Welcome back, {user.name}!</p>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="profile-avatar-image"
                />
              ) : (
                <span className="profile-avatar-fallback">{userInitial}</span>
              )}
            </div>
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p className="profile-role">Blood Receiver</p>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="detail-item">
              <Mail size={18} />
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <Phone size={18} />
              <span>{user.phone}</span>
            </div>
          </div>
        </div>

        <div className="quick-actions-grid">
          <div 
            className="action-card action-card-primary"
            onClick={() => navigate('/receiver-registration')}
          >
            <div className="action-icon">
              <PlusCircle size={32} />
            </div>
            <h3>Create Blood Request</h3>
            <p>Submit a new blood donation request</p>
          </div>

          <div 
            className="action-card action-card-secondary"
            onClick={() => navigate('/view-all-donors')}
          >
            <div className="action-icon">
              <Users size={32} />
            </div>
            <h3>View All Donors</h3>
            <p>Browse registered blood donors</p>
          </div>

          <div 
            className="action-card action-card-success"
            onClick={fetchMyRequests}
          >
            <div className="action-icon">
              <FileText size={32} />
            </div>
            <h3>My Blood Requests</h3>
            <p>View and manage your requests</p>
          </div>
        </div>

        <div className="my-requests-section">
          <h3>My Donor Requests ({receiverRequests.length})</h3>
          {receiverRequests.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} color="#9ca3af" />
              <p>You haven't requested blood from any donor yet.</p>
              <button 
                className="create-request-btn"
                onClick={() => navigate('/view-all-donors')}
              >
                Request From Donors
              </button>
            </div>
          ) : (
            <div className="requests-grid">
              {receiverRequests.filter((request) => request?._id).map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-header">
                    <h4>{getAssignedDonorName(request) || 'Selected Donor'}</h4>
                    <span className={`blood-badge blood-${request.bloodGroup.replace('+', 'pos').replace('-', 'neg')}`}>
                      {request.donor?.bloodGroup || request.bloodGroup}
                    </span>
                  </div>
                  <div className="request-details">
                    <p><strong>Donor:</strong> {getAssignedDonorName(request) || 'Unknown'}</p>
                    <p><strong>Status:</strong> {getNormalizedStatus(request.status)}</p>
                    <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                    {request.completedAt && (
                      <p><strong>Completed On:</strong> {new Date(request.completedAt).toLocaleDateString()}</p>
                    )}
                    {request.certificateGeneratedAt && (
                      <p><strong>Certificate Ready:</strong> {new Date(request.certificateGeneratedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  {renderRequestAction(request)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiverDashboard;
