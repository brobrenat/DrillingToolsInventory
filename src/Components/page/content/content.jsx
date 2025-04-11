import React, { useState, useEffect } from 'react';
import './content.css';
import { supabase } from '../../../createClient';
import ToolsUsedChart from './ToolsUsedChart';
import Sidebar from '../../sidebar/Sidebar';

const Content = ({ sidebar }) => {
  const [toolCounts, setToolCounts] = useState({
    totalTools: 0,
    availableTools: 0,
    inUseTools: 0,
    maintenanceTools: 0,
  });

  useEffect(() => {
    const fetchToolCounts = async () => {
      try {
        const { count: totalTools, error: totalError } = await supabase
          .from('drilling_tools')
          .select('*', { count: 'exact' });

        const { count: availableTools, error: availableError } = await supabase
          .from('drilling_tools')
          .select('*', { count: 'exact' })
          .eq('status', 'Available');

        const { count: inUseTools, error: inUseError } = await supabase
          .from('drilling_tools')
          .select('*', { count: 'exact' })
          .eq('status', 'In Use');

        const { count: maintenanceTools, error: maintenanceError } = await supabase
          .from('drilling_tools')
          .select('*', { count: 'exact' })
          .eq('status', 'Maintenance');

        if (totalError || availableError || inUseError || maintenanceError) {
          console.error('Error fetching tool counts:', {
            totalError,
            availableError,
            inUseError,
            maintenanceError,
          });
        } else {
          setToolCounts({
            totalTools,
            availableTools,
            inUseTools,
            maintenanceTools,
          });
        }
      } catch (error) {
        console.error('Error in fetching data:', error);
      }
    };
    fetchToolCounts();
  }, []);

  return (
    <div className="dashboard-page">
      {sidebar && <Sidebar />}
      <div className="contentbody">
        <h1>Dashboard Overview</h1>
        <div className="content-container">
          <div className="box-container">
            <div className="square">
              <h2>Total Tools</h2>
              <p>{toolCounts.totalTools}</p>
            </div>
            <div className="square">
              <h2>Available</h2>
              <p>{toolCounts.availableTools}</p>
            </div>
            <div className="square">
              <h2>In Use</h2>
              <p>{toolCounts.inUseTools}</p>
            </div>
            <div className="square">
              <h2>Maintenance</h2>
              <p>{toolCounts.maintenanceTools}</p>
            </div>
          </div>
          <div className="chart-container">
            <ToolsUsedChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;