import { Agent } from '../../../utils/types';
import './AgentCard.css';

interface AgentCardProps {
  agent: Agent;
}

function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <h4>{agent.name}</h4>
        <span className={`agent-status agent-status-${agent.status}`}>{agent.status}</span>
      </div>

      <div className="agent-card-content">
        <div className="agent-info">
          <span className="label">ID:</span>
          <span className="value">{agent.id}</span>
        </div>

        {agent.pid && (
          <div className="agent-info">
            <span className="label">PID:</span>
            <span className="value">{agent.pid}</span>
          </div>
        )}

        {agent.workItemId && (
          <div className="agent-info">
            <span className="label">Work Item:</span>
            <span className="value">#{agent.workItemId}</span>
          </div>
        )}
      </div>

      {agent.status === 'busy' && (
        <div className="agent-card-actions">
          <button className="stop-button">Stop Agent</button>
        </div>
      )}
    </div>
  );
}

export default AgentCard;
