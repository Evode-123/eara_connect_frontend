import React from 'react';
import '../../../style/AdminDashboard.css';

const PositionsContent = ({ positions, loading, error, formatDisplayName }) => {
  if (loading) return <div className="loading">Loading positions data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="positions-section">
      <h3>Committee</h3>
      <div className="positions-cards-container">
        {positions.length > 0 ? (
          positions.map((position) => (
            <div key={position.id} className="position-card">
              
              <div className="position-card-body">
                <h4 className="position-name">
                  {position.displayName || formatDisplayName(position.positionName)}
                </h4>
              </div>
            </div>
          ))
        ) : (
          <div className="no-positions-message">
            <p>No positions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionsContent;