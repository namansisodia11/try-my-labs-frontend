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
          <p className="home-hero-board-credit">
            <a
              href="https://en.wikipedia.org/wiki/Galton_board"
              target="_blank"
              rel="noopener noreferrer"
            >
              Galton board
            </a>{' '}
            simulation, after Francis Galton's 1894 "bean machine".
          </p>
        </div>
        <div className="home-hero-copy">
          <h1>
            Try MY <span className="home-hero-title-accent">Labs</span>
          </h1>
          <p>
            This is not trying to be the next big thing. It is just a fun place to play with ideas
            and actually understand them.
          </p>
          <p>
            See these balls. At every peg, each ball has one choice: left or right. Looks totally
            random, na? But drop enough balls and a clean pattern shows up at the bottom. Every
            single time.
          </p>
          <p>
            That's the whole point. What looks unguessable is usually just a mystery waiting for
            enough data and the right analysis.
          </p>
          <NewsletterSignup compact />
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
    </div>
  );
}

export default Home;
