import React from 'react';
import '../../../style/SecretaryDashboard.css';  // Updated CSS import

const SecretarySidebar = ({ activeMenuItem, handleMenuItemClick, className }) => {
  return (
    <div className={`sidebar fixed-sidebar ${className || ''}`}>
      <div className="sidebar-header">
        <h2>EARA CONNECT</h2>
      </div>
      <div className="sidebar-menu">
        <ul>
          <li
            className={activeMenuItem === 'dashboard' ? 'active' : ''}
            onClick={() => handleMenuItemClick('dashboard')}
          >
            <span>📊</span> Dashboard
          </li>
          <li
            className={activeMenuItem === 'positions' ? 'active' : ''}
            onClick={() => handleMenuItemClick('positions')}
          >
            <span>👥</span> Positions
          </li>
          <li
            className={activeMenuItem === 'meeting' ? 'active' : ''}
            onClick={() => handleMenuItemClick('meeting')}
          >
            <span>📝</span> Meeting Minutes
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SecretarySidebar;