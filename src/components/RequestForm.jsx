import React, { useState } from 'react';
import { createRequest } from '../services/api';
import { toast } from 'react-toastify';
import './RequestForm.css';

const RequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
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
    relation: '',
    urgency: 'Medium',
    requiredBy: '',
    notes: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
          relation: formData.relation,
        },
        urgency: formData.urgency,
        requiredBy: formData.requiredBy,
        notes: formData.notes,
      };

      await createRequest(requestData);
      toast.success('Blood request submitted successfully!');
      
      // Reset form
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
        relation: '',
        urgency: 'Medium',
        requiredBy: '',
        notes: '',
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="request-form">
      <h2>Request Blood</h2>

      <div className="form-section">
        <h3>Patient Information</h3>
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
            />
          </div>

          <div className="form-group">
            <label>Blood Group: *</label>
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
              required
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Hospital Information</h3>
        <div className="form-group">
          <label>Hospital Name: *</label>
          <input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Street Address:</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="form-control"
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
            />
          </div>

          <div className="form-group">
            <label>Pincode:</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Contact Person</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Name: *</label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Phone: *</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Relation to Patient:</label>
            <input
              type="text"
              name="relation"
              value={formData.relation}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Request Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Urgency: *</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              required
              className="form-control"
            >
              {urgencyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Required By: *</label>
            <input
              type="date"
              name="requiredBy"
              value={formData.requiredBy}
              onChange={handleChange}
              required
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
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Submit Request
      </button>
    </form>
  );
};

export default RequestForm;