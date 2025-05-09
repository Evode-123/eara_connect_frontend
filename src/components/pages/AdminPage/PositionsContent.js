import React from 'react';
import '../../../style/AdminDashboard.css';

const PositionsContent = ({ positions, loading, error, formatDisplayName }) => {
  if (loading) return <div className="loading">Loading positions data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="positions-section">
      <h3>Available Positions</h3>
      <table>
        <thead>
          <tr>
            <th>Position ID</th>
            <th>Position Name</th>
          </tr>
        </thead>
        <tbody>
          {positions.length > 0 ? (
            positions.map((position) => (
              <tr key={position.id}>
                <td>{position.id}</td>
                <td>
                  {position.displayName || formatDisplayName(position.positionName)}
                </td>
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

export default PositionsContent;