import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Sidebar />
      <div className="auth-main-wrapper">
        <TopBar />
        <main className="auth-content">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
}
