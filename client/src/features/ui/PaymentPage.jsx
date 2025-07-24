import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import '../../payment-styles.css';
import FloatingElements from './FloatingElements';

const PaymentPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [confirmationData, setConfirmationData] = useState({
    paymentDate: '',
    paymentReference: '',
    accountName: '',
    amountPaid: '2000'
  });
  
  const PAYMENT_FORM_STORAGE_KEY = 'paymentFormData';
  const PAYMENT_METHOD_STORAGE_KEY = 'selectedPaymentMethod';
  
  // Countdown timer state (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(900);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Get booking data from localStorage or navigation state
    const data = JSON.parse(localStorage.getItem('currentBooking') || '{}');
    setBookingData(data);
    
    // Load saved payment form data
    const savedPaymentData = localStorage.getItem(PAYMENT_FORM_STORAGE_KEY);
    if (savedPaymentData) {
      try {
        const parsedData = JSON.parse(savedPaymentData);
        setConfirmationData(parsedData);
      } catch (error) {
        console.error('Error loading saved payment form data:', error);
        localStorage.removeItem(PAYMENT_FORM_STORAGE_KEY);
      }
    }
    
    // Load saved payment method
    const savedPaymentMethod = localStorage.getItem(PAYMENT_METHOD_STORAGE_KEY);
    if (savedPaymentMethod) {
      setSelectedMethod(savedPaymentMethod);
    }
  }, []);

  // Save payment form data to localStorage whenever it changes
  useEffect(() => {
    if (confirmationData.paymentDate || confirmationData.paymentReference || confirmationData.accountName) {
      localStorage.setItem(PAYMENT_FORM_STORAGE_KEY, JSON.stringify(confirmationData));
    }
  }, [confirmationData]);

  // Save selected payment method to localStorage
  useEffect(() => {
    if (selectedMethod) {
      localStorage.setItem(PAYMENT_METHOD_STORAGE_KEY, selectedMethod);
    }
  }, [selectedMethod]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsExpired(true);
      // Auto-redirect after 5 seconds when expired
      setTimeout(() => {
        alert('Session expired. Please start over with your booking.');
        window.location.href = '/';
      }, 5000);
    }
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get countdown status for styling
  const getCountdownStatus = () => {
    if (timeLeft <= 0) return 'expired';
    if (timeLeft <= 300) return 'warning'; // 5 minutes warning
    if (timeLeft <= 600) return 'caution'; // 10 minutes caution
    return 'normal';
  };

  const handleMethodSelection = (method) => {
    setSelectedMethod(method);
    document.getElementById('step-1-next').disabled = false;
  };

  const proceedToStep2 = () => {
    if (selectedMethod) {
      setCurrentStep(2);
    }
  };

  const proceedToStep3 = () => {
    setCurrentStep(3);
  };

  const handleConfirmationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Handle different payment methods
      let paymentUpdateData;
      
      if (selectedMethod === 'cash') {
        // For cash payments, set status to pending and don't require payment verification
        paymentUpdateData = {
          paymentMethod: selectedMethod,
          paymentStatus: 'pending',
          paymentAmount: 2000,
          paymentDate: new Date().toISOString(),
          paymentReference: 'Cash on Site',
          accountName: bookingData.guardianName || 'Cash Payment'
        };
      } else {
        // For online payments (GCash/Maya), require verification
        paymentUpdateData = {
          paymentMethod: selectedMethod,
          paymentStatus: 'pending-verification',
          paymentAmount: 2000,
          paymentDate: confirmationData.paymentDate,
          paymentReference: confirmationData.paymentReference,
          accountName: confirmationData.accountName
        };
      }

      // Update the booking in the database with payment information
      const token = localStorage.getItem('userToken');
      const response = await axios.patch(
        `${API_BASE_URL}/api/bookings/${bookingData.bookingId}/payment`, 
        paymentUpdateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Clear current booking and payment form data
        localStorage.removeItem('currentBooking');
        localStorage.removeItem(PAYMENT_FORM_STORAGE_KEY);
        localStorage.removeItem(PAYMENT_METHOD_STORAGE_KEY);
        
        // Show appropriate success message based on payment method
        if (selectedMethod === 'cash') {
          alert('✅ Appointment reserved! We will call you to confirm your appointment details. Please bring ₱2,000 cash when you arrive.');
        } else {
          alert('✅ Payment confirmation submitted! We will verify your payment and contact you soon.');
        }
        
        window.location.href = '/';
      } else {
        throw new Error(response.data.message || 'Failed to update payment information');
      }
    } catch (error) {
      console.error('Error updating payment information:', error);
      
      // Fallback to localStorage for offline mode
      const paymentData = {
        ...bookingData,
        paymentMethod: selectedMethod,
        paymentStatus: selectedMethod === 'cash' ? 'pending' : 'pending-verification',
        paymentAmount: 2000,
        ...(selectedMethod === 'cash' ? {
          paymentDate: new Date().toISOString(),
          paymentReference: 'Cash on Site',
          accountName: bookingData.guardianName || 'Cash Payment'
        } : {
          paymentDate: confirmationData.paymentDate,
          paymentReference: confirmationData.paymentReference,
          accountName: confirmationData.accountName
        })
      };
      
      const existingBookings = JSON.parse(localStorage.getItem('assessmentBookings') || '[]');
      existingBookings.push(paymentData);
      localStorage.setItem('assessmentBookings', JSON.stringify(existingBookings));
      
      // Clear current booking and payment form data
      localStorage.removeItem('currentBooking');
      localStorage.removeItem(PAYMENT_FORM_STORAGE_KEY);
      localStorage.removeItem(PAYMENT_METHOD_STORAGE_KEY);
      
      alert('⚠️ Payment information saved locally. Please contact us if you experience any issues.');
      window.location.href = '/';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfirmationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <FloatingElements />
      
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>Lance and Yuri Kids Spot Naga City</h2>
          </div>
          <div className="nav-menu">
            <a href="/" className="nav-link">
              <i className="fas fa-arrow-left"></i> Back to Home
            </a>
          </div>
        </div>
      </nav>

      {/* Payment Section */}
      <section className="payment-section">
        <div className="container">
          <div className="payment-container">
            {/* Compact Header with Summary */}
            <div className="payment-header-compact">
              <div className="header-row">
                <div className="step-indicator-compact">
                  <div className={`step ${currentStep >= 1 ? 'completed' : ''}`}>1</div>
                  <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
                  <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
                </div>
                <div className="header-motivation-compact">
                  <i className="fas fa-heart"></i>
                  <span><strong>Don't Risk Your Child's Future!</strong> Early intervention is key to your child's development.</span>
                </div>
              </div>
              
              <div className="title-summary-row">
                <div className="payment-title">
                  <h1>Pay Booking Fee</h1>
                  <p>Secure your appointment with ₱2,000 reservation fee</p>
                </div>
                <div className="booking-summary-compact">
                  <div className="summary-card">
                    <div className="summary-item">
                      <span>Service:</span>
                      <span id="selected-service">Initial Assessment</span>
                    </div>
                    <div className="summary-item">
                      <span>Date:</span>
                      <span id="booking-date">{bookingData?.appointmentDate}</span>
                    </div>
                    <div className="summary-item total">
                      <span>Fee:</span>
                      <span className="amount" id="booking-fee">₱2,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Step Payment Process */}
            <div className="payment-steps">
              
              {/* Step 1: Payment Method Selection */}
              {currentStep === 1 && (
                <div className="payment-step" id="step-1" data-step="1">
                  <div className="step-header-compact">
                    <h3><i className="fas fa-credit-card"></i> Step 1: Select Payment Method</h3>
                    <p>Choose your preferred payment method to proceed</p>
                  </div>
                  
                  <div className="payment-methods-compact">
                    {/* GCash Option */}
                    <div 
                      className={`payment-option ${selectedMethod === 'gcash' ? 'selected' : ''}`} 
                      onClick={() => handleMethodSelection('gcash')}
                    >
                      <div className="payment-header-option">
                        <div className="payment-icon gcash-icon">
                          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFNvbGlkIGJyaWdodCBibHVlIGJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNiIgZmlsbD0iIzAwOENGRiIvPgogIDwhLS0gR0Nhc2ggdGV4dCAtLT4KICA8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkdDYXNoPC90ZXh0Pgo8L3N2Zz4K" alt="GCash" />
                        </div>
                        <div className="payment-info">
                          <h4>GCash</h4>
                          <p>Scan QR code and pay instantly</p>
                          <div className="payment-features">
                            <span className="feature">✓ Instant payment</span>
                            <span className="feature">✓ Secure transaction</span>
                          </div>
                        </div>
                        <div className="payment-radio">
                          <input 
                            type="radio" 
                            name="payment-method" 
                            value="gcash" 
                            id="gcash"
                            checked={selectedMethod === 'gcash'}
                            onChange={() => {}}
                          />
                          <label htmlFor="gcash"></label>
                        </div>
                      </div>
                    </div>

                    {/* Maya Option */}
                    <div 
                      className={`payment-option ${selectedMethod === 'maya' ? 'selected' : ''}`} 
                      onClick={() => handleMethodSelection('maya')}
                    >
                      <div className="payment-header-option">
                        <div className="payment-icon maya-icon">
                          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIERhcmsgYmFja2dyb3VuZCAtLT4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI2IiBmaWxsPSIjMkEyQTJBIi8+CiAgPCEtLSBtYXlhIHRleHQgLS0+CiAgPHRleHQgeD0iMjAiIHk9IjI2IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiMwMEQ3M0IiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGxldHRlci1zcGFjaW5nPSItMC41cHgiPm1heWE8L3RleHQ+Cjwvc3ZnPgo=" alt="Maya" />
                        </div>
                        <div className="payment-info">
                          <h4>Maya</h4>
                          <p>Pay using Maya digital wallet</p>
                          <div className="payment-features">
                            <span className="feature">✓ QR code payment</span>
                            <span className="feature">✓ Instant transfer</span>
                          </div>
                        </div>
                        <div className="payment-radio">
                          <input 
                            type="radio" 
                            name="payment-method" 
                            value="maya" 
                            id="maya"
                            checked={selectedMethod === 'maya'}
                            onChange={() => {}}
                          />
                          <label htmlFor="maya"></label>
                        </div>
                      </div>
                    </div>

                    {/* Cash on Site Option */}
                    <div 
                      className={`payment-option ${selectedMethod === 'cash' ? 'selected' : ''}`} 
                      onClick={() => handleMethodSelection('cash')}
                    >
                      <div className="payment-header-option">
                        <div className="payment-icon cash-icon">
                          <i className="fas fa-money-bill-wave"></i>
                        </div>
                        <div className="payment-info">
                          <h4>Pay Cash on Site</h4>
                          <p>Pay cash when you arrive for your appointment</p>
                          <div className="payment-features">
                            <span className="feature">✓ No online payment needed</span>
                            <span className="feature">✓ Pay upon arrival</span>
                          </div>
                        </div>
                        <div className="payment-radio">
                          <input 
                            type="radio" 
                            name="payment-method" 
                            value="cash" 
                            id="cash"
                            checked={selectedMethod === 'cash'}
                            onChange={() => {}}
                          />
                          <label htmlFor="cash"></label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => window.history.back()}>
                      <i className="fas fa-arrow-left"></i>
                      Back to Booking
                    </button>
                    <button 
                      className="btn-next" 
                      id="step-1-next" 
                      disabled={!selectedMethod}
                      onClick={proceedToStep2}
                    >
                      Continue to Payment
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Details - GCash or Maya */}
              {currentStep === 2 && (selectedMethod === 'gcash' || selectedMethod === 'maya') && (
                <div className="payment-step" id="step-2-online" data-step="2">
                  <div className="step-header-compact">
                    <h3>
                      <i className={selectedMethod === 'gcash' ? 'fas fa-mobile-alt' : 'fas fa-mobile-alt'}></i> 
                      Step 2: {selectedMethod === 'gcash' ? 'GCash' : 'Maya'} Payment
                    </h3>
                    <div className={`payment-warning-inline countdown-${getCountdownStatus()}`}>
                      <i className="fas fa-clock"></i>
                      <span>
                        {isExpired ? (
                          <span className="expired-text">⚠️ Session Expired - Please start over</span>
                        ) : (
                          <>
                            <span className="countdown-text">Time remaining: </span>
                            <span className="countdown-timer">{formatTime(timeLeft)}</span>
                            <span className="countdown-note"> • No refunds</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="gcash-payment-container-compact">
                    <div className="payment-instructions-compact">
                      <h4><i className="fas fa-list-ol"></i> Payment Instructions</h4>
                      <div className="steps-container">
                        <ol className="payment-steps-compact">
                          <li>
                            <span style={{ fontWeight: 'bold' }}>Option 1: Scan QR Code</span>
                            <div className="qr-code-section-compact">
                              <div className="qr-code-wrapper">
                                <img 
                                  src={selectedMethod === 'gcash' ? '/images/gcash-payment.jpg' : '/images/maya-payment.jpg'} 
                                  alt={`${selectedMethod === 'gcash' ? 'GCash' : 'Maya'} QR Code`}
                                  style={{ width: '300px', height: '300px', objectFit: 'contain' }}
                                />
                              </div>
                              <div className="payment-amount-compact">
                                ₱2,000
                              </div>
                              <small>Scan with your {selectedMethod === 'gcash' ? 'GCash' : 'Maya'} app</small>
                            </div>
                          </li>
                          <li>
                            <span style={{ fontWeight: 'bold' }}>Option 2: Send to {selectedMethod === 'gcash' ? 'GCash' : 'Maya'} Account</span>
                            <div className="gcash-account-info-compact" style={{ marginTop: '1rem' }}>
                              <h4><i className="fas fa-mobile-alt"></i> {selectedMethod === 'gcash' ? 'GCash' : 'Maya'} Details</h4>
                              <div className="account-detail">
                                <span className="label">Name:</span>
                                <span className="value">Ernie Singson</span>
                              </div>
                              <div className="account-detail">
                                <span className="label">Number:</span>
                                <span className="value">09299512205</span>
                              </div>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="step-actions">
                    <button 
                      className="btn-back" 
                      onClick={() => setCurrentStep(1)}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Back to Methods
                    </button>
                    <button 
                      className="btn-next" 
                      onClick={proceedToStep3}
                      disabled={isExpired}
                    >
                      {isExpired ? 'Session Expired' : 'Payment Completed'}
                      {!isExpired && <i className="fas fa-arrow-right"></i>}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Details - Cash on Site */}
              {currentStep === 2 && selectedMethod === 'cash' && (
                <div className="payment-step" id="step-2-cash" data-step="2">
                  <div className="step-header-compact">
                    <h3><i className="fas fa-money-bill-wave"></i> Step 2: Cash Payment Confirmation</h3>
                    <div className="motivational-message">
                      <i className="fas fa-info-circle"></i>
                      <span>
                        <strong>No payment needed now!</strong> You can pay cash when you arrive for your appointment.
                      </span>
                    </div>
                  </div>

                  <div className="cash-payment-container-compact">
                    <div className="cash-payment-details">
                      <div className="cash-instructions">
                        <h4><i className="fas fa-clipboard-list"></i> What to expect:</h4>
                        <div className="instruction-list">
                          <div className="instruction-item">
                            <i className="fas fa-calendar-check"></i>
                            <div>
                              <strong>Appointment Confirmation</strong>
                              <p>Your appointment is reserved and will be confirmed shortly</p>
                            </div>
                          </div>
                          <div className="instruction-item">
                            <i className="fas fa-money-bill-wave"></i>
                            <div>
                              <strong>Payment on Arrival</strong>
                              <p>Pay ₱2,000 cash when you arrive for your appointment</p>
                            </div>
                          </div>
                          <div className="instruction-item">
                            <i className="fas fa-phone"></i>
                            <div>
                              <strong>Confirmation Call</strong>
                              <p>We'll call you to confirm your appointment details</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="cash-payment-summary">
                        <h4><i className="fas fa-receipt"></i> Appointment Summary</h4>
                        <div className="summary-details">
                          <div className="summary-row">
                            <span>Service:</span>
                            <span>Initial Assessment</span>
                          </div>
                          <div className="summary-row">
                            <span>Date:</span>
                            <span>{bookingData?.appointmentDate}</span>
                          </div>
                          <div className="summary-row">
                            <span>Payment Method:</span>
                            <span>Cash on Site</span>
                          </div>
                          <div className="summary-row total">
                            <span>Amount to Pay:</span>
                            <span className="amount">₱2,000</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="step-actions">
                    <button 
                      className="btn-back" 
                      onClick={() => setCurrentStep(1)}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Back to Methods
                    </button>
                    <button 
                      className="btn-next" 
                      onClick={proceedToStep3}
                    >
                      Confirm Appointment
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}



              {/* Step 3: Payment Confirmation */}
              {currentStep === 3 && (
                <div className="payment-step" id="step-3" data-step="3">
                  {selectedMethod === 'cash' ? (
                    // Cash Payment Confirmation
                    <>
                      <div className="step-header-compact">
                        <h3><i className="fas fa-check-circle"></i> Step 3: Final Confirmation</h3>
                        <div className="motivational-message">
                          <i className="fas fa-heart"></i>
                          <span>
                            <strong>Almost done!</strong> Your appointment is ready to be confirmed.
                          </span>
                        </div>
                      </div>

                      <div className="cash-confirmation-container">
                        <div className="booking-confirmation-details">
                          <h4><i className="fas fa-calendar-alt"></i> Booking Details</h4>
                          <div className="confirmation-grid">
                            <div className="detail-group">
                              <label>Guardian Name:</label>
                              <span>{bookingData?.guardianName}</span>
                            </div>
                            <div className="detail-group">
                              <label>Child Name:</label>
                              <span>{bookingData?.childName}</span>
                            </div>
                            <div className="detail-group">
                              <label>Email:</label>
                              <span>{bookingData?.guardianEmail}</span>
                            </div>
                            <div className="detail-group">
                              <label>Phone:</label>
                              <span>{bookingData?.guardianPhone}</span>
                            </div>
                            <div className="detail-group">
                              <label>Address:</label>
                              <span>{(bookingData?.guardianAddress && bookingData.guardianAddress.trim() !== '') ? bookingData.guardianAddress : 'Not provided'}</span>
                            </div>
                            <div className="detail-group">
                              <label>Branch:</label>
                              <span>{bookingData?.branchLocation === 'blumentritt' ? 'Main Branch - Blumentritt' : 'Satellite Branch - Del Rosario'}</span>
                            </div>
                            <div className="detail-group">
                              <label>Date & Time:</label>
                              <span>{bookingData?.appointmentDate} at {bookingData?.selectedTime}</span>
                            </div>
                            <div className="detail-group">
                              <label>Service:</label>
                              <span>Initial Assessment</span>
                            </div>
                            <div className="detail-group">
                              <label>Professional:</label>
                              <span>
                                {bookingData?.selectedProfessional === 'developmental-pediatrician' ? 'Developmental Pediatrician' :
                                 bookingData?.selectedProfessional === 'occupational-therapist' ? 'Occupational Therapist' :
                                 bookingData?.selectedProfessional === 'speech-language-pathologist' ? 'Speech and Language Pathologist' :
                                 (bookingData?.selectedProfessional && bookingData.selectedProfessional.trim() !== '') ? bookingData.selectedProfessional : 'Not selected'}
                              </span>
                            </div>
                            <div className="detail-group">
                              <label>Payment Method:</label>
                              <span>Cash on Site</span>
                            </div>
                            <div className="detail-group payment-amount-group">
                              <label>Amount to Pay:</label>
                              <span className="amount">₱2,000</span>
                            </div>
                          </div>
                        </div>

                        <div className="cash-reminder">
                          <h4><i className="fas fa-exclamation-triangle"></i> Important Reminders</h4>
                          <ul>
                            <li>Bring exactly ₱2,000 in cash on your appointment day</li>
                            <li>Arrive 10-15 minutes early for registration</li>
                            <li>We will call you to confirm your appointment details</li>
                            <li>Please bring your child's birth certificate or ID</li>
                          </ul>
                        </div>
                      </div>

                      <div className="step-actions">
                        <button 
                          type="button"
                          className="btn-back" 
                          onClick={() => setCurrentStep(2)}
                        >
                          <i className="fas fa-arrow-left"></i>
                          Back to Details
                        </button>
                        <button 
                          type="button"
                          className="btn-submit btn-confirm" 
                          onClick={handleConfirmationSubmit}
                        >
                          <i className="fas fa-check"></i>
                          Confirm Appointment
                        </button>
                      </div>
                    </>
                  ) : (
                    // Online Payment Confirmation (GCash/Bank)
                    <>
                      <div className="step-header">
                        <h3><i className="fas fa-check-circle"></i> Step 3: Confirm Your Payment</h3>
                        <p>Please provide your payment details for verification</p>
                      </div>

                      <div className="confirmation-form">
                        <form id="payment-confirmation-form" onSubmit={handleConfirmationSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="payment-date">Date of Payment</label>
                          <input 
                            type="date" 
                            id="payment-date" 
                            name="paymentDate" 
                            value={confirmationData.paymentDate}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="payment-reference">Reference Number</label>
                          <input 
                            type="text" 
                            id="payment-reference" 
                            name="paymentReference" 
                            className="form-control" 
                            placeholder="Enter transaction reference" 
                            value={confirmationData.paymentReference}
                            onChange={handleInputChange}
                            required 
                            pattern="[0-9]{12}" 
                            maxLength="12" 
                            inputMode="numeric" 
                            title="Reference number must be exactly 12 digits"
                          />
                          <small className="form-text text-muted">Reference number must be exactly 12 digits.</small>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="account-name">Account Name</label>
                          <input 
                            type="text" 
                            id="account-name" 
                            name="accountName" 
                            placeholder="Enter account holder name" 
                            value={confirmationData.accountName}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="amount-paid">Amount Paid</label>
                          <div className="input-with-icon">
                            <span className="currency-symbol">₱</span>
                            <input 
                              type="text" 
                              id="amount-paid" 
                              name="amountPaid" 
                              placeholder="Enter amount paid" 
                              value={confirmationData.amountPaid}
                              onChange={handleInputChange}
                              pattern="[0-9]+" 
                              inputMode="numeric"
                              required 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="payment-summary-confirmation">
                        <h4>Payment Summary</h4>
                        <div className="summary-item">
                          <span>Payment Method:</span>
                          <span>{selectedMethod === 'gcash' ? 'GCash' : selectedMethod === 'maya' ? 'Maya' : 'Cash on Site'}</span>
                        </div>
                        <div className="summary-item">
                          <span>Reservation Fee:</span>
                          <span>₱2,000.00</span>
                        </div>
                        <div className="summary-item">
                          <span>Service:</span>
                          <span>Initial Assessment</span>
                        </div>
                      </div>

                      <div className="step-actions">
                        <button type="button" className="btn-back" onClick={() => setCurrentStep(2)}>
                          <i className="fas fa-arrow-left"></i>
                          Back
                        </button>
                        <button type="submit" className="btn-submit">
                          <i className="fas fa-check"></i>
                          Submit Payment Confirmation
                        </button>
                      </div>
                    </form>
                  </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <div className="security-notice">
        <div className="container">
          <div className="security-content">
            <i className="fas fa-shield-alt"></i>
            <div>
              <h4>Secure Payment</h4>
              <p>Your payment information is encrypted and secure. We never store your financial details.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage; 