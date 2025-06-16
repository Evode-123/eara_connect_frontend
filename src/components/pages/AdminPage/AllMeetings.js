import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../config/axiosConfig';
import '../../../style/MeetingList.css';

const AllMeetings = () => {
  const { isAuthenticated } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllMeetings();
  }, []);

  // Sample meeting data to display when no real meetings are found
  const sampleMeetings = [
    {
      id: 1,
      meetingNo: "MM-2025-001",
      theme: "Quarterly Planning Session",
      status: "COMPLETED",
      date: "2025-09-15T09:00:00",
      location: "Rwanda Kigali",
      meetingType: "IT Committee"
    },
    {
      id: 2,
      meetingNo: "MM-2025-002",
      theme: "Budget Review",
      status: "SCHEDULED",
      date: "2025-09-20T14:00:00",
      location: "Tanzania, Dar es Salaam",
      meetingType: "Commissional Meeting"
    },
    {
      id: 3,
      meetingNo: "MM-2025-003",
      theme: "Team Building Workshop",
      status: "CANCELLED",
      date: "2025-09-25T10:30:00",
      location: "Burundi Bujumbura",
      meetingType: "Legal Committee"
    },
    {
      id: 4,
      meetingNo: "MM-2025-004",
      theme: "Tax Collection Strategies",
      status: "SCHEDULED",
      date: "2025-09-30T10:30:00",
      location: "Kenya Nairobi",
      meetingType: "Research and Planning Committee"
    }
  ];

  const fetchAllMeetings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/meeting-minutes/all-meetings');
      // Ensure response.data is an array
      const data = Array.isArray(response.data) ? response.data : [];
      setMeetings(data);
      
      // If no data found, use sample data but mark as sample
      if (data.length === 0) {
        setMeetings(sampleMeetings);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings: ' + (err.response?.data?.message || err.message));
      // On error, use sample data but mark as sample
      setMeetings(sampleMeetings);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!isAuthenticated) {
    return <div className="error-message">Please log in to view meetings.</div>;
  }

  if (loading) {
    return <div className="loading-message">Loading meetings...</div>;
  }

  if (error) {
    return (
      <div className="meetings-container">
        <div className="error-message">{error}</div>
        <h2 className="meetings-header">Sample Meetings (Demo Only)</h2>
        <div className="meetings-list">
          {sampleMeetings.map(meeting => (
            <div key={meeting.id} className="meeting-card demo-card">
              <div className="meeting-card-header">
                <h3 className="meeting-title">{meeting.meetingNo} - {meeting.theme}</h3>
                <span className={`meeting-status ${meeting.status?.toLowerCase()}`}>
                  {meeting.status}
                </span>
              </div>
              <div className="meeting-details">
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(meeting.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{meeting.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{meeting.meetingType}</span>
                </div>
              </div>
              <div className="demo-notice">This is sample data for demonstration</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="meetings-container">
      <h2 className="meetings-header">All Meetings</h2>
      
      {meetings.length === 0 ? (
        <div className="no-meetings">
          <p>No meetings found in the system.</p>
          <h3>Sample Meetings (Demo Only)</h3>
          <div className="meetings-list">
            {sampleMeetings.map(meeting => (
              <div key={meeting.id} className="meeting-card demo-card">
                <div className="meeting-card-header">
                  <h3 className="meeting-title">{meeting.meetingNo} - {meeting.theme}</h3>
                  <span className={`meeting-status ${meeting.status?.toLowerCase()}`}>
                    {meeting.status}
                  </span>
                </div>
                <div className="meeting-details">
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(meeting.date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{meeting.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{meeting.meetingType}</span>
                  </div>
                </div>
                <div className="demo-notice">This is sample data for demonstration</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="meetings-list">
          {meetings.map(meeting => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-card-header">
                <h3 className="meeting-title">{meeting.meetingNo} - {meeting.theme}</h3>
                <span className={`meeting-status ${meeting.status?.toLowerCase()}`}>
                  {meeting.status || 'SCHEDULED'}
                </span>
              </div>
              
              <div className="meeting-details">
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(meeting.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{meeting.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{meeting.meetingType}</span>
                </div>
              </div>
              
              <div className="meeting-actions">
                <button className="action-button view-button">View Details</button>
                <button className="action-button edit-button">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMeetings;