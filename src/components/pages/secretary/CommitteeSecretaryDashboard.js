import { useState, useEffect } from 'react';
import SecretarySidebar from './SecretarySidebar';
import MeetingMinuteForm from './MeetingMinuteForm';
import '../../../style/SecretaryDashboard.css';  // Updated CSS import
import ReactCountryFlag from 'react-country-flag';
import PositionsContent from './PositionsContent'; // Import the PositionsContent component

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
            <div className="countries-grid">
              {countries.length > 0 ? (
                countries.map((country) => (
                  <div key={country.id} className="country-card">
                    <div className="country-flag">
                      <ReactCountryFlag 
                        countryCode={country.isoCode} 
                        svg 
                        style={{
                          width: '3em',
                          height: '3em',
                        }}
                        title={country.name}
                      />
                    </div>
                    <div className="country-info">
                      <h3>{formatDisplayName(country.name)}</h3>
                      <div className="revenue-authorities">
                        {getRevenueAuthorityByCountry(country.id).length > 0 ? (
                          <ul>
                            {getRevenueAuthorityByCountry(country.id).map(auth => (
                              <li key={auth.id}>
                                {formatDisplayName(auth.authorityName)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No revenue authorities</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-countries">No countries found</div>
              )}
            </div>
          </div>
        );
      };

  const renderPositions = () => {
    return (
      <PositionsContent
        positions={positions}
        loading={loading}
        error={error}
        formatDisplayName={formatDisplayName}
      />
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
        return 'Committee Positions';
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