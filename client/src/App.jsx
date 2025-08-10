import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './features/ui/LandingPage';
import AdminDashboard from './features/ui/AdminDashboard';
import AdminOnlineSlots from './features/ui/AdminOnlineSlots';
import PaymentPage from './features/ui/PaymentPage';
import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/online-consultations"
            element={<AdminDashboard initialServiceTypeFilter="Online Consultation" isOnlinePage={true} />}
          />
          <Route
            path="/admin/online-consultations/slots"
            element={<AdminOnlineSlots />}
          />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 