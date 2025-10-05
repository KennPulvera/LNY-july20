import React from 'react';

const ConsultationSection = () => {
  const consultations = [
    {
      icon: 'fa-stethoscope',
      title: 'Developmental Pediatrician 👶',
      description: 'Provides medical services to infants, children, and adolescents. Trained in overall growth and development, they are often the first point of contact for developmental concerns.',
      sparkles: ['🩺', '⭐']
    },
    {
      icon: 'fa-hands-helping',
      title: 'Occupational Therapist 🖐️',
      description: 'Provides assessment and treatment using specific, purposeful activities to prevent disability and promote independent function in all aspects of daily life.',
      sparkles: ['🖐️', '💫']
    },
    {
      icon: 'fa-graduation-cap',
      title: 'SPED Teachers 👩‍🏫',
      description: 'Provide specialized instruction using remedial techniques, individualized education programs (IEP), and early identification support to help children with specific learning disabilities.',
      sparkles: ['👩‍🏫', '📚']
    },
    {
      icon: 'fa-comments',
      title: 'Speech and Language Pathologist 🗣️',
      description: 'Specializes in communication disorders, providing assessment and treatment for speech articulation, language development, and communication skills enhancement.',
      sparkles: ['🗣️', '💬']
    }
  ];

  return (
    <section id="consultation" className="consultation">
      <div className="container">
        <div className="section-header">
          <h2 className="animated-section-title">Professional Consultation Services 👨‍⚕️</h2>
          <p>Our programs are delivered through consultation with a multi-disciplinary team of medical professionals and specialists</p>
        </div>
        
        <div className="consultation-grid">
          {consultations.map((consultation, index) => (
            <div key={index} className="consultation-card magic-service-card">
              <div className="service-icon">
                <i className={`fas ${consultation.icon}`}></i>
                <div className="icon-sparkles">
                  {consultation.sparkles.map((sparkle, i) => (
                    <span key={i} className="sparkle">{sparkle}</span>
                  ))}
                </div>
              </div>
              <h3>{consultation.title}</h3>
              <p>{consultation.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConsultationSection; 