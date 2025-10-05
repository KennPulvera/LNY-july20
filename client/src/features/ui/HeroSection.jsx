import React from 'react';

const HeroSection = ({ onBookClick }) => {
  return (
    <section id="home" className="hero">
      {/* Floating Orbs Animation Layer */}
      <div className="floating-orbs">
        <div className="orb"></div>
        <div className="orb"></div>
        <div className="orb"></div>
        <div className="orb"></div>
      </div>
      
      {/* Geometric Shapes Animation Layer */}
      <div className="geometric-shapes">
        <div className="triangle"></div>
        <div className="diamond"></div>
        <div className="hexagon"></div>
      </div>
      
      {/* Lightning Energy Streams */}
      <div className="energy-streams">
        <div className="energy-line"></div>
        <div className="energy-line"></div>
        <div className="energy-line"></div>
        <div className="energy-line"></div>
      </div>
      
      {/* Pulsing Energy Core */}
      <div className="energy-core"></div>
      
      <div className="hero-simplified-container">
        <div className="hero-simplified-content">
          <h1 className="hero-title-large">
            Pediatric Therapy Center for Children with Special Needs🌟
          </h1>

          <div className="hero-button-large">
            <button className="btn-primary magic-button-xl" onClick={onBookClick}>
              <i className="fas fa-calendar-plus"></i>
              <span>Schedule Assessment</span>
              <div className="button-rainbow"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 