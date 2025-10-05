import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isLogin) {
        // Registration validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
      }

      const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData);

      if (response.data.success) {
        // Store user data in localStorage
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        onAuthSuccess(response.data.user);
        onClose();
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal magic-modal" style={{ display: 'block' }}>
      <div className="auth-modal-content">
        <div className="auth-modal-header">
          <h2>🔐 {isLogin ? 'Welcome Back!' : 'Join Our Family!'} ✨</h2>
          <button className="auth-close" onClick={onClose}>×</button>
        </div>

        <div className="auth-modal-body">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              🔑 Login
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              👶 Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className={`auth-form ${isLogin ? 'login-form' : 'register-form'} active`}>
            {error && <div className="auth-error">{error}</div>}

            <div className="form-section">
              <h4>
                <i className="fas fa-user-circle"></i>
                {isLogin ? 'Login to Your Account' : 'Create Your Account'}
              </h4>



              <div className="form-group">
                <label>📧 Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>🔒 Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  minLength="6"
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label>🔒 Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    minLength="6"
                  />
                </div>
              )}

              <button type="submit" className="magic-auth-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-text">⏳ Processing...</span>
                ) : (
                  <>
                    <span className="btn-text">
                      {isLogin ? '🚀 Login Now' : '✨ Create Account'}
                    </span>
                    <div className="auth-btn-sparkles">
                      <span className="sparkle">✨</span>
                      <span className="sparkle">⭐</span>
                      <span className="sparkle">💫</span>
                    </div>
                  </>
                )}
              </button>
            </div>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-toggle">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={toggleMode} className="auth-toggle-btn">
                  {isLogin ? 'Sign Up Here' : 'Login Here'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 