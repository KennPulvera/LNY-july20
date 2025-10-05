import React, { useState, useEffect, useRef } from 'react';

const ImageCarousel = ({ 
  images, 
  autoplay = true, 
  autoplayInterval = 4000,
  showDots = true,
  showArrows = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);
  const rafId = useRef(0);

  // Auto-play functionality (runs only when visible)
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

  // Passive touch listeners + rAF-throttled move
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const handleStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
      setIsAutoPlaying(false);
    };
    const handleMove = (e) => {
      const x = e.targetTouches[0].clientX;
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => setTouchEnd(x));
    };
    const handleEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;
      if (isLeftSwipe && currentIndex < images.length - 1) goToNext();
      if (isRightSwipe && currentIndex > 0) goToPrevious();
      setTimeout(() => setIsAutoPlaying(autoplay), 2000);
    };
    node.addEventListener('touchstart', handleStart, { passive: true });
    node.addEventListener('touchmove', handleMove, { passive: true });
    node.addEventListener('touchend', handleEnd, { passive: true });
    return () => {
      node.removeEventListener('touchstart', handleStart);
      node.removeEventListener('touchmove', handleMove);
      node.removeEventListener('touchend', handleEnd);
      cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, touchStart, touchEnd, autoplay, images.length]);

  // Start/pause autoplay only when the carousel is in view
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsAutoPlaying(autoplay);
          else setIsAutoPlaying(false);
        });
      },
      { root: null, rootMargin: '100px', threshold: 0.01 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [autoplay]);

  if (!images || images.length === 0) {
    return <div className="carousel-placeholder">No images available</div>;
  }

  return (
    <div 
      className={`image-carousel ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="carousel-container"
        ref={containerRef}
      >
        <div className="carousel-track" style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}>
          {images.map((image, index) => (
            <div key={index} className="carousel-slide">
              <img 
                src={image.src} 
                alt={image.alt || `Slide ${index + 1}`}
                className="carousel-image"
                loading="lazy"
                decoding="async"
                width={image.width || 1000}
                height={image.height || 500}
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