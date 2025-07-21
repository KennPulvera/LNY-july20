import React, { useState, useEffect } from 'react';
import '../../styles.css';
import FloatingElements from './FloatingElements';
import Header from './Header';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import Footer from './Footer';
import BookingModal from './BookingModal';
import AuthModal from './AuthModal';
import AboutSection from './AboutSection';
import OtherBranchesSection from './OtherBranchesSection';
import SimpleSlider from './SimpleSlider';
import PediatricianSection from './PediatricianSection';
import FloatingCTA from './CTASection';

const LandingPage = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const handleBookingClick = () => {
    if (user) {
      // Check if user is admin
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        // Regular user - show booking modal
        setIsBookingModalOpen(true);
      }
    } else {
      // User is not logged in, show authentication modal
      setIsAuthModalOpen(true);
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    
    // Check if user is admin and redirect to admin dashboard
    if (userData.role === 'admin') {
      window.location.href = '/admin';
    } else {
      // Regular user - open booking modal
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingSubmit = async (formData) => {
    // Handle booking submission
    console.log('Booking submitted:', formData);
    // Here you would typically send the data to your backend
    // For now, just close the modal
    setIsBookingModalOpen(false);
    alert('Booking submitted successfully! We will contact you soon.');
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <div>
      <FloatingElements />
      <Header 
        isAdmin={false} 
        showBookingButton={true} 
        onBookClick={handleBookingClick}
        user={user}
        onLogout={handleLogout}
      />
      <HeroSection onBookClick={handleBookingClick} />
      <AboutSection />
      <PediatricianSection />
      <SimpleSlider />
      <ServicesSection onBookClick={handleBookingClick} />
      <OtherBranchesSection />
      <Footer />
      
      {/* Floating CTA - Always visible */}
      <FloatingCTA onBookClick={handleBookingClick} />
      
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSubmit={handleBookingSubmit}
        user={user}
      />
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage; 