import React, { useState, useEffect } from 'react';
import { FileText, Droplets, MapPin, Phone, AlertCircle, Clock } from 'lucide-react';
import { requestAPI, openWhatsApp, openEmailClient } from '../services/api';

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await requestAPI.getAllRequests();
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'badge-yellow',
      Approved: 'badge-blue',
      Fulfilled: 'badge-green',
      Rejected: 'badge-red',
      Cancelled: 'badge-gray'
    };
    return colors[status] || 'badge-gray';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      Low: 'badge-green',
      Medium: 'badge-yellow',
      High: 'badge-orange',
      Critical: 'badge-red'
    };
    return colors[urgency] || 'badge-gray';
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb', padding: '48px 16px' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            All Blood Requests
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280' }}>
            View and respond to blood donation requests
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['all', 'Pending', 'Approved', 'Fulfilled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className="btn"
              style={{
                backgroundColor: filter === status ? '#dc2626' : 'white',
                color: filter === status ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                padding: '8px 24px'
              }}
            >
              {status === 'all' ? 'All Requests' : status}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <FileText style={{ width: '64px', height: '64px', color: '#9ca3af', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              No Requests Found
            </h3>
            <p style={{ color: '#6b7280' }}>
              {filter === 'all' ? 'No blood requests available' : `No ${filter} requests`}
            </p>
          </div>
        ) : (
          <div className="grid" style={{ display: 'grid', gap: '24px' }}>
            {filteredRequests.map((request) => (
              <div key={request._id} className="card hover-shadow">
                <div style={{ display: 'flex', flexDirection: window.innerWidth >= 768 ? 'row' : 'column', gap: '24px' }}>
                  {/* Blood Group Badge */}
                  <div style={{ backgroundColor: '#fee2e2', borderRadius: '12px', padding: '24px', textAlign: 'center', minWidth: '120px', height: 'fit-content' }}>
                    <Droplets style={{ width: '48px', height: '48px', color: '#dc2626', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
                      {request.bloodGroup}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {request.unitsRequired} unit{request.unitsRequired !== 1 && 's'}
                    </div>
                  </div>

                  {/* Request Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                          {request.patientName}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          Request by: {request.user?.name}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className={`badge ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`badge ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </div>
                    </div>

                    <div className="grid" style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(2, 1fr)' : '1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                          <MapPin style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                          <span><strong>Hospital:</strong> {request.hospital.name}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginLeft: '20px' }}>
                          {request.hospital.address}, {request.hospital.city}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                          <Clock style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                          <span><strong>Required By:</strong> {new Date(request.requiredBy).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginLeft: '20px' }}>
                          Created: {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: 600 }}>Reason:</div>
                      <div style={{ fontSize: '14px', color: '#374151' }}>{request.reason}</div>
                    </div>

                    {/* Contact Information */}
                    <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 600 }}>
                        Contact Person: {request.contactPerson.name} ({request.contactPerson.relation})
                      </div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => openWhatsApp(request.contactPerson.phone, `Hi ${request.contactPerson.name}, I can help with ${request.bloodGroup} blood donation for ${request.patientName}.`)}
                          style={{ display: 'flex', alignItems: 'center', color: '#059669', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <Phone style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                          {request.contactPerson.phone}
                        </button>
                        <button
                          onClick={() => openEmailClient(request.user?.email, `Blood Donation for ${request.patientName}`, `Hi,\n\nI can help with ${request.bloodGroup} blood donation.\n\nPlease contact me.\n\nThank you.`)}
                          style={{ display: 'flex', alignItems: 'center', color: '#dc2626', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          Email: {request.user?.email}
                        </button>
                      </div>
                    </div>
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

export default AllRequests;