import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
