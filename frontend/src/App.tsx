import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import WorkItemDetail from './pages/WorkItemDetail/WorkItemDetail';
import AgentMonitor from './pages/AgentMonitor/AgentMonitor';
import './App.css';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/work-items/:id" element={<WorkItemDetail />} />
        <Route path="/agents" element={<AgentMonitor />} />
      </Routes>
    </Layout>
  );
}

export default App;
