import React, { useEffect, useRef, useState } from 'react';
import './WhatIsMinimaMaximaV2.css';

function df(x) {
  return x ** 3 - 3 * x ** 2 - x + 3.4;
}

function DesmosGraph({ onSlopeChange, resetRef }) {
  const containerRef = useRef(null);
  const calculatorRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function initDesmos() {
      if (cancelled || !window.Desmos || !containerRef.current) return;
      const Desmos = window.Desmos;
      const calculator = Desmos.GraphingCalculator(containerRef.current, {
        expressions: false,
        settingsMenu: false,
        zoomButtons: false,
        lockViewport: false,
        border: false,
      });
      calculator.setMathBounds({ left: -3, right: 5, bottom: -4, top: 4 });

      // Curve
      calculator.setExpression({
        id: 'curve',
        latex: 'y = \\frac{x^4}{4} - x^3 - \\frac{x^2}{2} + 3.4x',
        color: '#e85d4a',
        lineWidth: 3,
      });

      // Slider variable for draggable point x-position
      calculator.setExpression({ id: 'a', latex: 'a = 0.5' });

      // Tangent line through (a, f(a)) with slope f'(a)
      // y = f'(a)*(x - a) + f(a)  =>  stored as a full line expression
      calculator.setExpression({
        id: 'tangent',
        latex: 'y = (a^3 - 3a^2 - a + 3.4)(x - a) + (\\frac{a^4}{4} - a^3 - \\frac{a^2}{2} + 3.4a)',
        color: '#f59e0b',
        lineWidth: 2,
      });

      // Draggable point — colored ring underneath, white fill on top
      calculator.setExpression({
        id: 'drag-ring',
        latex: '(a, \\frac{a^4}{4} - a^3 - \\frac{a^2}{2} + 3.4a)',
        color: '#e85d4a',
        pointSize: 28,
        dragMode: Desmos.DragModes.X,
      });
      calculator.setExpression({
        id: 'drag',
        latex: '(a, \\frac{a^4}{4} - a^3 - \\frac{a^2}{2} + 3.4a)',
        color: '#ffffff',
        pointSize: 16,
        dragMode: Desmos.DragModes.NONE,
        secret: true,
      });

      // Critical-point markers
      calculator.setExpression({
        id: 'gmin',
        latex: '(-1.1, -2.65)',
        color: '#b94035',
        pointSize: 12,
        label: 'Global min',
        showLabel: true,
      });
      calculator.setExpression({
        id: 'lmax',
        latex: '(1.1, 2.17)',
        color: '#f59e0b',
        pointSize: 12,
        label: 'Local max',
        showLabel: true,
      });
      calculator.setExpression({
        id: 'lmin',
        latex: '(2.9, -1.05)',
        color: '#e85d4a',
        pointSize: 12,
        label: 'Local min',
        showLabel: true,
      });

      // Observe slider `a` and push slope to parent
      calculator.observe('expressionAnalysis', () => {
        const analysis = calculator.expressionAnalysis['a'];
        if (analysis && analysis.evaluation && analysis.evaluation.value != null) {
          const aVal = analysis.evaluation.value;
          onSlopeChange(df(aVal));
        }
      });

      calculatorRef.current = calculator;

      if (resetRef) {
        resetRef.current = () => {
          calculator.setExpression({ id: 'a', latex: 'a = 0.5' });
          calculator.setMathBounds({ left: -3, right: 5, bottom: -4, top: 4 });
          // observe('expressionAnalysis') doesn't reliably re-fire on programmatic resets, so push the slope directly
          onSlopeChange(df(0.5));
        };
      }
    }

    let poll;

    if (window.Desmos) {
      initDesmos();
    } else {
      // Desmos CDN script not yet loaded — inject it once
      if (!document.getElementById('desmos-script')) {
        const script = document.createElement('script');
        script.id = 'desmos-script';
        script.src =
          'https://www.desmos.com/api/v1.9/calculator.js?apiKey=63bf3722472543709cad20a4196e40c9';
        script.async = true;
        script.onload = initDesmos;
        document.head.appendChild(script);
      } else {
        // Script tag exists but hasn't fired onload yet — poll briefly
        poll = setInterval(() => {
          if (window.Desmos) {
            clearInterval(poll);
            initDesmos();
          }
        }, 100);
      }
    }

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      if (calculatorRef.current) calculatorRef.current.destroy();
      calculatorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="desmos-container" />;
}

function WhatIsMinimaMaximaV2() {
  const [slope, setSlope] = useState(df(0.5));
  const resetRef = useRef(null);

  const slopeSign = slope > 0.01 ? 'pos' : slope < -0.01 ? 'neg' : 'zero';
  const slopeLabel =
    slope > 0.01
      ? 'Going uphill. Gradient descent steps left.'
      : slope < -0.01
        ? 'Going downhill. Gradient descent steps right.'
        : "Flat. You're at a turning point.";

  return (
    <div className="v2-container">
      <section className="v2-section">
        <h1 className="v2-title">Minima and Maxima</h1>
        <p className="v2-lead">
          Gradient descent has one job: find the lowest point of a function. But most real functions
          don't have just one valley. They have several, and the algorithm can fall into any of them
          depending on where it starts.
        </p>
        <p className="v2-lead">
          Before we run gradient descent, we need to learn how to read a curve: where is it going
          up, where is it going down, and what makes a point a minimum or a maximum?
        </p>
      </section>

      <section className="v2-section">
        <h2 className="v2-subtitle">The curve</h2>
        <div className="v2-formula-block">
          <code className="v2-formula">f(x) = x&#x2074;/4 - x&#x00B3; - x&#x00B2;/2 + 3.4x</code>
          <span className="v2-formula-caption">
            Two valleys, one peak, all at different heights.
          </span>
        </div>
        <p className="v2-caption">
          Drag the white dot along the curve. The tangent line and slope update live. Zoom and pan
          freely too.
        </p>
        <div className="v2-graph-header">
          <button className="v2-reset-btn" onClick={() => resetRef.current && resetRef.current()}>
            Reset view
          </button>
        </div>
        <DesmosGraph onSlopeChange={setSlope} resetRef={resetRef} />
        <div className="v2-slope-readout">
          <span className={`v2-slope-pill slope-${slopeSign}`}>
            slope = {slope >= 0 ? '+' : ''}
            {slope.toFixed(2)}
          </span>
          <span className="v2-slope-desc">{slopeLabel}</span>
        </div>
      </section>

      <section className="v2-section">
        <h2 className="v2-subtitle">What the slope is telling you</h2>
        <p className="v2-lead">
          The slope at any point is the derivative f'(x). It tells you which way the function is
          tilting right there.
        </p>
        <div className="v2-slope-grid">
          <div className="v2-slope-row">
            <span className="v2-badge badge-pos">f'(x) &gt; 0</span>
            <p>Going uphill to the right. Gradient descent steps left.</p>
          </div>
          <div className="v2-slope-row">
            <span className="v2-badge badge-neg">f'(x) &lt; 0</span>
            <p>Going downhill to the right. Gradient descent steps right.</p>
          </div>
          <div className="v2-slope-row">
            <span className="v2-badge badge-zero">f'(x) = 0</span>
            <p>Slope is zero. You're at a turning point.</p>
          </div>
        </div>
        <p className="v2-lead" style={{ marginTop: 16 }}>
          For this curve, f'(x) = x&#x00B3; - 3x&#x00B2; - x + 3.4. It has three zeros near x
          &asymp; -1.1, x &asymp; 1.1, and x &asymp; 2.9.
        </p>
      </section>

      <section className="v2-section">
        <h2 className="v2-subtitle">Local vs. Global</h2>
        <div className="v2-card-grid">
          <div className="v2-card">
            <span className="v2-card-label label-lmin">Local Minimum</span>
            <p>
              Lower than everything immediately around it. Slope goes from negative to positive as
              you pass through.
            </p>
            <p className="v2-card-note">One at x &asymp; 2.9, f &asymp; -1.05.</p>
          </div>
          <div className="v2-card">
            <span className="v2-card-label label-lmax">Local Maximum</span>
            <p>
              Higher than everything immediately around it. Slope goes from positive to negative.
            </p>
            <p className="v2-card-note">One peak at x &asymp; 1.1, f &asymp; 2.17.</p>
          </div>
          <div className="v2-card">
            <span className="v2-card-label label-gmin">Global Minimum</span>
            <p>
              The absolute lowest value across the whole domain. Every local minimum is a candidate,
              but only the lowest one is global.
            </p>
            <p className="v2-card-note">The deeper valley is at x &asymp; -1.1, f &asymp; -2.65.</p>
          </div>
        </div>
      </section>

      <section className="v2-section">
        <h2 className="v2-subtitle">Why this matters for gradient descent</h2>
        <p className="v2-lead">
          Gradient descent only sees the slope at its current position. It steps downhill, reaches a
          flat point, and stops. It has no idea whether it found the global minimum or just a local
          one.
        </p>
        <p className="v2-lead">
          On this curve, start left of the peak at x &asymp; 1.1 and you roll into the global
          minimum at x &asymp; -1.1. Start right and you fall into the shallower local minimum at x
          &asymp; 2.9. The algorithm stopped because the slope hit zero, not because it found the
          best answer.
        </p>
        <p className="v2-lead">
          In real machine learning the valleys are rarely equal. That's why initialization and
          learning rate matter so much: they control which valley you end up in.
        </p>
      </section>
    </div>
  );
}

export default WhatIsMinimaMaximaV2;
