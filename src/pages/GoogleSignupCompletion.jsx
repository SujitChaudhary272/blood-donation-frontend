import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GoogleSignupCompletion = () => {
  const navigate = useNavigate();
  const { user, loading, completeGoogleSignup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: user.name || '',
      phone: user.phone || ''
    }));
  }, [user]);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    if (!user.needsProfileCompletion) {
      if (user.role === 'receiver') {
        navigate('/receiver-dashboard', { replace: true });
        return;
      }

      navigate('/donor-dashboard', { replace: true });
    }
  }, [loading, navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);

    const result = await completeGoogleSignup({
      name: formData.name.trim(),
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });

    setSaving(false);

    if (!result.success || !result.user) {
      setError(result.message || 'Failed to complete Google signup');
      return;
    }

    if (result.user.role === 'receiver') {
      navigate('/receiver-dashboard', { replace: true });
      return;
    }

    navigate('/donor-dashboard', { replace: true });
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--app-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        transition: 'background-color 0.3s ease'
      }}
    >
      <div style={{ maxWidth: '30rem', width: '100%' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Complete Your Signup
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
              Your Google account is connected. Add your full name, phone number, and password so you can log in with
              either Google or email and password.
            </p>
          </div>

          {error && (
            <div
              className="alert alert-error"
              style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                padding: '12px 16px',
                borderRadius: '8px'
              }}
            >
              <AlertCircle
                style={{ width: '20px', height: '20px', marginRight: '8px', marginTop: '2px', flexShrink: 0, color: '#dc2626' }}
              />
              <span style={{ color: 'inherit', fontSize: '14px', display: 'block' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'var(--surface-muted, rgba(148, 163, 184, 0.12))',
                    color: 'var(--text-secondary)'
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'var(--surface-bg)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
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
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'var(--surface-bg)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'var(--surface-bg)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-full"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving Details...' : 'Complete Signup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignupCompletion;
