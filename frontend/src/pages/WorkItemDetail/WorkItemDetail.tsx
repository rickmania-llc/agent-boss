import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchWorkItem } from '../../services/workItem.api';
import { WorkItem } from '../../utils/types';
import './WorkItemDetail.css';

function WorkItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agents = useSelector((state: RootState) => state.agents.items);
  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkItem();
  }, [id]);

  const loadWorkItem = async () => {
    if (!id) return;

    try {
      const item = await fetchWorkItem(parseInt(id));
      setWorkItem(item);
    } catch (error) {
      console.error('Failed to load work item:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="work-item-detail-loading">Loading...</div>;
  }

  if (!workItem) {
    return <div className="work-item-detail-error">Work item not found</div>;
  }

  const availableAgents = agents.filter(agent => agent.status === 'idle');

  return (
    <div className="work-item-detail">
      <div className="work-item-detail-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Dashboard
        </button>
      </div>

      <div className="work-item-detail-content">
        <h2>{workItem.title}</h2>

        <div className="work-item-detail-meta">
          <span className={`status status-${workItem.status}`}>
            {workItem.status.replace('_', ' ')}
          </span>
          <span className={`priority priority-${workItem.priority}`}>
            {workItem.priority} priority
          </span>
        </div>

        {workItem.description && (
          <div className="work-item-detail-section">
            <h3>Description</h3>
            <p>{workItem.description}</p>
          </div>
        )}

        {workItem.status === 'pending' && availableAgents.length > 0 && (
          <div className="work-item-detail-section">
            <h3>Assign to Agent</h3>
            <div className="agent-assignment">
              <select>
                <option value="">Select an agent</option>
                {availableAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <button>Assign</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkItemDetail;
