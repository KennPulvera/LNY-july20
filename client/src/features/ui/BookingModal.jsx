import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const BookingModal = ({ isOpen, onClose, onSubmit, user }) => {
  const FORM_STORAGE_KEY = 'bookingFormData';
  
  const [formData, setFormData] = useState({
    branchLocation: '',
    guardianName: '',
    guardianRelation: '',
    otherRelationship: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianAddress: '',
    childName: '',
    childBirthday: '',
    appointmentDate: '',
    selectedTime: '',
    selectedProfessional: ''
  });

  const [ageDisplay, setAgeDisplay] = useState('Age will be calculated automatically');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Professional availability features removed as requested

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        
        // If there's a saved birthday, calculate age
        if (parsedData.childBirthday) {
          calculateAge(parsedData.childBirthday);
        }
        
        // If there's a saved date and branch, load time slots
        if (parsedData.appointmentDate && parsedData.branchLocation) {
          loadTimeSlots(parsedData.appointmentDate);
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save form data with debouncing and meaningful data check
  useEffect(() => {
    // Check if form has meaningful data to save
    const hasMeaningfulData = formData.guardianName || 
                             formData.childName || 
                             formData.guardianPhone || 
                             formData.branchLocation ||
                             formData.appointmentDate;
    
    if (!hasMeaningfulData) {
      setAutoSaveStatus('idle');
      return;
    }

    setAutoSaveStatus('saving');
    setHasUnsavedChanges(true);
    
    // Debounce auto-save by 1 second
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
        setAutoSaveStatus('saved');
        setHasUnsavedChanges(false);
        
        // Reset to idle after 3 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      } catch (error) {
        console.error('Error auto-saving form data:', error);
        setAutoSaveStatus('idle');
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If branch location is changed, reset the date and time fields
    if (name === 'branchLocation' && value) {
      // Clear any existing date and time selections
      setFormData(prev => ({
        ...prev,
        appointmentDate: '',
        selectedTime: ''
      }));
      
      // Reset available time slots
      setAvailableTimeSlots([]);
    }
  };

  const calculateAge = (birthday) => {
    if (!birthday) return;
    
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    // Adjust if day difference is negative
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    // Adjust if month difference is negative
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // Format the age display
    let ageString = '';
    if (years > 0) {
      ageString += `${years} year${years !== 1 ? 's' : ''}`;
    }
    if (months > 0) {
      if (ageString) ageString += ', ';
      ageString += `${months} month${months !== 1 ? 's' : ''}`;
    }
    if (days > 0) {
      if (ageString) ageString += ', ';
      ageString += `${days} day${days !== 1 ? 's' : ''}`;
    }
    
    if (!ageString) {
      ageString = 'Less than 1 day old';
    } else {
      ageString += ' old';
    }
    
    setAgeDisplay(ageString);
  };

  const handleBirthdayChange = (e) => {
    handleChange(e);
    calculateAge(e.target.value);
  };

  const loadTimeSlots = async (date) => {
    if (!date || !formData.branchLocation) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings/availability/${date}?branch=${formData.branchLocation}&professional=${formData.selectedProfessional}`);
      if (response.data.success) {
        setAvailableTimeSlots(response.data.availableSlots);
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      // Fallback to default time slots if API fails
      setAvailableTimeSlots([
        '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
      ]);
    }
  };

  // Professional availability checking removed as requested - secretary will contact if needed

  const handleProfessionalChange = (e) => {
    handleChange(e);
    // Professional availability checking removed - secretary will contact if needed
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    handleChange(e);
    loadTimeSlots(date);
    // Professional availability checking removed - secretary will contact if needed
  };

  const clearSavedData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    setFormData({
      branchLocation: '',
      guardianName: '',
      guardianRelation: '',
      otherRelationship: '',
      guardianEmail: '',
      guardianPhone: '',
      guardianAddress: '',
      childName: '',
      childBirthday: '',
      appointmentDate: '',
      selectedTime: '',
      selectedProfessional: ''
    });
    setAgeDisplay('Age will be calculated automatically');
    setAvailableTimeSlots([]);
    setAutoSaveStatus('idle');
    setHasUnsavedChanges(false);
  };

  const validateTimeSlotAvailability = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings/availability/${formData.appointmentDate}?branch=${formData.branchLocation}`);
      if (response.data.success) {
        const availableSlots = response.data.availableSlots;
        return availableSlots.includes(formData.selectedTime);
      }
      return false;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false; // Assume unavailable if check fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Add calculated age to form data (date/time will be scheduled by secretary)
      const submissionData = {
        ...formData,
        childAge: ageDisplay,
        // Set placeholder date/time - secretary will update later
        appointmentDate: new Date().toISOString(),
        selectedTime: 'To be scheduled'
      };

      // Submit booking (no authentication required for guest bookings)
      const response = await axios.post(`${API_BASE_URL}/api/bookings`, submissionData);
      if (response.data.success) {
        // Clear saved form data since submission was successful
        localStorage.removeItem(FORM_STORAGE_KEY);
        setAutoSaveStatus('idle');
        setHasUnsavedChanges(false);
        
        // Save booking ID to localStorage for payment page
        localStorage.setItem('currentBooking', JSON.stringify({
          ...submissionData,
          bookingId: response.data.data._id
        }));
        
        // Redirect to payment page
        window.location.href = '/payment';
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      
      // Special handling for double-booking error
      if (error.response?.status === 409) {
        setError('⚠️ ' + errorMessage + ' Please refresh the page and select a different time slot.');
        
        // Refresh available time slots to show current availability
        if (formData.appointmentDate && formData.branchLocation) {
          setTimeout(() => {
            loadTimeSlots(formData.appointmentDate);
          }, 1000);
        }
      } else {
        setError(errorMessage);
      }
      
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal magic-modal" style={{ display: 'block' }}>
      <div className="auth-modal-content booking-modal-content booking-modal-large">
        <div className="auth-modal-header">
          <h2>🎈 Guest Assessment Booking ⭐</h2>
          <div className="header-controls">
            <div className={`auto-save-indicator ${autoSaveStatus}`}>
              {autoSaveStatus === 'saving' && (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Saving...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <i className="fas fa-check"></i>
                  <span>Auto-saved</span>
                </>
              )}
              {autoSaveStatus === 'idle' && hasUnsavedChanges && (
                <>
                  <i className="fas fa-edit"></i>
                  <span>Unsaved changes</span>
                </>
              )}
              {autoSaveStatus === 'idle' && !hasUnsavedChanges && (
                <>
                  <i className="fas fa-save"></i>
                  <span>Ready</span>
                </>
              )}
            </div>
            <button className="clear-form-btn" onClick={clearSavedData} title="Clear all saved data">
              <i className="fas fa-trash"></i>
            </button>
            <span className="guest-booking-close" onClick={onClose}>&times;</span>
          </div>
        </div>
        <div className="auth-modal-body">
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}
          
          <form id="guestBookingForm" onSubmit={handleSubmit}>
            {/* Branch Selection */}
            <div className="form-section branch-selection">
              <h4><i className="fas fa-map-marker-alt"></i> Select Branch Location 📍</h4>
              <div className="form-group">
                <label htmlFor="branchLocation">Choose Your Preferred Branch</label>
                <select
                  id="branchLocation"
                  name="branchLocation"
                  value={formData.branchLocation}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select...</option>
                  <option value="naga-blumentritt">Naga City - Main Branch (Blumentritt)</option>
                  <option value="naga-delrosario">Naga City - Satellite Branch (Del Rosario)</option>
                  <option value="legazpi">Legazpi Branch</option>
                  <option value="daet">Daet Branch</option>
                  <option value="guinobatan">Guinobatan Branch</option>
                  <option value="polangui">Polangui Branch</option>
                  <option value="daraga">Daraga Branch</option>
                  <option value="tabaco">Tabaco Branch</option>
                  <option value="sorsogon">Sorsogon Branch</option>
                  <option value="iriga">Iriga Branch</option>
                  <option value="catanduanes">Catanduanes Branch</option>
                </select>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="form-section">
              <h4><i className="fas fa-user-shield"></i> Guardian Contact Information 👤🛡️</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="guardianName">Guardian Name</label>
                  <input 
                    type="text" 
                    id="guardianName" 
                    name="guardianName" 
                    value={formData.guardianName}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="guardianRelation">Relationship to Child</label>
                  <select 
                    id="guardianRelation" 
                    name="guardianRelation" 
                    value={formData.guardianRelation}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                  {formData.guardianRelation === 'Other' && (
                    <div className="other-relationship-input" style={{ marginTop: '10px' }}>
                      <input 
                        type="text" 
                        name="otherRelationship" 
                        placeholder="Please specify your relationship to the child" 
                        className="other-relationship-field"
                        value={formData.otherRelationship}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="guardianEmail">Email Address</label>
                  <input
                    type="email"
                    id="guardianEmail"
                    name="guardianEmail"
                    placeholder="your-email@example.com"
                    value={formData.guardianEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="guardianPhone">Contact Number</label>
                  <input
                    type="tel"
                    id="guardianPhone"
                    name="guardianPhone"
                    pattern="09[0-9]{9}"
                    placeholder="09XX XXX XXXX"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="guardianAddress">Complete Address</label>
                  <input 
                    type="text" 
                    id="guardianAddress" 
                    name="guardianAddress" 
                    placeholder="House #, Street, Barangay, City, Province" 
                    value={formData.guardianAddress}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Child Information */}
            <div className="form-section">
              <h4><i className="fas fa-child"></i> Child Information 👶</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="childName">Child's Full Name</label>
                  <input 
                    type="text" 
                    id="childName" 
                    name="childName" 
                    value={formData.childName}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="childBirthday">Child's Birthday</label>
                  <input 
                    type="date" 
                    id="childBirthday" 
                    name="childBirthday" 
                    value={formData.childBirthday}
                    onChange={handleBirthdayChange}
                    max={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Child's Age</label>
                  <div className="age-display">
                    <span className="age-text">{ageDisplay}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Selection */}
            <div className="form-section">
              <h4><i className="fas fa-user-md"></i> Choose a Professional 👨‍⚕️</h4>
              <div className="form-group">
                <label htmlFor="selectedProfessional">Select Preferred Professional</label>
                <select 
                  id="selectedProfessional" 
                  name="selectedProfessional" 
                  value={formData.selectedProfessional}
                  onChange={handleProfessionalChange}
                  required
                >
                  <option value="">Select a professional...</option>
                  <option value="developmental-pediatrician">👶 Developmental Pediatrician</option>
                  <option value="occupational-therapist">🖐️ Occupational Therapist</option>
                  <option value="speech-language-pathologist">🗣️ Speech and Language Pathologist</option>
                </select>
              </div>
              
              {/* Important Scheduling Notice */}
              <div className="scheduling-notice highlighted-notice">
                <div className="notice-content">
                  <i className="fas fa-info-circle"></i>
                  <p><strong>📅 Scheduling Policy:</strong> If your selected professional is not available at the date and time of booking, our secretary will contact you to reschedule your appointment or suggest an alternative time that works for both you and the professional.</p>
                </div>
              </div>
              
              <div className="professional-info">
                {formData.selectedProfessional === 'developmental-pediatrician' && (
                  <div className="professional-description">
                    <p><strong>Developmental Pediatrician:</strong> Provides medical services to infants, children, and adolescents. Trained in overall growth and development, often the first point of contact for developmental concerns.</p>
                  </div>
                )}
                {formData.selectedProfessional === 'occupational-therapist' && (
                  <div className="professional-description">
                    <p><strong>Occupational Therapist:</strong> Provides assessment and treatment using specific, purposeful activities to prevent disability and promote independent function in all aspects of daily life.</p>
                  </div>
                )}
                {formData.selectedProfessional === 'speech-language-pathologist' && (
                  <div className="professional-description">
                    <p><strong>Speech and Language Pathologist:</strong> Specializes in communication disorders, providing assessment and treatment for speech articulation, language development, and communication skills enhancement.</p>
                  </div>
                )}
                
                {/* No availability status section - removed as requested */}
              </div>
            </div>

            {/* Date and Time removed - Secretary will contact to schedule */}
            <div className="form-section">
              <div className="scheduling-notice highlighted-notice">
                <div className="notice-content">
                  <i className="fas fa-calendar-check"></i>
                  <p><strong>📅 Appointment Scheduling:</strong> After submitting your booking, our secretary will contact you to schedule the best date and time for your appointment.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-book-now magic-book-btn"
              disabled={loading}
            >
              <i className="fas fa-calendar-check"></i>
              <span>{loading ? 'Processing...' : 'Book Assessment'}</span>
              <div className="book-sparkles">
                <span className="sparkle">✨</span>
                <span className="sparkle">🌟</span>
                <span className="sparkle">💫</span>
                <span className="sparkle">⭐</span>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 