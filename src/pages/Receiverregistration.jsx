import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { createRequest } from '../services/api';
import './Receiverregistration.css';

const ReceiverRegistration = () => {
  const navigate = useNavigate();
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
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
          pincode: formData.pincode
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
      setSuccess(true);
      setTimeout(() => {
        navigate('/receiver-dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Request Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your blood request has been submitted. Nearby donors will be notified.
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
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Receiver Registration
          </h1>
          <p className="text-xl text-gray-600">
            Submit your blood requirement and find donors
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
            {/* Patient Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Patient Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter patient's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group Required *
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
                    Units Required *
                  </label>
                  <input
                    type="number"
                    name="unitsRequired"
                    value={formData.unitsRequired}
                    onChange={handleChange}
                    required
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Number of units (1-10)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level *
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {urgencyLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required By *
                  </label>
                  <input
                    type="date"
                    name="requiredBy"
                    value={formData.requiredBy}
                    onChange={handleChange}
                    required
                    min={getMinDate()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Hospital Information */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Hospital Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter hospital name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
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
                    name="city"
                    value={formData.city}
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
                    name="state"
                    value={formData.state}
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
                    name="pincode"
                    value={formData.pincode}
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

            {/* Contact Person */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contact Person
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="10-digit mobile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relation to Patient
                  </label>
                  <input
                    type="text"
                    name="relation"
                    value={formData.relation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Father, Mother"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Additional Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Any additional information"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  id="terms"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I confirm that all information provided is accurate. I understand this request will be shared with registered blood donors.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting Request...' : 'Submit Blood Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiverRegistration;
