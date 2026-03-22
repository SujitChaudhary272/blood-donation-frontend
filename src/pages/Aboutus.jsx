import React, { useEffect, useRef } from 'react';
import {
  Droplets,
  Heart,
  Target,
  Shield,
  Clock,
  ArrowRight,
  Search,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Aboutus.css';

const AboutUs = () => {
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // animation trigger if needed later
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Search,
      title: 'Quick Donor Search',
      description:
        'Instantly search and find registered blood donors by blood group, location, and availability.'
    },
    {
      icon: Phone,
      title: 'Direct Contact',
      description:
        'Connect directly with donors through phone or messaging for immediate coordination.'
    },
    {
      icon: Shield,
      title: 'Verified Information',
      description:
        'All donor profiles are verified to ensure accurate blood group and contact information.'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description:
        'Get instant notifications when donors matching your requirements register on the platform.'
    }
  ];

  return (
    <div className="about-us">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="hero-background">
          <div className="floating-drops">
            <Droplets className="drop drop-1" />
            <Droplets className="drop drop-2" />
            <Droplets className="drop drop-3" />
          </div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-line">Connecting Donors,</span>
            <span className="title-line">Saving Lives</span>
          </h1>
          <p className="hero-subtitle">
            A platform to find blood donors when you need them most
          </p>
          <div className="hero-cta">
            <Link to="/donor-registration" className="cta-button primary">
              Become a Donor <ArrowRight size={20} />
            </Link>
            <Link to="/request-blood" className="cta-button secondary">
              Find Donors
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="mission-vision">
        <div className="container">
          <div className="intro-section">
            <h2 className="section-title">What's About BloodLife</h2>
            <p className="intro-text">
              BloodLife is a <strong>donor-recipient connection platform</strong>,
              not a medical service provider. We help you find registered blood
              donors in your area when you or your loved ones need blood.
            </p>
          </div>

          <div className="mission-grid">
            <div className="mission-card">
              <div className="card-icon">
                <Target size={40} />
              </div>
              <h2>Our Mission</h2>
              <p>
                To bridge the gap between blood donors and recipients by
                providing a simple, fast, and reliable platform for emergencies.
              </p>
            </div>

            <div className="mission-card">
              <div className="card-icon">
                <Heart size={40} />
              </div>
              <h2>Our Vision</h2>
              <p>
                A world where finding a blood donor is never a barrier to saving
                lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How BloodLife Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Register as Donor</h3>
              <p>Donors register with blood group and contact details.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Search for Donors</h3>
              <p>Recipients search donors by blood group and location.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Connect Directly</h3>
              <p>Contact donors directly for urgent needs.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Donate at Hospital</h3>
              <p>Donation is completed safely at certified hospitals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose BloodLife?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={32} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="disclaimer-section">
        <div className="container">
          <div className="disclaimer-card">
            <Shield size={40} className="disclaimer-icon" />
            <h3>Important Notice</h3>
            <p>
              BloodLife is a <strong>connection platform only</strong>. All blood
              donations must be done at certified hospitals or blood banks under
              medical supervision.
            </p>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default AboutUs;
