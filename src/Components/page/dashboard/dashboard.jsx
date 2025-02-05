import React from 'react';
import './dashboard.css';
import Sidebar from '../../sidebar/Sidebar';
import Content from '../content/content';
const dashboard = ({ sidebar }) => {
  return (
    <div className="dashboard-container">
      {sidebar && <Sidebar />}
      <div className="dashboard-content">
        <Content/>
      </div>
    </div>
  );
};

export default dashboard;