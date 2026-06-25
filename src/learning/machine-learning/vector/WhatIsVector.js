import React from 'react';
import './WhatIsVector.css';

function WhatIsVector() {
  return (
    <div className="vector-container">
      <h1 className="vector-title">What is a Vector?</h1>

      <section className="vector-section">
        <h2>Definition</h2>
        <p>
          A <strong>vector</strong> is a mathematical object that has both
          <em> magnitude</em> (size) and <em>direction</em>. Unlike a scalar,
          which only has magnitude, a vector tells you how much and which way.
        </p>
      </section>

      <section className="vector-section">
        <h2>Examples</h2>
        <ul>
          <li>Velocity — 60 km/h heading north</li>
          <li>Force — 10 N pushing to the right</li>
          <li>Displacement — 5 m to the east</li>
        </ul>
      </section>

      <section className="vector-section">
        <h2>Notation</h2>
        <p>
          Vectors are commonly written as <strong>v = (x, y)</strong> in 2D or{' '}
          <strong>v = (x, y, z)</strong> in 3D. They can also be represented
          as arrows pointing from an origin to a terminal point.
        </p>
      </section>

      <section className="vector-section">
        <h2>Key Properties</h2>
        <ul>
          <li><strong>Magnitude:</strong> The length of the vector, written |v|</li>
          <li><strong>Direction:</strong> The angle the vector makes with a reference axis</li>
          <li><strong>Addition:</strong> Vectors can be added component-wise</li>
          <li><strong>Scalar multiplication:</strong> A vector can be scaled by a number</li>
        </ul>
      </section>
    </div>
  );
}

export default WhatIsVector;
