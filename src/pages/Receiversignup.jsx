import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Lock, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const ReceiverSignup = () => {
  const navigate = useNavigate();
  const { signup, googleAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: '',
    password: '',
    confirmPassword: '',
    role: 'receiver'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatSignupError = (message) => {
    const errorMessage = message || 'Signup failed. Please try again.';
    const lower = errorMessage.toLowerCase();

    if (lower.includes('already have an account as')) {
      return errorMessage;
    }

    if (lower.includes('email address and mobile number')) {
      return 'An account with this email id already exists.';
    }

    if (lower.includes('account with this email id already exists') || lower.includes('email address is already registered') || lower.includes('email already')) {
      return 'An account with this email id already exists.';
    }

    if (lower.includes('mobile number is already registered') || lower.includes('phone number')) {
      return 'This mobile number is already registered. Please use a different mobile number.';
    }

    return errorMessage;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      const result = await signup(signupData);
      
      if (result.success) {
        navigate('/receiver-dashboard');
      } else {
        setError(formatSignupError(result.message));
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle network or server errors
      if (err.response) {
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Signup failed';
        setError(formatSignupError(errorMessage));
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credential) => {
    setError('');

    setLoading(true);

    try {
      const result = await googleAuth({
        credential,
        role: 'receiver',
        intent: 'signup'
      });

      if (result.success && result.user) {
        navigate('/receiver-dashboard');
      } else {
        setError(formatSignupError(result.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--app-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', transition: 'background-color 0.3s ease' }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
              }}>
                <Heart style={{ width: '48px', height: '48px', color: '#ffffff' }} />
              </div>
            </div>
            <h2 style={{ fontSize: '30px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Become a Receiver
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              Register to request blood when you need it
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ 
              marginBottom: '24px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              padding: '12px 16px', 
              borderRadius: '8px'
            }}>
              <AlertCircle style={{ width: '20px', height: '20px', marginRight: '8px', marginTop: '2px', flexShrink: 0, color: '#dc2626' }} />
              <div>
                <span style={{ color: 'inherit', fontSize: '14px', display: 'block' }}>{error}</span>
                {(error.toLowerCase().includes('already exists') || error.toLowerCase().includes('already registered')) && (
                  <Link 
                    to="/login" 
                    style={{ 
                      color: '#3b82f6', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      textDecoration: 'underline',
                      marginTop: '4px',
                      display: 'inline-block'
                    }}
                  >
                    Go to Login →
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  style={{ 
                    width: '100%',
                    paddingLeft: '40px',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    background: 'var(--surface-bg)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  style={{ 
                    width: '100%',
                    paddingLeft: '40px',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    background: 'var(--surface-bg)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  style={{ 
                    width: '100%',
                    paddingLeft: '40px',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    background: 'var(--surface-bg)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="10-digit phone number"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                Profile Picture URL (Optional)
              </label>
              <input
                id="profilePhoto"
                name="profilePhoto"
                type="url"
                value={formData.profilePhoto}
                onChange={handleChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  background: 'var(--surface-bg)',
                  color: 'var(--text-primary)'
                }}
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  style={{ 
                    width: '100%',
                    paddingLeft: '40px',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    background: 'var(--surface-bg)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  style={{ 
                    width: '100%',
                    paddingLeft: '40px',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    background: 'var(--surface-bg)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '24px' }}>
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                style={{ width: '16px', height: '16px', marginTop: '4px', color: '#3b82f6', borderRadius: '4px', border: '1px solid var(--surface-border)', accentColor: '#3b82f6' }}
              />
              <label htmlFor="terms" style={{ marginLeft: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>
                I agree to the{' '}
                <button type="button" style={{ color: '#3b82f6', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Terms and Conditions</button>
                {' '}and{' '}
                <button type="button" style={{ color: '#3b82f6', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Privacy Policy</button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ 
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Receiver Account'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 18px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
            </div>

            <GoogleAuthButton
              text="signup_with"
              onCredential={handleGoogleSignup}
              disabled={loading}
            />

            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                  Login
                </Link>
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                Want to donate blood?{' '}
                <Link to="/donor-signup" style={{ color: '#dc2626', fontWeight: 600, textDecoration: 'none' }}>
                  Sign up as Donor
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiverSignup;
