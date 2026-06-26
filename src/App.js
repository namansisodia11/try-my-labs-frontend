import { BrowserRouter } from 'react-router-dom';
import './App.css';
import AppRoutes from './common/Routes';

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <h1>My Labs Board</h1>
      </header>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
