import React, { useEffect } from 'react';
import './WhatIsVector.css';
import CartesianCanvas from '../../../common/mathbox/CartesianCanvas';

const DEMO_VECTORS = [
  { x: 2, y: 1, color: 0x4f46e5 },
  { x: 1, y: 2, color: 0xe53e3e },
];

function WhatIsVector() {
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, []);

  return (
    <div className="vector-container">
      <h1 className="vector-title">What is a Vector?</h1>

      <section className="vector-section">
        <h2>Live Demo</h2>
        <p>A simple 2D vector plotted using MathBox:</p>
        <CartesianCanvas vectors={DEMO_VECTORS} operation="addition" range={3} />
      </section>

      <section className="vector-section">
        <h2>Scalar</h2>
        <p>
          A <strong>scalar</strong> is just a single number — it has magnitude only, no direction.
          Temperature, mass, and speed are scalars. For example, <em>5 kg</em> or <em>100°C</em>.
        </p>
        <p>{'Mathematically: $a \\in \\mathbb{R}$'}</p>
      </section>

      <section className="vector-section">
        <h2>Vector</h2>
        <p>
          A <strong>vector</strong> has both magnitude and direction. It is an ordered list of
          numbers — each number represents a component along an axis. Velocity and force are
          vectors.
        </p>
        <p>{'A 3D vector: $\\vec{v} = (x,\\, y,\\, z)$'}</p>
        <p>{'Its magnitude: $|\\vec{v}| = \\sqrt{x^2 + y^2 + z^2}$'}</p>
      </section>

      <section className="vector-section">
        <h2>Tensor</h2>
        <p>
          A <strong>tensor</strong> is a generalization of scalars and vectors to higher dimensions.
          A scalar is a rank-0 tensor, a vector is rank-1, and a matrix is rank-2. Tensors describe
          relationships that have multiple directions at once — used heavily in physics and ML.
        </p>
        <p>{'A rank-2 tensor (matrix): $T = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$'}</p>
      </section>

      <section className="vector-section">
        <h2>Summary</h2>
        <table className="vector-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Rank</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Scalar</td>
              <td>0</td>
              <td>{'$5$'}</td>
            </tr>
            <tr>
              <td>Vector</td>
              <td>1</td>
              <td>{'$(3, 4)$'}</td>
            </tr>
            <tr>
              <td>Matrix</td>
              <td>2</td>
              <td>{'$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$'}</td>
            </tr>
            <tr>
              <td>Tensor</td>
              <td>n</td>
              <td>n-dimensional array</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default WhatIsVector;
