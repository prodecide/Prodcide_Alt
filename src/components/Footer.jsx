import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer section">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="navbar-logo" style={{ marginBottom: '1rem' }}>
              <span className="logo-text gradient-text">ProDecide</span> <span className="logo-badge">Next</span>
            </div>
            <p className="footer-desc">
              Empowering the next generation to make data-driven, strategic career choices.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Explore</h4>
            <a href="#">About Us</a>
            <a href="#">How it Works</a>
            <a href="#">Pricing</a>
            <a href="#">Consultants</a>
          </div>
          
          <div className="footer-links">
            <h4>Resources</h4>
            <a href="#">Blog</a>
            <a href="#">Career Guides</a>
            <a href="#">Help Center</a>
            <a href="#">Contact</a>
          </div>
          
          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <div className="input-group">
              <input type="email" placeholder="Enter your email" />
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Subscribe</button>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ProDecide Alternative Project. Built by AI.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
