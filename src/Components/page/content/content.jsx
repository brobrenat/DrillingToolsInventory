import React,{useState, useEffect} from 'react'
import './content.css'
import { supabase } from '../../../createClient';
import ToolsUsedChart from './ToolsUsedChart';
const content = () => {
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
    
            console.log('Total Tools:', totalTools); 
    
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
          <div className="contentbody">

        
        <div className="content-container">
          <div className="box-container">
            <div className="box1">
              <div className="square">
                <h2>Tools</h2>
                <p>{toolCounts.totalTools}</p>
              </div>
            </div>
            <div className="box2">
              <div className="square">
                <h2>Available</h2>
                <p>{toolCounts.availableTools}</p>
              </div>
            </div>
            <div className="box3">
              <div className="square">
                <h2>In Use</h2>
                <p>{toolCounts.inUseTools}</p>
              </div>
            </div>
            <div className="box4">
              <div className="square">
                <h2>Maintenance</h2>
                <p>{toolCounts.maintenanceTools}</p>
              </div>
            </div>
          </div>
          <div className="chart-container">
            
          <ToolsUsedChart/>
          </div>
        </div>
        </div>
      );
    };
  
  export default content;