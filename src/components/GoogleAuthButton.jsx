import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';

const ENV_GOOGLE_CLIENT_ID = (process.env.REACT_APP_GOOGLE_CLIENT_ID || '').trim();

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-google-identity="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const GoogleAuthButton = ({ text = 'continue_with', onCredential, disabled = false }) => {
  const buttonRef = useRef(null);
  const { isDarkMode } = useTheme();
  const [googleClientId, setGoogleClientId] = useState(ENV_GOOGLE_CLIENT_ID);
  const [configChecked, setConfigChecked] = useState(Boolean(ENV_GOOGLE_CLIENT_ID));

  const label = text === 'signup_with' ? 'Continue with Google' : 'Continue with Google';

  useEffect(() => {
    let active = true;

    const loadConfig = async () => {
      if (ENV_GOOGLE_CLIENT_ID) {
        return;
      }

      try {
        const response = await authAPI.getGoogleConfig();
        const runtimeClientId = (response.data?.clientId || '').trim();

        if (active && runtimeClientId) {
          setGoogleClientId(runtimeClientId);
        }
      } catch (error) {
        console.error('Failed to load Google config from backend:', error);
      } finally {
        if (active) {
          setConfigChecked(true);
        }
      }
    };

    loadConfig();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      if (!googleClientId || !buttonRef.current) {
        return;
      }

      try {
        await loadGoogleScript();
        if (cancelled || !window.google?.accounts?.id) {
          return;
        }

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: ({ credential }) => {
            if (!disabled && credential) {
              onCredential?.(credential);
            }
          }
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: isDarkMode ? 'filled_black' : 'outline',
          text,
          shape: 'pill',
          size: 'large',
          width: buttonRef.current.offsetWidth || 320
        });
      } catch (error) {
        console.error('Failed to initialize Google Identity Services:', error);
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [disabled, googleClientId, isDarkMode, onCredential, text]);

  if (!googleClientId && configChecked) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          window.alert('Google login is not configured yet. Add REACT_APP_GOOGLE_CLIENT_ID in frontend/.env and GOOGLE_CLIENT_ID in backend/.env.');
        }}
        style={{
          width: '100%',
          minHeight: '48px',
          borderRadius: '999px',
          border: '1px solid var(--surface-border)',
          background: 'var(--surface-bg)',
          color: 'var(--text-primary)',
          fontSize: '15px',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 8px 18px rgba(0, 0, 0, 0.12)'
        }}
      >
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#ea4335' }}>G</span>
        <span>{label}</span>
      </button>
    );
  }

  if (!googleClientId) {
    return <div ref={buttonRef} style={{ width: '100%', minHeight: '48px' }} />;
  }

  return <div ref={buttonRef} style={{ width: '100%', minHeight: '48px' }} />;
};

export default GoogleAuthButton;
