import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import CustomCursor from './components/common/CustomCursor';
import './styles/globals.css';
import './styles/layout.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <CustomCursor />
          <AppRouter />
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
