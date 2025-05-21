import React, { useState, useEffect } from 'react';
import '../../../style/AdminDashboard.css';
import axiosInstance from '../../../config/axiosConfig'; // Assuming this is the path to your axios instance

const CommissionerGeneral = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'register'
  const [commissioners, setCommissioners] = useState([]);
  const [formData, setFormData] = useState({
    cgName: '',
    cgPhone: '',
    cgEmail: '',
    countryId: '',
    revenueAuthorityId: '',
    memberType: ''
  });

  const [countries, setCountries] = useState([]);
  const [revenueAuthorities, setRevenueAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Member type options
  const memberTypeOptions = [
    { value: 'HEAD', label: 'Head' },
    { value: 'SECRETARY', label: 'Secretary' },
    { value: 'MEMBER', label: 'Member' }
  ];

  // Fetch commissioners, countries on component mount
  useEffect(() => {
    fetchCommissioners();
    fetchCountries();
  }, []);

  // Fetch all commissioners
  const fetchCommissioners = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/commissioners/get-all');
      setCommissioners(response.data);
    } catch (err) {
      console.error('Error fetching commissioners:', err);
      setError('Failed to load commissioners: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/countries/get-all-country');
      setCountries(response.data);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Failed to fetch countries: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch revenue authorities when country is selected
  useEffect(() => {
    const fetchRevenueAuthorities = async () => {
      if (formData.countryId) {
        try {
          setLoading(true);
          const response = await axiosInstance.get(`/countries/${formData.countryId}/revenue-authorities`);
          setRevenueAuthorities(response.data);
        } catch (err) {
          console.error('Error fetching revenue authorities:', err);
          setError('Failed to fetch revenue authorities: ' + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRevenueAuthorities();
  }, [formData.countryId]);

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
    setError(null);
    setSuccess(false);

    try {
      // Validate form data before sending
      if (!formData.cgName || !formData.cgEmail || !formData.cgPhone || 
          !formData.countryId || !formData.revenueAuthorityId || !formData.memberType) {
        throw new Error('Please fill in all required fields');
      }

      // Create the payload with the CORRECT field names expected by the backend
      const payload = {
        cgName: formData.cgName,
        cgPhone: formData.cgPhone,
        cgEmail: formData.cgEmail,
        memberType: formData.memberType
      };

      const response = await axiosInstance.post(
        `/commissioners/country/${formData.countryId}/authority/${formData.revenueAuthorityId}?memberType=${formData.memberType}`,
        payload
      );

      console.log('Success response:', response.data);
      setSuccess(true);
      
      // Reset form
      setFormData({
        cgName: '',
        cgPhone: '',
        cgEmail: '',
        countryId: '',
        revenueAuthorityId: '',
        memberType: ''
      });
      
      // Refresh the commissioner list
      fetchCommissioners();
      
      // Switch back to list view after successful registration
      setTimeout(() => {
        setViewMode('list');
      }, 999);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register commissioner');
    } finally {
      setLoading(false);
    }
  };

  // Function to get country name by ID
  const getCountryName = (countryId) => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.countryName : 'Unknown';
  };
  
  // Function to get authority name by ID
  const getAuthorityName = (authorityId) => {
    const authority = revenueAuthorities.find(a => a.id === authorityId);
    return authority ? authority.authorityName : 'Unknown';
  };

  // Format display name from backend format
  const formatDisplayName = (value) => {
    if (!value) return '';
    if (value.includes(' ')) return value;
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Switch to register mode
  const handleRegisterClick = () => {
    setViewMode('register');
    setError(null);
    setSuccess(false);
  };

  // Switch back to list mode
  const handleBackToList = () => {
    setViewMode('list');
    setError(null);
    setSuccess(false);
  };

  // Render commissioner list view
  const renderCommissionersList = () => {
    if (loading && commissioners.length === 0) {
      return <div className="loading">Loading commissioners...</div>;
    }

    return (
      <div className="commissioners-list">
        <div className="list-header">
          <h3>Commissioners General</h3>
          <button 
            className="action-btn add-btn"
            onClick={handleRegisterClick}
          >
            Register New Commissioner
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        
        {commissioners.length === 0 ? (
          <div className="no-data">No commissioners have been registered yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Country</th>
                <th>Revenue Authority</th>
                <th>Member Type</th>
              </tr>
            </thead>
            <tbody>
              {commissioners.map(commissioner => (
                <tr key={commissioner.id}>
                  <td>{commissioner.cgName}</td>
                  <td>{commissioner.cgEmail}</td>
                  <td>{commissioner.cgPhone}</td>
                  <td>{commissioner.country ? formatDisplayName(commissioner.country.name) : 'N/A'}</td>
                  <td>{commissioner.revenueAuthority ? formatDisplayName(commissioner.revenueAuthority.authorityName) : 'N/A'}</td>
                  <td>{formatDisplayName(commissioner.memberType)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Render registration form view
  const renderRegistrationForm = () => {
    return (
      <div className="registration-section">
        <div className="form-header">
          <button 
            className="back-btn"
            onClick={handleBackToList}
          >
            ← Back to Commissioners List
          </button>
          <h3>Register Commissioner General</h3>
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">Commissioner General registered successfully!</div>}
        
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cgName">Full Name</label>
            <input
              type="text"
              id="cgName"
              name="cgName"
              value={formData.cgName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="cgEmail">Email</label>
            <input
              type="email"
              id="cgEmail"
              name="cgEmail"
              value={formData.cgEmail}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="cgPhone">Phone Number</label>
            <input
              type="tel"
              id="cgPhone"
              name="cgPhone"
              value={formData.cgPhone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="countryId">Country</label>
            <select
              id="countryId"
              name="countryId"
              value={formData.countryId}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {formatDisplayName(country.name)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="revenueAuthorityId">Revenue Authority</label>
            <select
              id="revenueAuthorityId"
              name="revenueAuthorityId"
              value={formData.revenueAuthorityId}
              onChange={handleChange}
              required
              disabled={!formData.countryId || loading}
            >
              <option value="">Select revenue authority</option>
              {revenueAuthorities.map(authority => (
                <option key={authority.id} value={authority.id}>
                  {formatDisplayName(authority.authorityName)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="memberType">Member Type</label>
            <select
              id="memberType"
              name="memberType"
              value={formData.memberType}
              onChange={handleChange}
              required
            >
              <option value="">Select member type</option>
              {memberTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="positions-section commissioner-section">
      {viewMode === 'list' ? renderCommissionersList() : renderRegistrationForm()}
    </div>
  );
};

export default CommissionerGeneral;