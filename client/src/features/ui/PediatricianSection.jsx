import React from 'react';

const PediatricianSection = () => {
  return (
    <section className="pediatrician-section" style={{ padding: '60px 0', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <div className="container">
        {/* Main Heading */}
        <h2 style={{ 
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'var(--primary-orange)',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Meet Our Neurodevelopmental Pediatrician 👩‍⚕️
        </h2>
        
        {/* Doctor Name and Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ 
            fontSize: '2rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            Dr. Marnie Moya-Prudencio - Neurodevelopmental Pediatrician
          </h3>
        </div>
        
        <div className="pediatrician-content" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '50px',
          maxWidth: '1200px',
          margin: '0 auto',
          flexWrap: 'wrap'
        }}>
          {/* Pediatrician Photo */}
          <div className="pediatrician-image" style={{ 
            flex: '0 0 auto',
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <div style={{
              display: 'inline-block',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 25px 55px rgba(0, 0, 0, 0.2), 0 15px 25px rgba(255, 107, 53, 0.15)',
              background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
              padding: '8px',
              position: 'relative'
            }}>
              <div style={{
                borderRadius: '24px',
                overflow: 'hidden',
                background: '#ffffff',
                position: 'relative'
              }}>
                <img 
                  src="./images/doctor/pediatrician.jpg"
                  alt="Dr. Marnie Moya-Prudencio - Neurodevelopmental Pediatrician"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    transition: 'transform 0.3s ease',
                    minWidth: '500px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                />
                <div style={{ 
                  display: 'none',
                  width: '100%',
                  height: '500px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  color: '#666'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <i className="fas fa-user-md" style={{ fontSize: '80px', color: 'var(--primary-orange)', marginBottom: '20px' }}></i>
                    <p style={{ margin: '0', fontSize: '20px', fontWeight: '600' }}>Neurodevelopmental Pediatrician</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pediatrician Information */}
          <div className="pediatrician-info" style={{ 
            flex: '1',
            minWidth: '300px'
          }}>
            
            <div className="credentials" style={{ marginBottom: '2rem' }}>
              <h4 style={{ 
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '1rem'
              }}>
                Specializations & Experience:
              </h4>
              <ul style={{ 
                listStyle: 'none',
                padding: '0',
                margin: '0'
              }}>
                <li style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.8rem',
                  fontSize: '1rem',
                  color: '#666'
                }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--primary-orange)', marginRight: '10px' }}></i>
                  Neurodevelopmental Assessment & Diagnosis
                </li>
                <li style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.8rem',
                  fontSize: '1rem',
                  color: '#666'
                }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--primary-orange)', marginRight: '10px' }}></i>
                  Early Childhood Development
                </li>
                <li style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.8rem',
                  fontSize: '1rem',
                  color: '#666'
                }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--primary-orange)', marginRight: '10px' }}></i>
                  Autism Spectrum Disorders
                </li>
                <li style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.8rem',
                  fontSize: '1rem',
                  color: '#666'
                }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--primary-orange)', marginRight: '10px' }}></i>
                  Developmental Delays & Disabilities
                </li>
              </ul>
            </div>

            <div className="commitment" style={{
              background: 'rgba(255, 107, 53, 0.1)',
              padding: '1.5rem',
              borderRadius: '15px',
              borderLeft: '5px solid var(--primary-orange)'
            }}>
              <p style={{ 
                fontSize: '1.1rem',
                color: '#333',
                fontStyle: 'italic',
                margin: '0',
                lineHeight: '1.6'
              }}>
                "Every child has unique potential. My role is to help identify their strengths and support their developmental journey through comprehensive assessment and personalized care." 💝
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PediatricianSection; 