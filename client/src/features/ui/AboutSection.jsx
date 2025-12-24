import React, { useEffect, useRef } from 'react';

const AboutSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const infoCardRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Also animate child elements with animated-item class
          const animatedItems = entry.target.querySelectorAll('.animated-item');
          animatedItems.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('animate-in');
            }, index * 100);
          });
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const elementsToAnimate = [titleRef.current, textRef.current, imageRef.current, infoCardRef.current];
    elementsToAnimate.forEach(el => {
      if (el) observer.observe(el);
    });

    // Also observe elements with scroll animation classes
    const scrollElements = sectionRef.current?.querySelectorAll('.scroll-fade-in, .scroll-slide-up, .scroll-scale-in, .scroll-slide-right');
    scrollElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  return (
    <section id="about" className="about" ref={sectionRef}>
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2 ref={titleRef} className="animated-section-title scroll-fade-in">About Lance Yuri Kids SPOT Center</h2>
            
            <p ref={textRef} className="scroll-slide-up delay-1">
              <strong>Lance Yuri Kids SPOT Center is a pediatric center for children with special needs.</strong> 
              Our goals are: To provide a quality therapy service that assists the child, as a whole, to achieve 
              the highest level of skills possible within the scope of their cognitive and physical function. 
              To educate and inform the adults involved with these children to improved understanding and 
              acceptance of their unique abilities and challenges.
              <br /><br />
              <strong>Our Commitment</strong> Every child deserves the opportunity to reach their full potential. We are committed to
              providing quality therapy services that make a meaningful difference in children's lives
              and their families.
            </p>

          </div>
          
          <div className="about-image" ref={imageRef}>
            {/* Founders Image moved from Hero Section */}
            <div className="about-founders-section scroll-scale-in delay-2">
              <div className="founders-image-container-about floating-gentle">
                <img
                  src="/images/founders-lance-yuri.png"
                  alt="Lance and Yuri - Founders"
                  className="founders-image-about hover-float"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="high"
                  width="360"
                  height="270"
                  onError={handleImageError}
                />
                <div className="image-placeholder" style={{ display: 'none' }}>
                  <div className="placeholder-content">
                    <i className="fas fa-users" style={{ fontSize: '48px', color: 'var(--primary-orange)', marginBottom: '10px' }}></i>
                    <h3 style={{ color: 'var(--primary-orange)', margin: '0', fontSize: '18px' }}>Lance & Yuri</h3>
                    <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>Founders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Moved from Hero Section */}
            <div ref={infoCardRef} className="info-card magic-info-card scroll-slide-right delay-3">
              <h3 className="glow-text">What Sets Us Apart</h3>
              <div className="info-list">
                <div className="info-item slide-in-right animated-item delay-4">
                  <i className="fas fa-award pulse-icon"></i>
                  <span>15+ Years of Trusted Experience</span>
                </div>
                <div className="info-item slide-in-right animated-item delay-5">
                  <i className="fas fa-certificate pulse-icon"></i>
                  <span>Comprehensive Assessment</span>
                </div>
                <div className="info-item slide-in-right animated-item delay-6">
                  <i className="fas fa-child pulse-icon"></i>
                  <span>Child-Centered Approach</span>
                </div>
                <div className="info-item slide-in-right animated-item delay-7">
                  <i className="fas fa-users pulse-icon"></i>
                  <span>Family Collaboration</span>
                </div>
                <div className="info-item slide-in-right animated-item delay-8">
                  <i className="fas fa-chart-line pulse-icon"></i>
                  <span>Progress Monitoring</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 