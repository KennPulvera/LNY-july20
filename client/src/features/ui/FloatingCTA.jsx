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
    <div style={{
      position: 'fixed',
      bottom: isVisible ? '20px' : '-40px',
      left: '50%',
      transform: 'translateX(-50%)',
      transition: 'all 0.3s ease-in-out',
      zIndex: 1000,
      pointerEvents: isVisible ? 'auto' : 'none'
    }}>
      <button
        onClick={onBookClick}
        style={{
          background: 'linear-gradient(135deg, #ff6b35, #ff8a65)',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '6px 16px',
          fontSize: '0.85rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          height: '28px',
          boxShadow: '0 3px 15px rgba(255, 107, 53, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
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
        <span style={{ fontSize: '0.9rem' }}>📅</span>
        <span>Schedule Assessment</span>
      </button>
    </div>
  );
};

export default FloatingCTA; 