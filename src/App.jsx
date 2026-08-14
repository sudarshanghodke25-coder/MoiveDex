import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { ToastProvider } from './contexts/ToastContext';
import ScrollToTop from './components/common/ScrollToTop';
import SparkleTrail from './components/common/SparkleTrail';
import './styles/globals.css';
import './styles/layout.css';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <WatchlistProvider>
            <SparkleTrail />
            <AppRouter />
          </WatchlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
