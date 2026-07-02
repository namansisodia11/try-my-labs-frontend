import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useDesmosCalculator from '../../../common/desmos/useDesmosCalculator';
import useMathJax from '../../../common/hooks/useMathJax';
import './WhatIsGradientDescent.css';

function f(x) {
  return x ** 4 / 4 - x ** 3 - x ** 2 / 2 + 3.4 * x;
}

function df(x) {
  return x ** 3 - 3 * x ** 2 - x + 3.4;
}

const START_RANGE = [-2.8, 4.5];
const LEARNING_RATES = [0.02, 0.05, 0.1, 0.3];

function randomStartX() {
  const [min, max] = START_RANGE;
  return min + Math.random() * (max - min);
}

function DesmosGraph({ x, startX, trail, onPick, resetRef }) {
  const containerRef = useRef(null);
  const maxTrailRef = useRef(0);
  const lastSyncedARef = useRef(startX);
  const calcRef = useDesmosCalculator(containerRef, (calculator, Desmos) => {
    calculator.setMathBounds({ left: -3, right: 5, bottom: -4, top: 4 });

    calculator.setExpression({
      id: 'curve',
      latex: 'y = \\frac{x^4}{4} - x^3 - \\frac{x^2}{2} + 3.4x',
      color: '#e85d4a',
      lineWidth: 3,
    });

    calculator.setExpression({ id: 'a', latex: `a = ${startX}` });

    calculator.setExpression({
      id: 'pick-ring',
      latex: '(a, \\frac{a^4}{4} - a^3 - \\frac{a^2}{2} + 3.4a)',
      color: '#1a1a2e',
      pointSize: 22,
      dragMode: Desmos.DragModes.X,
    });
    calculator.setExpression({
      id: 'pick',
      latex: '(a, \\frac{a^4}{4} - a^3 - \\frac{a^2}{2} + 3.4a)',
      color: '#ffffff',
      pointSize: 12,
      dragMode: Desmos.DragModes.NONE,
      secret: true,
    });

    calculator.observe('expressionAnalysis', () => {
      const analysis = calculator.expressionAnalysis['a'];
      if (analysis && analysis.evaluation && analysis.evaluation.value != null) {
        const value = analysis.evaluation.value;
        if (Math.abs(value - lastSyncedARef.current) > 1e-9) {
          onPick(value);
        }
      }
    });

    if (resetRef) {
      resetRef.current = (newStartX) => {
        for (let i = 0; i < maxTrailRef.current; i++) {
          calculator.removeExpression({ id: `trail-${i}` });
        }
        calculator.removeExpression({ id: 'path' });
        maxTrailRef.current = 0;
        lastSyncedARef.current = newStartX;
        calculator.setExpression({ id: 'a', latex: `a = ${newStartX}` });
        calculator.setMathBounds({ left: -3, right: 5, bottom: -4, top: 4 });
      };
    }
  });

  React.useEffect(() => {
    const calculator = calcRef.current;
    if (!calculator) return;

    trail.forEach((tx, i) => {
      calculator.setExpression({
        id: `trail-${i}`,
        latex: `(${tx}, ${f(tx)})`,
        color: '#e85d4a',
        pointSize: 9,
        pointOpacity: 0.55,
      });
    });
    maxTrailRef.current = Math.max(maxTrailRef.current, trail.length);

    if (trail.length > 0) {
      const points = [...trail, x].map((tx) => `(${tx},${f(tx)})`).join(',');
      calculator.setExpression({
        id: 'path',
        latex: `[${points}]`,
        lines: true,
        points: false,
        color: '#1a1a2e',
        lineOpacity: 0.35,
        lineWidth: 1.5,
      });
    }

    lastSyncedARef.current = x;
    calculator.setExpression({ id: 'a', latex: `a = ${x}` });
  }, [x, trail, calcRef]);

  return <div ref={containerRef} className="gd-desmos-container" />;
}

function WhatIsGradientDescent() {
  const mathReady = useMathJax();
  const [startX] = useState(randomStartX);
  const [x, setX] = useState(startX);
  const [trail, setTrail] = useState([]);
  const [history, setHistory] = useState([]);
  const [rate, setRate] = useState(0.1);
  const [running, setRunning] = useState(false);
  const resetRef = useRef(null);
  const xRef = useRef(x);
  xRef.current = x;
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const intervalRef = useRef(null);

  const slope = df(x);
  const step = -rate * slope;
  const converged = Math.abs(slope) < 0.01;

  function stopRun() {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function takeStep() {
    const curX = xRef.current;
    const curSlope = df(curX);
    if (Math.abs(curSlope) < 0.01) {
      stopRun();
      return;
    }
    const curStep = -rateRef.current * curSlope;
    const xNew = curX + curStep;
    setHistory((h) => [...h, { x: curX, fx: f(curX), slope: curSlope, step: curStep, xNew }]);
    setTrail((t) => [...t, curX]);
    setX(xNew);
  }

  function handleStart() {
    if (converged || running) return;
    setRunning(true);
    intervalRef.current = setInterval(takeStep, 500);
  }

  function handleReset() {
    stopRun();
    setX(startX);
    setTrail([]);
    setHistory([]);
    if (resetRef.current) resetRef.current(startX);
  }

  function handlePick(newX) {
    stopRun();
    setX(newX);
    setTrail([]);
    setHistory([]);
  }

  React.useEffect(() => stopRun, []);

  return (
    <div className="gd-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>
      <h1 className="gd-title">Gradient Descent</h1>
      <p className="gd-lead">
        Gradient descent is how a lot of machine learning actually learns: start somewhere, check
        which way is downhill, take a small step, repeat. No formula for the minimum, just a rule
        for moving closer to it. If you haven't seen how to read a curve's slope yet, check out{' '}
        <Link to="/learning/machine-learning/what-is-minima-maxima">Minima and Maxima</Link> first.
      </p>

      <div className="gd-layout">
        <div className="gd-left">
          <div className="gd-block">
            <span className="gd-block-label">The update rule</span>
            <p className="gd-text">
              At every step, move a little in the opposite direction of the slope. That's it, that's
              the whole algorithm.
            </p>
            <p className="gd-math">{"$$x_{new} = x - \\alpha \\cdot f'(x)$$"}</p>
            <p className="gd-text">
              {'$\\alpha$'} is the <strong>learning rate</strong>, how big a step to take. Too small
              and you crawl forever. Too big and you overshoot the valley entirely.
            </p>
          </div>

          <div className="gd-block">
            <span className="gd-block-label">Right now</span>
            <div className="gd-readout-grid">
              <div className="gd-readout">
                <span className="gd-readout-label">x</span>
                <span className="gd-readout-value">{x.toFixed(3)}</span>
              </div>
              <div className="gd-readout">
                <span className="gd-readout-label">f(x)</span>
                <span className="gd-readout-value">{f(x).toFixed(3)}</span>
              </div>
              <div className="gd-readout">
                <span className="gd-readout-label">{"f'(x)"}</span>
                <span className="gd-readout-value">{slope.toFixed(3)}</span>
              </div>
              <div className="gd-readout">
                <span className="gd-readout-label">step</span>
                <span className="gd-readout-value">
                  {step >= 0 ? '+' : ''}
                  {step.toFixed(3)}
                </span>
              </div>
            </div>
            {converged && <p className="gd-converged">Slope is basically zero, you've landed.</p>}
          </div>

          <div className="gd-block">
            <span className="gd-block-label">Learning rate {'$\\alpha$'}</span>
            <div className="gd-rate-row">
              {LEARNING_RATES.map((r) => (
                <button
                  key={r}
                  className={`gd-rate-btn ${rate === r ? 'active' : ''}`}
                  onClick={() => setRate(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="gd-text gd-rate-hint">
              Try 0.3: watch it overshoot past the valley before settling down.
            </p>
          </div>
        </div>

        <div className="gd-right">
          <div className="gd-graph-header">
            <span className="gd-graph-hint">Drag the point to choose a start.</span>
            <button className="gd-reset-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
          <DesmosGraph
            x={x}
            startX={startX}
            trail={trail}
            onPick={handlePick}
            resetRef={resetRef}
          />
          <button
            className={`gd-step-btn ${running ? 'running' : ''}`}
            onClick={running ? stopRun : handleStart}
            disabled={converged}
          >
            {converged ? 'Converged' : running ? 'Stop' : 'Start'}
          </button>

          {history.length > 0 && (
            <div className="gd-history">
              {history.map((h, i) => (
                <div className="gd-history-row" key={i}>
                  <span className="gd-history-step">{i + 1}</span>
                  <span className="gd-history-calc">
                    {h.xNew.toFixed(3)} = {h.x.toFixed(3)} &minus; {rate} &times;{' '}
                    {h.slope >= 0 ? '' : '('}
                    {h.slope.toFixed(3)}
                    {h.slope >= 0 ? '' : ')'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="gd-block gd-block-full">
        <span className="gd-block-label">Why it can go wrong</span>
        <p className="gd-text">
          Gradient descent only ever looks at the slope right under its feet. It has no idea whether
          the valley it's falling into is the deepest one on the curve, or just the closest. Start
          on the wrong side of a bump and you'll converge to a local minimum instead of the global
          one.
        </p>
        <p className="gd-text">
          The learning rate matters just as much as the starting point. Too small wastes steps
          crawling toward the answer. Too large and each step can fling you past the minimum, and if
          it's large enough, the whole thing diverges instead of converging.
        </p>
      </div>
    </div>
  );
}

export default WhatIsGradientDescent;
