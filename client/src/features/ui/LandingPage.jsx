import React, { useState } from 'react';
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

  const handleBookingClick = () => {
    // Directly open booking modal - no authentication required
    setIsBookingModalOpen(true);
  };

  const handleLoginClick = () => {
    // Open authentication modal for login
    setIsAuthModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = (userData) => {
    // Check if user is admin and redirect to admin dashboard
    if (userData.role === 'admin') {
      window.location.href = '/admin';
    } else {
      // Regular user - just close the modal
      setIsAuthModalOpen(false);
    }
  };

  const handleBookingSubmit = async (formData) => {
    // Handle booking submission
    console.log('Booking submitted:', formData);
    // Close the modal after submission
    setIsBookingModalOpen(false);
    alert('Booking submitted successfully! We will contact you soon.');
  };

  return (
    <div>
      <FloatingElements />
      <Header
        isAdmin={false}
        showBookingButton={true}
        onBookClick={handleBookingClick}
        onLoginClick={handleLoginClick}
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