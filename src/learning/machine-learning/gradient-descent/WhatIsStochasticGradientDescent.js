import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ScatterFitCanvas from '../../../common/mathbox/ScatterFitCanvas';
import useMathJax from '../../../common/hooks/useMathJax';
import './WhatIsStochasticGradientDescent.css';

const X_VALUES = [1, 2, 3, 4, 5];
const Y_RANGE = [2, 13];
const START_RANGE = [-0.5, 4.5];
const SPEED_PRESETS = [
  { label: 'Slow', intervalMs: 800 },
  { label: 'Normal', intervalMs: 400 },
  { label: 'Fast', intervalMs: 120 },
];
const DEFAULT_SPEED = SPEED_PRESETS[1].intervalMs;
const RATE = 0.03;
const BATCH_THRESHOLD = 0.05;
const STOCHASTIC_THRESHOLD = 0.5;

// scattered on purpose (not a clean line) so each point disagrees with the
// others about which way to move m, which is what makes the stochastic
// zigzag visible on the graph
function randomPoints() {
  const [min, max] = Y_RANGE;
  return X_VALUES.map((x) => ({ x, y: min + Math.random() * (max - min) }));
}

function randomStartM() {
  const [min, max] = START_RANGE;
  return min + Math.random() * (max - min);
}

function fullError(points, m) {
  return points.reduce((s, { x, y }) => s + 2 * x * (m * x - y), 0) / points.length;
}

function pointError(m, point) {
  return 2 * point.x * (m * point.x - point.y);
}

const initialState = (startM, points) => ({
  m: startM,
  error: fullError(points, startM),
  step: 0,
  converged: false,
  history: [],
  running: false,
  usingPoint: null,
});

function WhatIsStochasticGradientDescent() {
  const mathReady = useMathJax();
  const [points, setPoints] = useState(randomPoints);
  const [startM] = useState(randomStartM);
  const [stochastic, setStochastic] = useState(true);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [state, setState] = useState(() => initialState(startM, points));

  const { m, error, step, converged, history, running, usingPoint } = state;

  const mRef = useRef(m);
  mRef.current = m;
  const pointsRef = useRef(points);
  const activeIndexRef = useRef(null);
  const resetViewRef = useRef(null);
  const stochasticRef = useRef(stochastic);
  stochasticRef.current = stochastic;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const intervalRef = useRef(null);
  const blinkTimeoutRef = useRef(null);

  function stop() {
    setState((s) => ({ ...s, running: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    clearTimeout(blinkTimeoutRef.current);
  }

  function takeStep() {
    const curM = mRef.current;
    const curPoints = pointsRef.current;
    const curThreshold = stochasticRef.current ? STOCHASTIC_THRESHOLD : BATCH_THRESHOLD;
    if (Math.abs(fullError(curPoints, curM)) < curThreshold) {
      stop();
      return;
    }
    let curError;
    let pointIndex = null;
    if (stochasticRef.current) {
      pointIndex = Math.floor(Math.random() * curPoints.length);
      curError = pointError(curM, curPoints[pointIndex]);
      activeIndexRef.current = pointIndex;
    } else {
      curError = fullError(curPoints, curM);
      activeIndexRef.current = 'all';
      clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = setTimeout(() => {
        activeIndexRef.current = null;
      }, speedRef.current * 0.5);
    }
    const curStep = -RATE * curError;
    const mNew = curM + curStep;
    setState((s) => ({
      ...s,
      m: mNew,
      error: fullError(curPoints, mNew),
      step: curStep,
      converged: Math.abs(fullError(curPoints, mNew)) < curThreshold,
      history: [...s.history, { m: curM, mNew, step: curStep, pull: curError, pointIndex }],
      usingPoint: pointIndex,
    }));
  }

  function start() {
    if (converged || running || intervalRef.current) return;
    intervalRef.current = setInterval(takeStep, speed);
    setState((s) => ({ ...s, running: true }));
  }

  function changeSpeed(nextSpeed) {
    setSpeed(nextSpeed);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(takeStep, nextSpeed);
    }
  }

  function reset() {
    stop();
    activeIndexRef.current = null;
    const freshPoints = randomPoints();
    const freshM = randomStartM();
    pointsRef.current = freshPoints;
    mRef.current = freshM;
    setPoints(freshPoints);
    setState(initialState(freshM, freshPoints));
    if (resetViewRef.current) resetViewRef.current();
  }

  function switchMode(nextStochastic) {
    if (nextStochastic === stochastic) return;
    stop();
    activeIndexRef.current = null;
    const freshM = randomStartM();
    mRef.current = freshM;
    setStochastic(nextStochastic);
    setState(initialState(freshM, pointsRef.current));
  }

  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sgd-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>
      <h1 className="sgd-title">Stochastic Gradient Descent</h1>
      <p className="sgd-lead">
        Regular gradient descent checks every single data point before taking even one step. Fine
        for five points. But real datasets have millions. Checking everyone every time is like
        asking the whole colony before buying a scooter. Stochastic gradient descent (SGD) does
        jugaad: grab one random point, get a rough idea of which way to move, and just step. If
        plain gradient descent is new for you, first see{' '}
        <Link to="/learning/machine-learning/what-is-gradient-descent">Gradient Descent</Link>,
        then come back.
      </p>

      <div className="sgd-layout">
        <div className="sgd-left">
          <div className="sgd-block">
            <span className="sgd-block-label">The setup</span>
            <p className="sgd-text">
              We are fitting a line {'$y = mx$'} through these 5 points. Goal is simple: find the{' '}
              {'$m$'} that fits best.
            </p>
            <div className="sgd-points-grid">
              {points.map((p, i) => (
                <span className="sgd-point-chip" key={i}>
                  ({p.x}, {p.y.toFixed(1)})
                </span>
              ))}
            </div>
            <p className="sgd-text">
              Every point pulls the line toward itself, like relatives pulling you to sit in their
              corner at a wedding. Differentiate the squared error of one point with respect to{' '}
              {'$m$'} and you get its pull:
            </p>
            <p className="sgd-math">
              {
                '$$\\frac{d}{dm}(m \\cdot x_i - y_i)^2 = 2x_i(m \\cdot x_i - y_i) = \\text{pull}_i$$'
              }
            </p>
            <p className="sgd-text">
              <strong>Batch</strong> gradient descent averages that pull over <strong>every</strong>{' '}
              point, then moves:
            </p>
            <p className="sgd-math">
              {'$$m_{i+1} = m_i - \\alpha \\cdot \\frac{1}{n}\\sum_j \\text{pull}_j$$'}
            </p>
            <p className="sgd-text">
              <strong>Stochastic</strong> gradient descent grabs <strong>one random point</strong>{' '}
              and moves using just its pull. No averaging, no waiting:
            </p>
            <p className="sgd-math">{'$$m_{i+1} = m_i - \\alpha \\cdot \\text{pull}_i$$'}</p>
          </div>

          <div className="sgd-block">
            <span className="sgd-block-label">Right now</span>
            <div className="sgd-readout-grid">
              <div className="sgd-readout">
                <span className="sgd-readout-label">m</span>
                <span className="sgd-readout-value">{m.toFixed(3)}</span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">{'α'}</span>
                <span className="sgd-readout-value">{RATE}</span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">true pull</span>
                <span className="sgd-readout-value">{error.toFixed(3)}</span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">last step</span>
                <span className="sgd-readout-value">
                  {step >= 0 ? '+' : ''}
                  {step.toFixed(3)}
                </span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">using</span>
                <span className="sgd-readout-value">
                  {usingPoint != null
                    ? `(${points[usingPoint].x}, ${points[usingPoint].y.toFixed(1)})`
                    : stochastic
                      ? 'none yet'
                      : 'all points'}
                </span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">steps taken</span>
                <span className="sgd-readout-value">{history.length}</span>
              </div>
            </div>
            {converged && <p className="sgd-converged">The fit has settled. Landed. Done.</p>}
          </div>

          <div className="sgd-block">
            <div className="sgd-rate-cols">
              <div className="sgd-rate-col">
                <span className="sgd-block-label">Mode</span>
                <div className="sgd-rate-row">
                  <button
                    className={`sgd-rate-btn ${stochastic ? 'active' : ''}`}
                    onClick={() => switchMode(true)}
                  >
                    Stochastic
                  </button>
                  <button
                    className={`sgd-rate-btn ${!stochastic ? 'active' : ''}`}
                    onClick={() => switchMode(false)}
                  >
                    Batch
                  </button>
                </div>
              </div>
              <div className="sgd-rate-col">
                <span className="sgd-block-label">Speed</span>
                <div className="sgd-rate-row">
                  {SPEED_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      className={`sgd-rate-btn ${speed === preset.intervalMs ? 'active' : ''}`}
                      onClick={() => changeSpeed(preset.intervalMs)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="sgd-text sgd-rate-hint">
              Batch glides straight to the best fit, smooth. Stochastic also reaches, but with full
              drama: zigzag here, zigzag there, since it sees only one point per step. Try Fast to
              speed it up. Sometimes the random points barely agree with each other, so SGD takes
              forever to settle. If that happens, hit Reset and get a fresh set of points.
            </p>
          </div>
        </div>

        <div className="sgd-right">
          <span className="sgd-graph-hint">
            The <strong>highlighted point(s)</strong> are the ones the last step just used, one for
            stochastic, all five for batch.
          </span>
          <ScatterFitCanvas
            pointsRef={pointsRef}
            pointCount={X_VALUES.length}
            mRef={mRef}
            activeIndexRef={activeIndexRef}
            resetViewRef={resetViewRef}
            xRange={[-1, 6]}
            yRange={[0, 14]}
          />
          <div className="sgd-controls">
            <button
              className={`sgd-step-btn ${running ? 'running' : ''}`}
              onClick={running ? stop : start}
              disabled={converged}
            >
              <span className={`sgd-btn-icon ${running ? 'icon-stop' : 'icon-play'}`} />
              {converged ? 'Converged' : running ? 'Stop' : 'Start'}
            </button>
            <button className="sgd-reset-btn" onClick={reset}>
              Reset
            </button>
          </div>

          {history.length > 0 && (
            <div className="sgd-block sgd-history-block">
              <span className="sgd-block-label">Step by step</span>
              <div className="sgd-history">
                {history.map((h, i) => (
                  <div className="sgd-history-row" key={i}>
                    <span className="sgd-history-step">{i + 1}</span>
                    <span className="sgd-history-calc">
                      {h.mNew.toFixed(3)} = {h.m.toFixed(3)} &minus; {RATE} &times;{' '}
                      {h.pull >= 0 ? '' : '('}
                      {h.pull.toFixed(3)}
                      {h.pull >= 0 ? '' : ')'}
                      {h.pointIndex != null && (
                        <span className="sgd-history-point">
                          {' '}
                          using point ({points[h.pointIndex].x}, {points[h.pointIndex].y.toFixed(1)}
                          )
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sgd-block sgd-block-full">
        <span className="sgd-block-label">Why bother with the noise</span>
        <p className="sgd-text">
          For 5 points, batch is obviously better. Why guess when you can check everything? But
          real datasets have millions, even billions of points. Adding up the pull from every
          single one means touching all of them before you are allowed to move even one step. Too
          costly, boss.
        </p>
        <p className="sgd-text">
          SGD makes a deal: a little accuracy per step, in exchange for a lot of speed. One
          point's pull is a rough guess, sure. But you can make that guess thousands of times in
          the time one exact batch step takes. In practice people split the difference and use{' '}
          <strong>mini-batches</strong>: a small handful of random points per step instead of just
          one. Middle path, works best.
        </p>
      </div>
    </div>
  );
}

export default WhatIsStochasticGradientDescent;
