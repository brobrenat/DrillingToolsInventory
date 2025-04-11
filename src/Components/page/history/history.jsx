import React, { useState, useEffect } from 'react';
import { supabase } from '../../../createClient';
import './history.css';
import Sidebar from '../../sidebar/Sidebar';

const History = ({ sidebar }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('drilling_tools_history')
        .select('*')
        .order('changed_at', { ascending: false });

      if (error) throw error;
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to fetch history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDataChanges = (oldData, newData, action) => {
    if (!oldData && !newData) return null;

    if (action === 'INSERT') {
      const relevantFields = ['tool_name', 'tool_type', 'serial_number', 'manufacturer', 'purchase_date', 'status'];
      return (
        <div className="history-changes">
          <span className="action-label">Added New Tool</span>
          <ul className="changes-list">
            {relevantFields.map(field => 
              newData[field] && (
                <li key={field}>
                  <span className="field-name">{field}:</span>
                  <span className="new-value">{newData[field]}</span>
                </li>
              )
            )}
          </ul>
        </div>
      );
    }

    if (action === 'DELETE') {
      const relevantFields = ['tool_name', 'tool_type', 'serial_number', 'status'];
      return (
        <div className="history-changes">
          <span className="action-label">Removed Tool</span>
          <ul className="changes-list">
            {relevantFields.map(field => 
              oldData[field] && (
                <li key={field}>
                  <span className="field-name">{field}:</span>
                  <span className="removed-value">{oldData[field]}</span>
                </li>
              )
            )}
          </ul>
        </div>
      );
    }

    if (action === 'UPDATE') {
      const changes = [];
      const ignoredFields = ['updated_at', 'created_at'];
      const fieldLabels = {
        tool_name: 'Tool Name',
        tool_type: 'Tool Type',
        status: 'Status',
        location: 'Location',
        manufacturer: 'Manufacturer',
        purchase_date: 'Purchase Date',
        comments: 'Comments',
        tool_condition: 'Condition',
        usage_hours: 'Usage Hours'
      };

      for (const [key, newValue] of Object.entries(newData)) {
        const oldValue = oldData[key];
        if (!ignoredFields.includes(key) && oldValue !== newValue) {
          changes.push(
            <li key={key}>
              <span className="field-name">{fieldLabels[key] || key}:</span>
              <span className="old-value">{oldValue || 'Not set'}</span>
              <span className="arrow">→</span>
              <span className="new-value">{newValue || 'Not set'}</span>
            </li>
          );
        }
      }

      return changes.length > 0 ? (
        <div className="history-changes">
          <span className="action-label">Updated Fields</span>
          <ul className="changes-list">{changes}</ul>
        </div>
      ) : null;
    }

    return null;
  };

  return (
    <div className="history-page">
      {sidebar && <Sidebar />}
      <div className="history-content">
        <h1>History</h1>
        <div className="history-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Serial Number</th>
                <th>Changes</th>
                <th>Changed At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="loading-message">Loading history...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="error-message">{error}</td>
                </tr>
              ) : history.length > 0 ? (
                history.map((log) => (
                  <tr key={log.history_id}>
                    <td className={`action-${log.action.toLowerCase()}`}>
                      {log.action}
                    </td>
                    <td>{log.tool_id}</td>
                    <td className="changes-cell">
                      {formatDataChanges(log.old_data, log.new_data, log.action)}
                    </td>
                    <td>{new Date(log.changed_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">No history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;