import React, { useState, useEffect } from 'react';
import '../../../style/AdminDashboard.css';

const CommitteeMembers = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'register', or 'edit'
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    currentPositionInYourRRA: '',
    positionId: '',
    appointedDate: '',
    countryId: '',
    revenueAuthorityId: '',
    memberType: ''
  });

  const [appointedLetter, setAppointedLetter] = useState(null);
  const [countries, setCountries] = useState([]);
  const [positions, setPositions] = useState([]);
  const [revenueAuthorities, setRevenueAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Member type options
  const memberTypeOptions = [
    { value: 'HEAD', label: 'Head' },
    { value: 'SECRETARY', label: 'Secretary' },
    { value: 'MEMBER', label: 'Member' }
  ];

  // Fetch committee members, countries, and positions on component mount
  useEffect(() => {
    fetchCommitteeMembers();
    fetchCountries();
    fetchPositions();
  }, []);

  // Fetch all committee members
  const fetchCommitteeMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/committee-members', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch committee members');
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error('Error fetching committee members:', err);
      setError('Failed to load committee members: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/countries/get-all-country', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Failed to fetch countries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch positions
  const fetchPositions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/positions/get-all-positions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch positions');
      const data = await response.json();
      setPositions(data);
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError('Failed to fetch positions: ' + err.message);
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
          const token = localStorage.getItem('token');
          const response = await fetch(
            `http://localhost:8080/api/countries/${formData.countryId}/revenue-authorities`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if (!response.ok) throw new Error('Failed to fetch revenue authorities');
          const data = await response.json();
          setRevenueAuthorities(data);
        } catch (err) {
          setError(err.message);
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

  const handleFileChange = (e) => {
    setAppointedLetter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get the token and check if it exists
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const isEditMode = viewMode === 'edit';

      // Validate form data before sending
      if (!formData.name || !formData.email || !formData.phone || 
          !formData.currentPositionInYourRRA || !formData.appointedDate || 
          !formData.memberType) {
        throw new Error('Please fill in all required fields');
      }

      // For new registrations, validate all fields including file upload
      if (!isEditMode && (!formData.countryId || !formData.revenueAuthorityId || 
          !formData.positionId || !appointedLetter)) {
        throw new Error('Please fill in all required fields and upload appointment letter');
      }

      let response;

      if (isEditMode) {
        // Update existing member - only basic info can be updated
        const updatePayload = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          currentPositionInYourRRA: formData.currentPositionInYourRRA,
          appointedDate: formData.appointedDate,
          memberType: formData.memberType
        };

        response = await fetch(`http://localhost:8080/api/committee-members/${editingMember.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });

        if (!response.ok) {
          let errorMessage = 'Failed to update committee member';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            errorMessage = `Error ${response.status}: ${response.statusText || errorMessage}`;
          }
          throw new Error(errorMessage);
        }

        setSuccess('Committee Member updated successfully!');
      } else {
        // Create form data object for multipart/form-data
        const formDataObj = new FormData();
        
        // Create the member object with the correct field names
        const memberObj = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          currentPositionInYourRRA: formData.currentPositionInYourRRA,
          appointedDate: formData.appointedDate
        };
        
        // Convert member object to JSON string and append to FormData
        formDataObj.append('member', JSON.stringify(memberObj));
        
        // Append the appointed letter file
        formDataObj.append('appointedLetter', appointedLetter);

        const url = `http://localhost:8080/api/committee-members/country/${formData.countryId}/position/${formData.positionId}/authority/${formData.revenueAuthorityId}?memberType=${formData.memberType}`;
        
        console.log('Sending request to:', url);
        
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // NOTE: Do not set Content-Type header when sending FormData
          },
          body: formDataObj
        });

        if (!response.ok) {
          // Try to parse error response
          let errorMessage = 'Failed to register committee member';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            // If can't parse JSON, use status text
            errorMessage = `Error ${response.status}: ${response.statusText || errorMessage}`;
          }
          throw new Error(errorMessage);
        }

        setSuccess('Committee Member registered successfully!');
      }

      // Try to parse the successful response
      try {
        const data = await response.json();
        console.log('Success response:', data);
      } catch (jsonError) {
        // If no JSON in success response, just continue
        console.log('No JSON in success response');
      }

      // Reset form
      resetForm();
      
      // Refresh the committee members list
      fetchCommitteeMembers();
      
      // Switch back to list view after successful registration
      setTimeout(() => {
        setViewMode('list');
      }, 1500);
      
    } catch (err) {
      console.error('Operation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      currentPositionInYourRRA: '',
      positionId: '',
      appointedDate: '',
      countryId: '',
      revenueAuthorityId: '',
      memberType: ''
    });
    setAppointedLetter(null);
    setEditingMember(null);
    
    // Reset file input
    const fileInput = document.getElementById('appointedLetter');
    if (fileInput) fileInput.value = '';
  };

  // Handle edit member
  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email,
      currentPositionInYourRRA: member.currentPositionInYourRRA,
      positionId: member.positionInERA?.id || '',
      appointedDate: member.appointedDate ? member.appointedDate.split('T')[0] : '',
      countryId: member.country?.id || '',
      revenueAuthorityId: member.revenueAuthority?.id || '',
      memberType: member.memberType
    });
    setViewMode('edit');
    setError(null);
    setSuccess(false);
  };

  // Handle delete member
  const handleDelete = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8080/api/committee-members/${memberToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete committee member');
      }

      setSuccess('Committee Member deleted successfully!');
      fetchCommitteeMembers();
      setShowDeleteModal(false);
      setMemberToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete committee member');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
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
            <p>Are you sure you want to delete this committee member?</p>
            <div className="member-details">
              <strong>{memberToDelete?.name}</strong>
              <br />
              <span>{memberToDelete?.email}</span>
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

  // Render committee members list view
  const renderMembersList = () => {
    if (loading && members.length === 0) {
      return <div className="loading">Loading committee members...</div>;
    }

    return (
      <div className="members-list">
        <div className="list-header">
          <h3>Committee Members</h3>
          <button 
            className="action-btn add-btn"
            onClick={handleRegisterClick}
          >
            + New Member
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        {members.length === 0 ? (
          <div className="no-data">No committee members have been registered yet.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Country</th>
                  <th>Current Position in RRA</th>
                  <th>Position in ERA</th>
                  <th>Revenue Authority</th>
                  <th>Member Type</th>
                  <th>Appointed Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>{member.country ? formatDisplayName(member.country.name) : 'N/A'}</td>
                    <td>{member.currentPositionInYourRRA}</td>
                    <td>{member.positionInERA ? formatDisplayName(member.positionInERA.positionName) : 'N/A'}</td>
                    <td>{member.revenueAuthority ? formatDisplayName(member.revenueAuthority.authorityName) : 'N/A'}</td>
                    <td>
                      <span className={`member-type-badge ${member.memberType.toLowerCase()}`}>
                        {formatDisplayName(member.memberType)}
                      </span>
                    </td>
                    <td>{new Date(member.appointedDate).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-edit"
                          onClick={() => handleEdit(member)}
                          title="Edit Member"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => handleDelete(member)}
                          title="Delete Member"
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
          <h3>{isEditMode ? 'Edit Committee Member' : 'Register Committee Member'}</h3>
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="currentPositionInYourRRA">Current Position in Your RRA</label>
            <input
              type="text"
              id="currentPositionInYourRRA"
              name="currentPositionInYourRRA"
              value={formData.currentPositionInYourRRA}
              onChange={handleChange}
              placeholder="Enter current position in your RRA"
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
              required={!isEditMode}
              disabled={loading || isEditMode}
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
              required={!isEditMode}
              disabled={!formData.countryId || loading || isEditMode}
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
            <label htmlFor="positionId">Position in ERA</label>
            <select
              id="positionId"
              name="positionId"
              value={formData.positionId}
              onChange={handleChange}
              required={!isEditMode}
              disabled={loading || isEditMode}
            >
              <option value="">Select position</option>
              {positions.map(position => (
                <option key={position.id} value={position.id}>
                  {formatDisplayName(position.positionName)}
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
          
          <div className="form-group">
            <label htmlFor="appointedDate">Appointed Date</label>
            <input
              type="date"
              id="appointedDate"
              name="appointedDate"
              value={formData.appointedDate}
              onChange={handleChange}
              required
            />
          </div>
          
          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="appointedLetter">Appointment Letter</label>
              <input
                type="file"
                id="appointedLetter"
                name="appointedLetter"
                onChange={handleFileChange}
                required
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <small>Upload appointment letter (PDF, DOC, DOCX, JPG, JPEG, PNG)</small>
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Registering...') : (isEditMode ? 'Update' : 'Register')}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="positions-section committee-section">
      {viewMode === 'list' ? renderMembersList() : renderRegistrationForm()}
      {renderDeleteModal()}
    </div>
  );
};

export default CommitteeMembers;