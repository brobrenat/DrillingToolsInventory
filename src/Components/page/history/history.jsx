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

  const formatJsonData = (data) => {
    if (!data) return 'N/A';
    return <pre className="json-data">{JSON.stringify(data, null, 2)}</pre>;
  };

  // Function to determine the action class
  const getActionClass = (action) => {
    switch (action) {
      case 'INSERT':
        return 'action-insert';
      case 'UPDATE':
        return 'action-update';
      case 'DELETE':
        return 'action-delete';
      default:
        return '';
    }
  };

  return (
    <div className="history-page">
      {sidebar && <Sidebar />}
      <div className="history-content">
        <h1>History</h1>
        {loading ? (
          <p className="loading-message">Loading history...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="history-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Serial Number</th>
                  <th>Old Data</th>
                  <th>New Data</th>
                  <th>Changed At</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((log) => (
                    <tr key={log.history_id}>
                      <td className={getActionClass(log.action)}>{log.action}</td>
                      <td>{log.tool_id}</td>
                      <td>{formatJsonData(log.old_data)}</td>
                      <td>{formatJsonData(log.new_data)}</td>
                      <td>{new Date(log.changed_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No history found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;