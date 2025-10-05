import React, { useEffect, useRef, useState } from 'react';
import ImageCarousel from './ImageCarousel';

const SimpleSlider = ({ 
  height = '500px',        // Increased default height
  fitType = 'cover',       // Changed default to cover for better photo display
  showDots = true,
  showArrows = true,
  autoplaySpeed = 4000     // Slightly slower for better viewing
}) => {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setInView(true);
        });
      },
      { root: null, rootMargin: '200px', threshold: 0.01 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  // Just add your image files here - no captions or descriptions needed
  const simpleImages = [
    {
      src: './images/simple/photo1.jpg',
      alt: 'Lance Yuri Kids Spot - Therapy Session'
    },
    {
      src: './images/simple/photo2.jpg', 
      alt: 'Lance Yuri Kids Spot - Child Development'
    },
    {
      src: './images/simple/photo3.jpg',
      alt: 'Lance Yuri Kids Spot - Pediatric Care'
    },
    {
      src: './images/simple/photo4.jpg',
      alt: 'Lance Yuri Kids Spot - Therapy Environment'
    },
    {
      src: './images/simple/photo5.jpg',
      alt: 'Lance Yuri Kids Spot - Family Care'
    }
  ];

  return (
    <section ref={sectionRef} className="enhanced-slider-section" style={{ 
      padding: '80px 0', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 50%, #f1f8e9 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50px',
        fontSize: '120px',
        color: 'rgba(255, 107, 53, 0.08)',
        transform: 'rotate(-15deg)',
        zIndex: 1
      }}>
        📸
      </div>
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '80px',
        fontSize: '100px',
        color: 'rgba(33, 150, 243, 0.08)',
        transform: 'rotate(15deg)',
        zIndex: 1
      }}>
        🌟
      </div>
      
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--primary-orange), #ff8a65)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            What to Expect ✨
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Experience our warm, professional environment designed for children's growth and development at Lance Yuri Kids Spot Center
          </p>
        </div>

        {/* Enhanced Slider Container */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
            borderRadius: '30px',
            padding: '20px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15), 0 10px 25px rgba(255, 107, 53, 0.1)',
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, var(--primary-orange), #ff8a65, #2196f3) 1',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Corner Elements */}
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              width: '30px',
              height: '30px',
              background: 'linear-gradient(135deg, var(--primary-orange), #ff8a65)',
              borderRadius: '50%',
              opacity: '0.8'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              width: '25px',
              height: '25px',
              background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
              borderRadius: '50%',
              opacity: '0.8'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '15px',
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #4caf50, #81c784)',
              borderRadius: '50%',
              opacity: '0.8'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '15px',
              right: '15px',
              width: '35px',
              height: '35px',
              background: 'linear-gradient(135deg, #ff6b35, #ffa726)',
              borderRadius: '50%',
              opacity: '0.6'
            }}></div>

            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              height: height,
              position: 'relative',
              background: '#000'
            }}>
              <style>
                {`
                  .enhanced-slider .carousel-container {
                    height: ${height};
                    border-radius: 20px;
                  }
                  .enhanced-slider .carousel-image {
                    object-fit: ${fitType};
                    object-position: center;
                    transition: transform 0.5s ease;
                  }
                  .enhanced-slider .carousel-image:hover {
                    transform: scale(1.02);
                  }
                  .enhanced-slider .carousel-dots {
                    bottom: 20px;
                  }
                  .enhanced-slider .carousel-dot {
                    width: 12px;
                    height: 12px;
                    background: rgba(255, 255, 255, 0.6);
                    border: 2px solid var(--primary-orange);
                    margin: 0 8px;
                    transition: all 0.3s ease;
                  }
                  .enhanced-slider .carousel-dot.active {
                    background: var(--primary-orange);
                    transform: scale(1.3);
                    box-shadow: 0 0 15px rgba(255, 107, 53, 0.6);
                  }
                  .enhanced-slider .carousel-arrow {
                    background: linear-gradient(135deg, var(--primary-orange), #ff8a65);
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    color: white;
                    font-size: 18px;
                    box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
                    transition: all 0.3s ease;
                  }
                  .enhanced-slider .carousel-arrow:hover {
                    transform: scale(1.1);
                    box-shadow: 0 12px 30px rgba(255, 107, 53, 0.5);
                  }
                  .enhanced-slider .carousel-arrow:before {
                    content: none;
                  }
                `}
              </style>
              <div className="enhanced-slider">
                {inView && (
                  <ImageCarousel 
                    images={simpleImages}
                    autoplay={true}
                    autoplayInterval={autoplaySpeed}
                    showDots={showDots}
                    showArrows={showArrows}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '10%',
        fontSize: '24px',
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '0s'
      }}>
        💝
      </div>
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '15%',
        fontSize: '28px',
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '2s'
      }}>
        🎈
      </div>
      <div style={{
        position: 'absolute',
        bottom: '60%',
        left: '80%',
        fontSize: '20px',
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '4s'
      }}>
        ⭐
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(5deg); }
            66% { transform: translateY(-10px) rotate(-3deg); }
          }
        `}
      </style>
    </section>
  );
};

export default SimpleSlider; 