import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../config/axiosConfig';
import '../../../style/MeetingMinute.css';

const MeetingInvitations = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Form state for meeting creation
  const [meetingForm, setMeetingForm] = useState({
    meetingNo: '',
    date: '',
    location: '',
    meetingType: '',
    theme: ''
  });

  // State for participants selection
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [commissioners, setCommissioners] = useState([]);
  const [selectedCommitteeMembers, setSelectedCommitteeMembers] = useState([]);
  const [selectedCommissioners, setSelectedCommissioners] = useState([]);
  
  // State for documents
  const [documents, setDocuments] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Create Meeting, 2: Select Participants, 3: Upload Documents, 4: Send Invitations
  const [createdMeetingId, setCreatedMeetingId] = useState(null);

  // Meeting types from your backend enum
  const meetingTypes = [
    { value: 'COMMISSIONER_GENERAL_MEETING', label: 'Commissioner General Meeting' },
    { value: 'DOMESTIC_REVENUE_COMMITTEE', label: 'Domestic Revenue Committee' },
    { value: 'CUSTOMS_REVENUE_COMMITTEE', label: 'Customs Revenue Committee' },
    { value: 'IT_COMMITTEE', label: 'IT Committee' },
    { value: 'HR_COMMITTEE', label: 'HR Committee' },
    { value: 'RESEARCH_AND_PLANNING_COMMITTEE', label: 'Research and Planning Committee' },
    { value: 'LEGAL_COMMITTEE', label: 'Legal Committee' }
  ];

  const validateMeetingDate = (dateString) => {
  if (!dateString) return false;
  
  const selectedDate = new Date(dateString);
  const today = new Date();
  
  // Reset time to beginning of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  
  return selectedDate >= today;
};

  // Load participants on component mount
  useEffect(() => {
    if (isAuthenticated && step >= 2) {
      fetchParticipants();
    }
  }, [isAuthenticated, step]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      
      // Fetch committee members
      const committeeResponse = await axiosInstance.get('/committee-members');
      setCommitteeMembers(committeeResponse.data || []);
      
      // Fetch commissioners
      const commissionerResponse = await axiosInstance.get('/commissioners/get-all');
      setCommissioners(commissionerResponse.data || []);
      
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Failed to load participants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear previous errors when user starts typing
    if (error) setError('');
    
    // Special handling for date field
    if (name === 'date') {
      if (value && !validateMeetingDate(value)) {
        setError('Meeting date cannot be in the past. Please select a future date.');
        return; // Don't update the state if date is invalid
      }
    }
    
    setMeetingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      setError('User authentication error. Please log in again.');
      return;
    }

    // Validate date before proceeding
    if (!validateMeetingDate(meetingForm.date)) {
      setError('Meeting date cannot be in the past. Please select a future date.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const meetingData = {
        ...meetingForm,
        date: new Date(meetingForm.date).toISOString(),
        userId: user.id
      };

      console.log('Creating meeting with data:', meetingData);

      const response = await axiosInstance.post('/meeting-minutes/create-basic', meetingData);
      
      if (response.data && response.data.id) {
        setCreatedMeetingId(response.data.id);
        setSuccess('Meeting created successfully!');
        setStep(2);
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err.response?.data?.message || 'Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantSelection = (type, id, checked) => {
    if (type === 'committee') {
      setSelectedCommitteeMembers(prev => 
        checked 
          ? [...prev, id]
          : prev.filter(memberId => memberId !== id)
      );
    } else if (type === 'commissioner') {
      setSelectedCommissioners(prev => 
        checked 
          ? [...prev, id]
          : prev.filter(commissionerId => commissionerId !== id)
      );
    }
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendInvitations = async () => {
    if (!createdMeetingId) {
      setError('No meeting created yet.');
      return;
    }

    if (selectedCommitteeMembers.length === 0 && selectedCommissioners.length === 0) {
      setError('Please select at least one participant.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      
      // Add documents to FormData (even if empty, the API expects this parameter)
      if (documents.length > 0) {
        documents.forEach(doc => {
          formData.append('documents', doc);
        });
      } else {
        // Add empty file if no documents to satisfy the API requirement
        formData.append('documents', new File([], 'empty.txt', { type: 'text/plain' }));
      }
      
      // Add committee participant IDs if any selected
      if (selectedCommitteeMembers.length > 0) {
        selectedCommitteeMembers.forEach(id => {
          formData.append('committeeParticipantIds', id);
        });
      }
      
      // Add commissioner participant IDs if any selected
      if (selectedCommissioners.length > 0) {
        selectedCommissioners.forEach(id => {
          formData.append('commissionerParticipantIds', id);
        });
      }

      console.log('Sending invitations for meeting ID:', createdMeetingId);
      console.log('Selected committee members:', selectedCommitteeMembers);
      console.log('Selected commissioners:', selectedCommissioners);
      console.log('Documents count:', documents.length);

      // Use the correct API endpoint with meeting ID as path parameter
      const response = await axiosInstance.post(`/meeting-minutes/${createdMeetingId}/send-invitations`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Invitations sent successfully!');
      setStep(4);
      
    } catch (err) {
      console.error('Error sending invitations:', err);
      setError(err.response?.data?.message || 'Failed to send invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMeetingForm({
      meetingNo: '',
      date: '',
      location: '',
      meetingType: '',
      theme: ''
    });
    setSelectedCommitteeMembers([]);
    setSelectedCommissioners([]);
    setDocuments([]);
    setStep(1);
    setCreatedMeetingId(null);
    setError('');
    setSuccess('');
  };

  const renderStepIndicator = () => (
    <div className="stepper-container">
      <div className="stepper">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-title">Basic Details</div>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-title">Invitations</div>
        </div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-title">Complete</div>
        </div>
      </div>
    </div>
  );

  const renderMeetingForm = () => (
    <div className="meeting-form-container">
      <h2 className="form-header">Basic Meeting Details</h2>
      <p className="form-subheader">Let's start by setting up the essential information for your meeting</p>
      
      <form className="meeting-form">
        <div className="form-group">
          <label htmlFor="meetingNo" className="form-label">MEETING NUMBER *</label>
          <input
            type="text"
            id="meetingNo"
            name="meetingNo"
            value={meetingForm.meetingNo}
            onChange={handleInputChange}
            placeholder="e.g., M001-2025"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">DATE *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={meetingForm.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates in the date picker
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location" className="form-label">LOCATION *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={meetingForm.location}
            onChange={handleInputChange}
            placeholder="e.g., Rwanda, Kigali"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="meetingType" className="form-label">MEETING TYPE *</label>
          <select
            id="meetingType"
            name="meetingType"
            value={meetingForm.meetingType}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="">Select meeting type</option>
            {meetingTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="theme" className="form-label">THEME *</label>
          <textarea
            id="theme"
            name="theme"
            value={meetingForm.theme}
            onChange={handleInputChange}
            rows="3"
            placeholder="Enter meeting theme or agenda"
            className="form-input textarea"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button"
            onClick={handleCreateMeeting}
            disabled={loading || !meetingForm.meetingNo || !meetingForm.date || !meetingForm.location || !meetingForm.meetingType || !meetingForm.theme}
            className="primary-button"
          >
            {loading ? 'Creating...' : 'Create Meeting'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderParticipantSelection = () => (
    <div className="participant-selection">
      <h3>Select Participants</h3>
      
      <div className="participants-grid">
        <div className="committee-members">
          <h4>Committee Members</h4>
          <div className="participant-list">
            {committeeMembers.map(member => (
              <div key={member.id} className="participant-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCommitteeMembers.includes(member.id)}
                    onChange={(e) => handleParticipantSelection('committee', member.id, e.target.checked)}
                  />
                  <span>{member.firstName} {member.lastName}</span>
                  <small>{member.email}</small>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="commissioners">
          <h4>Commissioner Generals</h4>
          <div className="participant-list">
            {commissioners.map(commissioner => (
              <div key={commissioner.id} className="participant-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCommissioners.includes(commissioner.id)}
                    onChange={(e) => handleParticipantSelection('commissioner', commissioner.id, e.target.checked)}
                  />
                  <span>{commissioner.firstName} {commissioner.lastName}</span>
                  <small>{commissioner.email}</small>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button 
          onClick={() => setStep(3)} 
          disabled={selectedCommitteeMembers.length === 0 && selectedCommissioners.length === 0}
          className="btn btn-primary"
        >
          Next: Upload Documents
        </button>
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="document-upload">
      <h3>Upload document</h3>
      
      <div className="upload-area">
        <input
          type="file"
          multiple
          onChange={handleDocumentUpload}
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          id="document-upload"
        />
      </div>

      {documents.length > 0 && (
        <div className="uploaded-documents">
          <h4>Selected Documents:</h4>
          {documents.map((doc, index) => (
            <div key={index} className="document-item">
              <span>{doc.name}</span>
              <button 
                type="button" 
                onClick={() => removeDocument(index)}
                className="btn btn-danger btn-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="step-actions">
        <button 
          onClick={() => setStep(2)} 
          className="btn btn-secondary"
        >
          Back
        </button>
        <button 
          onClick={handleSendInvitations} 
          disabled={loading}
          className="btn btn-success"
        >
          {loading ? 'Sending...' : 'Send Invitations'}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="success-message">
      <h3>✅ Invitations Sent Successfully!</h3>
      <p>Meeting invitations have been sent to all selected participants.</p>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Meeting ID:</strong> {createdMeetingId}</p>
        <p><strong>Participants:</strong> {selectedCommitteeMembers.length + selectedCommissioners.length} selected</p>
        <p><strong>Documents:</strong> {documents.length} uploaded</p>
      </div>
      <button 
        onClick={resetForm}
        className="btn btn-primary"
        style={{ marginTop: '20px' }}
      >
        Create Another Meeting
      </button>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="error-message">
        <p>Please log in to create meeting invitations.</p>
      </div>
    );
  }

  return (
    <div className="meeting-invitations-container">
      <div className="form-card">
        <h1 className="page-title">Create Meeting Invitation</h1>
        
        {renderStepIndicator()}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {step === 1 && renderMeetingForm()}
        {step === 2 && renderParticipantSelection()}
        {step === 3 && renderDocumentUpload()}
        {step === 4 && renderSuccess()}
      </div>
    </div>
  );
};

export default MeetingInvitations;