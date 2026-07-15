import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <Link to="/" className="site-header-brand">
        <Logo />
        <span className="site-header-brand-text">
          <span className="site-header-brand-line">Try My</span>
          <span className="site-header-brand-line site-header-brand-accent">Labs</span>
        </span>
      </Link>
      <nav className="site-header-nav">
        <div className={`site-header-dropdown${menuOpen ? ' open' : ''}`} ref={dropdownRef}>
          <span className="site-header-dropdown-label" onClick={() => setMenuOpen((open) => !open)}>
            Machine Learning
          </span>
          <div className="site-header-dropdown-menu" onClick={() => setMenuOpen(false)}>
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
