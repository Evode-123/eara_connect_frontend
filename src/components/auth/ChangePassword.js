import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/authApi';
import '../../style/ChangePassword.css';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, token, isAuthenticated, setAuthState } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("ChangePassword component - Auth state:", { 
      user: user ? { ...user } : null, 
      token: token ? "exists" : "missing",
      isAuthenticated 
    });
    
    // Check for valid authentication state
    const checkAuth = () => {
      if (!isAuthenticated || !token) {
        console.error("Not authenticated in ChangePassword component");
        setError('You are not logged in. Redirecting to login page...');
        setTimeout(() => navigate('/login'), 2000);
        return false;
      }
      
      if (!user || !user.email) {
        console.error("Missing user data in ChangePassword component");
        setError('User information not available. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return false;
      }
      
      return true;
    };
    
    checkAuth();
  }, [user, token, isAuthenticated, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.email) {
      setError('User information not available. Please log in again.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    // Fix 3: Add validation for password requirements
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Sending password change request for user:', user.email);
      
      // Fix 4: Debug token in localStorage before sending request
      const storedToken = localStorage.getItem('token');
      console.log('Using token from localStorage:', storedToken ? 'Token exists' : 'No token found');
      
      await changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword
      });
      
      // Update user data in auth state
      if (user) {
        const updatedUser = {
          ...user,
          firstLogin: false
        };
        
        setAuthState({
          user: updatedUser,
          token: token,
          isAuthenticated: true
        });
      }
      
      setSuccess('Password changed successfully!');
      
      // Determine next navigation step
      setTimeout(() => {
        if (user && !user.profileComplete) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      console.error('Password change error:', err);
      const errorMessage = err.response?.data?.message || 'Password change failed. Please check your current password.';
      setError(errorMessage);
      
      // Fix 5: Add more detailed error logging
      console.error('Full error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="change-password-page">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      
      <div className="change-password-wrapper">
        <div className="change-password-sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="30" height="30" rx="6" fill="white" fillOpacity="0.2"/>
                <path d="M15 7L21 12H9L15 7Z" fill="white"/>
                <path d="M15 23L21 18H9L15 23Z" fill="white"/>
              </svg>
            </div>
            <span>EARA CONNECT</span>
          </div>
          
          <h1>Security First!</h1>
          <p>Please change your password to enhance your account security</p>
        </div>
        
        <div className="change-password-form">
          <h2>Change Password</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="8"
              />
              <small className="form-text">Password must be at least 8 characters</small>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !user}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;