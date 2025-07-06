import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { loadAgents } from '../../store/actions/agents.actions';
import AgentList from '../../components/agents/AgentList/AgentList';
import './AgentMonitor.css';

function AgentMonitor() {
  const dispatch = useDispatch<AppDispatch>();
  const agents = useSelector((state: RootState) => state.agents.items);

  useEffect(() => {
    dispatch(loadAgents());
  }, [dispatch]);

  return (
    <div className="agent-monitor">
      <div className="agent-monitor-header">
        <h2>Agent Monitor</h2>
        <button className="create-agent-button">Create Agent</button>
      </div>

      <div className="agent-monitor-stats">
        <div className="stat">
          <span className="stat-label">Total Agents</span>
          <span className="stat-value">{agents.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Idle</span>
          <span className="stat-value">{agents.filter(a => a.status === 'idle').length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Busy</span>
          <span className="stat-value">{agents.filter(a => a.status === 'busy').length}</span>
        </div>
      </div>

      <AgentList />
    </div>
  );
}

export default AgentMonitor;
