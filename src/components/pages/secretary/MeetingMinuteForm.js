import React, { useState, useEffect } from 'react';
import '../../../style/SecretaryDashboard.css';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../config/axiosConfig';

const MeetingMinuteForm = ({ committeeMembers, commissioners, countries, positions, loading, error: initialError }) => {
  const [error, setError] = useState(initialError || null);
  const { user, token } = useAuth(); // Get user and token directly from auth context
  const [formData, setFormData] = useState({
    meetingNo: '',
    date: '',
    location: '',
    meetingType: '',
    theme: '',
    committeeParticipants: [],
    commissionerParticipants: [],
    agendaItems: [{ title: '', description: '' }],
    resolutions: [{
      title: '',
      description: '',
      deadlineDate: '',
      status: 'PENDING',
      assignToCountries: false,
      assignToPositions: false,
      assignToAllCommissioners: false,
      assignedCountryIds: [],
      assignedPositionIds: []
    }]
  });

  const [success, setSuccess] = useState(false);

  // Log auth information when component mounts
  useEffect(() => {
    console.log("Auth state in MeetingMinuteForm:", { user, token });
  }, [user, token]);

  const meetingTypeOptions = [
    { value: 'COMMISSIONER_GENERAL_MEETING', label: 'Commissioner General Meeting' },
    { value: 'DOMESTIC_REVENUE_COMMITTEE', label: 'Domestic Revenue Committee' },
    { value: 'CUSTOMS_REVENUE_COMMITTEE', label: 'Customs Revenue Committee' },
    { value: 'IT_COMMITTEE', label: 'IT Committee' },
    { value: 'HR_COMMITTEE', label: 'HR Committee' },
    { value: 'RESEARCH_AND_PLANNING_COMMITTEE', label: 'Research and Planning Committee' },
    { value: 'LEGAL_COMMITTEE', label: 'Legal Committee' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParticipantChange = (type, id, isChecked) => {
    setFormData(prev => {
      const participants = [...prev[type]];
      if (isChecked) {
        participants.push(id);
      } else {
        const index = participants.indexOf(id);
        if (index > -1) {
          participants.splice(index, 1);
        }
      }
      return {
        ...prev,
        [type]: participants
      };
    });
  };

  const handleAgendaItemChange = (index, field, value) => {
    const updatedAgendaItems = [...formData.agendaItems];
    updatedAgendaItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      agendaItems: updatedAgendaItems
    }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agendaItems: [...prev.agendaItems, { title: '', description: '' }]
    }));
  };

  const removeAgendaItem = (index) => {
    const updatedAgendaItems = [...formData.agendaItems];
    updatedAgendaItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      agendaItems: updatedAgendaItems
    }));
  };

  const handleResolutionChange = (index, field, value) => {
    const updatedResolutions = [...formData.resolutions];
    updatedResolutions[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      resolutions: updatedResolutions
    }));
  };

  // Handle toggling assignee type checkboxes
  const handleAssigneeTypeToggle = (index, assigneeType, isChecked) => {
    const updatedResolutions = [...formData.resolutions];
    updatedResolutions[index][assigneeType] = isChecked;
    
    // If unchecked, clear the corresponding assignments
    if (!isChecked) {
      if (assigneeType === 'assignToCountries') {
        updatedResolutions[index].assignedCountryIds = [];
      } else if (assigneeType === 'assignToPositions') {
        updatedResolutions[index].assignedPositionIds = [];
      }
    }
    
    setFormData(prev => ({
      ...prev,
      resolutions: updatedResolutions
    }));
  };

  const handleResolutionAssignmentChange = (index, type, id, isChecked) => {
    const updatedResolutions = [...formData.resolutions];
    const assignments = [...updatedResolutions[index][type]];
    
    if (isChecked) {
      assignments.push(id);
    } else {
      const assignmentIndex = assignments.indexOf(id);
      if (assignmentIndex > -1) {
        assignments.splice(assignmentIndex, 1);
      }
    }
    
    updatedResolutions[index][type] = assignments;
    setFormData(prev => ({
      ...prev,
      resolutions: updatedResolutions
    }));
  };

  const addResolution = () => {
    setFormData(prev => ({
      ...prev,
      resolutions: [...prev.resolutions, {
        title: '',
        description: '',
        deadlineDate: '',
        status: 'PENDING',
        assignToCountries: false,
        assignToPositions: false,
        assignToAllCommissioners: false,
        assignedCountryIds: [],
        assignedPositionIds: []
      }]
    }));
  };

  const removeResolution = (index) => {
    const updatedResolutions = [...formData.resolutions];
    updatedResolutions.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      resolutions: updatedResolutions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    
    try {
      // Get the authenticated user's ID from auth state
      const userId = user?.id;
      
      // Validate user ID exists and is a number
      if (!userId || isNaN(Number(userId))) {
        console.error('Invalid userId:', userId);
        throw new Error('User ID not found or invalid. Please log in again.');
      }
      
      // Validate token exists
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('Submitting meeting minute with userId:', userId);
      
      const payload = {
        meetingNo: formData.meetingNo,
        date: formData.date,
        location: formData.location,
        meetingType: formData.meetingType,
        theme: formData.theme,
        committeeParticipantIds: formData.committeeParticipants,
        commissionerParticipantIds: formData.commissionerParticipants,
        agendaItems: formData.agendaItems,
        // Explicitly include the user's role in the payload
        userRole: user?.role || '',
        resolutions: formData.resolutions.map(resolution => {
          // Construct the assignee type based on the selected options
          let assigneeTypes = [];
          if (resolution.assignToCountries) assigneeTypes.push('COUNTRY');
          if (resolution.assignToPositions) assigneeTypes.push('POSITION');
          if (resolution.assignToAllCommissioners) assigneeTypes.push('ALL_COMMISSIONERS');
          
          return {
            title: resolution.title,
            description: resolution.description,
            deadlineDate: resolution.deadlineDate,
            status: resolution.status,
            assigneeTypes: assigneeTypes, // Send array of assignee types
            assignedCountryIds: resolution.assignToCountries ? resolution.assignedCountryIds : [],
            assignedPositionIds: resolution.assignToPositions ? resolution.assignedPositionIds : [],
            assignToAllCommissioners: resolution.assignToAllCommissioners
          };
        })
      };
      
      // Log the payload for debugging
      console.log('Submitting payload:', payload);
      
      // Use axiosInstance instead of fetch for consistent error handling
      const response = await axiosInstance.post(`/meeting-minutes/create/${userId}`, payload);
      
      console.log('Meeting minute created:', response.data);
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        meetingNo: '',
        date: '',
        location: '',
        meetingType: '',
        theme: '',
        committeeParticipants: [],
        commissionerParticipants: [],
        agendaItems: [{ title: '', description: '' }],
        resolutions: [{
          title: '',
          description: '',
          deadlineDate: '',
          status: 'PENDING',
          assignToCountries: false,
          assignToPositions: false,
          assignToAllCommissioners: false,
          assignedCountryIds: [],
          assignedPositionIds: []
        }]
      });
      
    } catch (err) {
      console.error('Error creating meeting minute:', err);
      
      // Extract error message from axios response or use generic message
      const errorMessage = err.response?.data?.message || err.message || 'Error creating meeting minute';
      setError(errorMessage);
    }
  };

  return (
    <div className="meeting-minute-form">
        
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Meeting minute created successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Meeting Details</h3>
          
          <div className="form-group">
            <label>Meeting Number</label>
            <input
              type="text"
              name="meetingNo"
              value={formData.meetingNo}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Meeting Type</label>
            <select
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              required
            >
              <option value="">Select meeting type</option>
              {meetingTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Theme</label>
            <input
              type="text"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Participants</h3>
          
          <div className="participants-grid">
            <div className="participant-group">
              <h4>Committee Members</h4>
              {committeeMembers && committeeMembers.length > 0 ? committeeMembers.map(member => (
                <div key={member.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`committee-${member.id}`}
                    checked={formData.committeeParticipants.includes(member.id)}
                    onChange={(e) => handleParticipantChange(
                      'committeeParticipants', 
                      member.id, 
                      e.target.checked
                    )}
                  />
                  <label htmlFor={`committee-${member.id}`}>
                    {member.name} ({member.memberType})
                  </label>
                </div>
              )) : <p>No committee members found</p>}
            </div>
            
            <div className="participant-group">
              <h4>Commissioner Generals</h4>
              {commissioners && commissioners.length > 0 ? commissioners.map(commissioner => (
                <div key={commissioner.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`commissioner-${commissioner.id}`}
                    checked={formData.commissionerParticipants.includes(commissioner.id)}
                    onChange={(e) => handleParticipantChange(
                      'commissionerParticipants', 
                      commissioner.id, 
                      e.target.checked
                    )}
                  />
                  <label htmlFor={`commissioner-${commissioner.id}`}>
                    {commissioner.cgName} ({commissioner.memberType})
                  </label>
                </div>
              )) : <p>No commissioners found</p>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Agenda Items</h3>
          {formData.agendaItems.map((item, index) => (
            <div key={index} className="agenda-item">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleAgendaItemChange(index, 'title', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) => handleAgendaItemChange(index, 'description', e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="button" 
                className="remove-btn"
                onClick={() => removeAgendaItem(index)}
                disabled={formData.agendaItems.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button 
            type="button" 
            className="add-btn"
            onClick={addAgendaItem}
          >
            Add Agenda Item
          </button>
        </div>
        
        <div className="form-section">
          <h3>Resolutions</h3>
          {formData.resolutions.map((resolution, index) => (
            <div key={index} className="resolution-item">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={resolution.title}
                  onChange={(e) => handleResolutionChange(index, 'title', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={resolution.description}
                  onChange={(e) => handleResolutionChange(index, 'description', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Deadline Date</label>
                <input
                  type="date"
                  value={resolution.deadlineDate}
                  onChange={(e) => handleResolutionChange(index, 'deadlineDate', e.target.value)}
                  required
                />
              </div>
              
              <div className="assignment-options">
                <h4>Assign Resolution To:</h4>
                
                <div className="assignment-type-toggles">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`assign-countries-${index}`}
                      checked={resolution.assignToCountries}
                      onChange={(e) => handleAssigneeTypeToggle(
                        index,
                        'assignToCountries',
                        e.target.checked
                      )}
                    />
                    <label htmlFor={`assign-countries-${index}`}>Countries</label>
                  </div>
                  
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`assign-positions-${index}`}
                      checked={resolution.assignToPositions}
                      onChange={(e) => handleAssigneeTypeToggle(
                        index,
                        'assignToPositions',
                        e.target.checked
                      )}
                    />
                    <label htmlFor={`assign-positions-${index}`}>Positions</label>
                  </div>
                  
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`assign-commissioners-${index}`}
                      checked={resolution.assignToAllCommissioners}
                      onChange={(e) => handleAssigneeTypeToggle(
                        index,
                        'assignToAllCommissioners',
                        e.target.checked
                      )}
                    />
                    <label htmlFor={`assign-commissioners-${index}`}>All Commissioners</label>
                  </div>
                </div>
                
                {resolution.assignToCountries && (
                  <div className="assignment-group">
                    <h4>Select Countries</h4>
                    <div className="checkbox-grid">
                      {countries && countries.length > 0 ? countries.map(country => (
                        <div key={country.id} className="checkbox-item">
                          <input
                            type="checkbox"
                            id={`country-${index}-${country.id}`}
                            checked={resolution.assignedCountryIds.includes(country.id)}
                            onChange={(e) => handleResolutionAssignmentChange(
                              index,
                              'assignedCountryIds',
                              country.id,
                              e.target.checked
                            )}
                          />
                          <label htmlFor={`country-${index}-${country.id}`}>
                            {country.countryName}
                          </label>
                        </div>
                      )) : <p>No countries found</p>}
                    </div>
                  </div>
                )}
                
                {resolution.assignToPositions && (
                  <div className="assignment-group">
                    <h4>Select Positions</h4>
                    <div className="position-checkbox-grid">
                      {positions && positions.length > 0 ? positions.map(position => (
                        <div key={position.id} className="position-checkbox-item">
                          <input
                            type="checkbox"
                            id={`position-${index}-${position.id}`}
                            checked={resolution.assignedPositionIds.includes(position.id)}
                            onChange={(e) => handleResolutionAssignmentChange(
                              index,
                              'assignedPositionIds',
                              position.id,
                              e.target.checked
                            )}
                          />
                          <label htmlFor={`position-${index}-${position.id}`} className="position-label">
                            {position.positionName.replace(/_/g, ' ')}
                          </label>
                        </div>
                      )) : <p>No positions found</p>}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                type="button" 
                className="remove-btn"
                onClick={() => removeResolution(index)}
                disabled={formData.resolutions.length <= 1}
              >
                Remove Resolution
              </button>
            </div>
          ))}
          
          <button 
            type="button" 
            className="add-btn"
            onClick={addResolution}
          >
            Add Resolution
          </button>
        </div>
        
        <button type="submit" className="submit-btn">
          Create Meeting Minute
        </button>
      </form>
    </div>
  );
};

export default MeetingMinuteForm;