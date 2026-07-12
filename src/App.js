import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Header from './common/Header';
import AppRoutes from './common/Routes';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
