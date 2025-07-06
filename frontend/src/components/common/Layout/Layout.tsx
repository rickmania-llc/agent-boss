import { ReactNode } from 'react';
import Header from '../Header/Header';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main">{children}</main>
    </div>
  );
}

export default Layout;
