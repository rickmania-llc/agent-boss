import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import './Header.css';

function Header() {
  const location = useLocation();
  const socketConnected = useSelector((state: RootState) => state.ui.socketConnected);

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Agent Boss</h1>
        <nav className="header-nav">
          <Link to="/" className={`header-link ${location.pathname === '/' ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link
            to="/agents"
            className={`header-link ${location.pathname === '/agents' ? 'active' : ''}`}
          >
            Agents
          </Link>
        </nav>
      </div>
      <div className="header-right">
        <div className={`connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
          {socketConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </header>
  );
}

export default Header;
