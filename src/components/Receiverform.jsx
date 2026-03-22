import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Receiverform.css';

const Receiverregistration = ({ onSuccess, editMode = false, existingData = null }) => {
  const [formData, setFormData] = useState(
    existingData || {
      patientName: '',
      bloodGroup: '',
      unitsRequired: '',
      hospitalName: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      urgency: 'Medium',
      requiredBy: '',
      notes: '',
      isEmergency: false,
    }
  );

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleEmergencyToggle = () => {
    const isEmergency = !formData.isEmergency;
    setFormData({
      ...formData,
      isEmergency,
      urgency: isEmergency ? 'Critical' : 'Medium',
    });

    if (isEmergency) {
      toast.info('🚨 Emergency mode activated - request will be highlighted');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        unitsRequired: parseInt(formData.unitsRequired),
        hospitalName: formData.hospitalName,
        hospitalAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        contactPerson: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
        urgency: formData.urgency,
        requiredBy: formData.requiredBy,
        notes: formData.notes,
        isEmergency: formData.isEmergency,
      };

      // Get coordinates if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            requestData.hospitalAddress.coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            await submitRequest(requestData);
          },
          async (error) => {
            console.log('Location not available:', error);
            await submitRequest(requestData);
          }
        );
      } else {
        await submitRequest(requestData);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to submit blood request'
      );
    }
  };

  const submitRequest = async (requestData) => {
    const token = localStorage.getItem('token');
    const url = editMode
      ? `http://localhost:5000/api/requests/${existingData._id}`
      : 'http://localhost:5000/api/requests';
    const method = editMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit request');
    }

    toast.success(
      editMode
        ? 'Blood request updated successfully!'
        : 'Blood request submitted successfully!'
    );
    if (onSuccess) onSuccess();

    // Reset form if not in edit mode
    if (!editMode) {
      setFormData({
        patientName: '',
        bloodGroup: '',
        unitsRequired: '',
        hospitalName: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        urgency: 'Medium',
        requiredBy: '',
        notes: '',
        isEmergency: false,
      });
    }
  };

  return (
    <div className="receiver-form-page">
      <form onSubmit={handleSubmit} className="receiver-form">
        <div className="form-header">
          <h2>{editMode ? 'Edit Blood Request' : 'Blood Request Form'}</h2>
          <button
            type="button"
            onClick={handleEmergencyToggle}
            className={`emergency-toggle ${formData.isEmergency ? 'active' : ''}`}
          >
            {formData.isEmergency ? '🚨 Emergency Mode ON' : '⚪ Mark as Emergency'}
          </button>
        </div>

        {formData.isEmergency && (
          <div className="emergency-banner">
            <span className="emergency-icon">🚨</span>
            <div>
              <strong>Emergency Request Active</strong>
              <p>This request will be highlighted to all donors for urgent attention</p>
            </div>
          </div>
        )}

        {/* Patient Information */}
        <div className="section-title">Patient Information</div>

        <div className="form-row">
          <div className="form-group">
            <label>Patient Name: *</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter patient's full name"
            />
          </div>

          <div className="form-group">
            <label>Blood Group Required: *</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Units Required: *</label>
            <input
              type="number"
              name="unitsRequired"
              value={formData.unitsRequired}
              onChange={handleChange}
              min="1"
              max="10"
              required
              className="form-control"
              placeholder="Enter number of units"
            />
          </div>
        </div>

        {/* Hospital Information */}
        <div className="section-title">Hospital Information</div>

        <div className="form-group">
          <label>Hospital Name: *</label>
          <input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Enter hospital name"
          />
        </div>

        <div className="form-group">
          <label>Street Address: *</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Enter street address"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City: *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter city"
            />
          </div>

          <div className="form-group">
            <label>State: *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter state"
            />
          </div>

          <div className="form-group">
            <label>Pincode: *</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              pattern="[0-9]{6}"
              className="form-control"
              placeholder="Enter 6-digit pincode"
            />
          </div>
        </div>

        {/* Contact Person Information */}
        <div className="section-title">Contact Person Details</div>

        <div className="form-row">
          <div className="form-group">
            <label>Contact Person Name: *</label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter contact person's name"
            />
          </div>

          <div className="form-group">
            <label>Contact Phone: *</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="form-control"
              placeholder="Enter 10-digit phone number"
            />
          </div>

          <div className="form-group">
            <label>Contact Email:</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Request Details */}
        <div className="section-title">Request Details</div>

        <div className="form-row">
          <div className="form-group">
            <label>Urgency Level: *</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              required
              className="form-control"
              disabled={formData.isEmergency}
            >
              {urgencyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {formData.isEmergency && (
              <small className="form-hint">
                Urgency is set to Critical in emergency mode
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Required By Date: *</label>
            <input
              type="date"
              name="requiredBy"
              value={formData.requiredBy}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Additional Notes:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="form-control"
            placeholder="Add any additional information or special requirements..."
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {editMode ? 'Update Blood Request' : 'Submit Blood Request'}
        </button>
      </form>
    </div>
  );
};

export default Receiverregistration;