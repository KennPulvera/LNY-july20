import React from 'react';

const FloatingCTA = ({ onBookClick }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(135deg, #ff6b35, #ff8a65)',
      boxShadow: '0 -8px 25px rgba(255, 107, 53, 0.3), 0 -4px 10px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      padding: '15px 0',
      backdropFilter: 'blur(10px)',
      borderTop: '3px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Left side - Quick info */}
        <div style={{
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div>
            <h3 style={{
              margin: '0',
              fontSize: '1.2rem',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Ready to Start? 🚀
            </h3>
            <p style={{
              margin: '0',
              fontSize: '0.9rem',
              opacity: '0.9'
            }}>
              Professional assessment & personalized care
            </p>
          </div>
          
          {/* Quick features */}
          <div style={{
            display: 'flex',
            gap: '15px',
            opacity: '0.9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
              <i className="fas fa-clipboard-check" style={{ fontSize: '0.9rem' }}></i>
              <span>Expert Assessment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
              <i className="fas fa-calendar" style={{ fontSize: '0.9rem' }}></i>
              <span>Flexible Scheduling</span>
            </div>
          </div>
        </div>

        {/* Right side - CTA Button */}
        <button 
          onClick={onBookClick}
          style={{
            background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
            color: '#ff6b35',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 30px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.05)';
            e.target.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.3)';
          }}
        >
          <i className="fas fa-calendar-plus" style={{ fontSize: '1.1rem' }}></i>
          <span>Schedule Your Assessment</span>
          
          {/* Animated sparkle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '8px',
            transform: 'translateY(-50%)',
            fontSize: '1rem',
            animation: 'sparkle 2s infinite'
          }}>
            ✨
          </div>
        </button>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes sparkle {
            0%, 100% { opacity: 1; transform: translateY(-50%) rotate(0deg); }
            50% { opacity: 0.7; transform: translateY(-50%) rotate(180deg); }
          }
          
          @media (max-width: 768px) {
            .floating-cta-container {
              flex-direction: column !important;
              gap: 15px !important;
              text-align: center !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FloatingCTA; 