import React from 'react';
import { Link } from 'react-router-dom';
import GaltonBoard from './GaltonBoard';
import NewsletterSignup from './NewsletterSignup';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-board">
          <GaltonBoard />
        </div>
        <div className="home-hero-copy">
          <h1>Learn math by playing with it (deployed successfully!).</h1>
          <p>
            Every lesson here is interactive. Like this Galton board: pure randomness, dropped
            through pegs enough times, turns into a predictable shape.
          </p>
          <p>
            Each ball bounces left or right at every peg, a coin flip each time. One ball's path
            looks totally random. Thousands of them stack into a bell curve, because most left/right
            sequences roughly cancel out and only land far from center if you get a long unlikely
            streak.
          </p>
        </div>
      </section>
      <section className="home-topics">
        <h2 className="home-topics-heading">
          <Link to="/learning/machine-learning" className="home-topics-link">
            Machine Learning
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
          <li>
            <Link to="/learning/machine-learning/what-is-gradient-descent-with-momentum">
              What is Gradient Descent with Momentum?
            </Link>
          </li>
          <li>
            <Link to="/learning/machine-learning/what-is-stochastic-gradient-descent">
              What is Stochastic Gradient Descent?
            </Link>
          </li>
        </ul>
      </section>
      <NewsletterSignup />
    </div>
  );
}

export default Home;
