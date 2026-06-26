import React from 'react';
import './WhatIsVector.css';
import VectorAdditionCanvas from '../../../common/mathbox/VectorAdditionCanvas';
import VectorScalingCanvas from '../../../common/mathbox/VectorScalingCanvas';
import useMathJax from '../../../common/hooks/useMathJax';

function WhatIsVector() {
  const mathReady = useMathJax();

  return (
    <div className="vector-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>
      <h1 className="vector-title">What is a Vector?</h1>

      <section className="vector-section">
        <p className="vector-lead">
          A <strong>vector</strong> is any object that lives inside a <em>vector space</em> — a
          collection of objects {'$V$'} where two operations are always defined and always stay
          inside {'$V$'}:
        </p>
      </section>

      <section className="vector-section">
        <div className="axiom-card">
          <div className="axiom">
            <span className="axiom-name">Closure under addition</span>
            <span className="axiom-math">
              {'$\\mathbf{u}, \\mathbf{v} \\in V \\implies \\mathbf{u} + \\mathbf{v} \\in V$'}
            </span>
            <span className="axiom-gloss">
              Add two objects — you must land back in the same collection.
            </span>
          </div>
          <div className="axiom-example">
            <p className="example-caption">
              <strong style={{ color: '#4f46e5' }}>a (2,1)</strong> and{' '}
              <strong style={{ color: '#e53e3e' }}>b (1,2)</strong> add tip-to-tail. Their{' '}
              <strong style={{ color: '#059669' }}>sum (3,3)</strong> is the diagonal of the
              parallelogram — still a 2D arrow, still inside the same space.
            </p>
            <VectorAdditionCanvas a={{ x: 2, y: 1 }} b={{ x: 1, y: 2 }} />
            <p className="canvas-note">
              No matter which two 2D vectors you pick, their sum is always another 2D vector.
            </p>
          </div>
        </div>
      </section>

      <section className="vector-section">
        <div className="axiom-card">
          <div className="axiom">
            <span className="axiom-name">Closure under scalar multiplication</span>
            <span className="axiom-math">
              {'$\\mathbf{v} \\in V,\\; c \\in \\mathbb{R} \\implies c\\mathbf{v} \\in V$'}
            </span>
            <span className="axiom-gloss">
              Scale any object by a real number — you must land back in the same collection.
            </span>
          </div>
          <div className="axiom-example">
            <p className="example-caption">
              Starting from <strong style={{ color: '#4f46e5' }}>v (2,1)</strong>: multiplying by{' '}
              <strong style={{ color: '#059669' }}>2</strong> stretches it,{' '}
              <strong style={{ color: '#d97706' }}>0.5</strong> shrinks it, and{' '}
              <strong style={{ color: '#e53e3e' }}>−1</strong> flips it — but all results stay on
              the same line through the origin.
            </p>
            <VectorScalingCanvas
              vector={{ x: 2, y: 1 }}
              scalars={[
                { c: 2, color: 0x059669 },
                { c: 0.5, color: 0xd97706 },
                { c: -1, color: 0xe53e3e },
              ]}
            />
            <p className="canvas-note">
              Every scaled version is still a 2D vector. The scalar can be any real number —
              positive, fractional, or negative.
            </p>
          </div>
        </div>
      </section>

      <section className="vector-section">
        <p className="vector-lead">
          That's the whole definition. The objects can be anything — arrows, polynomials, audio
          signals, images — as long as both rules hold.
        </p>
      </section>
    </div>
  );
}

export default WhatIsVector;
