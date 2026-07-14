import { BrowserRouter, useLocation } from 'react-router-dom';
import './App.css';
import Header from './common/Header';
import AppRoutes from './common/Routes';
import NewsletterSignup from './pages/Home/NewsletterSignup';

function AppBanner() {
  const location = useLocation();
  if (location.pathname === '/') {
    return null;
  }
  return <NewsletterSignup />;
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRoutes />
      <AppBanner />
    </BrowserRouter>
  );
}

export default App;
