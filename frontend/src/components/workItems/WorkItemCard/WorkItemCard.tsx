import { Link } from 'react-router-dom';
import { WorkItem } from '../../../utils/types';
import { formatDate } from '../../../utils/helpers';
import './WorkItemCard.css';

interface WorkItemCardProps {
  workItem: WorkItem;
}

function WorkItemCard({ workItem }: WorkItemCardProps) {
  return (
    <Link to={`/work-items/${workItem.id}`} className="work-item-card">
      <div className="work-item-card-header">
        <h4>{workItem.title}</h4>
        <span className={`priority priority-${workItem.priority}`}>{workItem.priority}</span>
      </div>

      {workItem.description && <p className="work-item-card-description">{workItem.description}</p>}

      <div className="work-item-card-footer">
        <span className={`status status-${workItem.status}`}>
          {workItem.status.replace('_', ' ')}
        </span>
        <span className="date">{formatDate(workItem.created_at)}</span>
      </div>
    </Link>
  );
}

export default WorkItemCard;
