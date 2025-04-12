import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../createClient';
import './tracking.css';
import Sidebar from '../../sidebar/Sidebar';

const Tracking = ({ sidebar }) => {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTool, setSelectedTool] = useState(null);
    const [updateMessage, setUpdateMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [durations, setDurations] = useState({});
    const [userRole, setUserRole] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [toolToTerminate, setToolToTerminate] = useState(null);

    useEffect(() => {
        fetchTools();
        const role = localStorage.getItem('userRole');
        setUserRole(role);
    }, []);

    const isSupervisor = () => userRole === 'Supervisor';

    const fetchTools = async () => {
        try {
            const { data, error } = await supabase
                .from('drilling_tools')
                .select('*')
                .eq('status', 'In Use')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setTools(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch tools data');
            setLoading(false);
        }
    };

    const handleToolSelect = (tool) => {
        setSelectedTool(tool);
    };

    const formatDuration = (startTime) => {
        const now = new Date();
        now.setHours(now.getHours() - 7); // subtract 7 hours
        const start = new Date(startTime);
        const diff = Math.floor((now - start) / 1000); // difference in seconds

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const newDurations = {};
            tools.forEach(tool => {
                newDurations[tool.serial_number] = formatDuration(tool.updated_at);
            });
            setDurations(newDurations);
        }, 1000);

        return () => clearInterval(timer);
    }, [tools]);

    const terminateJob = async (tool) => {
        try {
            setLoading(true);
            
            if (!tool || !tool.serial_number) {
                throw new Error('Invalid tool data');
            }

            const startTime = new Date(tool.updated_at);
            const endTime = new Date();
            const hoursUsed = Math.round((endTime - startTime) / (1000 * 60 * 60));

            const updates = {
                status: 'Available',
                updated_at: endTime.toISOString(),
                usage_hours: tool.usage_hours ? (parseInt(tool.usage_hours) + hoursUsed) : hoursUsed
            };

            console.log('Attempting to update tool:', tool.serial_number);
            console.log('Updates:', updates);

            const { data, error } = await supabase
                .from('drilling_tools')
                .update(updates)
                .eq('serial_number', tool.serial_number)
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw new Error(error.message);
            }

            if (!data || data.length === 0) {
                throw new Error('No rows were updated');
            }

            setTools(tools.filter(t => t.serial_number !== tool.serial_number));
            setUpdateMessage(`Job terminated for ${tool.tool_name}`);
            setTimeout(() => setUpdateMessage(''), 3000);

            if (selectedTool?.serial_number === tool.serial_number) {
                setSelectedTool(null);
            }
        } catch (err) {
            console.error('Error in terminateJob:', err);
            setError(`Failed to terminate job: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateClick = (e, tool) => {
        e.stopPropagation();
        setToolToTerminate(tool);
        setShowConfirmModal(true);
    };

    const handleConfirmTerminate = () => {
        if (toolToTerminate) {
            terminateJob(toolToTerminate);
        }
        setShowConfirmModal(false);
        setToolToTerminate(null);
    };

    const filteredTools = searchQuery
        ? tools.filter(tool => 
            tool.tool_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.location.toLowerCase().includes(searchQuery.toLowerCase()))
        : tools;

    if (loading) {
        return (
            <div className="tracking-page">
                {sidebar && <Sidebar />}
                <div className="tracking-content">
                    <div className="loading-container">Loading tracking data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tracking-page">
            {sidebar && <Sidebar />}
            <div className="tracking-content">
                <div className="tracking-header">
                    <h1>Active Jobs Tracking</h1>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search tools or locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        {updateMessage && (
                            <div className="success-message">{updateMessage}</div>
                        )}
                        
                        <div className="tracking-container">
                            <table className="tracking-table">
                                <thead>
                                    <tr>
                                        <th>Tool Name</th>
                                        <th>Location</th>
                                        <th>Start Time</th>
                                        <th>Duration</th>
                                        {!isSupervisor() && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTools.length > 0 ? (
                                        filteredTools.map(tool => (
                                            <tr 
                                                key={tool.serial_number}
                                                className={selectedTool?.serial_number === tool.serial_number ? 'selected' : ''}
                                                onClick={() => handleToolSelect(tool)}
                                            >
                                                <td>{tool.tool_name}</td>
                                                <td>{tool.location}</td>
                                                <td>{new Date(tool.updated_at).toLocaleString()}</td>
                                                <td>{durations[tool.serial_number] || '00:00:00'}</td>
                                                {!isSupervisor() && (
                                                    <td>
                                                        <button
                                                            className="terminate-button"
                                                            onClick={(e) => handleTerminateClick(e, tool)}
                                                        >
                                                            Terminate Job
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isSupervisor() ? 4 : 5}>
                                                <div className="no-tools-message">
                                                    {searchQuery 
                                                        ? "No active jobs match your search"
                                                        : "No active jobs at the moment"}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
            {showConfirmModal && (
                <>
                    <div className="popup-background" onClick={() => setShowConfirmModal(false)} />
                    <div className="popup">
                        <div className="popup-title">Confirm Termination</div>
                        <p>Are you sure you want to terminate the job for {toolToTerminate?.tool_name}?</p>
                        <div className="popup-buttons">
                            <button className="cancel-button" onClick={() => setShowConfirmModal(false)}>
                                Cancel
                            </button>
                            <button className="confirm-button" onClick={handleConfirmTerminate}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Tracking;