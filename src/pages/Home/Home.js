import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="home-topics">
        <h2 className="home-topics-heading">
          <Link to="/learning/machine-learning" className="home-topics-link">
            Learning Machine Learning
          </Link>
        </h2>
        <ul className="home-topics-list">
          <li>
            <Link to="/learning/machine-learning/what-is-point">What is a Point?</Link>
          </li>
          <li>
            <Link to="/learning/machine-learning/what-is-vector">What is a Vector?</Link>
          </li>
          <li>
            <Link to="/learning/machine-learning/what-is-minima-maxima">
              What is Minima and Maxima?
            </Link>
          </li>
          <li>
            <Link to="/learning/machine-learning/what-is-gradient-descent">
              What is Gradient Descent?
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default Home;
