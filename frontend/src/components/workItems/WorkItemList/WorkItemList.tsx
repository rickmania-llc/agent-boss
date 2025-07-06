import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import WorkItemCard from '../WorkItemCard/WorkItemCard';
import './WorkItemList.css';

function WorkItemList() {
  const workItems = useSelector((state: RootState) => state.workItems.items);
  const loading = useSelector((state: RootState) => state.workItems.loading);

  if (loading) {
    return <div className="work-item-list-loading">Loading work items...</div>;
  }

  if (workItems.length === 0) {
    return (
      <div className="work-item-list-empty">No work items yet. Create one to get started!</div>
    );
  }

  return (
    <div className="work-item-list">
      <h3>Work Items</h3>
      <div className="work-item-grid">
        {workItems.map(workItem => (
          <WorkItemCard key={workItem.id} workItem={workItem} />
        ))}
      </div>
    </div>
  );
}

export default WorkItemList;
