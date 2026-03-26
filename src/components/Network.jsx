import React from 'react';
import './Network.css';

const Network = () => {
  const experts = [
    { name: "Sarah J.", role: "VP of Product", company: "TechNova", image: "👩‍💼" },
    { name: "Michael T.", role: "Lead Engineer", company: "DataFlow", image: "👨‍💻" },
    { name: "Elena R.", role: "Design Director", company: "CreativeStudio", image: "👩‍🎨" },
    { name: "David L.", role: "Strategy Consult.", company: "Apex Advisors", image: "👨‍💼" }
  ];

  return (
    <section id="network" className="section network-section">
      <div className="network-glow"></div>
      <div className="container">
        <div className="network-content">
          <div className="network-text">
            <h2 className="section-title">An Elite Network at Your Fingertips</h2>
            <p className="section-subtitle" style={{ marginLeft: 0, textAlign: 'left' }}>
              We don't just give you a report. We connect you with verified experts who 
              live and breathe the career paths you're exploring.
            </p>
            <ul className="network-benefits">
              <li><span className="check">✓</span> 1-on-1 mentorship sessions</li>
              <li><span className="check">✓</span> Insider industry knowledge</li>
              <li><span className="check">✓</span> Resume and portfolio reviews</li>
            </ul>
            <button className="btn btn-primary" style={{ marginTop: '2rem' }}>
              View Top Consultants
            </button>
          </div>
          
          <div className="network-grid">
            {experts.map((expert, idx) => (
              <div key={idx} className="expert-card glass-panel">
                <div className="expert-avatar">{expert.image}</div>
                <div className="expert-info">
                  <h4 className="expert-name">{expert.name}</h4>
                  <p className="expert-role">{expert.role}</p>
                  <p className="expert-company">{expert.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Network;
