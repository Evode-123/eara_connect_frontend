import React from 'react';
import '../../../style/AdminDashboard.css';

const AdminSidebar = ({ activeMenuItem, handleMenuItemClick }) => {
  return (
    <div className="sidebar fixed-sidebar">
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
            className={activeMenuItem === 'commissioner' ? 'active' : ''}
            onClick={() => handleMenuItemClick('commissioner')}
          >
            <span>👔</span> Commissioner General
          </li>
          <li
            className={activeMenuItem === 'committee' ? 'active' : ''}
            onClick={() => handleMenuItemClick('committee')}
          >
            <span>👥</span> Committee Member
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;