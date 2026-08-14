import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import Footer from './Footer';

export default function AuthLayout() {
  const scrollRef = useRef(null);
  const { pathname } = useLocation();
  const isDetailRoute = /^\/(movie|tv|anime)\/[^/]+/.test(pathname);

  return (
    <div className="auth-layout">
      <Navbar />
      <div className="auth-main-wrapper">
        <main ref={scrollRef} className="auth-content" id="app-scroll">
          <div style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </div>
          {!isDetailRoute && <Footer animated scrollRef={scrollRef} />}
        </main>
      </div>
    </div>
  );
}
