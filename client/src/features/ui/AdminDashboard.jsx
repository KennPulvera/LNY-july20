import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../admin-styles.css';
import FloatingElements from './FloatingElements';
import Header from './Header';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('blumentritt');
  const [currentView, setCurrentView] = useState('assessments');
  const [patients, setPatients] = useState({
    assessments: []
  });
  
  // Booking details modal state
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Payment details modal state
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Reschedule modal state
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    appointmentDate: '',
    selectedTime: '',
    reason: '',
    adminNotes: ''
  });
  const [availableTimeSlotsForReschedule, setAvailableTimeSlotsForReschedule] = useState([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Authentication modal state
  const [authEmail, setAuthEmail] = useState('test@gmail.com');
  const [authPassword, setAuthPassword] = useState('admin123');

  // Confirmation modal states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);
  const [confirmationCallback, setConfirmationCallback] = useState(null);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');

  // Password protection for deletions
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingDeleteAction, setPendingDeleteAction] = useState(null);

  useEffect(() => {
    // Check if user is already logged in as admin from main auth system
    const userData = localStorage.getItem('userData');
    const userToken = localStorage.getItem('userToken');
    
    if (userData && userToken) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'admin') {
          // User is already authenticated as admin
          setIsAuthenticated(true);
          localStorage.setItem('adminAuth', 'true');
          loadPatientData();
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Fallback: Check if admin is already authenticated via admin-specific auth
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      setIsAuthenticated(true);
      loadPatientData();
    }
  }, []);

  const adminLogin = () => {
    // Simple authentication check
    if (authEmail === 'test@gmail.com' && authPassword === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      loadPatientData();
    } else {
      alert('Invalid credentials!');
    }
  };

  const adminLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
    navigate('/'); // Redirect to main page
  };

  const loadPatientData = () => {
    // Load patient data from localStorage or API
    const storedBookings = JSON.parse(localStorage.getItem('assessmentBookings') || '[]');
    setPatients(prev => ({
      ...prev,
      assessments: storedBookings
    }));
  };

  // Helper function to show confirmation modal
  const showConfirmationDialog = (type, title, message, data, callback) => {
    setConfirmationType(type);
    setConfirmationTitle(title);
    setConfirmationMessage(message);
    setConfirmationData(data);
    setConfirmationCallback(() => callback);
    setShowConfirmation(true);
  };

  // Password protection for deletions
  const requestDeletePassword = (deleteAction) => {
    setPendingDeleteAction(() => deleteAction);
    setShowPasswordPrompt(true);
    setDeletePassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = () => {
    if (deletePassword === '123') {
      setShowPasswordPrompt(false);
      setDeletePassword('');
      setPasswordError('');
      if (pendingDeleteAction) {
        pendingDeleteAction();
      }
      setPendingDeleteAction(null);
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setDeletePassword('');
    }
  };

  const closePasswordPrompt = () => {
    setShowPasswordPrompt(false);
    setDeletePassword('');
    setPasswordError('');
    setPendingDeleteAction(null);
  };
  
  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsBookingDetailsOpen(true);
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setIsPaymentDetailsOpen(true);
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
    setIsBookingDetailsOpen(false);
  };

  const closePaymentDetails = () => {
    setSelectedPayment(null);
    setIsPaymentDetailsOpen(false);
  };

  const deleteAssessment = (bookingIndex) => {
    const booking = patients.assessments[bookingIndex];
    
    const performDeletion = () => {
      showConfirmationDialog(
        'delete',
        'Delete Assessment',
        'Are you sure you want to delete this assessment? Payment information will be kept.',
        booking,
        () => {
          const updatedBookings = [...patients.assessments];
          const booking = updatedBookings[bookingIndex];
          
          // Mark as deleted but keep booking in the array
          updatedBookings[bookingIndex] = {
            ...booking,
            assessmentDeleted: true,
            assessmentDeletedAt: new Date().toISOString()
          };
          
          // Update localStorage
          localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
          
          // Update state
          setPatients(prev => ({
            ...prev,
            assessments: updatedBookings
          }));
          
          // Close modal if open
          if (selectedBooking && patients.assessments.findIndex(b => b === selectedBooking) === bookingIndex) {
            closeBookingDetails();
          }
        }
      );
    };

    requestDeletePassword(performDeletion);
  };

  const deletePayment = (bookingIndex) => {
    const booking = patients.assessments[bookingIndex];
    
    const performDeletion = () => {
      showConfirmationDialog(
        'delete',
        'Delete Payment',
        'Are you sure you want to delete this payment information? Assessment will be kept.',
        booking,
        () => {
          const updatedBookings = [...patients.assessments];
          const booking = updatedBookings[bookingIndex];
          
          // Remove payment-specific fields but keep assessment
          updatedBookings[bookingIndex] = {
            ...booking,
            paymentMethod: null,
            paymentAmount: null,
            paymentReference: null,
            accountName: null,
            paymentDate: null,
            paymentStatus: null,
            verifiedAt: null,
            paymentDeleted: true,
            paymentDeletedAt: new Date().toISOString()
          };
          
          // Update localStorage
          localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
          
          // Update state
          setPatients(prev => ({
            ...prev,
            assessments: updatedBookings
          }));
          
          // Close modal if open
          if (selectedPayment && patients.assessments.findIndex(b => b === selectedPayment) === bookingIndex) {
            closePaymentDetails();
          }
        }
      );
    };

    requestDeletePassword(performDeletion);
  };

  // Function to recalculate statistics based on current data
  const refreshStats = () => {
    // This forces a re-render of the stats section
    setPatients(prev => ({ ...prev }));
  };
  
  // Commented out unused function
  // const deleteEntireBooking = (bookingIndex) => {
  //   const booking = patients.assessments[bookingIndex];
  //   
  //   showConfirmationDialog(
  //     'delete',
  //     'Delete Entire Booking',
  //     'Are you sure you want to delete this entire booking? Assessment and payment information will be permanently removed.',
  //     booking,
  //     () => {
  //       const updatedBookings = [...patients.assessments];
  //       updatedBookings.splice(bookingIndex, 1);
  //       
  //       // Update localStorage
  //       localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
  //       
  //       // Update state with a force refresh
  //       setPatients(prev => {
  //         // Make a completely new object to ensure React detects the change
  //         return {
  //           ...prev,
  //           assessments: [...updatedBookings]
  //         };
  //       });
  //       
  //       // Explicitly call refresh to update stats
  //       setTimeout(() => refreshStats(), 50);
  //       
  //       // Close modals if open
  //       if (selectedBooking && patients.assessments.findIndex(b => b === selectedBooking) === bookingIndex) {
  //         closeBookingDetails();
  //       }
  //       if (selectedPayment && patients.assessments.findIndex(b => b === selectedPayment) === bookingIndex) {
  //         closePaymentDetails();
  //       }
  //     }
  //   );
  // };

  const markBookingDone = (bookingIndex) => {
    const booking = patients.assessments[bookingIndex];
    
    showConfirmationDialog(
      'mark-done',
      'Mark as Completed',
      'Are you sure you want to mark this appointment as completed?',
      booking,
      () => {
        const updatedBookings = [...patients.assessments];
        updatedBookings[bookingIndex] = {
          ...updatedBookings[bookingIndex],
          status: 'completed',
          completedAt: new Date().toISOString()
        };
        
        // Update localStorage
        localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
        
        // Update state
        setPatients(prev => ({
          ...prev,
          assessments: updatedBookings
        }));
        
        // Close modal if it's the current booking
        if (selectedBooking && patients.assessments.findIndex(b => b === selectedBooking) === bookingIndex) {
          closeBookingDetails();
        }
      }
    );
  };

  const verifyPayment = (bookingIndex) => {
    const booking = patients.assessments[bookingIndex];
    
    showConfirmationDialog(
      'verify',
      'Verify Payment',
      'Are you sure you want to mark this payment as verified?',
      booking,
      () => {
        const updatedBookings = [...patients.assessments];
        updatedBookings[bookingIndex] = {
          ...updatedBookings[bookingIndex],
          paymentStatus: 'verified',
          verifiedAt: new Date().toISOString()
        };
        
        // Update localStorage
        localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
        
        // Update state
        setPatients(prev => ({
          ...prev,
          assessments: updatedBookings
        }));
        
        // Close modal if it's the current booking
        if (selectedBooking && patients.assessments.findIndex(b => b === selectedBooking) === bookingIndex) {
          closeBookingDetails();
        }
      }
    );
  };

  // Reschedule functions
  const openRescheduleModal = (booking) => {
    if (window.confirm(`Are you sure you want to reschedule the appointment for ${booking.childName} (${booking.guardianName})?\n\nCurrent appointment: ${new Date(booking.appointmentDate).toLocaleDateString()} at ${booking.selectedTime}`)) {
      setSelectedBookingForReschedule(booking);
      setRescheduleData({
        appointmentDate: '',
        selectedTime: '',
        reason: '',
        adminNotes: booking.adminNotes || ''
      });
      setIsRescheduleModalOpen(true);
    }
  };

  const closeRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedBookingForReschedule(null);
    setRescheduleData({
      appointmentDate: '',
      selectedTime: '',
      reason: '',
      adminNotes: ''
    });
    setAvailableTimeSlotsForReschedule([]);
  };

  const loadTimeSlotsForReschedule = async (date) => {
    if (!date || !selectedBookingForReschedule) return;
    
    try {
      // Get all bookings for the selected date and branch (excluding current booking)
      const existingBookings = patients.assessments.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate).toDateString();
        const selectedDate = new Date(date).toDateString();
        return bookingDate === selectedDate && 
               booking.branchLocation === selectedBookingForReschedule.branchLocation &&
               booking !== selectedBookingForReschedule &&
               booking.status !== 'cancelled';
      });

      // Define all available time slots
      const allTimeSlots = [
        '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
      ];

      // Get booked time slots
      const bookedSlots = existingBookings.map(booking => booking.selectedTime);

      // Return available slots
      const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
      setAvailableTimeSlotsForReschedule(availableSlots);
    } catch (error) {
      console.error('Error loading time slots:', error);
      setAvailableTimeSlotsForReschedule([]);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleData.appointmentDate || !rescheduleData.selectedTime) {
      alert('Please select both a new date and time.');
      return;
    }
    
    const performReschedule = () => {
      setRescheduleLoading(true);
      
      try {
        // Find the booking index
        const bookingIndex = patients.assessments.findIndex(b => b === selectedBookingForReschedule);
        
        if (bookingIndex === -1) {
          throw new Error('Booking not found');
        }

        // Update the booking in localStorage
        const updatedBookings = [...patients.assessments];
        const originalDate = updatedBookings[bookingIndex].appointmentDate;
        const originalTime = updatedBookings[bookingIndex].selectedTime;
        
        updatedBookings[bookingIndex] = {
          ...updatedBookings[bookingIndex],
          appointmentDate: rescheduleData.appointmentDate,
          selectedTime: rescheduleData.selectedTime,
          adminNotes: rescheduleData.adminNotes,
          status: 'scheduled',
          rescheduledFrom: {
            originalDate: originalDate,
            originalTime: originalTime,
            rescheduledAt: new Date().toISOString(),
            reason: rescheduleData.reason || 'Admin rescheduled'
          },
          updatedAt: new Date().toISOString()
        };

        // Update localStorage
        localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));

        // Update state
        setPatients(prev => ({
          ...prev,
          assessments: updatedBookings
        }));

        // Show success message using alert since we're already in the modal
        alert(`Booking successfully rescheduled from ${new Date(originalDate).toLocaleDateString()} at ${originalTime} to ${new Date(rescheduleData.appointmentDate).toLocaleDateString()} at ${rescheduleData.selectedTime}`);
        
        closeRescheduleModal();
        
        // Close booking details modal if open
        if (selectedBooking === selectedBookingForReschedule) {
          closeBookingDetails();
        }

      } catch (error) {
        console.error('Error rescheduling booking:', error);
        alert('Error rescheduling booking. Please try again.');
      } finally {
        setRescheduleLoading(false);
      }
    };
    
    showConfirmationDialog(
      'reschedule',
      'Confirm Reschedule',
      'Are you sure you want to reschedule this appointment?',
      {
        ...selectedBookingForReschedule,
        newAppointmentDate: rescheduleData.appointmentDate,
        newSelectedTime: rescheduleData.selectedTime
      },
      performReschedule
    );
  };

  const filterByBranch = (branch) => {
    setSelectedBranch(branch);
    // Filter patients by branch
  };

  const switchPatientView = (view) => {
    setCurrentView(view);
  };

  // Make adminLogout available globally
  useEffect(() => {
    window.adminLogout = adminLogout;
    return () => {
      delete window.adminLogout;
    };
  }, [adminLogout]);
  
  // Update stats when patients data changes
  useEffect(() => {
    // This will trigger when patients state changes
    // Stats will automatically update since they're calculated from patients state
    console.log("Stats refreshed - Total bookings:", 
      patients.assessments.filter(p => p.branchLocation === selectedBranch).length);
  }, [patients.assessments, selectedBranch]);

  if (!isAuthenticated) {
    return (
      <>
        <FloatingElements />
        <Header isAdmin={true} />
        <div id="authCheckModal" className="auth-modal" style={{ display: 'block' }}>
          <div className="auth-modal-content">
            <h2>🔒 Admin Authentication Required</h2>
            <p>Please log in with admin credentials to access the admin dashboard.</p>
            <div className="auth-form">
              <input 
                type="email" 
                id="adminEmail" 
                placeholder="Admin Email" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
              <input 
                type="password" 
                id="adminPassword" 
                placeholder="Admin Password" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
              <button onClick={adminLogin} className="btn-primary">Login as Admin</button>
            </div>
            <p className="auth-note">Default admin: test@gmail.com / admin123</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FloatingElements />
      <Header isAdmin={true} onLogout={adminLogout} />
      
      <section className="admin-section">
        <div className="container">
          {/* Welcome Header */}
          <div className="welcome-header">
            <div className="welcome-content">
              <h1>👋 Welcome to Lance and Yuri Kids Spot Naga City Admin</h1>
              <p className="welcome-subtitle">Manage your patient appointments easily and efficiently</p>
            </div>
            
            {/* Branch Selection */}
            <div className="branch-filter-section">
              <div className="branch-filter-header">
                <h3>📍 Select Your Branch</h3>
                <p>Choose your branch to view patients for your location</p>
              </div>
              <div className="admin-branch-boxes">
                <div className="admin-branch-box" data-value="blumentritt">
                  <input 
                    type="radio" 
                    id="adminBranchMain" 
                    name="adminBranchLocation" 
                    value="blumentritt" 
                    onChange={() => filterByBranch('blumentritt')} 
                    checked={selectedBranch === 'blumentritt'}
                  />
                  <label htmlFor="adminBranchMain" className="admin-branch-label">
                    <div className="admin-branch-icon">🏢</div>
                    <div className="admin-branch-info">
                      <h4>Main Branch</h4>
                      <p>Blumentritt St., Naga City</p>
                    </div>
                    <div className="admin-branch-badge main-badge">PRIMARY</div>
                  </label>
                </div>
                <div className="admin-branch-box" data-value="delrosario">
                  <input 
                    type="radio" 
                    id="adminBranchSatellite" 
                    name="adminBranchLocation" 
                    value="delrosario" 
                    onChange={() => filterByBranch('delrosario')}
                    checked={selectedBranch === 'delrosario'}
                  />
                  <label htmlFor="adminBranchSatellite" className="admin-branch-label">
                    <div className="admin-branch-icon">📡</div>
                    <div className="admin-branch-info">
                      <h4>Satellite Branch</h4>
                      <p>Del Rosario, Naga City</p>
                    </div>
                    <div className="admin-branch-badge satellite-badge">SATELLITE</div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Quick Stats - With key for forcing refresh */}
            <div className="quick-stats" key={`stats-${patients.assessments.length}-${selectedBranch}`}>
              <div className="stat-item">
                <div className="stat-number" id="branchPendingCount">
                  {patients.assessments.filter(p => p.branchLocation === selectedBranch).length}
                </div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-item">
                <div className="stat-number" id="branchVerifiedCount">
                  {patients.assessments.filter(p => p.branchLocation === selectedBranch && p.paymentStatus === 'verified').length}
                </div>
                <div className="stat-label">Verified Payments</div>
              </div>
            </div>
          </div>

          {/* Main Actions */}
          <div className="main-actions">
            <button 
              className={`big-action-btn ${currentView === 'assessments' ? 'active' : ''}`} 
              data-view="assessments" 
              onClick={() => switchPatientView('assessments')}
            >
              🩺 Assessment Bookings
              <span className="action-count" id="assessmentCount">
                {patients.assessments.filter(p => !p.assessmentDeleted).length}
              </span>
            </button>
            <button 
              className={`big-action-btn ${currentView === 'payments' ? 'active' : ''}`} 
              data-view="payments" 
              onClick={() => switchPatientView('payments')}
            >
              💳 Payment Information
              <span className="action-count" id="paymentCount">
                {patients.assessments.filter(p => (p.paymentReference || p.accountName) && !p.paymentDeleted).length}
              </span>
            </button>
          </div>

          {/* Assessment Bookings View */}
          {currentView === 'assessments' && (
            <div id="assessments-view" className="patient-list-container active">
              <div className="list-header">
                <h2>🩺 Assessment Bookings</h2>
                <div className="help-text">
                  <div className="help-item">
                    <span className="help-icon">📅</span>
                    <span>Patients who booked assessments from the website</span>
                  </div>
                </div>
              </div>

              <div className="table-wrapper table-wrapper-enhanced">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th className="col-patient">Patient Info</th>
                      <th className="col-contact">Contact & Service</th>
                      <th className="col-appointment">Assessment Details</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.assessments
                      .filter(patient => patient.branchLocation === selectedBranch && !patient.assessmentDeleted)
                      .map((patient, index) => {
                        const originalIndex = patients.assessments.findIndex(p => p === patient);
                        const isCompleted = patient.status === 'completed';
                        
                        return (
                          <tr key={index} className={isCompleted ? 'completed-booking' : ''}>
                            <td>
                              <div className="patient-info">
                                <strong>{patient.guardianName}</strong><br />
                                Child: {patient.childName}, {patient.childAge || 'Age not specified'}
                                {isCompleted && <span className="completed-badge">✅ Completed</span>}
                              </div>
                            </td>
                            <td>
                              <div className="contact-info">
                                {patient.guardianPhone}<br />
                                {patient.guardianEmail}<br />
                                <small>{patient.guardianAddress}</small>
                              </div>
                            </td>
                            <td>
                              <div className="appointment-info">
                                Date: {patient.appointmentDate}<br />
                                Time: {patient.selectedTime}
                                {patient.rescheduledFrom && (
                                  <div className="rescheduled-badge">
                                    🔄 Rescheduled from {new Date(patient.rescheduledFrom.originalDate).toLocaleDateString()}
                                  </div>
                                )}
                                {isCompleted && <div className="completed-date">Completed: {new Date(patient.completedAt).toLocaleDateString()}</div>}
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn-action view-details" 
                                  onClick={() => viewBookingDetails(patient)}
                                  title="View booking details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                {!isCompleted && (
                                  <>
                                    <button 
                                      className="btn-action reschedule" 
                                      onClick={() => openRescheduleModal(patient)}
                                      title="Reschedule appointment"
                                    >
                                      <i className="fas fa-calendar-alt"></i>
                                    </button>
                                    <button 
                                      className="btn-action done" 
                                      onClick={() => markBookingDone(originalIndex)}
                                      title="Mark as done"
                                    >
                                      <i className="fas fa-check"></i>
                                    </button>
                                  </>
                                )}
                                <button 
                                  className="btn-action delete-booking" 
                                  onClick={() => deleteAssessment(originalIndex)}
                                  title="Delete assessment"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                
                {patients.assessments.filter(p => p.branchLocation === selectedBranch && !p.assessmentDeleted).length === 0 && (
                  <div className="empty-state">
                    <p>No assessment bookings for this branch yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}



          {currentView === 'payments' && (
            <div id="payments-view" className="patient-list-container active">
              <div className="list-header">
                <h2>💳 Payment Information</h2>
                <div className="help-text">
                  <div className="help-item">
                    <span className="help-icon">💰</span>
                    <span>Verify and manage patient payment confirmations</span>
                  </div>
                </div>
              </div>

              <div className="table-wrapper table-wrapper-enhanced">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th className="col-patient">Patient Info</th>
                      <th className="col-payment">Payment Details</th>
                      <th className="col-status">Payment Status</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.assessments
                      .filter(patient => patient.branchLocation === selectedBranch && (patient.paymentReference || patient.accountName) && !patient.paymentDeleted)
                      .map((patient, index) => {
                        const originalIndex = patients.assessments.findIndex(p => p === patient);
                        const isVerified = patient.paymentStatus === 'verified';
                        const hasPaymentInfo = patient.paymentReference || patient.accountName;
                        
                        return (
                          <tr key={index} className={isVerified ? 'verified-payment' : hasPaymentInfo ? 'pending-payment' : 'no-payment'}>
                            <td>
                              <div className="patient-info">
                                <strong>{patient.guardianName}</strong><br />
                                Child: {patient.childName}<br />
                                <small>{patient.guardianPhone}</small>
                              </div>
                            </td>
                            <td>
                              <div className="payment-details">
                                {hasPaymentInfo ? (
                                  <>
                                    <div className="payment-method-badge">
                                      {patient.paymentMethod === 'gcash' ? (
                                        <span className="method-badge gcash">💳 GCash</span>
                                      ) : patient.paymentMethod === 'bank-transfer' ? (
                                        <span className="method-badge bank">🏦 Bank Transfer</span>
                                      ) : (
                                        <span className="method-badge unknown">❓ Unknown</span>
                                      )}
                                    </div>
                                    <strong>Amount:</strong> ₱{patient.paymentAmount ? patient.paymentAmount.toLocaleString() : '2,000'}<br />
                                    <strong>Reference:</strong> {patient.paymentReference || 'N/A'}<br />
                                    <strong>Account:</strong> {patient.accountName || 'N/A'}<br />
                                    <strong>Date:</strong> {patient.paymentDate || 'N/A'}
                                  </>
                                ) : (
                                  <span className="no-payment-info">No payment information provided</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="payment-status">
                                {isVerified ? (
                                  <span className="payment-badge verified">✅ Verified</span>
                                ) : hasPaymentInfo ? (
                                  <span className="payment-badge pending">⏳ Pending Verification</span>
                                ) : (
                                  <span className="payment-badge no-payment">❌ No Payment</span>
                                )}
                                {isVerified && patient.verifiedAt && (
                                  <div className="verified-date">
                                    Verified: {new Date(patient.verifiedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn-action view-details" 
                                  onClick={() => viewPaymentDetails(patient)}
                                  title="View payment details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                {hasPaymentInfo && !isVerified && (
                                  <button 
                                    className="btn-verify-payment-small" 
                                    onClick={() => verifyPayment(originalIndex)}
                                    title="Verify payment"
                                  >
                                    <i className="fas fa-check-circle"></i>
                                  </button>
                                )}
                                <button 
                                  className="btn-action delete-booking" 
                                  onClick={() => deletePayment(originalIndex)}
                                  title="Delete payment"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                
                {patients.assessments.filter(p => p.branchLocation === selectedBranch && (p.paymentReference || p.accountName) && !p.paymentDeleted).length === 0 && (
                  <div className="empty-state">
                    <p>No payment information available for this branch.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Booking Details Modal */}
      {isBookingDetailsOpen && selectedBooking && (
        <div className="booking-details-modal" style={{ display: 'block' }}>
          <div className="booking-details-content">
            <div className="booking-details-header">
              <h2>📋 Booking Details</h2>
              <span className="close-booking-details" onClick={closeBookingDetails}>&times;</span>
            </div>
            
            <div className="booking-details-body">
              <div className="booking-details-grid">
                {/* Branch Information */}
                <div className="detail-section">
                  <h3>📍 Branch Information</h3>
                  <div className="detail-item">
                    <strong>Branch:</strong> {selectedBooking.branchLocation === 'blumentritt' ? 'Main Branch (Blumentritt)' : 'Satellite Branch (Del Rosario)'}
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="detail-section">
                  <h3>👤 Guardian Information</h3>
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedBooking.guardianName}
                  </div>
                  <div className="detail-item">
                    <strong>Relationship:</strong> {selectedBooking.guardianRelation === 'Other' ? selectedBooking.otherRelationship : selectedBooking.guardianRelation}
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong> {selectedBooking.guardianPhone}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedBooking.guardianEmail}
                  </div>
                  <div className="detail-item">
                    <strong>Address:</strong> {selectedBooking.guardianAddress}
                  </div>
                </div>

                {/* Child Information */}
                <div className="detail-section">
                  <h3>👶 Child Information</h3>
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedBooking.childName}
                  </div>
                  <div className="detail-item">
                    <strong>Birthday:</strong> {selectedBooking.childBirthday}
                  </div>
                  <div className="detail-item">
                    <strong>Age:</strong> {selectedBooking.childAge}
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="detail-section">
                  <h3>📅 Appointment Information</h3>
                  <div className="detail-item">
                    <strong>Date:</strong> {selectedBooking.appointmentDate}
                  </div>
                  <div className="detail-item">
                    <strong>Time:</strong> {selectedBooking.selectedTime}
                  </div>
                  <div className="detail-item">
                    <strong>Professional:</strong> {
                      selectedBooking.selectedProfessional === 'developmental-pediatrician' ? '👶 Developmental Pediatrician' :
                      selectedBooking.selectedProfessional === 'occupational-therapist' ? '🖐️ Occupational Therapist' :
                      selectedBooking.selectedProfessional === 'speech-language-pathologist' ? '🗣️ Speech and Language Pathologist' :
                      selectedBooking.selectedProfessional
                    }
                  </div>
                </div>

                {/* Payment Information */}
                <div className="detail-section">
                  <h3>💳 Payment Information</h3>
                  <div className="detail-item">
                    <strong>Payment Method:</strong> 
                    <div className="payment-method-display">
                      {selectedBooking.paymentMethod === 'gcash' ? (
                        <span className="method-badge gcash large">💳 GCash</span>
                      ) : selectedBooking.paymentMethod === 'bank-transfer' ? (
                        <span className="method-badge bank large">🏦 Bank Transfer</span>
                      ) : (
                        <span className="method-badge unknown large">❓ {selectedBooking.paymentMethod || 'Not specified'}</span>
                      )}
                    </div>
                  </div>
                  <div className="detail-item">
                    <strong>Amount:</strong> <span className="amount-display">₱{selectedBooking.paymentAmount ? selectedBooking.paymentAmount.toLocaleString() : '2,000.00'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Reference Number:</strong> <span className="reference-display">{selectedBooking.paymentReference || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Account Name:</strong> <span className="account-display">{selectedBooking.accountName || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Payment Date:</strong> <span className="date-display">{selectedBooking.paymentDate || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Payment Status:</strong> 
                    <span className={`payment-status-badge ${selectedBooking.paymentStatus === 'pending-verification' ? 'pending' : 'verified'}`}>
                      {selectedBooking.paymentStatus === 'pending-verification' ? '⏳ Pending Verification' : '✅ Verified'}
                    </span>
                    {selectedBooking.paymentStatus === 'verified' && selectedBooking.verifiedAt && (
                      <div className="verified-date">
                        Verified: {new Date(selectedBooking.verifiedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Information */}
                <div className="detail-section">
                  <h3>📊 Status Information</h3>
                  <div className="detail-item">
                    <strong>Status:</strong> 
                    <span className={`status-badge ${selectedBooking.status === 'completed' ? 'completed' : 'pending'}`}>
                      {selectedBooking.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                    </span>
                  </div>
                  {selectedBooking.completedAt && (
                    <div className="detail-item">
                      <strong>Completed:</strong> {new Date(selectedBooking.completedAt).toLocaleString()}
                    </div>
                  )}
                  {selectedBooking.rescheduledFrom && (
                    <div className="detail-section reschedule-history">
                      <h4>🔄 Reschedule History</h4>
                      <div className="detail-item">
                        <strong>Originally Scheduled:</strong> {new Date(selectedBooking.rescheduledFrom.originalDate).toLocaleDateString()} at {selectedBooking.rescheduledFrom.originalTime}
                      </div>
                      <div className="detail-item">
                        <strong>Rescheduled On:</strong> {new Date(selectedBooking.rescheduledFrom.rescheduledAt).toLocaleString()}
                      </div>
                      {selectedBooking.rescheduledFrom.reason && (
                        <div className="detail-item">
                          <strong>Reason:</strong> {selectedBooking.rescheduledFrom.reason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="booking-details-actions">
                {selectedBooking.status !== 'completed' && (
                  <>
                    <button 
                      className="btn-reschedule-modal" 
                      onClick={() => openRescheduleModal(selectedBooking)}
                    >
                      <i className="fas fa-calendar-alt"></i> Reschedule
                    </button>
                    <button 
                      className="btn-mark-done" 
                      onClick={() => markBookingDone(patients.assessments.findIndex(b => b === selectedBooking))}
                    >
                      <i className="fas fa-check"></i> Mark as Done
                    </button>
                  </>
                )}
                <button 
                  className="btn-delete-booking-modal" 
                  onClick={() => deleteAssessment(patients.assessments.findIndex(b => b === selectedBooking))}
                >
                  <i className="fas fa-trash"></i> Delete Assessment
                </button>
                <button className="btn-close-details" onClick={closeBookingDetails}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {isPaymentDetailsOpen && selectedPayment && (
        <div className="booking-details-modal" style={{ display: 'block' }}>
          <div className="booking-details-content">
            <div className="booking-details-header">
              <h2>💳 Payment Details</h2>
              <span className="close-booking-details" onClick={closePaymentDetails}>&times;</span>
            </div>
            
            <div className="booking-details-body">
              <div className="booking-details-grid">
                {/* Patient Information */}
                <div className="detail-section">
                  <h3>👤 Patient Information</h3>
                  <div className="detail-item">
                    <strong>Guardian:</strong> {selectedPayment.guardianName}
                  </div>
                  <div className="detail-item">
                    <strong>Child:</strong> {selectedPayment.childName}
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong> {selectedPayment.guardianPhone}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="detail-section">
                  <h3>💳 Payment Information</h3>
                  <div className="payment-method-display">
                    {selectedPayment.paymentMethod === 'gcash' ? (
                      <span className="method-badge gcash large">💳 GCash</span>
                    ) : selectedPayment.paymentMethod === 'bank-transfer' ? (
                      <span className="method-badge bank large">🏦 Bank Transfer</span>
                    ) : (
                      <span className="method-badge unknown large">❓ {selectedPayment.paymentMethod || 'Not specified'}</span>
                    )}
                  </div>
                  
                  <div className="detail-item">
                    <strong>Amount:</strong> <span className="amount-display">₱{selectedPayment.paymentAmount ? selectedPayment.paymentAmount.toLocaleString() : '2,000.00'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Reference Number:</strong> <span className="reference-display">{selectedPayment.paymentReference || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Account Name:</strong> <span className="account-display">{selectedPayment.accountName || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Payment Date:</strong> <span className="date-display">{selectedPayment.paymentDate || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className={`payment-status-badge ${selectedPayment.paymentStatus === 'pending-verification' ? 'pending' : 'verified'}`}>
                      {selectedPayment.paymentStatus === 'pending-verification' ? '⏳ Pending Verification' : '✅ Verified'}
                    </span>
                    {selectedPayment.paymentStatus === 'verified' && selectedPayment.verifiedAt && (
                      <div className="verified-date">
                        Verified: {new Date(selectedPayment.verifiedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

                             <div className="booking-details-actions">
                 {selectedPayment.paymentStatus !== 'verified' && (selectedPayment.paymentReference || selectedPayment.accountName) && (
                   <button 
                     className="btn-verify-payment-modern"
                     onClick={() => verifyPayment(patients.assessments.findIndex(b => b === selectedPayment))}
                   >
                     <i className="fas fa-check-circle"></i> Verify Payment
                   </button>
                 )}
                 <button 
                   className="btn-delete-booking-modal" 
                   onClick={() => deletePayment(patients.assessments.findIndex(b => b === selectedPayment))}
                 >
                   <i className="fas fa-trash"></i> Delete Payment
                 </button>
                 <button className="btn-close-details" onClick={closePaymentDetails}>
                   Close
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedBookingForReschedule && (
        <div className="auth-modal" style={{ display: 'block' }}>
          <div className="auth-modal-content reschedule-modal-content">
            <div className="auth-modal-header">
              <h2>📅 Reschedule Appointment</h2>
              <span className="guest-booking-close" onClick={closeRescheduleModal}>&times;</span>
            </div>
            <div className="auth-modal-body">
              <div className="current-booking-info">
                <h4>Current Appointment:</h4>
                <p><strong>Patient:</strong> {selectedBookingForReschedule.childName}</p>
                <p><strong>Guardian:</strong> {selectedBookingForReschedule.guardianName}</p>
                <p><strong>Current Date:</strong> {new Date(selectedBookingForReschedule.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Current Time:</strong> {selectedBookingForReschedule.selectedTime}</p>
                <p><strong>Branch:</strong> {selectedBookingForReschedule.branchLocation === 'blumentritt' ? 'Main Branch (Blumentritt)' : 'Satellite Branch (Del Rosario)'}</p>
              </div>

              <div className="reschedule-form">
                <div className="form-group">
                  <label htmlFor="rescheduleDate">New Appointment Date:</label>
                  <input 
                    type="date" 
                    id="rescheduleDate" 
                    value={rescheduleData.appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setRescheduleData(prev => ({ ...prev, appointmentDate: e.target.value, selectedTime: '' }));
                      loadTimeSlotsForReschedule(e.target.value);
                    }}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rescheduleTime">Available Time Slots:</label>
                  {rescheduleData.appointmentDate ? (
                    <select 
                      id="rescheduleTime" 
                      value={rescheduleData.selectedTime}
                      onChange={(e) => setRescheduleData(prev => ({ ...prev, selectedTime: e.target.value }))}
                      required
                    >
                      <option value="">Select a time slot</option>
                      {availableTimeSlotsForReschedule.length > 0 ? (
                        availableTimeSlotsForReschedule.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))
                      ) : (
                        <option value="" disabled>No available slots for this date</option>
                      )}
                    </select>
                  ) : (
                    <p className="select-date-first">Please select a date first</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rescheduleReason">Reason for Rescheduling:</label>
                  <select 
                    id="rescheduleReason" 
                    value={rescheduleData.reason}
                    onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                  >
                    <option value="">Select a reason</option>
                    <option value="Professional unavailable">Professional unavailable</option>
                    <option value="Patient request">Patient request</option>
                    <option value="Emergency scheduling">Emergency scheduling</option>
                    <option value="Administrative reasons">Administrative reasons</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rescheduleNotes">Admin Notes (Optional):</label>
                  <textarea 
                    id="rescheduleNotes" 
                    value={rescheduleData.adminNotes}
                    onChange={(e) => setRescheduleData(prev => ({ ...prev, adminNotes: e.target.value }))}
                    placeholder="Add any additional notes about this rescheduling..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="reschedule-actions">
                <button 
                  className="btn-confirm-reschedule" 
                  onClick={handleRescheduleSubmit}
                  disabled={rescheduleLoading || !rescheduleData.appointmentDate || !rescheduleData.selectedTime}
                >
                  {rescheduleLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Rescheduling...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calendar-check"></i> Confirm Reschedule
                    </>
                  )}
                </button>
                <button className="btn-cancel-reschedule" onClick={closeRescheduleModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <div className="confirmation-header">
              <h3>{confirmationTitle}</h3>
              <button 
                className="close-confirmation" 
                onClick={() => setShowConfirmation(false)}
              >
                &times;
              </button>
            </div>
            <div className="confirmation-body">
              <div className={`confirmation-icon ${confirmationType}`}>
                {confirmationType === 'delete' && <i className="fas fa-trash-alt"></i>}
                {confirmationType === 'reschedule' && <i className="fas fa-calendar-alt"></i>}
                {confirmationType === 'verify' && <i className="fas fa-check-circle"></i>}
                {confirmationType === 'mark-done' && <i className="fas fa-check"></i>}
              </div>
              
              <div className="confirmation-message">
                <h4>{confirmationMessage}</h4>
              </div>
              
              {confirmationData && (
                <div className="confirmation-details">
                  {confirmationData.childName && (
                    <div className="confirmation-detail-item">
                      <span className="confirmation-detail-label">Patient:</span>
                      <span className="confirmation-detail-value">{confirmationData.childName}</span>
                    </div>
                  )}
                  {confirmationData.guardianName && (
                    <div className="confirmation-detail-item">
                      <span className="confirmation-detail-label">Guardian:</span>
                      <span className="confirmation-detail-value">{confirmationData.guardianName}</span>
                    </div>
                  )}
                  {confirmationData.appointmentDate && (
                    <div className="confirmation-detail-item">
                      <span className="confirmation-detail-label">Date:</span>
                      <span className="confirmation-detail-value">
                        {new Date(confirmationData.appointmentDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {confirmationData.selectedTime && (
                    <div className="confirmation-detail-item">
                      <span className="confirmation-detail-label">Time:</span>
                      <span className="confirmation-detail-value">{confirmationData.selectedTime}</span>
                    </div>
                  )}
                  {confirmationData.newAppointmentDate && (
                    <div className="confirmation-detail-item">
                      <span className="confirmation-detail-label">New Date:</span>
                      <span className="confirmation-detail-value">
                        {new Date(confirmationData.newAppointmentDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {confirmationData.newSelectedTime && (
                    <div className="confirmation-detail-item">
                      <span className="confirmation-detail-label">New Time:</span>
                      <span className="confirmation-detail-value">{confirmationData.newSelectedTime}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="confirmation-actions">
                <button 
                  className={`btn-confirm ${confirmationType === 'delete' ? 'delete' : 'proceed'}`}
                  onClick={() => {
                    if (confirmationCallback) {
                      confirmationCallback();
                    }
                    setShowConfirmation(false);
                  }}
                >
                  {confirmationType === 'delete' && <>
                    <i className="fas fa-trash-alt"></i> Delete
                  </>}
                  {confirmationType === 'reschedule' && <>
                    <i className="fas fa-calendar-check"></i> Reschedule
                  </>}
                  {confirmationType === 'verify' && <>
                    <i className="fas fa-check-circle"></i> Verify
                  </>}
                  {confirmationType === 'mark-done' && <>
                    <i className="fas fa-check"></i> Mark as Done
                  </>}
                </button>
                <button 
                  className="btn-confirm cancel"
                  onClick={() => setShowConfirmation(false)}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="password-prompt-modal">
          <div className="password-prompt-content">
            <h3>Confirm Deletion</h3>
            <p>Please enter the password to confirm deletion:</p>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
            <div className="password-prompt-actions">
              <button onClick={handlePasswordSubmit} className="btn-confirm">Confirm</button>
              <button onClick={closePasswordPrompt} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard; 