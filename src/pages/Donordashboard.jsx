import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { donorAPI, requestAPI } from '../services/api';
import { Droplets, MapPin, Phone, Activity, AlertCircle, Mail } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import './Donordashboard.css';

const REQUEST_POLL_INTERVAL = 5000;

const Donordashboard = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [donorProfile, setDonorProfile] = useState(null);
  const [donorRequests, setDonorRequests] = useState([]);
  const [error, setError] = useState('');
  const attemptedAvatarRefresh = useRef(false);

  const loadDonorRequests = useCallback(async ({ silent = false } = {}) => {
    try {
      const response = await requestAPI.getDonorRequests();
      setDonorRequests(response.data.requests || []);

      if (!silent) {
        setError('');
      }

      return response.data.requests || [];
    } catch (err) {
      if (!silent) {
        throw err;
      }

      return [];
    }
  }, []);

  const downloadCertificate = async (requestId) => {
    if (!requestId) {
      alert('Unable to download certificate because request ID is missing.');
      return;
    }

    try {
      const response = await requestAPI.downloadCertificate(requestId);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `blood-donation-certificate-${requestId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download certificate.');
    }
  };

  useEffect(() => {
    if (user?.profilePhoto) {
      attemptedAvatarRefresh.current = false;
      return;
    }

    if (
      user?.role === 'donor' &&
      user?.providers?.includes('google') &&
      !user?.profilePhoto &&
      !attemptedAvatarRefresh.current
    ) {
      attemptedAvatarRefresh.current = true;
      refreshUser();
    }
  }, [refreshUser, user]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [profileResponse, requestsResponse] = await Promise.allSettled([
        donorAPI.getMyProfile(),
        loadDonorRequests()
      ]);

      let nextDonorProfile = null;
      let nextRequests = [];
      let profileErrorMessage = '';

      if (profileResponse.status === 'fulfilled') {
        nextDonorProfile = profileResponse.value.data.donor;
      } else if (profileResponse.reason?.response?.status !== 404) {
        profileErrorMessage = profileResponse.reason?.response?.data?.message || 'Failed to load donor profile.';
      }

      if (requestsResponse.status === 'fulfilled') {
        nextRequests = requestsResponse.value || [];
      } else {
        throw requestsResponse.reason;
      }

      // Some request payloads already include the assigned donor document.
      // Use it as a fallback so incoming requests remain actionable.
      if (!nextDonorProfile && nextRequests.length > 0) {
        nextDonorProfile = nextRequests.find((request) => request?.donor)?.donor || null;
      }

      setDonorProfile(nextDonorProfile);
      setDonorRequests(nextRequests);

      if (profileErrorMessage && !nextDonorProfile) {
        setError(profileErrorMessage);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [loadDonorRequests]);

  useEffect(() => {
    if (!user || user.role !== 'donor') {
      navigate('/');
      return;
    }

    loadDashboard();
  }, [user, navigate, loadDashboard]);

  useEffect(() => {
    if (user?.role !== 'donor') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadDonorRequests({ silent: true });
    }, REQUEST_POLL_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [user, loadDonorRequests]);

  const handleAvailabilityToggle = async () => {
    if (!donorProfile) return;

    try {
      const response = await donorAPI.updateDonor(donorProfile._id, {
        isAvailable: !donorProfile.isAvailable
      });

      setDonorProfile(response.data.donor);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability.');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!requestId) {
      alert('Unable to accept request because request ID is missing.');
      return;
    }

    try {
      await requestAPI.acceptRequest(requestId);
      alert('Request accepted successfully.');
      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.');
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

  const getAssignedDonorId = (request) => {
    const donorRef = request.donor || request.acceptedDonor || request.fulfilledBy;
    return typeof donorRef === 'object' ? donorRef?._id : donorRef;
  };

  const getVisibleRequests = () => {
    return donorRequests;
  };

  const getRequestAction = (request) => {
    const normalizedStatus = getNormalizedStatus(request.status);
    const assignedDonorId = getAssignedDonorId(request);

    if (normalizedStatus === 'requested') {
      return (
        <button onClick={() => handleAcceptRequest(request._id)} className="btn-accept">
          Accept Request
        </button>
      );
    }

    if (normalizedStatus === 'accepted' && assignedDonorId === donorProfile?._id) {
      return (
        <button className="btn-accept" disabled>
          Waiting for completion
        </button>
      );
    }

    if (normalizedStatus === 'accepted') {
      return (
        <button className="btn-accept" disabled>
          Already Accepted
        </button>
      );
    }

    if (normalizedStatus === 'completed' && assignedDonorId === donorProfile?._id) {
      return (
        <button onClick={() => downloadCertificate(request._id)} className="btn-accept">
          {request.certificateGeneratedAt ? 'Retrieve Certificate' : 'Generate Certificate'}
        </button>
      );
    }

    if (normalizedStatus === 'completed') {
      return (
        <button className="btn-accept" disabled>
          Completed
        </button>
      );
    }

    if (normalizedStatus === 'Cancelled' || normalizedStatus === 'Expired') {
      return (
        <button className="btn-accept" disabled>
          Closed
        </button>
      );
    }

    return null;
  };

  const visibleRequests = getVisibleRequests();
  if (loading) {
    return (
      <div className="donor-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!donorProfile) {
    return (
      <div className="donor-dashboard">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              <Droplets className="title-icon" />
              Donor Dashboard
            </h1>
            <p className="dashboard-subtitle">Complete your donor profile to start helping nearby patients.</p>
          </div>

          <div className="empty-state">
            <div className="empty-icon">O+</div>
            <h3>No donor profile yet</h3>
            <p>{error || 'Your account is ready. You just need to finish your donor registration.'}</p>
            <button onClick={() => navigate('/donor-registration')} className="create-request-btn">
              Complete Donor Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <Droplets className="title-icon" />
            Donor Dashboard
          </h1>
          <p className="dashboard-subtitle">Welcome back, {user?.name}.</p>
        </div>

        {error && (
          <div className="dashboard-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="profile-section">
          <h2>My Profile</h2>
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <UserAvatar
                  user={user}
                  size={78}
                  imageClassName="profile-avatar-image"
                  fallbackClassName="profile-avatar-fallback"
                />
              </div>
              <div className="profile-info">
                <h2>{donorProfile.name}</h2>
                <p className="profile-role">Blood Donor</p>
                <span className="profile-blood-group">{donorProfile.bloodGroup}</span>
              </div>
            </div>

            <div className="profile-content-stack">
              <div className="profile-details profile-details-primary">
                <div className="detail-item">
                  <Mail size={18} />
                  <span>{user?.email || 'No email available'}</span>
                </div>
                <div className="detail-item">
                  <Phone size={18} />
                  <span>{donorProfile.phone}</span>
                </div>
                <div className="detail-item">
                  <MapPin size={18} />
                  <span>{donorProfile.address?.city}, {donorProfile.address?.state}</span>
                </div>
                <div className="detail-item">
                  <Activity size={18} />
                  <span>{donorProfile.isAvailable ? 'Available to Donate' : 'Currently Unavailable'}</span>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="info-item">
                  <div className="info-item-header">
                    <span className="info-label">Name</span>
                  </div>
                  <span className="info-value">{donorProfile.name}</span>
                </div>
                <div className="info-item">
                  <div className="info-item-header">
                    <span className="info-label">Blood Group</span>
                  </div>
                  <span className="info-value blood-group">{donorProfile.bloodGroup}</span>
                </div>
                <div className="info-item">
                  <div className="info-item-header">
                    <Phone size={18} />
                    <span className="info-label">Phone</span>
                  </div>
                  <span className="info-value">{donorProfile.phone}</span>
                </div>
                <div className="info-item">
                  <div className="info-item-header">
                    <span className="info-label">Age</span>
                  </div>
                  <span className="info-value">{donorProfile.age} years</span>
                </div>
                <div className="info-item">
                  <div className="info-item-header">
                    <MapPin size={18} />
                    <span className="info-label">Location</span>
                  </div>
                  <span className="info-value">
                    {donorProfile.address?.city}, {donorProfile.address?.state}
                  </span>
                </div>
                <div className="info-item">
                  <div className="info-item-header">
                    <Activity size={18} />
                    <span className="info-label">Status</span>
                  </div>
                  <span className={`info-value ${donorProfile.isAvailable ? 'available' : 'unavailable'}`}>
                    {donorProfile.isAvailable ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>

              <div className="availability-toggle">
                <button onClick={handleAvailabilityToggle} className="toggle-btn">
                  {donorProfile.isAvailable ? 'Mark as Unavailable' : 'Mark as Available'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon donations-icon">
              <Droplets size={24} />
            </div>
            <div className="stat-content">
              <h3>{donorProfile.donationCount || 0}</h3>
              <p>Total Donations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>{donorRequests.filter((request) => getNormalizedStatus(request.status) === 'requested').length}</h3>
              <p>Requested</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon fulfilled-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{donorRequests.filter((request) => getNormalizedStatus(request.status) === 'completed').length}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        <div className="requests-section">
          <div className="section-header">
            <h2>Incoming Requests</h2>
            <button onClick={loadDashboard} className="refresh-btn">
              Refresh
            </button>
          </div>

          {visibleRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">*</div>
              <h3>No requests right now</h3>
              <p>Check back later to see new blood requests.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {visibleRequests.filter((request) => request?._id).map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-header">
                    <h3>{request.receiver?.name || request.patientName || 'Receiver Request'}</h3>
                    <span className="urgency-badge urgency-medium">
                      {getNormalizedStatus(request.status)}
                    </span>
                  </div>

                  <div className="request-details">
                    <div className="detail-row">
                      <span className="detail-label">Receiver</span>
                      <span className="detail-value">{request.receiver?.name || 'Unknown'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Receiver Email</span>
                      <span className="detail-value">{request.receiver?.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Receiver Phone</span>
                      <span className="detail-value">{request.receiver?.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Blood Group</span>
                      <span className="blood-group-badge">{request.donor?.bloodGroup || request.bloodGroup}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Requested On</span>
                      <span className="detail-value">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status</span>
                      <span className="detail-value">
                        {getNormalizedStatus(request.status)}
                      </span>
                    </div>
                  </div>

                  <div className="request-actions">
                    {getRequestAction(request)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Donordashboard;
