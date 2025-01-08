import React from 'react'
import Sidebar from '../../sidebar/Sidebar'
import './profile.css'
const profile = ({sidebar}) => {
  return (
    <div className="profile-container">
    {sidebar && <Sidebar />}
    <div className="dashboard-content">
    </div>
  </div>
  )
}

export default profile