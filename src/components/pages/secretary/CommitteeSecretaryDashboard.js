import { useState, useEffect } from 'react';
import SecretarySidebar from './SecretarySidebar';
import MeetingMinuteForm from './MeetingMinuteForm';
import '../../../style/SecretaryDashboard.css';  // Updated CSS import

const SecretaryDashboard = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [countries, setCountries] = useState([]);
  const [revenueAuthorities, setRevenueAuthorities] = useState([]);
  const [positions, setPositions] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [commissioners, setCommissioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarActive, setSidebarActive] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        if (activeMenuItem === 'dashboard') {
          const [countriesRes, revenueRes] = await Promise.all([
            fetch('http://localhost:8080/api/countries/get-all-country', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch('http://localhost:8080/api/revenue-authorities/get-all-revenue-authority', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            })
          ]);
          
          if (!countriesRes.ok) throw new Error(`Failed to fetch countries: ${countriesRes.status}`);
          if (!revenueRes.ok) throw new Error(`Failed to fetch revenue authorities: ${revenueRes.status}`);
          
          const countriesData = await countriesRes.json();
          const revenueData = await revenueRes.json();
          
          setCountries(countriesData);
          setRevenueAuthorities(revenueData);
        } 
        else if (activeMenuItem === 'positions') {
          const positionsRes = await fetch('http://localhost:8080/api/positions/get-all-positions', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!positionsRes.ok) throw new Error(`Failed to fetch positions: ${positionsRes.status}`);
          const positionsData = await positionsRes.json();
          setPositions(positionsData);
        }
        else if (activeMenuItem === 'meeting') {
          const [committeeRes, commissionersRes] = await Promise.all([
            fetch('http://localhost:8080/api/meeting-minutes/committee-members', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch('http://localhost:8080/api/meeting-minutes/commissioner-generals', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            })
          ]);
          
          if (!committeeRes.ok) throw new Error(`Failed to fetch committee members: ${committeeRes.status}`);
          if (!commissionersRes.ok) throw new Error(`Failed to fetch commissioners: ${commissionersRes.status}`);
          
          const committeeData = await committeeRes.json();
          const commissionersData = await commissionersRes.json();
          
          setCommitteeMembers(committeeData);
          setCommissioners(commissionersData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeMenuItem]);

  const getRevenueAuthorityByCountry = (countryId) => {
    return revenueAuthorities.filter(auth => auth.country && auth.country.id === countryId);
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
    // Close sidebar on mobile after menu item is clicked
    if (window.innerWidth <= 768) {
      setSidebarActive(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const formatDisplayName = (value) => {
    if (!value) return '';
    if (value.includes(' ')) return value;
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const renderDashboard = () => {
    if (loading) return <div className="loading">Loading countries and revenue data...</div>;
    if (error) return <div className="error">{error}</div>;
  
    return (
      <div className="dashboard-content">
        <div className="data-section">
          <h3>Countries & Revenue Authorities</h3>
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Revenue Authority</th>
              </tr>
            </thead>
            <tbody>
              {countries.length > 0 ? (
                countries.map((country) => (
                  <tr key={country.id}>
                    <td>
                      {typeof country.countryName === 'string' 
                        ? formatDisplayName(country.countryName)
                        : (country.countryName?.toString() || 'N/A')}
                    </td>
                    <td>
                      {getRevenueAuthorityByCountry(country.id).map(auth => (
                        <div key={auth.id}>
                          {typeof auth.authorityName === 'string' 
                            ? formatDisplayName(auth.authorityName)
                            : (auth.authorityName?.toString() || 'N/A')}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No countries found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPositions = () => {
    if (loading) return <div className="loading">Loading positions data...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
      <div className="positions-section">
        <h3>Available Positions</h3>
        <table>
          <thead>
            <tr>
              <th>Position Name</th>
            </tr>
          </thead>
          <tbody>
            {positions.length > 0 ? (
              positions.map((position) => (
                <tr key={position.id}>
                  <td>{position.displayName || formatDisplayName(position.positionName)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No positions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMeetingMinuteForm = () => {
    return (
      <MeetingMinuteForm 
        committeeMembers={committeeMembers}
        commissioners={commissioners}
        countries={countries}
        positions={positions}
        loading={loading}
        error={error}
      />
    );
  };

  const getPageTitle = () => {
    switch (activeMenuItem) {
      case 'dashboard':
        return 'Revenue Authorities';
      case 'positions':
        return 'Positions';
      case 'meeting':
        return 'Take Meeting Minute';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'dashboard':
        return renderDashboard();
      case 'positions':
        return renderPositions();
      case 'meeting':
        return renderMeetingMinuteForm();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-container">
      {/* Mobile sidebar toggle button */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        style={{ display: window.innerWidth <= 768 ? 'block' : 'none' }}
      >
        ☰
      </button>
      
      <SecretarySidebar 
        activeMenuItem={activeMenuItem} 
        handleMenuItemClick={handleMenuItemClick}
        className={sidebarActive ? 'active' : ''}
      />
      
      <div className="main-content">
        <header>
          <h1>{getPageTitle()}</h1>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SecretaryDashboard;