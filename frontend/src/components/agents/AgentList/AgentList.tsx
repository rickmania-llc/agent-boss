import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import AgentCard from '../AgentCard/AgentCard';
import './AgentList.css';

function AgentList() {
  const agents = useSelector((state: RootState) => state.agents.items);
  const loading = useSelector((state: RootState) => state.agents.loading);

  if (loading) {
    return <div className="agent-list-loading">Loading agents...</div>;
  }

  if (agents.length === 0) {
    return <div className="agent-list-empty">No agents created yet.</div>;
  }

  return (
    <div className="agent-list">
      <h3>Active Agents</h3>
      <div className="agent-grid">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

export default AgentList;
