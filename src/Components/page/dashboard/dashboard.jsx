import React, { useState, useEffect } from 'react';
import { supabase } from '../../../createClient';
import Sidebar from '../../sidebar/Sidebar';
import './dashboard.css';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
);

const Dashboard = ({ sidebar }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalTools: 0,
        availableTools: 0,
        inUseTools: 0,
        maintenanceTools: 0,
        recentActivity: [],
        hourlyUsage: [],
        toolTypeDistribution: {}
    });
    const [toolsData, setToolsData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        // Refresh data every 5 minutes
        const interval = setInterval(fetchDashboardData, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch tools count by status
            const { data: toolsData, error: toolsError } = await supabase
                .from('drilling_tools')
                .select('*');

            if (toolsError) throw toolsError;

            setToolsData(toolsData);

            const statsData = {
                totalTools: toolsData.length,
                availableTools: toolsData.filter(tool => tool.status.toLowerCase() === 'available').length,
                inUseTools: toolsData.filter(tool => tool.status.toLowerCase() === 'in use').length,
                maintenanceTools: toolsData.filter(tool => tool.status.toLowerCase() === 'maintenance').length
            };

            // Calculate tool type distribution
            const toolTypeDistribution = toolsData.reduce((acc, tool) => {
                const type = tool.tool_type || 'Unknown';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});

            // Calculate hourly usage for the past 24 hours
            const now = new Date();
            const hourlyUsage = Array(24).fill(0);
            toolsData.forEach(tool => {
                if (tool.status.toLowerCase() === 'in use') {
                    const updatedAt = new Date(tool.updated_at);
                    const hoursDiff = Math.floor((now - updatedAt) / (1000 * 60 * 60));
                    if (hoursDiff < 24) {
                        hourlyUsage[23 - hoursDiff]++;
                    }
                }
            });

            // Fetch recent activity
            const { data: activityData, error: activityError } = await supabase
                .from('drilling_tools')
                .select('serial_number, tool_name, status, location, updated_at')
                .order('updated_at', { ascending: false })
                .limit(10);

            if (activityError) throw activityError;

            setStats({
                ...statsData,
                recentActivity: activityData,
                hourlyUsage,
                toolTypeDistribution
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'available': return '✅';
            case 'in use': return '🔄';
            case 'maintenance': return '🔧';
            default: return '📝';
        }
    };

    const generateToolAgeData = () => {
        const now = new Date();
        const ageData = {};
        toolsData?.forEach(tool => {
            if (tool.purchase_date) {
                const ageInMonths = Math.floor((now - new Date(tool.purchase_date)) / (1000 * 60 * 60 * 24 * 30));
                const ageRange = Math.floor(ageInMonths / 6) * 6; // Group by 6 months
                const label = `${ageRange}-${ageRange + 6} months`;
                ageData[label] = (ageData[label] || 0) + 1;
            }
        });
        return {
            labels: Object.keys(ageData),
            datasets: [{
                label: 'Tools by Age',
                data: Object.values(ageData),
                backgroundColor: '#6c5ce7',
                borderColor: '#6c5ce7',
                borderWidth: 1
            }]
        };
    };

    const generateUtilizationData = () => {
        const inUseCount = stats.inUseTools;
        const availableCount = stats.availableTools;
        const maintenanceCount = stats.maintenanceTools;
        const total = stats.totalTools;

        return {
            labels: ['In Use', 'Available', 'Maintenance'],
            datasets: [{
                data: [inUseCount, availableCount, maintenanceCount],
                backgroundColor: ['#ef4444', '#22c55e', '#f59e0b'],
                borderWidth: 0
            }]
        };
    };

    const hourlyUsageData = {
        labels: Array.from({ length: 24 }, (_, i) => `${(23 - i + new Date().getHours()) % 24}:00`).reverse(),
        datasets: [{
            label: 'Tools in Use',
            data: stats.hourlyUsage,
            fill: true,
            borderColor: '#3f3081',
            backgroundColor: 'rgba(63, 48, 129, 0.1)',
            tension: 0.4
        }]
    };

    const toolTypeData = {
        labels: Object.keys(stats.toolTypeDistribution),
        datasets: [{
            data: Object.values(stats.toolTypeDistribution),
            backgroundColor: [
                '#3f3081',
                '#6c5ce7',
                '#a29bfe',
                '#81ecec',
                '#74b9ff',
                '#0984e3',
                '#ff7675',
                '#fab1a0'
            ]
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#1a1a1a'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#1a1a1a'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: '#1a1a1a'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                {sidebar && <Sidebar />}
                <div className="dashboard-content">
                    <div className="loading-spinner">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {sidebar && <Sidebar />}
            <div className="dashboard-content">
                <div className="dashboard-inner">
                    <div className="dashboard-header">
                        <h1>Dashboard</h1>
                        <button 
                            className="refresh-button"
                            onClick={fetchDashboardData}
                            disabled={loading}
                        >
                            {loading ? 'Refreshing...' : 'Refresh Dashboard'}
                        </button>
                    </div>
                    
                    {error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card total">
                                    <h3>Total Tools</h3>
                                    <p className="stat-number">{stats.totalTools}</p>
                                </div>
                                <div className="stat-card available">
                                    <h3>Available Tools</h3>
                                    <p className="stat-number">{stats.availableTools}</p>
                                </div>
                                <div className="stat-card in-use">
                                    <h3>Tools in Use</h3>
                                    <p className="stat-number">{stats.inUseTools}</p>
                                </div>
                                <div className="stat-card maintenance">
                                    <h3>In Maintenance</h3>
                                    <p className="stat-number">{stats.maintenanceTools}</p>
                                </div>
                            </div>

                            <div className="dashboard-grid">
                                <div className="charts-container">
                                    <div className="chart-section">
                                        <h2>24-Hour Usage History</h2>
                                        <div className="chart-wrapper">
                                            <Line data={hourlyUsageData} options={chartOptions} />
                                        </div>
                                    </div>
                                    
                                    <div className="chart-section">
                                        <h2>Tool Age Distribution</h2>
                                        <div className="chart-wrapper">
                                            <Bar data={generateToolAgeData()} options={chartOptions} />
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-section">
                                    <div className="utilization-section">
                                        <h2>Current Utilization</h2>
                                        <div className="chart-wrapper">
                                            <Doughnut 
                                                data={generateUtilizationData()} 
                                                options={{
                                                    ...chartOptions,
                                                    plugins: {
                                                        ...chartOptions.plugins,
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context) => {
                                                                    const value = context.raw;
                                                                    const total = context.dataset.data.reduce((a, b) => a + b);
                                                                    const percentage = ((value / total) * 100).toFixed(1);
                                                                    return `${context.label}: ${value} (${percentage}%)`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="recent-activity">
                                        <h2>Recent Activity</h2>
                                        <div className="activity-list">
                                            {stats.recentActivity.length > 0 ? (
                                                stats.recentActivity.map((activity) => (
                                                    <div key={activity.serial_number} className="activity-item">
                                                        <div className="activity-icon">
                                                            {getStatusIcon(activity.status)}
                                                        </div>
                                                        <div className="activity-details">
                                                            <p className="activity-text">
                                                                <strong>{activity.tool_name}</strong>
                                                                {' - '}
                                                                <span className={`status ${activity.status.toLowerCase().replace(' ', '-')}`}>
                                                                    {activity.status}
                                                                </span>
                                                                {activity.location && (
                                                                    <span className="location-text">
                                                                        {' at '}{activity.location}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="activity-time">{formatDate(activity.updated_at)}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-activity">No recent activity</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;