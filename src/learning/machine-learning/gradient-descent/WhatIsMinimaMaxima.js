import React, { useRef, useState } from 'react';
import useDesmosCalculator from '../../../common/desmos/useDesmosCalculator';
import useMathJax from '../../../common/hooks/useMathJax';
import './WhatIsMinimaMaxima.css';

function df(x) {
  return x ** 3 - 3 * x ** 2 - x + 3.4;
}

const CRITICAL_XS = [-1.1, 1.1, 2.9];
// Snapping in slope-space (not x-space) keeps the pull equally gentle at all
// three points, even though the curve bends more sharply near the global min.
const SNAP_SLOPE = 0.35;

function DesmosGraph({ onSlopeChange, resetRef }) {
  const containerRef = useRef(null);

  useDesmosCalculator(containerRef, (calculator, Desmos) => {
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

    // Observe slider `a` and push slope to parent. Snapping mid-drag fights
    // Desmos's own per-frame writes to `a` and makes the point stutter, so
    // the live drag is left untouched here and snapping happens on release.
    let lastA = 0.5;
    calculator.observe('expressionAnalysis', () => {
      const analysis = calculator.expressionAnalysis['a'];
      if (analysis && analysis.evaluation && analysis.evaluation.value != null) {
        lastA = analysis.evaluation.value;
        onSlopeChange(df(lastA));
      }
    });

    function snapOnRelease() {
      const nearest = CRITICAL_XS.reduce((best, cx) =>
        Math.abs(cx - lastA) < Math.abs(best - lastA) ? cx : best,
      );
      if (Math.abs(df(lastA)) < SNAP_SLOPE && nearest !== lastA) {
        calculator.setExpression({ id: 'a', latex: `a = ${nearest}` });
        lastA = nearest;
        onSlopeChange(df(nearest));
      }
    }
    containerRef.current.addEventListener('pointerup', snapOnRelease);

    if (resetRef) {
      resetRef.current = () => {
        calculator.setExpression({ id: 'a', latex: 'a = 0.5' });
        calculator.setMathBounds({ left: -3, right: 5, bottom: -4, top: 4 });
        // observe('expressionAnalysis') doesn't reliably re-fire on programmatic resets, so push the slope directly
        onSlopeChange(df(0.5));
      };
    }
  });

  return <div ref={containerRef} className="mm-desmos-container" />;
}

function WhatIsMinimaMaxima() {
  const mathReady = useMathJax();
  const [slope, setSlope] = useState(df(0.5));
  const resetRef = useRef(null);

  const slopeSign = slope > 0.01 ? 'pos' : slope < -0.01 ? 'neg' : 'zero';
  const slopeLabel =
    slope > 0.01
      ? 'Uphill. Gradient descent will step left.'
      : slope < -0.01
        ? 'Downhill. Gradient descent will step right.'
        : 'Flat. Turning point, this is the spot.';

  return (
    <div className="mm-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>
      <h1 className="mm-title">Minima and Maxima</h1>
      <p className="mm-lead">
        Gradient descent has one job only: find the lowest point of a function. But most real
        functions have many valleys, and where you start decides which valley you fall into. So
        before running the algorithm, first learn to read a curve properly: where it goes up,
        where it goes down, and what exactly makes a point a min or a max.
      </p>

      <div className="mm-layout">
        <div className="mm-left">
          <div className="mm-block">
            <span className="mm-block-label">The curve</span>
            <p className="mm-math">{'$$f(x) = \\dfrac{x^4}{4} - x^3 - \\dfrac{x^2}{2} + 3.4x$$'}</p>
          </div>

          <div className="mm-block">
            <span className="mm-block-label">Slope = derivative</span>
            <p className="mm-text">
              Slope at any point is just {"$f'(x)$"}, the derivative. Simple funda: plug in an x,
              check the sign of the answer, and it tells you which way the curve is tilting there.
            </p>
            <p className="mm-math">{"$$f'(x) = x^3 - 3x^2 - x + 3.4$$"}</p>
            <div className="mm-example-grid">
              <div className="mm-example-row">
                <span className="mm-example-x">x = -2</span>
                <span className="mm-example-eq">{"$f'(-2) = -14.6$"}</span>
                <span className="mm-badge badge-neg">negative</span>
                <span className="mm-example-note">Downhill, descent steps right.</span>
              </div>
              <div className="mm-example-row">
                <span className="mm-example-x">x = 0</span>
                <span className="mm-example-eq">{"$f'(0) = 3.4$"}</span>
                <span className="mm-badge badge-pos">positive</span>
                <span className="mm-example-note">Uphill, descent steps left.</span>
              </div>
              <div className="mm-example-row">
                <span className="mm-example-x">x = 1.1</span>
                <span className="mm-example-eq">{"$f'(1.1) = 0$"}</span>
                <span className="mm-badge badge-zero">zero</span>
                <span className="mm-example-note">Flat, a turning point.</span>
              </div>
            </div>
          </div>

          <div className="mm-block">
            <span className="mm-block-label">Local vs. global</span>
            <p className="mm-def">
              <strong>Local minimum:</strong> lower than every point right around it, {"$f'(x)$"}{' '}
              flips negative to positive as you pass through.
            </p>
            <p className="mm-def">
              <strong>Local maximum:</strong> higher than every point right around it, {"$f'(x)$"}{' '}
              flips positive to negative.
            </p>
            <p className="mm-def">
              <strong>Global minimum:</strong> the lowest value in the entire domain, not just in
              the neighbourhood. Every local min is like a district topper, but global min is the
              all-India rank 1. Only one.
            </p>
          </div>
        </div>

        <div className="mm-right">
          <div className="mm-graph-header">
            <span className="mm-graph-hint">Drag the point. Zoom and pan freely.</span>
            <button className="mm-reset-btn" onClick={() => resetRef.current && resetRef.current()}>
              Reset view
            </button>
          </div>
          <DesmosGraph onSlopeChange={setSlope} resetRef={resetRef} />
          <div className="mm-slope-readout">
            <span className={`mm-slope-pill slope-${slopeSign}`}>
              slope = {slope >= 0 ? '+' : ''}
              {slope.toFixed(2)}
            </span>
            <span className="mm-slope-desc">{slopeLabel}</span>
          </div>
          <div className="mm-legend">
            <span className="mm-legend-item">
              <span className="mm-dot dot-gmin" /> Global min, x &asymp; -1.1
            </span>
            <span className="mm-legend-item">
              <span className="mm-dot dot-lmax" /> Local max, x &asymp; 1.1
            </span>
            <span className="mm-legend-item">
              <span className="mm-dot dot-lmin" /> Local min, x &asymp; 2.9
            </span>
          </div>
        </div>
      </div>

      <div className="mm-block mm-block-full">
        <span className="mm-block-label">Why it matters</span>
        <p className="mm-text">
          Here is the thing: gradient descent can only see the slope where it is standing. Like
          walking downhill in full fog. It walks down, hits a flat spot, and stops. It has no clue
          whether this is the best valley or just the nearest one.
        </p>
        <p className="mm-text">
          Start left of the peak here, you roll into the global min. Lucky. Start right, you get
          stuck in the shallow local min. Poor fellow. Same algorithm, same rule, different
          answer. This is exactly why initialization and learning rate matter so much.
        </p>
      </div>
    </div>
  );
}

export default WhatIsMinimaMaxima;
