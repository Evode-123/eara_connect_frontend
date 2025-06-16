import React from 'react';

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
            <span>👥</span> Committee
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
          
          {/* Meeting Management Section */}
          <li 
            className={activeMenuItem === 'meeting-invitations' ? 'active' : ''}
            onClick={() => handleMenuItemClick('meeting-invitations')}
          >
            <span>📧</span> Send Invitations
          </li>
          <li
            className={activeMenuItem === 'all-meetings' ? 'active' : ''}
            onClick={() => handleMenuItemClick('all-meetings')}
          >
            <span>📅</span> All Meetings
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;