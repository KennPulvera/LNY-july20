import React, { useState, useEffect } from 'react';

const FloatingCTA = ({ onBookClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="floating-cta-container" style={{
      position: 'fixed',
      bottom: isVisible ? '20px' : '-60px',
      left: '50%',
      transform: 'translateX(-50%)',
      transition: 'all 0.3s ease-in-out',
      zIndex: 1000,
      pointerEvents: isVisible ? 'auto' : 'none'
    }}>
      <button
        className="floating-cta-button"
        onClick={onBookClick}
        style={{
          background: 'linear-gradient(135deg, #ff6b35, #ff8a65)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '24px',
          padding: '12px 20px',
          fontSize: '0.95rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
          minHeight: '48px',
          boxShadow: '0 3px 15px rgba(255, 107, 53, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #ff8a65, #ffab40)';
          e.target.style.transform = 'scale(1.05) translateY(-1px)';
          e.target.style.boxShadow = '0 4px 18px rgba(255, 107, 53, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #ff6b35, #ff8a65)';
          e.target.style.transform = 'scale(1) translateY(0)';
          e.target.style.boxShadow = '0 3px 15px rgba(255, 107, 53, 0.4)';
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>📅</span>
        <span>Schedule Assessment</span>
      </button>
    </div>
  );
};

export default FloatingCTA; 