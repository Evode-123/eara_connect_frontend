import { useState, useEffect } from 'react';
import { formatDisplayName } from './utils';

const DashboardView = () => {
  const [countries, setCountries] = useState([]);
  const [revenueAuthorities, setRevenueAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch countries data
        const countriesResponse = await fetch('http://localhost:8080/countries/get-all-country', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!countriesResponse.ok) {
          throw new Error(`Failed to fetch countries: ${countriesResponse.status}`);
        }
        
        const countriesData = await countriesResponse.json();
        setCountries(countriesData);
        
        // Fetch revenue authorities data
        const revenueResponse = await fetch('http://localhost:8080/revenue-authorities/get-all-revenue-authority', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!revenueResponse.ok) {
          throw new Error(`Failed to fetch revenue authorities: ${revenueResponse.status}`);
        }
        
        const revenueData = await revenueResponse.json();
        setRevenueAuthorities(revenueData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Get revenue authority by country ID
  const getRevenueAuthorityByCountry = (countryId) => {
    return revenueAuthorities.filter(auth => auth.country && auth.country.id === countryId);
  };

  if (loading) return <div className="p-4">Loading countries and revenue data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Countries & Revenue Authorities</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Country</th>
              <th className="py-2 px-4 border-b text-left">Revenue Authority</th>
            </tr>
          </thead>
          <tbody>
            {countries.length > 0 ? (
              countries.map((country) => (
                <tr key={country.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{country.id}</td>
                  <td className="py-2 px-4 border-b">
                    {typeof country.countryName === 'string' 
                      ? formatDisplayName(country.countryName)
                      : (country.countryName?.toString() || 'N/A')}
                  </td>
                  <td className="py-2 px-4 border-b">
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
                <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                  No countries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardView;