import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import SparkleTrail from './components/common/SparkleTrail';
import './styles/globals.css';
import './styles/layout.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <SparkleTrail />
          <AppRouter />
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
