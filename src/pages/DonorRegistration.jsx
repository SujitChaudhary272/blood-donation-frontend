import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, AlertCircle, CheckCircle } from 'lucide-react';
import { donorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DonorRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bloodGroup: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      coordinates: {
        lat: null,
        lng: null
      }
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingDonor, setCheckingDonor] = useState(true);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Other'];

  const checkExistingDonor = useCallback(async () => {
    try {
      await donorAPI.getMyProfile();
      setError('You are already registered as a donor. Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/donor-dashboard');
      }, 2000);
    } catch (err) {
      setCheckingDonor(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkExistingDonor();
  }, [checkExistingDonor]);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const donorPayload = {
        name: user?.name,
        phone: user?.phone,
        bloodGroup: formData.bloodGroup,
        age: calculateAge(formData.dateOfBirth),
        gender: formData.gender,
        address: formData.address
      };

      await donorAPI.createDonor(donorPayload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/donor-dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingDonor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for registering as a blood donor. You're now part of our life-saving community.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl">
        <div className="text-center mb-8">
          <Droplets className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Register as Blood Donor
          </h1>
          <p className="text-xl text-gray-600">
            Join our community of life-savers
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select blood group</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    min="45"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Minimum 45 kg"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Address Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select state</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{6}"
                    maxLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Submit */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  id="terms"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I confirm that I am above 18 years old, weigh at least 45 kg, and am in good health. I agree to the terms and conditions of blood donation.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register as Donor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonorRegistration;
