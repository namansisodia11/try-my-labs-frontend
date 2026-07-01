import React from 'react';
import './WhatIsMinimaMaxima.css';
import GradientDescentCurveCanvas from '../../../common/mathbox/GradientDescentCurveCanvas';
import useMathJax from '../../../common/hooks/useMathJax';

function WhatIsMinimaMaxima() {
  const mathReady = useMathJax();

  return (
    <div className="minima-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>

      <section className="minima-section">
        <h1 className="minima-title">Minima and Maxima</h1>
        <p className="minima-lead">
          Gradient descent has one job: find the lowest point of a function. But most real
          functions don't have just one valley. They have several, and the algorithm can fall
          into any of them depending on where it starts.
        </p>
        <p className="minima-lead">
          Before we run gradient descent, we need to learn how to read a curve: where is it
          going up, where is it going down, and what makes a point a minimum or a maximum?
        </p>
      </section>

      <section className="minima-section">
        <h2 className="minima-subtitle">The curve</h2>
        <div className="minima-formula-block">
          <span className="minima-formula">{'$f(x) = \\frac{x^4}{4} - x^3 - \\frac{x^2}{2} + 3.4x$'}</span>
          <span className="minima-formula-caption">
            Asymmetric. Two valleys, one peak, all at different heights.
          </span>
        </div>
        <p className="minima-caption">
          Drag the dot along the curve. The tangent line rotates with it and the slope value
          updates live. At each labeled dot the tangent is perfectly flat: slope = 0.
        </p>
        <GradientDescentCurveCanvas />
      </section>

      <section className="minima-section">
        <h2 className="minima-subtitle">What the slope is telling you</h2>
        <p className="minima-lead">
          The slope at any point is the derivative {'$f\'(x)$'}. It tells you which way the
          function is tilting right there.
        </p>
        <div className="minima-slope-grid">
          <div className="minima-slope-row">
            <span className="minima-slope-badge">{'$f\'(x) > 0$'}</span>
            <p>Slope is positive. Going uphill to the right. Gradient descent steps left.</p>
          </div>
          <div className="minima-slope-row">
            <span className="minima-slope-badge">{'$f\'(x) < 0$'}</span>
            <p>Slope is negative. Going downhill to the right. Gradient descent steps right.</p>
          </div>
          <div className="minima-slope-row">
            <span className="minima-slope-badge">{'$f\'(x) = 0$'}</span>
            <p>Slope is zero. The curve has flattened out: you're at a turning point.</p>
          </div>
        </div>
        <p className="minima-lead" style={{ marginTop: 16 }}>
          For this curve, {'$f\'(x) = x^3 - 3x^2 - x + 3.4$'}. It has three zeros near
          {'$x \\approx -1.1$'}, {'$x \\approx 1.1$'}, and {'$x \\approx 2.9$'}. Drag the dot to
          any of them and the tangent goes perfectly horizontal.
        </p>
      </section>

      <section className="minima-section">
        <h2 className="minima-subtitle">Local vs. Global</h2>
        <div className="minima-card-grid">
          <div className="minima-card">
            <span className="minima-card-label local-min">Local Minimum</span>
            <p>
              Lower than everything immediately around it. The slope goes from negative to
              positive as you pass through. {'$f\'(x) = 0$'} and the curve is concave up.
            </p>
            <p className="minima-card-note">
              One at {'$x \\approx 2.9$'}, {'$f \\approx -1.05$'}.
            </p>
          </div>
          <div className="minima-card">
            <span className="minima-card-label local-max">Local Maximum</span>
            <p>
              Higher than everything immediately around it. Slope goes from positive to negative.
              {'$f\'(x) = 0$'} but the curve is concave down.
            </p>
            <p className="minima-card-note">
              One peak at {'$x \\approx 1.1$'}, {'$f \\approx 2.17$'}.
            </p>
          </div>
          <div className="minima-card">
            <span className="minima-card-label global-min">Global Minimum</span>
            <p>
              The absolute lowest value across the whole domain. Every local minimum is a
              candidate, but only the lowest one is global.
            </p>
            <p className="minima-card-note">
              The deeper valley is at {'$x \\approx -1.1$'}, {'$f \\approx -2.65$'}. That's the global minimum.
            </p>
          </div>
        </div>
      </section>

      <section className="minima-section">
        <h2 className="minima-subtitle">Why this matters for gradient descent</h2>
        <p className="minima-lead">
          Gradient descent only sees the slope at its current position. It steps downhill, reaches
          a flat point, and stops. It has no idea whether it found the global minimum or just a
          local one.
        </p>
        <p className="minima-lead">
          On this curve, start to the left of the peak at {'$x \\approx 1.1$'} and you roll into
          the global minimum at {'$x \\approx -1.1$'}. Start to the right and you fall into the
          shallower local minimum at {'$x \\approx 2.9$'}. The algorithm has no idea it missed the
          deeper valley. It stopped because the slope hit zero, not because it found the best answer.
        </p>
        <p className="minima-lead">
          In real machine learning the valleys are rarely equal. That's why initialization and
          learning rate matter so much: they control which valley you end up in.
        </p>
      </section>

    </div>
  );
}

export default WhatIsMinimaMaxima;
