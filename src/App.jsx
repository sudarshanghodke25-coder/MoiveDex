import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import CustomCursor from './components/common/CustomCursor';
import './styles/globals.css';
import './styles/layout.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomCursor />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
