import React, { useState } from 'react';
import { registerDonor } from '../services/api';
import { toast } from 'react-toastify';
import './DonorForm.css';

const DonorForm = ({ onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Eligibility, 2: Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    age: '',
    gender: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    lastDonationDate: '',
    isAvailable: true,
  });

  const [eligibility, setEligibility] = useState({
    ageEligible: false,
    weightEligible: false,
    healthyEligible: false,
    noRecentDonation: false,
    noMedication: false,
    noChronicIllness: false,
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const eligibilityQuestions = [
    {
      key: 'ageEligible',
      question: 'Are you between 18-65 years of age?',
    },
    {
      key: 'weightEligible',
      question: 'Do you weigh at least 50 kg (110 lbs)?',
    },
    {
      key: 'healthyEligible',
      question: 'Are you in good health today?',
    },
    {
      key: 'noRecentDonation',
      question: 'Has it been at least 3 months since your last blood donation?',
    },
    {
      key: 'noMedication',
      question: 'Are you not currently taking antibiotics or any major medications?',
    },
    {
      key: 'noChronicIllness',
      question: 'Are you free from chronic illnesses (diabetes, heart disease, etc.)?',
    },
  ];

  const handleEligibilityChange = (key, value) => {
    setEligibility({
      ...eligibility,
      [key]: value,
    });
  };

  const checkEligibility = () => {
    const allEligible = Object.values(eligibility).every((value) => value === true);
    if (allEligible) {
      setStep(2);
      toast.success('✓ You are eligible to donate blood!');
    } else {
      toast.error(
        '⚠️ Based on your responses, you may not be eligible to donate at this time. Please consult with a healthcare professional.'
      );
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const donorData = {
        name: formData.name,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        age: parseInt(formData.age),
        gender: formData.gender,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        lastDonationDate: formData.lastDonationDate || undefined,
        isAvailable: formData.isAvailable,
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            donorData.location = {
              type: 'Point',
              coordinates: [
                position.coords.longitude,
                position.coords.latitude,
              ],
            };
            await submitDonor(donorData);
          },
          async (error) => {
            console.log('Location not available:', error);
            await submitDonor(donorData);
          }
        );
      } else {
        await submitDonor(donorData);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to register as donor'
      );
    }
  };

  const submitDonor = async (donorData) => {
    await registerDonor(donorData);
    toast.success('Successfully registered as donor!');
    if (onSuccess) onSuccess();
  };

  // Render eligibility checklist
  if (step === 1) {
    return (
      <div className="donor-form-page">
        <div className="donor-form eligibility-form">
          <h2>🩺 Health Eligibility Checklist</h2>
          <p className="eligibility-intro">
            Before you register as a blood donor, please answer these questions to
            ensure you are eligible to donate blood safely.
          </p>

          <div className="eligibility-questions">
            {eligibilityQuestions.map((item, index) => (
              <div key={item.key} className="eligibility-item">
                <p className="eligibility-question">
                  {index + 1}. {item.question}
                </p>
                <div className="eligibility-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={item.key}
                      checked={eligibility[item.key] === true}
                      onChange={() => handleEligibilityChange(item.key, true)}
                    />
                    <span className="radio-text">Yes</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={item.key}
                      checked={eligibility[item.key] === false}
                      onChange={() => handleEligibilityChange(item.key, false)}
                    />
                    <span className="radio-text">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="eligibility-note">
            <p>
              ℹ️ <strong>Note:</strong> These questions help ensure the safety of
              both donors and recipients. If you have any concerns, please consult
              with a healthcare professional.
            </p>
          </div>

          <button
            type="button"
            onClick={checkEligibility}
            className="btn btn-primary"
          >
            Continue to Registration
          </button>
        </div>
      </div>
    );
  }

  // Render registration form
  return (
    <div className="donor-form-page">
      <form onSubmit={handleSubmit} className="donor-form">
        <h2>Donor Registration Form</h2>

        <div className="form-row">
          <div className="form-group">
            <label>Full Name: *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Phone: *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="form-control"
              placeholder="Enter 10-digit phone number"
            />
          </div>
        </div>

        <div className="form-row">
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
            <label>Age: *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="18"
              max="65"
              required
              className="form-control"
              placeholder="Enter your age"
            />
          </div>

          <div className="form-group">
            <label>Gender: *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Street Address:</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
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

        <div className="form-group">
          <label>Last Donation Date (if any):</label>
          <input
            type="date"
            name="lastDonationDate"
            value={formData.lastDonationDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="form-control"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
            />
            I am available to donate blood
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="btn btn-secondary"
          >
            ← Back to Eligibility
          </button>
          <button type="submit" className="btn btn-primary">
            Register as Donor
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonorForm;