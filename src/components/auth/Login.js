import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/authApi';
import '../../style/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthState } = useAuth();
  
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await loginUser(credentials);
      const userData = response.data;
      
      console.log("Login response data:", userData); // Debug the response structure
      
      // Ensure the ID is properly formatted as a number
      const userId = userData.id;
      const parsedId = userId ? Number(userId) : null;
      
      if (isNaN(parsedId)) {
        console.error("Invalid user ID received:", userId);
        throw new Error("Login response contained an invalid user ID");
      }
      
      // Create a consistent user object structure including all necessary data
      const userObj = {
        id: parsedId, // Ensure ID is a number
        email: userData.email,
        firstLogin: userData.firstLogin,
        profileComplete: userData.profileComplete,
        role: userData.role,
        memberType: userData.memberType || null
      };
      
      // Store both the user object and token in auth state AND localStorage
      const authData = {
        user: userObj,
        token: userData.token,
        isAuthenticated: true
      };
      
      // Update state and localStorage
      setAuthState(authData);
      
      console.log("Login successful, auth state updated with:", authData);
      
      // Navigate based on first login status
      if (userData.firstLogin) {
        navigate('/change-password');
      } else if (!userData.profileComplete) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      
      <div className="login-wrapper">
        <div className="login-sidebar">
          <div className="login-sidebar-logo">
            <span>EARA CONNECT</span>
          </div>
          
          <h1>Welcome Back!</h1>
          <p>To keep connected with us please login with your personal info</p>
          
        </div>
        
        <div className="login-form">
          <h2>Login to your Account</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={credentials.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;