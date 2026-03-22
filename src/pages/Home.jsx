import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Search, Users, MapPin, Activity, Shield } from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  // Function to scroll to top and navigate
  const handleNavigate = (path) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
  };

  const features = [
    {
      icon: <Search style={{ width: '32px', height: '32px' }} />,
      title: 'Search Donors',
      description: 'Find available blood donors quickly by blood group and location'
    },
    {
      icon: <Users style={{ width: '32px', height: '32px' }} />,
      title: 'Register as Donor',
      description: 'Join our community of life-savers and help those in need'
    },
    {
      icon: <Activity style={{ width: '32px', height: '32px' }} />,
      title: 'Request Blood',
      description: 'Submit blood requests for medical emergencies instantly'
    },
    {
      icon: <MapPin style={{ width: '32px', height: '32px' }} />,
      title: 'Find Nearby Donors',
      description: 'Locate blood donors near your location with Google Maps'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid" style={{ 
            gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr' 
          }}>
            <div className="hero-content">
              <h1>
                Donate Blood,<br />Save Lives
              </h1>
              <p>
                Connect with blood donors near you. Join our mission to ensure blood availability for everyone in need.
              </p>
        
            </div>
            {window.innerWidth >= 768 && (
              <div className="hero-visual">
                <div className="hero-visual-card">
                  <Droplets style={{ width: '192px', height: '192px', color: 'white' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple steps to donate or find blood donors</p>
          </div>
          <div className="features-grid" style={{ 
            gridTemplateColumns: window.innerWidth >= 1024 ? 'repeat(4, 1fr)' : 
                                 window.innerWidth >= 768 ? 'repeat(2, 1fr)' : '1fr' 
          }}>
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="feature-card-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Why Donate Section */}
      <section className="why-donate-section">
        <div className="container">
          <div className="why-donate-grid" style={{ 
            gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr' 
          }}>
            <div className="why-donate-content">
              <h2>Why Donate Blood?</h2>
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <Droplets style={{ width: '24px', height: '24px', color: '#dc2626' }} />
                  </div>
                  <div className="benefit-text">
                    <h3>Save Lives</h3>
                    <p>One donation can save up to three lives</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <Shield style={{ width: '24px', height: '24px', color: '#dc2626' }} />
                  </div>
                  <div className="benefit-text">
                    <h3>Health Benefits</h3>
                    <p>Regular donation helps maintain good health</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <Activity style={{ width: '24px', height: '24px', color: '#dc2626' }} />
                  </div>
                  <div className="benefit-text">
                    <h3>Free Health Check</h3>
                    <p>Get a mini health screening with every donation</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="cta-card">
              <Droplets style={{ width: '128px', height: '128px', color: '#dc2626' }} />
              <h3>Ready to Save Lives?</h3>
              <p>Join thousands of donors making a difference every day</p>
              <button
                onClick={() => handleNavigate('/donor-signup')}
                className="btn btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
