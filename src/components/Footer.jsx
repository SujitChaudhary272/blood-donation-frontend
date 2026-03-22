import React from 'react';
import {
  Droplets,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Instagram
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  // Function to scroll to top and navigate
  const handleLinkClick = (path) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Navigate to the path
    navigate(path);
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ABOUT SECTION */}
        <div className="footer-section about-section">
          <div className="footer-logo">
            <Droplets size={34} className="footer-icon" />
            <h3>BloodLife</h3>
          </div>

          <p>
            A platform designed to connect blood donors with recipients in need. 
            We bridge the gap between those who can donate and those who need blood, 
            making it easier to find donors quickly.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <button onClick={() => handleLinkClick('/search')} className="footer-link-btn">
                Find Donors
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('/donor-registration')} className="footer-link-btn">
                Register as Donor
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('/request-blood')} className="footer-link-btn">
                Request Blood
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('/about')} className="footer-link-btn">
                About Us
              </button>
            </li>
          </ul>
        </div>

        {/* CONTACT SECTION WITH SOCIAL ICONS */}
        <div className="footer-section">
          <h4>For Any Queries - Contact Us</h4>

          <p className="footer-contact">
            <MapPin size={18} />
            <span>Sector 26, Pradhikaran, Nigdi, Pimpri-Chinchwad, near Akurdi Railway Station, Pune, Maharashtra, 411044</span>
          </p>

          <p className="footer-contact">
            <Phone size={18} />
            <a href="tel:+918127390567">+91-8127390567</a>
          </p>

          <p className="footer-contact">
            <Mail size={18} />
            <a href="mailto:sujit.chaudhary23@pccoepune.org">sujit.chaudhary23@pccoepune.org</a>
          </p>

          {/* SOCIAL ICONS - Now in Contact Section */}
          <div className="social-icons">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Follow us on Twitter"
              title="Twitter"
            >
              <Twitter size={20} />
            </a>

            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Follow us on Facebook"
              title="Facebook"
            >
              <Facebook size={20} />
            </a>

            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Follow us on Instagram"
              title="Instagram"
            >
              <Instagram size={20} />
            </a>

            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Chat on WhatsApp"
              title="WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M20.52 3.48A11.86 11.86 0 0012.01 0C5.38 0 .01 5.37 0 12c0 2.11.55 4.18 1.6 6.01L0 24l6.15-1.6a11.92 11.92 0 005.86 1.49h.01c6.63 0 12-5.37 12-12a11.86 11.86 0 00-3.5-8.41z" />
              </svg>
            </a>

            <a 
              href="mailto:support@bloodlife.com" 
              aria-label="Send us an email"
              title="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <p className="copyright">
          © {new Date().getFullYear()} <span>BloodLife</span>. All rights reserved.
        </p>
        <p className="developer">
          Developed by <span>Sujit Chaudhary</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
