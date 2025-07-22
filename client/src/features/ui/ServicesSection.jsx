import React from 'react';

const ServicesSection = ({ onBookClick }) => {
  const services = [
    {
      icon: 'fa-comments',
      title: 'Speech Therapy',
      category: 'Communication',
      description: 'Evidence-based interventions for articulation, voice disorders, and language development.',
      benefits: ['Articulation correction', 'Voice therapy', 'Language development', 'Communication skills'],
      accent: '#ff6b35'
    },
    {
      icon: 'fa-hands-helping',
      title: 'Occupational Therapy',
      category: 'Daily Skills',
      description: 'Purposeful activities enhancing independence through motor skills and sensory processing.',
      benefits: ['Fine motor skills', 'Self-help training', 'Sensory integration', 'School readiness'],
      accent: '#ff8a65'
    },
    {
      icon: 'fa-brain',
      title: 'Behavioral Therapy',
      category: 'Emotional Regulation',
      description: 'ABA principles and positive reinforcement for appropriate behaviors and social skills.',
      benefits: ['Behavior management', 'Social skills', 'Emotional regulation', 'Family support'],
      accent: '#ffab40'
    },
    {
      icon: 'fa-graduation-cap',
      title: 'Early Intervention',
      category: 'Ages 0-3',
      description: 'Family-centered services for infants and toddlers with developmental delays.',
      benefits: ['Family support', 'Milestone tracking', 'Individual plans', 'Parent education'],
      accent: '#ffc107'
    }
  ];

  const team = [
    {
      icon: 'fa-stethoscope',
      title: 'Developmental Pediatrician',
      specialties: ['Growth Assessment', 'Delay Diagnosis', 'Medical Consultation', 'Care Coordination'],
      accent: '#ff5722'
    },
    {
      icon: 'fa-hands-helping',
      title: 'Occupational Therapist',
      specialties: ['Daily Living Skills', 'Fine Motor Training', 'Sensory Integration', 'Adaptive Equipment'],
      accent: '#ff6b35'
    },
    {
      icon: 'fa-graduation-cap',
      title: 'SPED Teachers',
      specialties: ['IEP Development', 'Learning Support', 'Educational Assessment', 'Curriculum Adaptation'],
      accent: '#ff8a65'
    },
    {
      icon: 'fa-comments',
      title: 'Speech Pathologist',
      specialties: ['Speech Therapy', 'Language Support', 'Communication Training', 'Swallowing Treatment'],
      accent: '#ffab40'
    }
  ];

  return (
    <section id="services" className="services" style={{
      background: 'linear-gradient(135deg, #fff8f5 0%, #fff3e0 100%)',
      padding: '60px 0 80px 0',
      position: 'relative'
    }}>
      <div className="container">
        {/* Compact Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ff5722, #ffab40)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Professional Team & Comprehensive Services
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ff6b35, #ff8a65)',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              <span>👨‍⚕️</span>
              <span>Expert Team</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ffab40, #ffc107)',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              <span>🎯</span>
              <span>Proven Results</span>
            </div>
          </div>
          <p style={{
            fontSize: '1.1rem',
            color: '#bf360c',
            maxWidth: '600px',
            margin: '0 auto',
            fontWeight: '500'
          }}>
            Multi-disciplinary team delivering evidence-based interventions since 2009
          </p>
        </div>

        {/* Main Content Grid - Fixed Equal Containers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          maxWidth: '1300px',
          margin: '0 auto',
          alignItems: 'flex-start'
        }}>
          
          {/* Professional Team */}
          <div style={{ height: '600px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ff6b35, #ff8a65)',
              color: 'white',
              padding: '18px',
              borderRadius: '18px 18px 0 0',
              textAlign: 'center',
              height: '70px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                margin: '0 0 4px 0'
              }}>
                👨‍⚕️ Our Professional Team
              </h3>
              <p style={{ margin: '0', opacity: '0.9', fontSize: '0.9rem' }}>
                Licensed specialists with proven expertise
              </p>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '0 0 18px 18px',
              padding: '20px',
              boxShadow: '0 15px 35px rgba(255, 87, 34, 0.1)',
              height: '530px',
              overflowY: 'auto'
            }}>
              {team.map((member, index) => (
                <div key={index} style={{
                  padding: '16px',
                  marginBottom: index < team.length - 1 ? '16px' : '0',
                  background: `linear-gradient(135deg, ${member.accent}08, ${member.accent}04)`,
                  borderRadius: '12px',
                  border: `2px solid ${member.accent}20`,
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      background: `linear-gradient(135deg, ${member.accent}, ${member.accent}dd)`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      <i className={`fas ${member.icon}`}></i>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#333',
                        marginBottom: '10px'
                      }}>
                        {member.title}
                      </h4>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px'
                      }}>
                        {member.specialties.map((specialty, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                            color: '#555'
                          }}>
                            <div style={{
                              width: '5px',
                              height: '5px',
                              background: member.accent,
                              borderRadius: '50%',
                              marginRight: '6px'
                            }}></div>
                            {specialty}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Programs & Services */}
          <div style={{ height: '600px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffab40, #ffc107)',
              color: 'white',
              padding: '18px',
              borderRadius: '18px 18px 0 0',
              textAlign: 'center',
              height: '70px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                margin: '0 0 4px 0'
              }}>
                🎯 Programs & Services
              </h3>
              <p style={{ margin: '0', opacity: '0.9', fontSize: '0.9rem' }}>
                Evidence-based therapeutic interventions
              </p>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '0 0 18px 18px',
              padding: '20px',
              boxShadow: '0 15px 35px rgba(255, 171, 64, 0.1)',
              height: '530px',
              overflowY: 'auto'
            }}>
              {services.map((service, index) => (
                <div key={index} style={{
                  padding: '16px',
                  marginBottom: index < services.length - 1 ? '16px' : '0',
                  background: `linear-gradient(135deg, ${service.accent}08, ${service.accent}04)`,
                  borderRadius: '12px',
                  border: `2px solid ${service.accent}20`,
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      background: `linear-gradient(135deg, ${service.accent}, ${service.accent}dd)`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      <i className={`fas ${service.icon}`}></i>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '6px' }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#333',
                          margin: '0 0 2px 0'
                        }}>
                          {service.title}
                        </h4>
                        <span style={{
                          fontSize: '0.85rem',
                          color: service.accent,
                          fontWeight: '600'
                        }}>
                          {service.category}
                        </span>
                      </div>
                      
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        lineHeight: '1.3',
                        margin: '0 0 12px 0'
                      }}>
                        {service.description}
                      </p>
                      
                      {service.sessions && (
                        <div style={{
                          marginBottom: '10px'
                        }}>
                          <span style={{
                            background: service.accent + '20',
                            color: service.accent,
                            padding: '2px 6px',
                            borderRadius: '5px',
                            fontWeight: '600',
                            fontSize: '0.75rem'
                          }}>
                            {service.sessions}
                          </span>
                        </div>
                      )}
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '5px'
                      }}>
                        {service.benefits.map((benefit, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                            color: '#555'
                          }}>
                            <div style={{
                              width: '4px',
                              height: '4px',
                              background: service.accent,
                              borderRadius: '50%',
                              marginRight: '5px'
                            }}></div>
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 