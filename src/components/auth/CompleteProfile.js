import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/userApi';
import '../../style/CompleteProfile.css';

const CompleteProfile = () => {
  const [gender, setGender] = useState('');
  const [currentJobPosition, setCurrentJobPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentDate, setEmploymentDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, token, isAuthenticated, setAuthState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("CompleteProfile component - Auth state:", { 
      user: user ? { ...user } : null, 
      token: token ? "exists" : "missing",
      isAuthenticated 
    });
    
    // Check for valid authentication state
    const checkAuth = () => {
      if (!isAuthenticated || !token) {
        console.error("Not authenticated in CompleteProfile component");
        setError('You are not logged in. Redirecting to login page...');
        setTimeout(() => navigate('/login'), 2000);
        return false;
      }
      
      if (!user || !user.email) {
        console.error("Missing user data in CompleteProfile component");
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
    
    setLoading(true);
    setError('');
    
    try {
      const response = await updateProfile({
        gender,
        jobPosition: currentJobPosition,
        department,
        employmentDate
      });
      
      // Update user data in auth state
      if (user) {
        const updatedUser = {
          ...user,
          profileComplete: true,
          gender: gender,
          currentJobPosition: currentJobPosition,
          department: department,
          employmentDate: employmentDate
        };
        
        setAuthState({
          user: updatedUser,
          token: token,
          isAuthenticated: true
        });
      }
      
      console.log("Profile updated successfully, navigating to dashboard");
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="bg-circle-1"></div>
      <div className="bg-circle-2"></div>
      
      <div className="profile-container">
        <div className="profile-sidebar">
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
          
          <h1>Profile Setup</h1>
          <p>Please to continue provide some additional information about yourself to know you better.</p>
        </div>
        
        <div className="profile-form">
          <h2>Complete Your Profile</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Gender</label>
              <select
                className="form-control"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Current Job Position</label>
              <input
                type="text"
                className="form-control"
                value={currentJobPosition}
                onChange={(e) => setCurrentJobPosition(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Employment Date</label>
              <input
                type="date"
                className="form-control"
                value={employmentDate}
                onChange={(e) => setEmploymentDate(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading || !user}>
              {loading ? 'Saving...' : 'Save and Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;