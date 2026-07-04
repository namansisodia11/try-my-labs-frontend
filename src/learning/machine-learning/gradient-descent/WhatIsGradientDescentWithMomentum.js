import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CurveDesmosGraph from '../../../common/desmos/CurveDesmosGraph';
import useMathJax from '../../../common/hooks/useMathJax';
import './WhatIsGradientDescentWithMomentum.css';

const CURVE_LATEX = 'y = \\frac{x^4}{4} - x^3 - \\frac{x^2}{2} + 3.4x';
const POINT_LATEX = (a) => `(${a}, \\frac{${a}^4}{4} - ${a}^3 - \\frac{${a}^2}{2} + 3.4${a})`;

function f(x) {
  return x ** 4 / 4 - x ** 3 - x ** 2 / 2 + 3.4 * x;
}

function df(x) {
  return x ** 3 - 3 * x ** 2 - x + 3.4;
}

const START_RANGE = [-1.9, 3.7];
const RATE = 0.1;
const BETAS = [0, 0.5, 0.8, 0.9];

function randomStartX() {
  const [min, max] = START_RANGE;
  return min + Math.random() * (max - min);
}

function WhatIsGradientDescentWithMomentum() {
  const mathReady = useMathJax();
  const [startX] = useState(randomStartX);
  const [x, setX] = useState(startX);
  const [prevX, setPrevX] = useState(startX);
  const [trail, setTrail] = useState([]);
  const [history, setHistory] = useState([]);
  const [beta, setBeta] = useState(0.8);
  const [running, setRunning] = useState(false);
  const [plainX, setPlainX] = useState(startX);
  const [plainTrail, setPlainTrail] = useState([]);
  const resetRef = useRef(null);
  const xRef = useRef(x);
  xRef.current = x;
  const prevXRef = useRef(prevX);
  prevXRef.current = prevX;
  const betaRef = useRef(beta);
  betaRef.current = beta;
  const plainXRef = useRef(plainX);
  plainXRef.current = plainX;
  const intervalRef = useRef(null);

  const slope = df(x);
  const lastStep = x - prevX;
  const converged = Math.abs(slope) < 0.01 && Math.abs(lastStep) < 0.01;

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
    const curLastStep = curX - prevXRef.current;
    const curStep = RATE * curSlope - betaRef.current * curLastStep;
    if (Math.abs(curSlope) < 0.01 && Math.abs(curStep) < 0.01) {
      stopRun();
      return;
    }
    const xNew = curX - curStep;
    setHistory((h) => [
      ...h,
      { x: curX, fx: f(curX), slope: curSlope, lastStep: curLastStep, xNew },
    ]);
    setTrail((t) => [...t, curX]);
    setPrevX(curX);
    setX(xNew);

    const curPlainX = plainXRef.current;
    if (Math.abs(df(curPlainX)) >= 0.01) {
      setPlainTrail((t) => [...t, curPlainX]);
      setPlainX(curPlainX - RATE * df(curPlainX));
    }
  }

  function handleStart() {
    if (converged || running) return;
    setRunning(true);
    intervalRef.current = setInterval(takeStep, 500);
  }

  function handleReset() {
    stopRun();
    const newX = randomStartX();
    setX(newX);
    setPrevX(newX);
    setTrail([]);
    setHistory([]);
    setPlainX(newX);
    setPlainTrail([]);
    if (resetRef.current) resetRef.current(newX);
  }

  function handlePick(newX) {
    stopRun();
    setX(newX);
    setPrevX(newX);
    setTrail([]);
    setHistory([]);
    setPlainX(newX);
    setPlainTrail([]);
    if (resetRef.current) resetRef.current(newX, { keepView: true });
  }

  React.useEffect(() => stopRun, []);

  return (
    <div className="gdwm-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>
      <h1 className="gdwm-title">Gradient Descent with Momentum</h1>
      <p className="gdwm-lead">
        Plain gradient descent has a short memory: it only looks at the slope right now. Momentum
        gives it a memory of where it's been, so it keeps moving in a direction it's already been
        heading, the same way a ball rolling downhill doesn't stop the instant the ground flattens
        out. If you haven't seen plain gradient descent yet, start with{' '}
        <Link to="/learning/machine-learning/what-is-gradient-descent">Gradient Descent</Link>{' '}
        first.
      </p>

      <div className="gdwm-layout">
        <div className="gdwm-left">
          <div className="gdwm-block">
            <span className="gdwm-block-label">The problem with plain descent</span>
            <p className="gdwm-text">
              Say step {'$i$'} is at {'$x_i$'}. Regular gradient descent gets to the next step using
              only the slope right there:
            </p>
            <p className="gdwm-math">{"$$x_{i+1} = x_i - \\alpha \\cdot f'(x_i)$$"}</p>
            <p className="gdwm-text">
              On a flat-ish stretch, the slope is tiny, so the steps are tiny too. It can take
              forever to cross a shallow valley floor.
            </p>
          </div>

          <div className="gdwm-block">
            <span className="gdwm-block-label">Adding memory</span>
            <p className="gdwm-text">
              Momentum takes the normal gradient step, then adds back a fraction of{' '}
              <strong>whatever step it took last time</strong>. That's the whole trick.
            </p>
            <p className="gdwm-math">
              {"$$x_{i+1} = x_i - \\alpha \\cdot f'(x_i) + \\beta \\cdot (x_i - x_{i-1})$$"}
            </p>
            <p className="gdwm-text">
              {'$(x_i - x_{i-1})$'} is just last step's move. {'$\\beta$'} decides how much of it
              carries into the next one, somewhere between 0 and 1. {'$\\beta = 0$'} means no
              memory at all, just plain gradient descent. The bigger {'$\\beta$'} is, the more of
              the old step keeps pushing you forward.
            </p>
          </div>

          <div className="gdwm-block">
            <span className="gdwm-block-label">Right now</span>
            <div className="gdwm-readout-grid">
              <div className="gdwm-readout">
                <span className="gdwm-readout-label">x</span>
                <span className="gdwm-readout-value">{x.toFixed(3)}</span>
              </div>
              <div className="gdwm-readout">
                <span className="gdwm-readout-label">f(x)</span>
                <span className="gdwm-readout-value">{f(x).toFixed(3)}</span>
              </div>
              <div className="gdwm-readout">
                <span className="gdwm-readout-label">{"f'(x)"}</span>
                <span className="gdwm-readout-value">{slope.toFixed(3)}</span>
              </div>
              <div className="gdwm-readout">
                <span className="gdwm-readout-label">last step</span>
                <span className="gdwm-readout-value">
                  {lastStep >= 0 ? '+' : ''}
                  {lastStep.toFixed(3)}
                </span>
              </div>
              <div className="gdwm-readout">
                <span className="gdwm-readout-label">steps taken</span>
                <span className="gdwm-readout-value">{history.length}</span>
              </div>
            </div>
            {converged && (
              <p className="gdwm-converged">
                Slope and last step are basically zero, you've landed.
              </p>
            )}
          </div>

          <div className="gdwm-block">
            <span className="gdwm-block-label">Momentum {'$\\beta$'}</span>
            <div className="gdwm-rate-row">
              {BETAS.map((b) => (
                <button
                  key={b}
                  className={`gdwm-rate-btn ${beta === b ? 'active' : ''}`}
                  onClick={() => setBeta(b)}
                >
                  {b}
                </button>
              ))}
            </div>
            <p className="gdwm-text gdwm-rate-hint">
              Try {'$\\beta = 0.9$'}: watch it barrel through the flat stretch instead of crawling.
            </p>
          </div>
        </div>

        <div className="gdwm-right">
          <span className="gdwm-graph-hint">
            <strong>Drag the point</strong> to choose a starting spot.
          </span>
          <p className="gdwm-legend">
            <span className="gdwm-legend-dot gdwm-legend-dot-momentum" /> momentum
            <span className="gdwm-legend-dot gdwm-legend-dot-plain" /> plain descent
          </p>
          <CurveDesmosGraph
            curveLatex={CURVE_LATEX}
            pointLatex={POINT_LATEX}
            f={f}
            x={x}
            trail={trail}
            onPick={handlePick}
            resetRef={resetRef}
            className="gdwm-desmos-container"
            extraPoints={[{ x: plainX, trail: plainTrail, color: '#9ca3af' }]}
          />
          <div className="gdwm-controls">
            <button
              className={`gdwm-step-btn ${running ? 'running' : ''}`}
              onClick={running ? stopRun : handleStart}
              disabled={converged}
            >
              <span className={`gdwm-btn-icon ${running ? 'icon-stop' : 'icon-play'}`} />
              {converged ? 'Converged' : running ? 'Stop' : 'Start'}
            </button>
            <button className="gdwm-reset-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
          <p className="gdwm-run-note">
            Hitting Start runs both points at once, from the same spot, so you can watch momentum
            (blue) pull ahead of plain descent (gray).
          </p>

          {history.length > 0 && (
            <div className="gdwm-block gdwm-history-block">
              <span className="gdwm-block-label">Step by step</span>
              <div className="gdwm-history">
                {history.map((h, i) => (
                  <div className="gdwm-history-row" key={i}>
                    <span className="gdwm-history-step">{i + 1}</span>
                    <span className="gdwm-history-calc">
                      {h.xNew.toFixed(3)} = {h.x.toFixed(3)} &minus; {RATE} &times;{' '}
                      {h.slope >= 0 ? '' : '('}
                      {h.slope.toFixed(3)}
                      {h.slope >= 0 ? '' : ')'} + {beta} &times;{' '}
                      {h.lastStep >= 0 ? '' : '('}
                      {h.lastStep.toFixed(3)}
                      {h.lastStep >= 0 ? '' : ')'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="gdwm-block gdwm-block-full">
        <span className="gdwm-block-label">Why it can go wrong</span>
        <p className="gdwm-text">
          Momentum can overshoot. Since it keeps carrying over part of the last step, it can blow
          past a minimum and have to swing back, oscillating before it settles. A high {'$\\beta$'}{' '}
          makes this worse, a low one makes it barely different from plain descent.
        </p>
        <p className="gdwm-text">
          In practice {'$\\beta$'} around 0.8 to 0.9 tends to work well: fast through flat regions,
          without wild overshooting.
        </p>
      </div>
    </div>
  );
}

export default WhatIsGradientDescentWithMomentum;
