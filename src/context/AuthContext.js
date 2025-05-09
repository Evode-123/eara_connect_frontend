import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initial state with proper structure
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  
  const navigate = useNavigate();
  
  // Load auth data from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log("Loading auth state from localStorage:", { token, storedUser });
      
      if (token && storedUser && storedUser !== "undefined") {
        const user = JSON.parse(storedUser);
        
        // Ensure user ID is a number
        if (user && user.id) {
          user.id = Number(user.id);
        }
        
        setAuthState({
          user: user,
          token: token,
          isAuthenticated: true,
        });
        
        console.log("Auth state loaded successfully:", { user, token });
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);
  
  // Update auth state and localStorage
  const updateAuthState = (userData) => {
    console.log("Updating auth state with:", userData);
    
    // Check if we're receiving a structure with user property
    if (userData.user) {
      // Ensure ID is a number
      if (userData.user && userData.user.id) {
        userData.user.id = Number(userData.user.id);
      }
      
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData.user));
      
      setAuthState({
        user: userData.user,
        token: userData.token,
        isAuthenticated: true,
      });
      
      console.log("Auth state updated successfully with user object:", userData.user);
    }
    // For direct auth updates (from login)
    else if (userData && userData.token) {
      // Ensure ID is a number
      let userID = userData.id;
      if (userID) {
        userID = Number(userID);
      }
      
      const userInfo = {
        id: userID, // Important: Include the user's ID
        email: userData.email || '',
        firstLogin: userData.firstLogin || false,
        profileComplete: userData.profileComplete || false,
        role: userData.role || 'USER',
        memberType: userData.memberType || null
      };
      
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      setAuthState({
        user: userInfo,
        token: userData.token,
        isAuthenticated: true,
      });
      
      console.log("Auth state updated successfully:", userInfo);
    } else {
      console.error("Invalid user data provided to updateAuthState");
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    navigate('/login');
  };
  
  return (
    <AuthContext.Provider value={{
      // Spread entire auth state
      ...authState,
      // Also provide individual properties for direct access
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated,
      setAuthState: updateAuthState,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};