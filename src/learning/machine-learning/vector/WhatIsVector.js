import React, { useState, useCallback } from 'react';
import './WhatIsVector.css';
import VectorAdditionCanvas from '../../../common/mathbox/VectorAdditionCanvas';
import VectorScalingCanvas from '../../../common/mathbox/VectorScalingCanvas';
import useMathJax from '../../../common/hooks/useMathJax';

const fmt = (n) => +n.toFixed(1);

function WhatIsVector() {
  const mathReady = useMathJax();

  const [a, setA] = useState({ x: 2, y: 1 });
  const [b, setB] = useState({ x: 1, y: 2 });
  const [v, setV] = useState({ x: 2, y: 1 });

  const handleAddDrag = useCallback((idx, { x, y }) => {
    if (idx === 0) setA({ x: fmt(x), y: fmt(y) });
    else setB({ x: fmt(x), y: fmt(y) });
  }, []);

  const handleScaleDrag = useCallback(({ x, y }) => {
    setV({ x: fmt(x), y: fmt(y) });
  }, []);

  const sum = { x: fmt(a.x + b.x), y: fmt(a.y + b.y) };

  return (
    <div className="vector-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>
      <section className="vector-section">
        <h1 className="vector-title">What is a Vector?</h1>
        <p className="vector-lead">
          A <strong>vector</strong> is any object living inside a <em>vector space</em>. And
          vector space is like a gated society: a collection {'$V$'} with two strict rules, and
          whatever you do, you must stay inside {'$V$'} only. The two rules:
        </p>
      </section>

      <div className="axiom-list">
        <div className="axiom-card">
          <div className="axiom">
            <span className="axiom-name">Closure under addition</span>
            <span className="axiom-math">
              {'$\\mathbf{u}, \\mathbf{v} \\in V \\implies \\mathbf{u} + \\mathbf{v} \\in V$'}
            </span>
            <span className="axiom-gloss">
              Add any two objects, and the answer must land back in the same collection. No
              escaping.
            </span>
          </div>
          <div className="axiom-example">
            <p className="example-caption">
              <strong style={{ color: '#4f46e5' }}>
                a ({a.x},{a.y})
              </strong>{' '}
              and{' '}
              <strong style={{ color: '#e53e3e' }}>
                b ({b.x},{b.y})
              </strong>{' '}
              add tip-to-tail. Their{' '}
              <strong style={{ color: '#059669' }}>
                sum ({sum.x},{sum.y})
              </strong>{' '}
              is the diagonal of the parallelogram. Still a 2D arrow, still inside the same
              space. Rule followed.
            </p>
            <VectorAdditionCanvas a={{ x: 2, y: 1 }} b={{ x: 1, y: 2 }} onDrag={handleAddDrag} />
            <p className="canvas-note">
              Try any two vectors, drag them anywhere. Their sum is always another 2D vector.
              Always.
            </p>
          </div>
        </div>

        <div className="axiom-card">
          <div className="axiom">
            <span className="axiom-name">Closure under scalar multiplication</span>
            <span className="axiom-math">
              {'$\\mathbf{v} \\in V,\\; c \\in \\mathbb{R} \\implies c\\mathbf{v} \\in V$'}
            </span>
            <span className="axiom-gloss">
              Multiply any object by any real number, and again you must land back in the same
              collection.
            </span>
          </div>
          <div className="axiom-example">
            <p className="example-caption">
              Starting from{' '}
              <strong style={{ color: '#4f46e5' }}>
                v ({v.x},{v.y})
              </strong>
              : multiplying by <strong style={{ color: '#059669' }}>2</strong> stretches it,{' '}
              <strong style={{ color: '#d97706' }}>0.5</strong> shrinks it, and{' '}
              <strong style={{ color: '#e53e3e' }}>-1</strong> flips it fully. But see, all of
              them stay on the same line through the origin. Nobody leaves the line.
            </p>
            <VectorScalingCanvas
              vector={{ x: 2, y: 1 }}
              scalars={[
                { c: 2, color: 0x059669 },
                { c: 0.5, color: 0xd97706 },
                { c: -1, color: 0xe53e3e },
              ]}
              onDrag={handleScaleDrag}
            />
            <p className="canvas-note">
              Every scaled version is still a 2D vector. The scalar can be anything: positive,
              fraction, negative, does not matter.
            </p>
          </div>
        </div>
      </div>

      <p className="vector-closing">
        And that's the full definition, done. The objects can be anything: arrows, polynomials,
        audio signals, images. Two rules pass, vector space it is. That simple.
      </p>
    </div>
  );
}

export default WhatIsVector;
