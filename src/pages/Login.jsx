import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Droplets, Mail, Lock, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, googleAuth } = useAuth();
  const initialRole = useMemo(() => {
    const role = searchParams.get('role');
    return role === 'receiver' ? 'receiver' : 'donor';
  }, [searchParams]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: initialRole
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatLoginError = (message) => {
    const errorMessage = message || 'Login failed. Please try again.';
    const lower = errorMessage.toLowerCase();

    if (lower.includes('user not found') || lower.includes('no account found')) {
      return 'No account found with this email. Please sign up first.';
    }

    if (lower.includes('invalid email or password')) {
      return 'Invalid email or password. Please check your credentials.';
    }

    if (lower.includes('google login')) {
      return 'This account uses Google login. Please continue with Google.';
    }

    return errorMessage;
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, role: initialRole }));
  }, [initialRole]);

  const redirectByRole = (role) => {
    if (role === 'donor') {
      navigate('/donor-dashboard', { replace: true });
      return;
    }
    if (role === 'receiver') {
      navigate('/receiver-dashboard', { replace: true });
      return;
    }
    navigate('/', { replace: true });
  };

  const redirectAfterAuth = (authUser) => {
    if (authUser?.needsProfileCompletion) {
      navigate('/complete-google-signup', { replace: true });
      return;
    }

    redirectByRole(authUser?.role);
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

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success && result.user) {
        redirectAfterAuth(result.user);
      } else {
        setError(formatLoginError(result.message));
      }
    } catch (err) {
      console.error('Login error:', err);

      if (err.response) {
        setError(formatLoginError(err.response.data?.message || 'Login failed'));
      } else {
        setError('Unable to connect to server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential) => {
    setError('');
    setLoading(true);

    try {
      const result = await googleAuth({
        credential,
        role: formData.role,
        intent: 'login'
      });

      if (result.success && result.user) {
        redirectAfterAuth(result.user);
      } else {
        setError(result.message || 'Google login failed. Please try again.');
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
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)'
              }}>
                <Droplets style={{ width: '48px', height: '48px', color: '#ffffff' }} />
              </div>
            </div>
            <h2 style={{ fontSize: '30px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              Login to your Blood Donation Portal account
            </p>
            <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: 700, marginTop: '10px' }}>
              Logging in as {formData.role === 'receiver' ? 'Receiver' : 'Donor'}
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
                {error.toLowerCase().includes('no account found') && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <Link 
                      to="/donor-signup" 
                      style={{ 
                        color: '#dc2626', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        textDecoration: 'underline'
                      }}
                    >
                      Sign up as Donor
                    </Link>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>or</span>
                    <Link 
                      to="/receiver-signup" 
                      style={{ 
                        color: '#3b82f6', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        textDecoration: 'underline'
                      }}
                    >
                      Sign up as Receiver
                    </Link>
                  </div>
                )}
              </div>
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
                  autoComplete="email"
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  style={{ width: '16px', height: '16px', color: '#dc2626', borderRadius: '4px', border: '1px solid var(--surface-border)', accentColor: '#dc2626' }}
                />
                <label htmlFor="remember" style={{ marginLeft: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" style={{ fontSize: '14px', color: '#dc2626', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
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
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
            </div>

            <GoogleAuthButton
              text="continue_with"
              onCredential={handleGoogleLogin}
              disabled={loading}
            />

            <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--surface-border)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                Don't have an account?
              </p>
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <Link 
                  to="/donor-signup" 
                  style={{ 
                    display: 'block',
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Droplets size={18} />
                    <span>Sign up as Donor</span>
                  </div>
                </Link>
                <Link 
                  to="/receiver-signup" 
                  style={{ 
                    display: 'block',
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <User size={18} />
                    <span>Sign up as Receiver</span>
                  </div>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
