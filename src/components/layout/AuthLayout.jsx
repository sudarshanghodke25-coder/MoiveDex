import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import Footer from './Footer';

export default function AuthLayout() {
  const scrollRef = useRef(null);

  return (
    <div className="auth-layout">
      <Navbar />
      <div className="auth-main-wrapper">
        <main ref={scrollRef} className="auth-content" id="app-scroll">
          <div style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </div>
          <Footer animated scrollRef={scrollRef} />
        </main>
      </div>
    </div>
  );
}
