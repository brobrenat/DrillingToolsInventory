import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../../createClient';
import Sidebar from '../../sidebar/Sidebar';
import './ToolsUsedChart.css';

const ToolsUsedChart = ({ sidebar }) => {
  const [data, setData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchToolsData();
  }, []);

  const fetchToolsData = async () => {
    try {
      // Fetch tools data from Supabase
      const { data: toolsData, error } = await supabase
        .from('drilling_tools')
        .select('*');

      if (error) throw error;

      // Process data for the charts
      const statusCount = {
        'Available': 0,
        'In Use': 0,
        'Maintenance': 0
      };

      const typeCount = {};

      toolsData.forEach(tool => {
        // Count by status
        statusCount[tool.status] = (statusCount[tool.status] || 0) + 1;

        // Count by type
        typeCount[tool.tool_type] = (typeCount[tool.tool_type] || 0) + 1;
      });

      // Format data for charts
      const formattedStatusData = Object.entries(statusCount).map(([status, count]) => ({
        name: status,
        value: count
      }));

      const formattedTypeData = Object.entries(typeCount).map(([type, count]) => ({
        name: type,
        count: count
      }));

      setData(formattedTypeData);
      setPieData(formattedStatusData);

    } catch (error) {
      console.error('Error fetching tools data:', error);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          <p>Count: {payload[0].value}</p>
          {payload[0].name === 'status' && (
            <p className="status">{payload[0].payload.status}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-page">
      {sidebar && <Sidebar />}
      <div className="dashboard-content">
        <div className="tools-chart-container">
          <h1>Tools Usage Analysis</h1>
          <div className="charts-grid">
            <div className="chart-section">
              <h3 className="chart-title">Tools by Type Distribution</h3>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="name" stroke="#1a1a1a" />
                    <YAxis stroke="#1a1a1a" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#1a1a1a' }} />
                    <Bar dataKey="count" fill="#3f3081" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-section">
              <h3 className="chart-title">Tool Status Distribution</h3>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={(value) => <span style={{ color: '#1a1a1a' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsUsedChart;
