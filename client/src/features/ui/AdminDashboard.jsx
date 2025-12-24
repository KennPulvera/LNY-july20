import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import '../../admin-styles.css';
import FloatingElements from './FloatingElements';
import Header from './Header';
import AdminWalkInModal from './AdminWalkInModal';

const AdminDashboard = ({ initialServiceTypeFilter = 'all', isOnlinePage = false }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [currentView, setCurrentView] = useState('assessments');
  const [patients, setPatients] = useState({
    assessments: []
  });
  
  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'not-completed'
  const [dateSort, setDateSort] = useState('upcoming'); // 'upcoming', 'recent', 'oldest'
  const [showTimeSlotView, setShowTimeSlotView] = useState(false);
  const [selectedDateForSlots, setSelectedDateForSlots] = useState(new Date().toISOString().split('T')[0]);
  const [showOnlineTimeSlotView, setShowOnlineTimeSlotView] = useState(isOnlinePage);
  const [selectedDateForOnlineSlots, setSelectedDateForOnlineSlots] = useState(new Date().toISOString().split('T')[0]);
  const [professionFilter, setProfessionFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState(initialServiceTypeFilter);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  
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
    serviceType: 'Initial Assessment',
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

  // Helper function to format branch names
  const formatBranchName = (branchValue) => {
    const branchMap = {
      'naga-blumentritt': 'Naga City - Main Branch (Blumentritt)',
      'naga-delrosario': 'Naga City - Satellite Branch (Del Rosario)',
      'legazpi': 'Legazpi Branch',
      'daet': 'Daet Branch',
      'guinobatan': 'Guinobatan Branch',
      'polangui': 'Polangui Branch',
      'daraga': 'Daraga Branch',
      'tabaco': 'Tabaco Branch',
      'sorsogon': 'Sorsogon Branch',
      'iriga': 'Iriga Branch',
      'catanduanes': 'Catanduanes Branch',
      'masbate': 'Masbate Branch',
      'irosin': 'Irosin Branch',
      // Legacy values
      'blumentritt': 'Main Branch (Blumentritt)',
      'delrosario': 'Satellite Branch (Del Rosario)'
    };
    return branchMap[branchValue] || branchValue || 'Not specified';
  };

  // Filter and sort bookings function
  const getFilteredAndSortedBookings = () => {
    let filteredBookings = patients.assessments.filter(patient =>
      (selectedBranch === 'all' || patient.branchLocation === selectedBranch) && !patient.assessmentDeleted
    );

    // Apply status filter
    if (statusFilter === 'completed') {
      filteredBookings = filteredBookings.filter(patient => patient.status === 'completed');
    } else if (statusFilter === 'not-completed') {
      filteredBookings = filteredBookings.filter(patient => patient.status !== 'completed');
    }

    // Apply service type filter
    if (serviceTypeFilter !== 'all') {
      filteredBookings = filteredBookings.filter(patient => (patient.serviceType || 'Initial Assessment') === serviceTypeFilter);
    }

    // Apply profession filter
    if (professionFilter !== 'all') {
      filteredBookings = filteredBookings.filter(patient => (patient.selectedProfessional || '') === professionFilter);
    }

    // Sort bookings
    filteredBookings.sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      const now = new Date();
      
      // First, separate completed and non-completed (completed always go to bottom)
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // Then sort by date preference
      if (dateSort === 'upcoming') {
        // Show upcoming dates first, then past dates
        const aIsFuture = dateA >= now;
        const bIsFuture = dateB >= now;
        
        if (aIsFuture && !bIsFuture) return -1;
        if (!aIsFuture && bIsFuture) return 1;
        
        return aIsFuture ? dateA - dateB : dateB - dateA;
      } else if (dateSort === 'recent') {
        // Most recent dates first
        return dateB - dateA;
      } else if (dateSort === 'oldest') {
        // Oldest dates first
        return dateA - dateB;
      }
      
      return 0;
    });

    return filteredBookings;
  };

  // Get time slot availability for a specific date
  const getTimeSlotAvailability = (date) => {
    const allTimeSlots = [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];

    const bookingsForDate = patients.assessments.filter(booking => {
      const bookingDate = new Date(booking.appointmentDate).toISOString().split('T')[0];
      if (bookingDate !== date) return false;
      if (booking.status === 'cancelled' || booking.assessmentDeleted) return false;
      return booking.branchLocation === selectedBranch && (booking.serviceType || 'Initial Assessment') !== 'Online Consultation';
    });

    const bookedSlots = bookingsForDate.map(booking => booking.selectedTime);
    
    return allTimeSlots.map(slot => ({
      time: slot,
      isBooked: bookedSlots.includes(slot),
      bookingsCount: bookedSlots.filter(booked => booked === slot).length,
      bookings: bookingsForDate.filter(booking => booking.selectedTime === slot)
    }));
  };

  // Online Consultation availability (global, Saturdays-only)
  const getOnlineConsultationAvailability = (date) => {
    const onlineSlots = [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];

    const isSaturday = new Date(date).getDay() === 6;
    if (!isSaturday) return [];

    const bookingsForDate = patients.assessments.filter(booking => {
      const bookingDate = new Date(booking.appointmentDate).toISOString().split('T')[0];
      if (bookingDate !== date) return false;
      if (booking.status === 'cancelled' || booking.assessmentDeleted) return false;
      return (booking.serviceType === 'Online Consultation');
    });

    const bookedSlots = bookingsForDate.map(booking => booking.selectedTime);
    return onlineSlots.map(slot => ({
      time: slot,
      isBooked: bookedSlots.includes(slot),
      bookingsCount: bookedSlots.filter(booked => booked === slot).length,
      bookings: bookingsForDate.filter(booking => booking.selectedTime === slot)
    }));
  };

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

  const adminLogout = useCallback(() => {
    // Clear all authentication data
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
    navigate('/'); // Redirect to main page
  }, [navigate]);

  const loadPatientData = async () => {
    try {
      // Fetch bookings from API
      const response = await axios.get(`${API_BASE_URL}/api/bookings`);
      if (response.data.success) {
        setPatients(prev => ({
          ...prev,
          assessments: response.data.data || []
        }));
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Fallback to localStorage for offline mode
      const storedBookings = JSON.parse(localStorage.getItem('assessmentBookings') || '[]');
      setPatients(prev => ({
        ...prev,
        assessments: storedBookings
      }));
    }
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
    if (deletePassword === 'LYKSC@2025') {
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
        'Delete Booking',
        'Are you sure you want to permanently delete this booking? This action cannot be undone.',
        booking,
        async () => {
          try {
            // Delete booking from database via API
            const response = await axios.delete(`${API_BASE_URL}/api/bookings/${booking._id}`);
            
            if (response.data.success) {
              // Reload data from API to refresh the list
              await loadPatientData();
              
              // Close modal if open
              if (selectedBooking && selectedBooking._id === booking._id) {
                closeBookingDetails();
              }
              
              alert('Booking deleted successfully');
            }
          } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Error deleting booking. Please try again.');
            
            // Fallback to localStorage update for offline mode
            const updatedBookings = [...patients.assessments];
            updatedBookings[bookingIndex] = {
              ...booking,
              assessmentDeleted: true,
              assessmentDeletedAt: new Date().toISOString()
            };
            
            localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
            setPatients(prev => ({
              ...prev,
              assessments: updatedBookings
            }));
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
        'Clear Payment Information',
        'Are you sure you want to clear all payment information for this booking? The booking will be kept.',
        booking,
        async () => {
          try {
            // Clear payment information via API
            const response = await axios.patch(`${API_BASE_URL}/api/bookings/${booking._id}/payment`, {
              paymentStatus: 'pending',
              paymentMethod: '',
              paymentReference: '',
              paymentDate: null,
              accountName: ''
            });
            
            if (response.data.success) {
              // Reload data from API to refresh the list
              await loadPatientData();
              
              // Close modal if open
              if (selectedPayment && selectedPayment._id === booking._id) {
                closePaymentDetails();
              }
              
              alert('Payment information cleared successfully');
            }
          } catch (error) {
            console.error('Error clearing payment information:', error);
            alert('Error clearing payment information. Please try again.');
            
            // Fallback to localStorage update for offline mode
            const updatedBookings = [...patients.assessments];
            updatedBookings[bookingIndex] = {
              ...booking,
              paymentMethod: null,
              paymentAmount: null,
              paymentReference: null,
              accountName: null,
              paymentDate: null,
              paymentStatus: 'pending',
              verifiedAt: null,
              paymentDeleted: true,
              paymentDeletedAt: new Date().toISOString()
            };
            
            localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
            setPatients(prev => ({
              ...prev,
              assessments: updatedBookings
            }));
          }
        }
      );
    };

    requestDeletePassword(performDeletion);
  };

  // Removed unused deleteEntireBooking function to fix ESLint error

  const markBookingDone = (bookingIndex) => {
    const booking = patients.assessments[bookingIndex];
    
    showConfirmationDialog(
      'mark-done',
      'Mark as Completed',
      'Are you sure you want to mark this appointment as completed?',
      booking,
      async () => {
        try {
          // Update booking status via API
          const response = await axios.patch(`${API_BASE_URL}/api/bookings/${booking._id}/status`, {
            status: 'completed'
          });
          
          if (response.data.success) {
            // Reload data from API
            await loadPatientData();
            
            // Close modal if it's the current booking
            if (selectedBooking && selectedBooking._id === booking._id) {
              closeBookingDetails();
            }
          }
        } catch (error) {
          console.error('Error marking booking as done:', error);
          alert('Error updating booking status. Please try again.');
          
          // Fallback to localStorage update
          const updatedBookings = [...patients.assessments];
          updatedBookings[bookingIndex] = {
            ...updatedBookings[bookingIndex],
            status: 'completed',
            completedAt: new Date().toISOString()
          };
          
          localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
          setPatients(prev => ({
            ...prev,
            assessments: updatedBookings
          }));
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
      async () => {
        try {
          // Update payment status via API
          const response = await axios.patch(`${API_BASE_URL}/api/bookings/${booking._id}/payment`, {
            paymentStatus: 'paid',
            paymentDate: new Date().toISOString()
          });
          
          if (response.data.success) {
            // Reload data from API
            await loadPatientData();
            
            // Close modal if it's the current booking
            if (selectedBooking && selectedBooking._id === booking._id) {
              closeBookingDetails();
            }
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          alert('Error verifying payment. Please try again.');
          
          // Fallback to localStorage update
          const updatedBookings = [...patients.assessments];
          updatedBookings[bookingIndex] = {
            ...updatedBookings[bookingIndex],
            paymentStatus: 'paid',
            verifiedAt: new Date().toISOString()
          };
          
          localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
          setPatients(prev => ({
            ...prev,
            assessments: updatedBookings
          }));
        }
      }
    );
  };

  // Reschedule functions
  const openRescheduleModal = (booking) => {
    if (window.confirm(`Are you sure you want to reschedule the appointment for ${booking.childName} (${booking.guardianName})?\n\nCurrent appointment: ${new Date(booking.appointmentDate).toLocaleDateString()} at ${booking.selectedTime}`)) {
      setSelectedBookingForReschedule(booking);
      setRescheduleData({
        serviceType: booking.serviceType || 'Initial Assessment',
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
      serviceType: 'Initial Assessment',
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
      // Online Consultation uses global availability and Saturdays-only
      if (rescheduleData.serviceType === 'Online Consultation') {
        const isSaturday = new Date(date).getDay() === 6;
        if (!isSaturday) {
          setAvailableTimeSlotsForReschedule([]);
          return;
        }

        const allTimeSlots = [
          '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
          '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
        ];

        const existingBookings = patients.assessments.filter(booking => {
          const bookingDate = new Date(booking.appointmentDate).toDateString();
          const selectedDate = new Date(date).toDateString();
          if (bookingDate !== selectedDate) return false;
          if (booking._id === selectedBookingForReschedule._id) return false;
          if (booking.status === 'cancelled' || booking.assessmentDeleted) return false;
          return booking.serviceType === 'Online Consultation';
        });

        const bookedSlots = existingBookings.map(booking => booking.selectedTime);
        const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));

        // Add back the current booking's time slot
        const currentTime = selectedBookingForReschedule.selectedTime;
        const merged = availableSlots.includes(currentTime) ? availableSlots : [...availableSlots, currentTime];
        const sorted = allTimeSlots.filter(slot => merged.includes(slot));
        setAvailableTimeSlotsForReschedule(sorted);
        return;
      }

      // Branch-based availability for non-online services via API
      const response = await axios.get(`${API_BASE_URL}/api/bookings/availability/${date}?branch=${selectedBookingForReschedule.branchLocation}`);
      
      if (response.data.success) {
        // Filter out the current booking's time slot since we're rescheduling it
        const availableSlots = response.data.availableSlots;
        // Add back the current booking's time slot since it will be freed up
        const currentTime = selectedBookingForReschedule.selectedTime;
        if (!availableSlots.includes(currentTime)) {
          availableSlots.push(currentTime);
          // Sort the slots to maintain order
          const allTimeSlots = [
            '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
            '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
          ];
          const sortedAvailable = allTimeSlots.filter(slot => availableSlots.includes(slot));
          setAvailableTimeSlotsForReschedule(sortedAvailable);
        } else {
          setAvailableTimeSlotsForReschedule(availableSlots);
        }
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      // Fallback to local calculation
      const allTimeSlots = [
        '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
      ];
      const existingBookings = patients.assessments.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate).toDateString();
        const selectedDate = new Date(date).toDateString();
        if (bookingDate !== selectedDate) return false;
        if (booking._id === selectedBookingForReschedule._id) return false;
        if (booking.status === 'cancelled' || booking.assessmentDeleted) return false;
        if (rescheduleData.serviceType === 'Online Consultation') {
          return booking.serviceType === 'Online Consultation';
        }
        return booking.branchLocation === selectedBookingForReschedule.branchLocation;
      });

      const bookedSlots = existingBookings.map(booking => booking.selectedTime);
      const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
      setAvailableTimeSlotsForReschedule(availableSlots);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleData.appointmentDate || !rescheduleData.selectedTime) {
      alert('Please select both a new date and time.');
      return;
    }
    
    const performReschedule = async () => {
      setRescheduleLoading(true);
      
      try {
        // Reschedule booking via API
        const response = await axios.patch(`${API_BASE_URL}/api/bookings/${selectedBookingForReschedule._id}/reschedule`, {
          appointmentDate: rescheduleData.appointmentDate,
          selectedTime: rescheduleData.selectedTime,
          adminNotes: rescheduleData.adminNotes,
          reason: rescheduleData.reason || 'Admin rescheduled',
          serviceType: rescheduleData.serviceType
        });

        if (response.data.success) {
          // Reload data from API to refresh the list
          await loadPatientData();
          
          // Show success message with old and new dates
          const oldDate = new Date(selectedBookingForReschedule.appointmentDate).toLocaleDateString();
          const oldTime = selectedBookingForReschedule.selectedTime;
          const newDate = new Date(rescheduleData.appointmentDate).toLocaleDateString();
          const newTime = rescheduleData.selectedTime;
          
          alert(`✅ Booking Rescheduled Successfully!\n\n📅 FROM: ${oldDate} at ${oldTime}\n📅 TO: ${newDate} at ${newTime}\n\nThe patient will be notified of the schedule change.`);
          
          closeRescheduleModal();
          
          // Close booking details modal if open
          if (selectedBooking && selectedBooking._id === selectedBookingForReschedule._id) {
            closeBookingDetails();
          }
        }
      } catch (error) {
        console.error('Error rescheduling booking:', error);
        alert('Error rescheduling booking. Please try again.');
        
        // Fallback to localStorage update for offline mode
        const bookingIndex = patients.assessments.findIndex(b => b._id === selectedBookingForReschedule._id);
        
        if (bookingIndex !== -1) {
          const updatedBookings = [...patients.assessments];
          const originalDate = updatedBookings[bookingIndex].appointmentDate;
          const originalTime = updatedBookings[bookingIndex].selectedTime;
          
          updatedBookings[bookingIndex] = {
            ...updatedBookings[bookingIndex],
            appointmentDate: rescheduleData.appointmentDate,
            selectedTime: rescheduleData.selectedTime,
            serviceType: rescheduleData.serviceType,
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

          localStorage.setItem('assessmentBookings', JSON.stringify(updatedBookings));
          setPatients(prev => ({
            ...prev,
            assessments: updatedBookings
          }));
        }
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

  const openWalkInModal = () => setIsWalkInOpen(true);
  const closeWalkInModal = () => setIsWalkInOpen(false);
  const handleWalkInSuccess = async () => {
    await loadPatientData();
    setIsWalkInOpen(false);
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
            <div style={{
              background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '10px',
              fontSize: '0.9rem',
              color: '#856404'
            }}>
              <strong>📝 Note:</strong> Address and Professional fields will show "not provided/selected" for existing bookings. New bookings will include this information.
            </div>
          </div>
            
            {/* Branch Selection */}
            <div className="branch-filter-section">
              <div className="branch-filter-header">
                <h3>📍 Select Your Branch</h3>
                <p>Choose your branch to view patients for your location</p>
              </div>
              <div className="branch-dropdown-container">
                <select
                  className="branch-dropdown"
                  value={selectedBranch}
                  onChange={(e) => filterByBranch(e.target.value)}
                >
                  <option value="all">All Branches</option>
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
                  {/* Legacy branch values for backward compatibility */}
                  <option value="blumentritt">Legacy: Blumentritt (old bookings)</option>
                  <option value="delrosario">Legacy: Del Rosario (old bookings)</option>
                </select>
              </div>
            </div>
            
            {/* Quick Stats - With key for forcing refresh */}
            <div className="quick-stats" key={`stats-${patients.assessments.length}-${selectedBranch}-${statusFilter}`}>
              <div className="stat-item">
                <div className="stat-number" id="branchPendingCount">
                  {patients.assessments.filter(p => (selectedBranch === 'all' || p.branchLocation === selectedBranch) && !p.assessmentDeleted).length}
                </div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-item">
                <div className="stat-number" id="branchCompletedCount">
                  {patients.assessments.filter(p => (selectedBranch === 'all' || p.branchLocation === selectedBranch) && !p.assessmentDeleted && p.status === 'completed').length}
                </div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number" id="branchPendingCount">
                  {patients.assessments.filter(p => (selectedBranch === 'all' || p.branchLocation === selectedBranch) && !p.assessmentDeleted && p.status !== 'completed').length}
                </div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item">
                <div className="stat-number" id="filteredCount">
                  {getFilteredAndSortedBookings().length}
                </div>
                <div className="stat-label">
                  {statusFilter === 'all' ? 'Showing All' :
                   statusFilter === 'completed' ? 'Showing Completed' :
                   'Showing Pending'}
                </div>
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
            <button
              className={`big-action-btn ${isWalkInOpen ? 'active' : ''}`}
              onClick={openWalkInModal}
              title="Add a walk-in booking without creating a user account"
            >
              ➕ Add Walk-in Booking
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
                
                {/* Filter and Sort Controls */}
                <div className="booking-controls">
                  <div className="filter-section">
                    <div className="filter-group">
                      <label>Status Filter:</label>
                      <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All Bookings</option>
                        <option value="not-completed">Not Completed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label>Sort by Date:</label>
                      <select 
                        value={dateSort} 
                        onChange={(e) => setDateSort(e.target.value)}
                        className="filter-select"
                      >
                        <option value="upcoming">Upcoming First</option>
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                    
                    {!isOnlinePage && (
                      <div className="filter-group">
                        <button 
                          className={`btn-time-slots ${showTimeSlotView ? 'active' : ''}`}
                          onClick={() => setShowTimeSlotView(!showTimeSlotView)}
                        >
                          <i className="fas fa-clock"></i> Time Slots
                        </button>
                      </div>
                    )}
                    <div className="filter-group">
                      <button
                        className={`btn-time-slots ${showOnlineTimeSlotView ? 'active' : ''}`}
                        onClick={() => setShowOnlineTimeSlotView(!showOnlineTimeSlotView)}
                        title="View Online Consultation time slots"
                      >
                        <i className="fas fa-video"></i> Online Time Slots
                      </button>
                    </div>
                    {!isOnlinePage && (
                      <div className="filter-group">
                        <label>Service Type:</label>
                        <select 
                          value={serviceTypeFilter} 
                          onChange={(e) => setServiceTypeFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">All</option>
                          <option value="Initial Assessment">Initial Assessment</option>
                          <option value="Online Consultation">Online Consultation</option>
                        </select>
                      </div>
                    )}
                    <div className="filter-group">
                      <label>Profession:</label>
                      <select
                        value={professionFilter}
                        onChange={(e) => setProfessionFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All</option>
                        <option value="developmental-pediatrician">Developmental Pediatrician</option>
                        <option value="occupational-therapist">Occupational Therapist</option>
                        <option value="speech-language-pathologist">Speech & Language Pathologist</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Time Slot Availability View (branch-based) */}
                  {showTimeSlotView && !isOnlinePage && (
                    <div className="time-slot-availability">
                      <div className="slot-date-picker">
                        <label>View availability for:</label>
                        <input 
                          type="date" 
                          value={selectedDateForSlots}
                          onChange={(e) => setSelectedDateForSlots(e.target.value)}
                          className="date-input"
                        />
                        {isOnlinePage && new Date(selectedDateForSlots).getDay() !== 6 && (
                          <small style={{ color: '#c05621', display: 'block', marginTop: '8px' }}>
                            Online Consultation is available on Saturdays only.
                          </small>
                        )}
                      </div>
                      
                      <div className="time-slots-grid">
                        {getTimeSlotAvailability(selectedDateForSlots).map((slot, index) => (
                          <div 
                            key={index} 
                            className={`time-slot-info ${slot.isBooked ? 'booked' : 'available'}`}
                          >
                            <div className="slot-time">{slot.time}</div>
                            <div className="slot-status">
                              {slot.isBooked ? (
                                <>
                                  <span className="booked-badge">
                                    <i className="fas fa-user"></i> {slot.bookingsCount} Booked
                                  </span>
                                  {slot.bookings.map((booking, i) => (
                                    <div key={i} className="slot-booking-info">
                                      {booking.childName} ({booking.guardianName})
                                    </div>
                                  ))}
                                </>
                              ) : (
                                <span className="available-badge">
                                  <i className="fas fa-check"></i> Available
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Online Consultation Time Slot Availability View (global) */}
                  {showOnlineTimeSlotView && (
                    <div className="time-slot-availability">
                      <div className="slot-date-picker">
                        <label>View online availability for:</label>
                        <input 
                          type="date" 
                          value={selectedDateForOnlineSlots}
                          onChange={(e) => setSelectedDateForOnlineSlots(e.target.value)}
                          className="date-input"
                        />
                        {new Date(selectedDateForOnlineSlots).getDay() !== 6 && (
                          <small style={{ color: '#c05621', display: 'block', marginTop: '8px' }}>
                            Online Consultation is available on Saturdays only.
                          </small>
                        )}
                      </div>
                      <div className="time-slots-grid">
                        {getOnlineConsultationAvailability(selectedDateForOnlineSlots).map((slot, index) => (
                          <div 
                            key={index} 
                            className={`time-slot-info ${slot.isBooked ? 'booked' : 'available'}`}
                          >
                            <div className="slot-time">{slot.time}</div>
                            <div className="slot-status">
                              {slot.isBooked ? (
                                <>
                                  <span className="booked-badge">
                                    <i className="fas fa-user"></i> {slot.bookingsCount} Booked
                                  </span>
                                  {slot.bookings.map((booking, i) => (
                                    <div key={i} className="slot-booking-info">
                                      {booking.childName} ({booking.guardianName})
                                    </div>
                                  ))}
                                </>
                              ) : (
                                <span className="available-badge">
                                  <i className="fas fa-check"></i> Available
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    {getFilteredAndSortedBookings()
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
                                <small>{(patient.guardianAddress && patient.guardianAddress.trim() !== '') ? patient.guardianAddress : 'Address not provided'}</small>
                              </div>
                            </td>
                            <td>
                              <div className="appointment-info">
                                <strong>Branch:</strong> {formatBranchName(patient.branchLocation)}<br />
                                <strong>Date:</strong> {new Date(patient.appointmentDate).toLocaleDateString()}<br />
                                <strong>Time:</strong> {patient.selectedTime}
                                {patient.rescheduleHistory && patient.rescheduleHistory.length > 0 && (
                                  <div className="rescheduled-badge">
                                    🔄 Rescheduled {patient.rescheduleHistory.length} time{patient.rescheduleHistory.length > 1 ? 's' : ''}
                                    <small>(Originally: {new Date(patient.rescheduleHistory[0].fromDate).toLocaleDateString()})</small>
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
                      title="Delete entire booking"
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
                
                {getFilteredAndSortedBookings().length === 0 && (
                  <div className="empty-state">
                    <p>
                      {statusFilter === 'completed' ? 'No completed bookings found.' :
                       statusFilter === 'not-completed' ? 'No pending bookings found.' :
                       'No assessment bookings for this branch yet.'}
                    </p>
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
                                      ) : patient.paymentMethod === 'maya' ? (
                                        <span className="method-badge maya">💚 Maya</span>
                                      ) : patient.paymentMethod === 'cash' ? (
                                        <span className="method-badge cash">💵 Cash on Site</span>
                                      ) : (
                                        <span className="method-badge unknown">❓ {patient.paymentMethod || 'Not specified'}</span>
                                      )}
                                    </div>
                                    <strong>Amount:</strong> ₱{patient.paymentAmount ? patient.paymentAmount.toLocaleString() : '2,000'}<br />
                                    <strong>Reference:</strong> {patient.paymentReference || 'N/A'}<br />
                                    <strong>Account:</strong> {patient.accountName || 'N/A'}<br />
                                    <strong>Date:</strong> {patient.paymentDate ? new Date(patient.paymentDate).toLocaleDateString() : 'N/A'}
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
                      title="Clear payment information"
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

      {/* Walk-in Booking Modal */}
      <AdminWalkInModal
        isOpen={isWalkInOpen}
        onClose={closeWalkInModal}
        onSuccess={handleWalkInSuccess}
        selectedBranch={selectedBranch}
      />

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
                    <strong>Branch:</strong> {formatBranchName(selectedBooking.branchLocation)}
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
                    <strong>Address:</strong> {selectedBooking.guardianAddress && selectedBooking.guardianAddress.trim() !== '' ? selectedBooking.guardianAddress : 'Address not provided'}
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
                    <strong>Branch:</strong> {formatBranchName(selectedBooking.branchLocation)}
                  </div>
                  <div className="detail-item">
                    <strong>Date:</strong> {new Date(selectedBooking.appointmentDate).toLocaleDateString()}
                  </div>
                  <div className="detail-item">
                    <strong>Time:</strong> {selectedBooking.selectedTime}
                  </div>
                  <div className="detail-item">
                    <strong>Professional:</strong> {
                      selectedBooking.selectedProfessional === 'developmental-pediatrician' ? '👶 Developmental Pediatrician' :
                      selectedBooking.selectedProfessional === 'occupational-therapist' ? '🖐️ Occupational Therapist' :
                      selectedBooking.selectedProfessional === 'speech-language-pathologist' ? '🗣️ Speech and Language Pathologist' :
                      selectedBooking.selectedProfessional === 'not-specified' ? 'Professional not selected (existing booking)' :
                      (selectedBooking.selectedProfessional && selectedBooking.selectedProfessional.trim() !== '') ? selectedBooking.selectedProfessional : 'Professional not selected'
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
                      ) : selectedBooking.paymentMethod === 'maya' ? (
                        <span className="method-badge maya large">💚 Maya</span>
                      ) : selectedBooking.paymentMethod === 'cash' ? (
                        <span className="method-badge cash large">💵 Cash on Site</span>
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
                    <strong>Payment Date:</strong> <span className="date-display">{selectedBooking.paymentDate ? new Date(selectedBooking.paymentDate).toLocaleDateString() : 'Not provided'}</span>
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
                  {selectedBooking.rescheduleHistory && selectedBooking.rescheduleHistory.length > 0 && (
                    <div className="detail-section reschedule-history">
                      <h4>🔄 Reschedule History ({selectedBooking.rescheduleHistory.length} time{selectedBooking.rescheduleHistory.length > 1 ? 's' : ''})</h4>
                      <div className="reschedule-timeline">
                        {selectedBooking.rescheduleHistory.map((reschedule, index) => (
                          <div key={index} className="reschedule-entry">
                            <div className="reschedule-index">#{selectedBooking.rescheduleHistory.length - index}</div>
                            <div className="reschedule-details">
                              <div className="detail-item">
                                <strong>From:</strong> {new Date(reschedule.fromDate).toLocaleDateString()} at {reschedule.fromTime}
                              </div>
                              <div className="detail-item">
                                <strong>To:</strong> {new Date(reschedule.toDate).toLocaleDateString()} at {reschedule.toTime}
                              </div>
                              <div className="detail-item">
                                <strong>Rescheduled On:</strong> {new Date(reschedule.rescheduledAt).toLocaleString()}
                              </div>
                              <div className="detail-item">
                                <strong>By:</strong> <span className="reschedule-by">{reschedule.rescheduledBy || 'admin'}</span>
                              </div>
                              {reschedule.reason && (
                                <div className="detail-item">
                                  <strong>Reason:</strong> <span className="reschedule-reason">{reschedule.reason}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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
                                        <i className="fas fa-trash"></i> Delete Booking
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
                    ) : selectedPayment.paymentMethod === 'maya' ? (
                      <span className="method-badge maya large">💚 Maya</span>
                    ) : selectedPayment.paymentMethod === 'cash' ? (
                      <span className="method-badge cash large">💵 Cash on Site</span>
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
                    <strong>Payment Date:</strong> <span className="date-display">{selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString() : 'Not provided'}</span>
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
                                         <i className="fas fa-trash"></i> Clear Payment
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
                  <label htmlFor="rescheduleServiceType">Service Type:</label>
                  <select
                    id="rescheduleServiceType"
                    value={rescheduleData.serviceType}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRescheduleData(prev => ({
                        ...prev,
                        serviceType: value,
                        appointmentDate: (value === 'Online Consultation' && prev.appointmentDate && new Date(prev.appointmentDate).getDay() !== 6) ? '' : prev.appointmentDate,
                        selectedTime: value === 'Online Consultation' ? '' : prev.selectedTime
                      }));
                      if (rescheduleData.appointmentDate && value === 'Online Consultation' && new Date(rescheduleData.appointmentDate).getDay() !== 6) {
                        setAvailableTimeSlotsForReschedule([]);
                      }
                    }}
                  >
                    <option value="Initial Assessment">Initial Assessment</option>
                    <option value="Online Consultation">Online Consultation</option>
                  </select>
                  {rescheduleData.serviceType === 'Online Consultation' && (
                    <small style={{ color: '#c05621' }}>Online Consultation is available on Saturdays only.</small>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="rescheduleDate">New Appointment Date:</label>
                  <input 
                    type="date" 
                    id="rescheduleDate" 
                    value={rescheduleData.appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (rescheduleData.serviceType === 'Online Consultation') {
                        const day = new Date(value).getDay();
                        if (day !== 6) {
                          alert('Online Consultation is available on Saturdays only.');
                          setRescheduleData(prev => ({ ...prev, appointmentDate: '', selectedTime: '' }));
                          setAvailableTimeSlotsForReschedule([]);
                          return;
                        }
                      }
                      setRescheduleData(prev => ({ ...prev, appointmentDate: value, selectedTime: '' }));
                      loadTimeSlotsForReschedule(value);
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