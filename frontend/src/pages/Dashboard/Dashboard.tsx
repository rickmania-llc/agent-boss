import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { loadWorkItems } from '../../store/actions/workItems.actions';
import { loadAgents } from '../../store/actions/agents.actions';
import WorkItemList from '../../components/workItems/WorkItemList/WorkItemList';
import CreateWorkItem from '../../components/workItems/CreateWorkItem/CreateWorkItem';
import './Dashboard.css';

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const workItems = useSelector((state: RootState) => state.workItems.items);
  const agents = useSelector((state: RootState) => state.agents.items);

  useEffect(() => {
    dispatch(loadWorkItems());
    dispatch(loadAgents());
  }, [dispatch]);

  const stats = {
    totalWorkItems: workItems.length,
    pendingItems: workItems.filter(item => item.status === 'pending').length,
    inProgressItems: workItems.filter(item => item.status === 'in_progress').length,
    completedItems: workItems.filter(item => item.status === 'completed').length,
    totalAgents: agents.length,
    idleAgents: agents.filter(agent => agent.status === 'idle').length,
    busyAgents: agents.filter(agent => agent.status === 'busy').length,
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <CreateWorkItem />
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Work Items</h3>
          <div className="stat-value">{stats.totalWorkItems}</div>
          <div className="stat-details">
            <span>Pending: {stats.pendingItems}</span>
            <span>In Progress: {stats.inProgressItems}</span>
            <span>Completed: {stats.completedItems}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Agents</h3>
          <div className="stat-value">{stats.totalAgents}</div>
          <div className="stat-details">
            <span>Idle: {stats.idleAgents}</span>
            <span>Busy: {stats.busyAgents}</span>
          </div>
        </div>
      </div>

      <WorkItemList />
    </div>
  );
}

export default Dashboard;
