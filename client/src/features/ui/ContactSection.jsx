import React from 'react';

const ContactSection = () => {
  const contactInfo = [
    {
      icon: 'fa-phone',
      title: 'Phone 📱',
      content: '0947 964 9595'
    },
    {
      icon: 'fa-envelope',
      title: 'Email 📧',
      content: 'lanceyurikidsspot@gmail.com'
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Branch Locations 📍',
      content: (
        <>
          <strong>🏢 Main Branch:</strong> Unit 08 Olivan Bldg. # 76 Blumentritt St., Naga City<br />
          <strong>📡 Satellite Branch:</strong> Del Rosario, Naga City
        </>
      )
    },
    {
      icon: 'fa-clock',
      title: 'Office Hours ⏰',
      content: (
        <>
          Mon: 8:00 AM - 5:00 PM<br />
          Tue-Sat: 9:00 AM - 5:00 PM<br />
          Sun: CLOSED
        </>
      )
    }
  ];

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-content">
          <h2 className="animated-section-title">Contact Information 📞</h2>
          <div className="contact-grid">
            {contactInfo.map((item, index) => (
              <div key={index} className="contact-item magic-contact-item">
                <i className={`fas ${item.icon}`}></i>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 