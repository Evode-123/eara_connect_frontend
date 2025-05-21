import React, { useState, useEffect } from 'react';
import '../../../style/AdminDashboard.css';

const CountryCommitteeView = ({ countryId, onBack }) => {
  const [commissioners, setCommissioners] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch commissioners for this country
        const commissionersResponse = await fetch(`http://localhost:8080/api/commissioners/country/${countryId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!commissionersResponse.ok) throw new Error('Failed to fetch commissioners');
        const commissionersData = await commissionersResponse.json();
        setCommissioners(commissionersData);
        
        // Fetch committee members for this country
        const membersResponse = await fetch(`http://localhost:8080/api/committee-members/country/${countryId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!membersResponse.ok) throw new Error('Failed to fetch committee members');
        const membersData = await membersResponse.json();
        setCommitteeMembers(membersData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [countryId]);

  const formatDisplayName = (value) => {
    if (!value) return '';
    if (value.includes(' ')) return value;
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) return <div className="loading">Loading committee data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="country-committee-view">
      <button className="back-btn" onClick={onBack}>
        ← Back to Countries
      </button>
      
      <h2>Committee for Selected Country</h2>
      
      <div className="committee-section">
        <h3>Commissioners General</h3>
        {commissioners.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {commissioners.map(commissioner => (
                <tr key={commissioner.id}>
                  <td>{commissioner.cgName}</td>
                  <td>{commissioner.cgEmail}</td>
                  <td>{commissioner.cgPhone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No commissioners found for this country</p>
        )}
      </div>
      
      <div className="committee-section">
        <h3>Committee Members</h3>
        {committeeMembers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {committeeMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No committee members found for this country</p>
        )}
      </div>
    </div>
  );
};

export default CountryCommitteeView;