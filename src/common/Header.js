import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="site-header-brand">
        TRY MY LABS
      </Link>
      <nav className="site-header-nav">
        <div className="site-header-dropdown">
          <span className="site-header-dropdown-label">Machine Learning</span>
          <div className="site-header-dropdown-menu">
            <Link to="/learning/machine-learning/what-is-point">What is a Point?</Link>
            <Link to="/learning/machine-learning/what-is-vector">What is a Vector?</Link>
            <Link to="/learning/machine-learning/what-is-minima-maxima">
              What is Minima and Maxima?
            </Link>
            <Link to="/learning/machine-learning/what-is-gradient-descent">
              What is Gradient Descent?
            </Link>
            <Link to="/learning/machine-learning/what-is-gradient-descent-with-momentum">
              What is Gradient Descent with Momentum?
            </Link>
            <Link to="/learning/machine-learning/what-is-stochastic-gradient-descent">
              What is Stochastic Gradient Descent?
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
