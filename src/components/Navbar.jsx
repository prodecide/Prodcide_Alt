import React from 'react';
import './Navbar.css';

const Navbar = ({ scrolled }) => {
  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        <div className="navbar-logo">
          <span className="logo-text gradient-text">ProDecide</span> <span className="logo-badge">Next</span>
        </div>
        
        <nav className="navbar-links">
          <a href="#features">Features</a>
          <a href="#network">Experts</a>
          <a href="#how-it-works">How it Works</a>
        </nav>
        
        <div className="navbar-actions">
          <button className="btn btn-secondary">Login</button>
          <button className="btn btn-primary">Start Assessment</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
