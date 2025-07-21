import React, { useState, useEffect } from 'react';

const ImageCarousel = ({ 
  images, 
  autoplay = true, 
  autoplayInterval = 4000,
  showDots = true,
  showArrows = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, images.length, autoplayInterval]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(autoplay);
  };

  if (!images || images.length === 0) {
    return <div className="carousel-placeholder">No images available</div>;
  }

  return (
    <div 
      className={`image-carousel ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-container">
        <div className="carousel-track" style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}>
          {images.map((image, index) => (
            <div key={index} className="carousel-slide">
              <img 
                src={image.src} 
                alt={image.alt || `Slide ${index + 1}`}
                className="carousel-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="image-placeholder" style={{ display: 'none' }}>
                <div className="placeholder-content">
                  <i className="fas fa-image" style={{ fontSize: '48px', color: 'var(--primary-orange)', marginBottom: '10px' }}></i>
                  <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
                    {image.alt || 'Image unavailable'}
                  </p>
                </div>
              </div>
              {image.caption && (
                <div className="carousel-caption">
                  <p>{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && images.length > 1 && (
          <>
            <button 
              className="carousel-arrow carousel-arrow-left"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              className="carousel-arrow carousel-arrow-right"
              onClick={goToNext}
              aria-label="Next image"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {showDots && images.length > 1 && (
          <div className="carousel-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="carousel-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel; 