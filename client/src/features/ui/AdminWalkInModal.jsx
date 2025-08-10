import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const AdminWalkInModal = ({ isOpen, onClose, onSuccess, selectedBranch }) => {
  const [formData, setFormData] = useState({
    serviceType: 'Initial Assessment',
    branchLocation: selectedBranch || '',
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

  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [ageDisplay, setAgeDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState(1);
  const [professionals, setProfessionals] = useState([]);

  // Service types
  const serviceTypes = [
    'Initial Assessment',
    'Speech Therapy',
    'Occupational Therapy',
    'Online Consultation',
    'Follow-up Session'
  ];

  // Branch locations
  const branchLocations = [
    'blumentritt',
    'delrosario'
  ];

  // Relation options
  const relationOptions = [
    'Mother',
    'Father',
    'Grandparent',
    'Legal Guardian',
    'Other'
  ];

  // Fetch professionals when the component mounts
  const fetchProfessionals = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/professionals`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      setProfessionals(response.data);
    } catch (err) {
      console.error('Error fetching professionals:', err);
      // Fallback to static list if API unavailable (keeps modal functional)
      setProfessionals([
        { _id: 'developmental-pediatrician', name: 'Developmental Pediatrician' },
        { _id: 'occupational-therapist', name: 'Occupational Therapist' },
        { _id: 'speech-language-pathologist', name: 'Speech & Language Pathologist' }
      ]);
      setError('Failed to fetch professionals. Using defaults.');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProfessionals();
    }
  }, [isOpen, fetchProfessionals]);

  // Calculate age when birthday changes
  useEffect(() => {
    if (formData.childBirthday) {
      calculateAge(formData.childBirthday);
    }
  }, [formData.childBirthday]);

  // Available dates are enforced at input time via min/max and Saturday-only rules for Online Consultation

  // Fetch time slots when appointment date changes
  const fetchAvailableTimeSlots = useCallback(async () => {
    try {
      const branch = formData.branchLocation || selectedBranch || 'blumentritt';
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/availability/${formData.appointmentDate}?branch=${encodeURIComponent(branch)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );
      setAvailableTimeSlots(response.data.availableSlots || []);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Failed to fetch available time slots. Please try again.');
    }
  }, [formData.appointmentDate, formData.branchLocation, selectedBranch]);

  useEffect(() => {
    if (formData.appointmentDate) {
      fetchAvailableTimeSlots();
    }
  }, [formData.appointmentDate, fetchAvailableTimeSlots]);

  

  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const monthAge = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
    
    setAgeDisplay(`${age} years, ${monthAge} months`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset error and success messages when form is changed
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create booking without requiring user account
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/walk-in-booking`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );
      
      setSuccessMessage('Walk-in booking created successfully!');
      setLoading(false);
      
      // Reset form
      setFormData({
        serviceType: 'Initial Assessment',
        branchLocation: selectedBranch || '',
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
      
      // Reset step
      setStep(1);
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Validate current step before proceeding
  const validateStep = () => {
    if (step === 1) {
      return formData.serviceType && formData.branchLocation;
    } else if (step === 2) {
      return formData.guardianName && 
             formData.guardianRelation && 
             formData.guardianPhone && 
             formData.guardianEmail &&
             formData.guardianAddress &&
             (formData.guardianRelation !== 'Other' || formData.otherRelationship);
    } else if (step === 3) {
      return formData.childName && formData.childBirthday;
    } else if (step === 4) {
      return formData.selectedProfessional && formData.appointmentDate && formData.selectedTime;
    }
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="admin-walk-in-modal">
        <div className="modal-header">
          <h2>Add Walk-in Booking</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Service Type and Branch */}
            {step === 1 && (
              <div className="form-step">
                <h3>Step 1: Service Details</h3>
                
                <div className="form-group">
                  <label>Service Type:</label>
                  <select 
                    name="serviceType" 
                    value={formData.serviceType} 
                    onChange={handleChange}
                    required
                  >
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Branch Location:</label>
                  <select 
                    name="branchLocation" 
                    value={formData.branchLocation} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branchLocations.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="next-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Guardian Information */}
            {step === 2 && (
              <div className="form-step">
                <h3>Step 2: Guardian Information</h3>
                
                <div className="form-group">
                  <label>Guardian Name:</label>
                  <input 
                    type="text" 
                    name="guardianName" 
                    value={formData.guardianName} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Relationship to Child:</label>
                  <select 
                    name="guardianRelation" 
                    value={formData.guardianRelation} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Relationship</option>
                    {relationOptions.map(relation => (
                      <option key={relation} value={relation}>{relation}</option>
                    ))}
                  </select>
                </div>
                
                {formData.guardianRelation === 'Other' && (
                  <div className="form-group">
                    <label>Specify Relationship:</label>
                    <input 
                      type="text" 
                      name="otherRelationship" 
                      value={formData.otherRelationship} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label>Email:</label>
                  <input 
                    type="email" 
                    name="guardianEmail" 
                    value={formData.guardianEmail} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number:</label>
                  <input 
                    type="tel" 
                    name="guardianPhone" 
                    value={formData.guardianPhone} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Address:</label>
                  <textarea 
                    name="guardianAddress" 
                    value={formData.guardianAddress} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={prevStep} className="back-btn">
                    Back
                  </button>
                  <button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="next-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Child Information */}
            {step === 3 && (
              <div className="form-step">
                <h3>Step 3: Child Information</h3>
                
                <div className="form-group">
                  <label>Child's Name:</label>
                  <input 
                    type="text" 
                    name="childName" 
                    value={formData.childName} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Child's Birthday:</label>
                  <input 
                    type="date" 
                    name="childBirthday" 
                    value={formData.childBirthday} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                {ageDisplay && (
                  <div className="age-display">
                    <strong>Age:</strong> {ageDisplay}
                  </div>
                )}
                
                <div className="form-actions">
                  <button type="button" onClick={prevStep} className="back-btn">
                    Back
                  </button>
                  <button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="next-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 4: Appointment Details */}
            {step === 4 && (
              <div className="form-step">
                <h3>Step 4: Appointment Details</h3>
                
                <div className="form-group">
                  <label>Professional:</label>
                  <select 
                    name="selectedProfessional" 
                    value={formData.selectedProfessional} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Professional</option>
                    {professionals.map(prof => (
                      <option key={prof._id} value={prof._id}>{prof.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Appointment Date:</label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    max={(() => { const d = new Date(); d.setDate(d.getDate() + 60); return d.toISOString().split('T')[0]; })()}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Enforce Saturday-only for Online Consultation
                      if (formData.serviceType === 'Online Consultation') {
                        const day = new Date(value).getDay();
                        if (day !== 6) {
                          setError('Online Consultation is available on Saturdays only.');
                          setFormData(prev => ({ ...prev, appointmentDate: '', selectedTime: '' }));
                          setAvailableTimeSlots([]);
                          return;
                        }
                      }
                      handleChange(e);
                    }}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Time Slot:</label>
                  <select 
                    name="selectedTime" 
                    value={formData.selectedTime} 
                    onChange={handleChange}
                    required
                    disabled={!formData.appointmentDate}
                  >
                    <option value="">Select Time</option>
                    {availableTimeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={prevStep} className="back-btn">
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || !validateStep()}
                    className="submit-btn"
                  >
                    {loading ? 'Creating...' : 'Create Booking'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminWalkInModal;