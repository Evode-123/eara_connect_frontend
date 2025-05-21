import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import CommissionerGeneral from './CommissionerGeneral';
import CommitteeMembers from './CommitteeMembers';
import PositionsContent from './PositionsContent';

import ReactCountryFlag from 'react-country-flag';

const AdminDashboard = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [countries, setCountries] = useState([]);
  const [revenueAuthorities, setRevenueAuthorities] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        if (activeMenuItem === 'dashboard') {
          const countriesResponse = await fetch('http://localhost:8080/api/countries/get-all-country', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!countriesResponse.ok) throw new Error(`Failed to fetch countries: ${countriesResponse.status}`);
          const countriesData = await countriesResponse.json();
          setCountries(countriesData);
          
          const revenueResponse = await fetch('http://localhost:8080/api/revenue-authorities/get-all-revenue-authority', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!revenueResponse.ok) throw new Error(`Failed to fetch revenue authorities: ${revenueResponse.status}`);
          const revenueData = await revenueResponse.json();
          setRevenueAuthorities(revenueData);
        } 
        else if (activeMenuItem === 'positions') {
          const positionsResponse = await fetch('http://localhost:8080/api/positions/get-all-positions', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!positionsResponse.ok) throw new Error(`Failed to fetch positions: ${positionsResponse.status}`);
          const positionsData = await positionsResponse.json();
          setPositions(positionsData);
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

  const renderCommissionerGeneral = () => {
    return <CommissionerGeneral />;
  };

  const renderCommitteeMembers = () => {
    return <CommitteeMembers />;
  };

  const getPageTitle = () => {
    switch (activeMenuItem) {
      case 'dashboard':
        return 'Countries and Revenue Authorities';
      case 'positions':
        return 'Positions';
      case 'commissioner':
        return 'Commissioner General';
      case 'committee':
        return 'Committee Member';
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
      case 'commissioner':
        return renderCommissionerGeneral();
      case 'committee':
        return renderCommitteeMembers();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar 
        activeMenuItem={activeMenuItem} 
        handleMenuItemClick={handleMenuItemClick} 
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

export default AdminDashboard;