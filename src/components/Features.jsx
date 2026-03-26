import React from 'react';
import './Features.css';

const Features = () => {
  const features = [
    {
      title: "Deep Cognitive Profiling",
      description: "Our AI goes beyond simple questionnaires to analyze your unique logical, verbal, and creative aptitude.",
      icon: "🧠"
    },
    {
      title: "Precision Matching",
      description: "Get connected strictly with professionals who are verified top performers in their respective fields.",
      icon: "🎯"
    },
    {
      title: "Actionable Roadmaps",
      description: "Receive step-by-step guidance tailored to your specific strengths and the reality of the industry.",
      icon: "🗺️"
    }
  ];

  return (
    <section id="features" className="section features-section">
      <div className="container">
        <div className="features-header text-center">
          <h2 className="section-title">The ProDecide Advantage</h2>
          <p className="section-subtitle">We don't just guess your future. We engineer it.</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className={`feature-card glass-panel delay-${(index + 1) * 100}`}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
