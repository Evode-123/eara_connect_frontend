import React, { useState, useEffect } from 'react';
import '../../../style/AdminDashboard.css';
import axiosInstance from '../../../config/axiosConfig';

const CommissionerGeneral = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'register', or 'edit'
  const [commissioners, setCommissioners] = useState([]);
  const [editingCommissioner, setEditingCommissioner] = useState(null);
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commissionerToDelete, setCommissionerToDelete] = useState(null);

  // Member type options - Updated to match backend enum
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
      } else {
        setRevenueAuthorities([]);
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
    
    // Reset revenue authority when country changes
    if (name === 'countryId') {
      setFormData(prev => ({
        ...prev,
        revenueAuthorityId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data before sending
      if (!formData.cgName || !formData.cgEmail || !formData.cgPhone || !formData.memberType) {
        throw new Error('Please fill in all required fields');
      }

      // For registration, also validate country and revenue authority
      if (viewMode === 'register' && (!formData.countryId || !formData.revenueAuthorityId)) {
        throw new Error('Please select country and revenue authority');
      }

      // Create the payload matching backend CommissionerGeneral model
      const payload = {
        cgName: formData.cgName.trim(),
        cgPhone: formData.cgPhone.trim(),
        cgEmail: formData.cgEmail.trim()
      };

      let response;
      if (viewMode === 'edit') {
        // Update existing commissioner - send memberType as query param
        const updateUrl = formData.memberType 
          ? `/api/commissioners/${editingCommissioner.id}?memberType=${formData.memberType}`
          : `/api/commissioners/${editingCommissioner.id}`;
          
        response = await axiosInstance.put(updateUrl, payload);
        setSuccess('Commissioner updated successfully!');
      } else {
        // Create new commissioner - all params in URL as per backend
        response = await axiosInstance.post(
          `/commissioners/country/${formData.countryId}/authority/${formData.revenueAuthorityId}?memberType=${formData.memberType}`,
          payload
        );
        setSuccess('Commissioner registered successfully!');
      }

      console.log('Success response:', response.data);
      
      // Reset form
      resetForm();
      
      // Refresh the commissioner list
      await fetchCommissioners();
      
      // Switch back to list view after successful operation
      setTimeout(() => {
        setViewMode('list');
        setSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Operation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save commissioner';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cgName: '',
      cgPhone: '',
      cgEmail: '',
      countryId: '',
      revenueAuthorityId: '',
      memberType: ''
    });
    setEditingCommissioner(null);
  };

  // Handle edit commissioner
  const handleEdit = (commissioner) => {
    setEditingCommissioner(commissioner);
    setFormData({
      cgName: commissioner.cgName || '',
      cgPhone: commissioner.cgPhone || '',
      cgEmail: commissioner.cgEmail || '',
      countryId: commissioner.country?.id || '',
      revenueAuthorityId: commissioner.revenueAuthority?.id || '',
      memberType: commissioner.memberType || ''
    });
    setViewMode('edit');
    setError(null);
    setSuccess(false);
  };

  // Handle delete commissioner
  const handleDelete = (commissioner) => {
    setCommissionerToDelete(commissioner);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!commissionerToDelete) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/api/commissioners/${commissionerToDelete.id}`);
      setSuccess('Commissioner deleted successfully!');
      await fetchCommissioners();
      setShowDeleteModal(false);
      setCommissionerToDelete(null);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete commissioner');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCommissionerToDelete(null);
  };

  // Function to get country name by ID
  const getCountryName = (countryId) => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.countryName || country.name : 'Unknown';
  };
  
  // Function to get authority name by ID
  const getAuthorityName = (authorityId) => {
    const authority = revenueAuthorities.find(a => a.id === authorityId);
    return authority ? authority.authorityName || authority.name : 'Unknown';
  };

  // Format display name from backend format
  const formatDisplayName = (value) => {
    if (!value) return '';
    if (value.includes(' ')) return value;
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Switch to register mode
  const handleRegisterClick = () => {
    resetForm();
    setViewMode('register');
    setError(null);
    setSuccess(false);
  };

  // Switch back to list mode
  const handleBackToList = () => {
    setViewMode('list');
    resetForm();
    setError(null);
    setSuccess(false);
  };

  // Render Delete Modal
  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content delete-modal">
          <div className="modal-header">
            <h3>Confirm Delete</h3>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete this commissioner?</p>
            <div className="commissioner-details">
              <strong>{commissionerToDelete?.cgName}</strong>
              <br />
              <span>{commissionerToDelete?.cgEmail}</span>
            </div>
            <p className="warning-text">This action cannot be undone.</p>
          </div>
          <div className="modal-actions">
            <button 
              className="btn btn-secondary" 
              onClick={cancelDelete}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-danger" 
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
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
            + New Commissioner
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        {commissioners.length === 0 ? (
          <div className="no-data">No commissioners have been registered yet.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Country</th>
                  <th>Revenue Authority</th>
                  <th>Member Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {commissioners.map(commissioner => (
                  <tr key={commissioner.id}>
                    <td>{commissioner.cgName}</td>
                    <td>{commissioner.cgEmail}</td>
                    <td>{commissioner.cgPhone}</td>
                    <td>{commissioner.country ? formatDisplayName(commissioner.country.name || commissioner.country.countryName) : 'N/A'}</td>
                    <td>{commissioner.revenueAuthority ? formatDisplayName(commissioner.revenueAuthority.authorityName || commissioner.revenueAuthority.name) : 'N/A'}</td>
                    <td>
                      <span className={`member-type-badge ${commissioner.memberType?.toLowerCase() || 'member'}`}>
                        {formatDisplayName(commissioner.memberType || 'Member')}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => handleEdit(commissioner)}
                          title="Edit Commissioner"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => handleDelete(commissioner)}
                          title="Delete Commissioner"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render registration form view
  const renderRegistrationForm = () => {
    const isEditMode = viewMode === 'edit';
    
    return (
      <div className="registration-section">
        <div className="form-header">
          <button 
            className="back-btn"
            onClick={handleBackToList}
          >
            ← Back
          </button>
          <h3>{isEditMode ? 'Edit Commissioner General' : 'Register Commissioner General'}</h3>
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cgName">Full Name *</label>
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
            <label htmlFor="cgEmail">Email *</label>
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
            <label htmlFor="cgPhone">Phone Number *</label>
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
          
          {!isEditMode && (
            <>
              <div className="form-group">
                <label htmlFor="countryId">Country *</label>
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
                      {formatDisplayName(country.name || country.countryName)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="revenueAuthorityId">Revenue Authority *</label>
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
                      {formatDisplayName(authority.authorityName || authority.name)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="memberType">Member Type *</label>
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
            {loading ? (isEditMode ? 'Updating...' : 'Registering...') : (isEditMode ? 'Update Commissioner' : 'Register Commissioner')}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="positions-section commissioner-section">
      {viewMode === 'list' ? renderCommissionersList() : renderRegistrationForm()}
      {renderDeleteModal()}
    </div>
  );
};

export default CommissionerGeneral;