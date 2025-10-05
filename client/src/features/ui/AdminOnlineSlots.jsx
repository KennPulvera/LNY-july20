import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import '../../admin-styles.css';
import FloatingElements from './FloatingElements';
import Header from './Header';

const DEFAULT_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

// To customize Online Consultation slots, set values below.
// If left empty, DEFAULT_SLOTS will be used.
const ONLINE_CONSULTATION_SLOTS = [];

function getNextSaturdayISO() {
  const date = new Date();
  const day = date.getDay();
  const delta = (6 - day + 7) % 7;
  date.setDate(date.getDate() + (delta === 0 ? 7 : delta));
  return date.toISOString().split('T')[0];
}

const AdminOnlineSlots = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patients, setPatients] = useState({ assessments: [] });
  const [selectedDate, setSelectedDate] = useState(getNextSaturdayISO());

  const loadPatientData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings`);
      if (response.data.success) {
        setPatients({ assessments: response.data.data || [] });
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      const stored = JSON.parse(localStorage.getItem('assessmentBookings') || '[]');
      setPatients({ assessments: stored });
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const userToken = localStorage.getItem('userToken');
    if (userData && userToken) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'admin') {
          setIsAuthenticated(true);
          localStorage.setItem('adminAuth', 'true');
          loadPatientData();
          return;
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      setIsAuthenticated(true);
      loadPatientData();
    }
  }, [loadPatientData]);

  const effectiveSlots = (ONLINE_CONSULTATION_SLOTS.length > 0 ? ONLINE_CONSULTATION_SLOTS : DEFAULT_SLOTS);

  const getOnlineTimeSlotAvailability = (date) => {
    // Enforce Saturdays-only for Online Consultation to stay consistent
    const isSaturday = new Date(date).getDay() === 6;
    if (!isSaturday) return [];

    const bookingsForDate = patients.assessments.filter(booking => {
      const bookingDate = new Date(booking.appointmentDate).toISOString().split('T')[0];
      if (bookingDate !== date) return false;
      if (booking.status === 'cancelled' || booking.assessmentDeleted) return false;
      return (booking.serviceType === 'Online Consultation');
    });

    const bookedSlots = bookingsForDate.map(b => b.selectedTime);

    return effectiveSlots.map(slot => ({
      time: slot,
      isBooked: bookedSlots.includes(slot),
      bookingsCount: bookedSlots.filter(booked => booked === slot).length,
      bookings: bookingsForDate.filter(b => b.selectedTime === slot)
    }));
  };

  if (!isAuthenticated) {
    return (
      <>
        <FloatingElements />
        <Header isAdmin={true} />
        <div id="authCheckModal" className="auth-modal" style={{ display: 'block' }}>
          <div className="auth-modal-content">
            <h2>🔒 Admin Authentication Required</h2>
            <p>Please log in with admin credentials to access this page.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FloatingElements />
      <Header isAdmin={true} onLogout={() => { if (window.adminLogout) window.adminLogout(); }} />
      <section className="admin-section">
        <div className="container">
          <div className="welcome-header">
            <div className="welcome-content">
              <h1>🗓 Online Consultation Time Slots</h1>
              <p className="welcome-subtitle">Global availability for Online Consultations (Saturdays)</p>
            </div>
            <div className="main-actions">
              <button className="big-action-btn" onClick={() => navigate('/admin')}>
                ← Back to Dashboard
              </button>
              <button className="big-action-btn" onClick={() => navigate('/admin')}>
                📋 View Online Bookings
              </button>
            </div>
          </div>

          <div className="booking-controls">
            <div className="filter-section">
              <div className="filter-group">
                <label>View availability for:</label>
                <input
                  type="date"
                  className="date-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {new Date(selectedDate).getDay() !== 6 && (
                  <small style={{ color: '#c05621', display: 'block', marginTop: '8px' }}>
                    Online Consultation is available on Saturdays only.
                  </small>
                )}
              </div>
            </div>

            <div className="time-slot-availability">
              <div className="time-slots-grid">
                {getOnlineTimeSlotAvailability(selectedDate).map((slot, index) => (
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
                {getOnlineTimeSlotAvailability(selectedDate).length === 0 && (
                  <div style={{ marginTop: '12px', color: '#6b7280' }}>
                    No slots to display for the selected date.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminOnlineSlots;


