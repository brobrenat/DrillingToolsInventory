import React from 'react'
import './history.css'
import Sidebar from '../../sidebar/Sidebar';

const history = ({sidebar}) => {
  return (
    <div className="toolslist-container">
    {sidebar && <Sidebar />}
    <div className="dashboard-content">
    </div>
  </div>  )
}

export default history