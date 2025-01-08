import { useEffect, useState } from 'react';
import { supabase } from '../../../createClient';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './ToolsUsedChart.css'; 

const ToolsUsedChart = () => {
  const [toolsUsed, setToolsUsed] = useState([]);
  const [toolStatusData, setToolStatusData] = useState([]);

  const fetchToolsUsedOverTime = async () => {
    try {
      const { data, error } = await supabase
        .from('drilling_tools')
        .select('tool_name, usage_hours, last_service_date, status'); // Include status field

      if (error) {
        console.log("Error fetching tools used over time:", error);
        return;
      }

      const formattedData = data.map((tool) => ({
        lastServiceDate: new Date(tool.last_service_date).toLocaleDateString(),
        usageHours: tool.usage_hours,
        toolName: tool.tool_name,
        status: tool.status // Include status in formatted data
      }));

      setToolsUsed(formattedData);
      calculateToolStatus(formattedData); // Calculate tool status for pie chart
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const calculateToolStatus = (data) => {
    const statusCount = data.reduce((acc, tool) => {
      acc[tool.status] = (acc[tool.status] || 0) + 1; // Count occurrences of each status
      return acc;
    }, {});

    const formattedStatusData = Object.entries(statusCount).map(([key, value]) => ({
      name: key,
      value: value
    }));

    setToolStatusData(formattedStatusData);
  };

  useEffect(() => {
    fetchToolsUsedOverTime();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { toolName, usageHours } = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`Tool: ${toolName}`}</p>
          <p className="intro">{`Usage Hours: ${usageHours}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="tools-chart-container">
    <div className="chart-section">
      <h3 className="chart-title">Tool Usage Over Time</h3>
      <div className="line-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={toolsUsed} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lastServiceDate" tick={{ fill: 'white' }} />
            <YAxis tick={{ fill: 'white' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="usageHours" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  
    <div className="chart-section">
      <h3 className="chart-title">Tool Status</h3>
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={toolStatusData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {toolStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
  );
};

// Function to determine color based on status
const getColor = (status) => {
  switch (status) {
    case 'Available':
      return '#82ca9d';
    case 'In Use':
      return '#ffc658';
    case 'Under Maintenance':
      return '#ff8042';
    default:
      return '#8884d8';
  }
};

export default ToolsUsedChart;
