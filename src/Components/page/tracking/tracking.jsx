import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../createClient';
import './tracking.css';
import Sidebar from '../../sidebar/Sidebar';

const Tracking = ({ sidebar }) => {
  const [tools, setTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTools, setSelectedTools] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date()); // Add state for current time
  const [showConfirmation, setShowConfirmation] = useState(false); // Add state for confirmation pop-up
  

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('drilling_tools')
        .select('*')
        .eq('status', 'In Use');
      if (error) throw error;
      setTools(data);
      console.log("Tools fetched: ", data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // Add real-time update effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckbox = (serialNumber) => {
    setSelectedTools(prev => {
      if (prev.includes(serialNumber)) {
        return prev.filter(sn => sn !== serialNumber);
      } else {
        return [...prev, serialNumber];
      }
    });
  };

  const handleTerminate = async () => {
    try {
      if (selectedTools.length === 0) {
        alert('Please select tools to terminate');
        return;
      }
  
      const now = new Date();
  
      const { error } = await supabase
        .from('drilling_tools')
        .update({ 
          status: 'Available',
          updated_at: now.toISOString()
        })
        .in('serial_number', selectedTools);
  
      if (error) throw error;
      await fetchTools();
      setSelectedTools([]);
      showConfirmationPopup();
    } catch (error) {
      console.error('Error updating tools:', error);
      alert('Error updating tools: ' + error.message);
    }
  };

  const showConfirmationPopup = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 1500); // Hide the confirmation after 1.5 seconds
  };
  
  const calculateDuration = (updatedAt) => {
    try {
      // Parse the updatedAt timestamp as a Date object in UTC
      const lastUpdated = new Date(updatedAt);
  
      // Get the current time in UTC
      const now = new Date();
  
      // Calculate the difference in milliseconds
      const diffMs = now.getTime() - lastUpdated.getTime();
  
      // Calculate total seconds difference
      const totalSeconds = Math.floor(diffMs / 1000);
  
      // Calculate hours, minutes, and seconds
      const hours = String(Math.floor(totalSeconds / 3600)-7).padStart(2, '0');
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
  
      return `${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return '00:00:00';
    }
  };

  const filteredTools = tools.filter((tool) =>
    tool.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.tool_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tracking-page">
      {sidebar && <Sidebar />}
      <div className="tracking-content">
        <h1>Tracking</h1>
        <div className="tracking-header">
          <input
            type="text"
            placeholder="Search..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="terminate-button" onClick={handleTerminate}>
            Terminate
          </button>
        </div>
      
        <div className="tracking-container">
          <table className="tracking-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Name</th>
                <th>Duration</th>
                <th>Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {filteredTools.length > 0 ? (
                filteredTools.map((tool, index) => (
                  <tr key={tool.serial_number}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={selectedTools.includes(tool.serial_number)}
                        onChange={() => handleCheckbox(tool.serial_number)}
                      />
                      {index + 1}
                    </td>
                    <td>{tool.serial_number}</td>
                    <td>
                      {tool.status === 'Available' ? (
                        <span className="status available">● Available</span>
                      ) : (
                        <span className="status in-use">● In use</span>
                      )}
                    </td>
                    <td>{tool.tool_name}</td>
                    <td>{calculateDuration(tool.updated_at)}</td>
                    <td>{tool.location}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No tools found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {showConfirmation && (
          <div className="popup">
            <div className="popup-content">
              <h3 style={{ color: 'green' }}>Operation Successful!</h3>
              <p>The operation has been completed successfully.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;