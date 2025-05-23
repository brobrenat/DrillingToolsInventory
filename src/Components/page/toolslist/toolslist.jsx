import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../createClient';
import './toolslist.css';
import Sidebar from '../../sidebar/Sidebar';

const ToolsList = ({ sidebar }) => {
  const [tools, setTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [assignPlace, setAssignPlace] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    tool_name: '',
    tool_type: '',
    serial_number: ''
  });
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newToolData, setNewToolData] = useState({
    tool_name: '',
    tool_type: '',
    manufacturer: '',
    purchase_date: '',
    comments: '',
  });
  const [userRole, setUserRole] = useState('');

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase.from('drilling_tools').select('*')
        .order('serial_number', { ascending: true });

      if (error) throw error;
      setTools(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  useEffect(() => {
    fetchTools();
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const isSupervisor = () => userRole === 'Supervisor';

  const deleteTool = async () => {
    if (selectedTool && selectedTool.serial_number) {
      try {
        await supabase.from('drilling_tools').delete().eq('serial_number', selectedTool.serial_number);
        fetchTools();
        setShowDeletePopup(false);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 1500);
      } catch (error) {
        console.error('Error deleting tool:', error);
      }
    } else {
      console.error('Error: selectedTool is not defined or missing serial_number.');
    }
  };

  const editTool = async () => {
    if (selectedTool && editData.tool_name && editData.tool_type && editData.status) {
      try {
        const { error } = await supabase
          .from('drilling_tools')
          .update({
            tool_name: editData.tool_name,
            tool_type: editData.tool_type,
            status: editData.status
          })
          .eq('serial_number', selectedTool.serial_number);
        if (error) throw error;
        fetchTools();
        setShowEditPopup(false);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 1500);
      } catch (error) {
        console.error('Error editing tool:', error);
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  const addTool = async () => {
    const { tool_name, tool_type, manufacturer, purchase_date, comments } = newToolData;

    if (tool_name && tool_type && manufacturer && purchase_date) {
      try {
        const { error } = await supabase.from('drilling_tools').insert([
          {
            tool_name,
            tool_type,
            manufacturer,
            purchase_date,
            comments,
            status: 'Available',
            usage_hours: 0,
            tool_condition: 'Good',
          },
        ]);
        if (error) throw error;

        fetchTools();
        setShowAddPopup(false);
        setNewToolData({
          tool_name: '',
          tool_type: '',
          manufacturer: '',
          purchase_date: '',
          comments: '',
        });
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 1500);
      } catch (error) {
        console.error('Error adding tool:', error);
      }
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleAssignClick = (tool) => {
    setSelectedTool(tool);
    setShowAssignPopup(true);
    setAssignPlace('');
  };

  const handleEditClick = (tool) => {
    setSelectedTool(tool);
    setEditData({
      status: tool.status,
      tool_name: tool.tool_name,
      tool_type: tool.tool_type,
      serial_number: tool.serial_number
    });
    setShowEditPopup(true);
  };

  const handleDeleteClick = (tool) => {
    setSelectedTool(tool);
    setShowDeletePopup(true);
  };

  const handleAssign = async () => {
    if (selectedTool && assignPlace.trim()) {
      try {
        const { error } = await supabase
          .from('drilling_tools')
          .update({
            status: 'In Use',
            location: assignPlace.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('serial_number', selectedTool.serial_number);
        if (error) throw error;

        setShowConfirmation(true);
        setTimeout(() => {
          fetchTools();
          setShowAssignPopup(false);
          setAssignPlace('');
          setShowConfirmation(false);
        }, 1500);
      } catch (error) {
        console.error('Error assigning tool:', error);
      }
    } else {
      alert('Please enter a valid location.');
    }
  };

  const renderActionButtons = (tool) => {
    if (isSupervisor()) {
      return null; // Supervisors don't see any action buttons
    }
    return (
      <>
        {tool.status === 'Available' && (
          <button className="assign-button" onClick={() => handleAssignClick(tool)}>
            Assign
          </button>
        )}
        <i className="fas fa-edit edit-icon" onClick={() => handleEditClick(tool)}></i>
        <i className="fas fa-trash-alt delete-icon" onClick={() => handleDeleteClick(tool)}></i>
      </>
    );
  };

  const filteredTools = tools.filter((tool) =>
    tool.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.tool_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tools-list-page">
      {sidebar && <Sidebar />}
      <div className="tools-list-content">
        <h1>Tools List</h1>
        <div className="tools-list-header">
          <input
            type="text"
            placeholder="Search..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {!isSupervisor() && (
            <button className="add-button" onClick={() => setShowAddPopup(true)}>+ Create New</button>
          )}
        </div>

        <div className="tools-table-container">
          <table className="tools-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Name</th>
                <th>Type</th>
                {!isSupervisor() && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTools.length > 0 ? (
                filteredTools.map((tool, index) => (
                  <tr key={tool.id}>
                    <td>{index + 1}</td>
                    <td>{tool.serial_number}</td>
                    <td>
                      {tool.status === 'Available' ? (
                        <span className="status available">● Available</span>
                      ) : tool.status === 'In Use' ? (
                        <span className="status in-use">● In use</span>
                      ) : tool.status === 'Maintenance' ? (
                        <span className="status maintenance">● Maintenance</span>
                      ) : null}
                    </td>
                    <td>{tool.tool_name}</td>
                    <td>{tool.tool_type}</td>
                    {!isSupervisor() && (
                      <td>
                        {renderActionButtons(tool)}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isSupervisor() ? 5 : 6}>No tools found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showAssignPopup && !showConfirmation && (
          <div className="assign-popup">
            <div className="popup-content">
              <h3 style={{ color: 'black' }}>Assign Tool</h3>
              <p>
                Assigning tool: <strong>{selectedTool?.tool_name}</strong> (Serial: <strong>{selectedTool?.serial_number}</strong>)
              </p>
              <input
                type="text"
                placeholder="Enter place to assign"
                value={assignPlace}
                onChange={(e) => setAssignPlace(e.target.value)}
              />
              <div className="popup-buttons">
                <button onClick={handleAssign} className="confirm-button">Confirm</button>
                <button onClick={() => setShowAssignPopup(false)} className="cancel-button">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showEditPopup && (
          <div className="edit-popup">
            <div className="popup-content">
              <h3 style={{ color: 'black' }}>Edit Tool</h3>
              <label htmlFor="tool_name">Name</label>
              <input
                type="text"
                id="tool_name"
                value={editData.tool_name}
                onChange={(e) => setEditData({ ...editData, tool_name: e.target.value })}
              />
              <label htmlFor="tool_type">Type</label>
              <input
                type="text"
                id="tool_type"
                value={editData.tool_type}
                onChange={(e) => setEditData({ ...editData, tool_type: e.target.value })}
              />
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <div className="popup-buttons">
                <button onClick={editTool} className="confirm-button">Save</button>
                <button onClick={() => setShowEditPopup(false)} className="cancel-button">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showAddPopup && (
          <div className="add-popup">
            <div className="popup-content">
              <h3 style={{ color: 'black' }}>Add New Tool</h3>
              <label htmlFor="tool_name">Name</label>
              <input
                type="text"
                id="tool_name"
                placeholder="Enter tool name"
                value={newToolData.tool_name}
                onChange={(e) => setNewToolData({ ...newToolData, tool_name: e.target.value })}
              />

              <label htmlFor="tool_type">Type</label>
              <input
                type="text"
                id="tool_type"
                placeholder="Enter tool type"
                value={newToolData.tool_type}
                onChange={(e) => setNewToolData({ ...newToolData, tool_type: e.target.value })}
              />

              <label htmlFor="manufacturer">Manufacturer</label>
              <input
                type="text"
                id="manufacturer"
                placeholder="Enter manufacturer"
                value={newToolData.manufacturer}
                onChange={(e) => setNewToolData({ ...newToolData, manufacturer: e.target.value })}
              />

              <label htmlFor="purchase_date">Purchase Date</label>
              <input
                type="date"
                id="purchase_date"
                value={newToolData.purchase_date}
                onChange={(e) => setNewToolData({ ...newToolData, purchase_date: e.target.value })}
              />

              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                placeholder="Enter comments (optional)"
                value={newToolData.comments}
                onChange={(e) => setNewToolData({ ...newToolData, comments: e.target.value })}
              />

              <div className="popup-buttons">
                <button onClick={addTool} className="confirm-button">Add Tool</button>
                <button onClick={() => setShowAddPopup(false)} className="cancel-button">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showDeletePopup && (
          <div className="delete-popup">
            <div className="popup-content">
              <h3 style={{ color: 'black' }}>Confirm Delete</h3>
              <p>
                Are you sure you want to delete tool: <strong>{selectedTool?.tool_name}</strong> (Serial: <strong>{selectedTool?.serial_number}</strong>)?
              </p>
              <div className="popup-buttons">
                <button onClick={deleteTool} className="confirm-button">Delete</button>
                <button onClick={() => setShowDeletePopup(false)} className="cancel-button">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="confirmation-popup">
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

export default ToolsList;