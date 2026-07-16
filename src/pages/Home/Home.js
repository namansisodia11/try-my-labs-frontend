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
            This platform is not meant to become the next big thing, but rather a fun platform to
            explore ideas.
          </p>
          <p>
            Balls have two decisions in every path, either to go left or right, which seems
            completely random. Performing it on a sufficient number of balls reveals a pattern in
            the dropping location.
          </p>
          <p>
            What appears unguessable is often only a mystery awaiting sufficient data & right
            analysis.
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
