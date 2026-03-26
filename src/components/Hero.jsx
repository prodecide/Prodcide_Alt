import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-glow background-glow"></div>
      
      <div className="container hero-container">
        <div className="hero-content animate-fade-in">
          <div className="badge animate-float">
            ✦ Welcome to the Future of Career Planning
          </div>
          
          <h1 className="hero-title">
            Discover Your True Path with <br/>
            <span className="gradient-text glow-text">ProDecide Next</span>
          </h1>
          
          <p className="hero-subtitle">
            An advanced AI-powered career matching engine that analyzes your cognitive profile
            to connect you with elite industry experts.
          </p>
          
          <div className="hero-cta delay-200">
            <button className="btn btn-primary btn-large">
              Begin Cognitive Test
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            <button className="btn btn-secondary btn-large">
              Explore Network
            </button>
          </div>
          
          <div className="hero-stats delay-300">
            <div className="stat-item">
              <span className="stat-value">500+</span>
              <span className="stat-label">Verified Experts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">98%</span>
              <span className="stat-label">Match Accuracy</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">20k+</span>
              <span className="stat-label">Paths Unlocked</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual animate-fade-in delay-200">
          <div className="glass-panel visual-card animate-float">
            <div className="card-header">
              <div className="card-dots"><span></span><span></span><span></span></div>
              <div className="card-title">Cognitive Analysis</div>
            </div>
            <div className="card-body">
              <div className="analysis-row">
                <div className="analysis-label">Logical Parsing</div>
                <div className="progress-bar"><div className="progress" style={{ width: '85%' }}></div></div>
              </div>
              <div className="analysis-row">
                <div className="analysis-label">Creative Synthesis</div>
                <div className="progress-bar"><div className="progress" style={{ width: '92%' }}></div></div>
              </div>
              <div className="analysis-row">
                <div className="analysis-label">Strategic Planning</div>
                <div className="progress-bar"><div className="progress" style={{ width: '78%' }}></div></div>
              </div>
            </div>
            <div className="card-match">
              <div className="match-icon">✦</div>
              <div>
                <div className="match-title">Perfect Match Found</div>
                <div className="match-desc">Product Management / Strategy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
