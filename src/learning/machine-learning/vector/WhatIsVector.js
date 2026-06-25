import React, { useEffect, useRef } from 'react';
import './WhatIsVector.css';

function WhatIsVector() {
  const mathboxRef = useRef(null);

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, []);

  useEffect(() => {
    const container = mathboxRef.current;
    if (!container || !window.MathBox) return;

    const mathbox = window.MathBox.mathBox({
      element: container,
      plugins: ['core', 'controls', 'cursor'],
      controls: { klass: window.THREE.OrbitControls },
    });

    const three = mathbox.three;
    three.renderer.setClearColor(new window.THREE.Color(0xfafafa), 1.0);
    three.camera.position.set(0, 0, 4);
    three.controls.target.set(0, 0, 0);
    three.controls.update();

    const view = mathbox.cartesian({
      range: [
        [-3, 3],
        [-3, 3],
      ],
      scale: [1, 1],
    });

    view.axis({ axis: 1, color: 0x999999, width: 2 });
    view.axis({ axis: 2, color: 0x999999, width: 2 });
    view.grid({ axes: 'xy', divideX: 10, divideY: 10, opacity: 0.3 });

    // Vector A: (0,0) -> (2,1)
    view.interval({
      id: 'vecA',
      width: 2,
      expr: function (emit, x, i) {
        if (i === 0) emit(0, 0);
        else emit(2, 1);
      },
      channels: 2,
    });
    view.line({ points: '#vecA', color: 0x4f46e5, width: 6 });
    view.point({ points: '#vecA', color: 0x4f46e5, size: 10 });

    // Vector B: (0,0) -> (1,2)
    view.interval({
      id: 'vecB',
      width: 2,
      expr: function (emit, x, i) {
        if (i === 0) emit(0, 0);
        else emit(1, 2);
      },
      channels: 2,
    });
    view.line({ points: '#vecB', color: 0xe53e3e, width: 6 });
    view.point({ points: '#vecB', color: 0xe53e3e, size: 10 });

    // Vector A+B: (0,0) -> (3,3) shown as dashed result
    view.interval({
      id: 'vecSum',
      width: 2,
      expr: function (emit, x, i) {
        if (i === 0) emit(0, 0);
        else emit(3, 3);
      },
      channels: 2,
    });
    view.line({ points: '#vecSum', color: 0x38a169, width: 4 });
    view.point({ points: '#vecSum', color: 0x38a169, size: 10 });

    return () => {
      three.renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="vector-container">
      <h1 className="vector-title">What is a Vector?</h1>

      <section className="vector-section">
        <h2>Live Demo</h2>
        <p>A simple 2D vector plotted using MathBox:</p>
        <div ref={mathboxRef} className="mathbox-canvas" />
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
