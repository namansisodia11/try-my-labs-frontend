import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import StochasticGradientDescentGraph from '../../../common/desmos/StochasticGradientDescentGraph';
import ScatterFitCanvas from '../../../common/mathbox/ScatterFitCanvas';
import useMathJax from '../../../common/hooks/useMathJax';
import './WhatIsStochasticGradientDescent.css';

// scattered on purpose (not a clean line) so each point's slope disagrees with
// the others, which is what makes the stochastic zigzag visible on the graph
const POINTS = [
  { x: 1, y: 4.5 },
  { x: 2, y: 3.0 },
  { x: 3, y: 8.5 },
  { x: 4, y: 7.0 },
  { x: 5, y: 12.5 },
];

// divides by 5 (point count) * 30 (display scale, keeps the bowl inside the
// graph's fixed -4..4 bounds instead of shooting off the top as a steep spike)
const CURVE_LATEX = 'y = \\frac{1}{150}((x-4.5)^2+(2x-3.0)^2+(3x-8.5)^2+(4x-7.0)^2+(5x-12.5)^2)';
const POINT_LATEX = (a) =>
  `(${a}, \\frac{1}{150}((1\\cdot ${a}-4.5)^2+(2\\cdot ${a}-3.0)^2+(3\\cdot ${a}-8.5)^2+(4\\cdot ${a}-7.0)^2+(5\\cdot ${a}-12.5)^2))`;

const START_RANGE = [-0.5, 4.5];
const RATE = 0.5;

function randomStartM() {
  const [min, max] = START_RANGE;
  return min + Math.random() * (max - min);
}

const initialState = (startM) => ({
  m: startM,
  grad: 0,
  step: 0,
  converged: false,
  history: [],
  running: false,
  start: () => {},
  stop: () => {},
  reset: () => {},
});

const FIT_STEP_INTERVAL_MS = 400;
const FIT_RATE = 0.03;
const FIT_BATCH_THRESHOLD = 0.05;
const FIT_STOCHASTIC_THRESHOLD = 0.5;

function fitFullGrad(m) {
  return POINTS.reduce((s, { x, y }) => s + 2 * x * (m * x - y), 0) / POINTS.length;
}

function fitPointGrad(m, point) {
  return 2 * point.x * (m * point.x - point.y);
}

function WhatIsStochasticGradientDescent() {
  const mathReady = useMathJax();
  const [startM] = useState(randomStartM);
  const [stochastic, setStochastic] = useState(true);
  const [state, setState] = useState(() => initialState(startM));

  const { m, grad, step, converged, history, running, start, stop, reset } = state;

  const [fitStochastic, setFitStochastic] = useState(true);
  const [fitM, setFitM] = useState(startM);
  const [fitRunning, setFitRunning] = useState(false);
  const [fitActiveIndex, setFitActiveIndex] = useState(null);
  const [fitHistory, setFitHistory] = useState([]);
  const fitMRef = useRef(fitM);
  fitMRef.current = fitM;
  const fitActiveIndexRef = useRef(null);
  const fitStochasticRef = useRef(fitStochastic);
  fitStochasticRef.current = fitStochastic;
  const fitIntervalRef = useRef(null);

  const fitGrad = fitFullGrad(fitM);
  const fitThreshold = fitStochastic ? FIT_STOCHASTIC_THRESHOLD : FIT_BATCH_THRESHOLD;
  const fitConverged = Math.abs(fitGrad) < fitThreshold;

  function fitStop() {
    setFitRunning(false);
    if (fitIntervalRef.current) {
      clearInterval(fitIntervalRef.current);
      fitIntervalRef.current = null;
    }
  }

  function fitTakeStep() {
    const curM = fitMRef.current;
    const curThreshold = fitStochasticRef.current ? FIT_STOCHASTIC_THRESHOLD : FIT_BATCH_THRESHOLD;
    if (Math.abs(fitFullGrad(curM)) < curThreshold) {
      fitStop();
      return;
    }
    let curGrad;
    let pointIndex = null;
    let residual = null;
    if (fitStochasticRef.current) {
      const idx = Math.floor(Math.random() * POINTS.length);
      const point = POINTS[idx];
      residual = curM * point.x - point.y;
      curGrad = fitPointGrad(curM, point);
      pointIndex = idx;
      fitActiveIndexRef.current = idx;
      setFitActiveIndex(idx);
    } else {
      curGrad = fitFullGrad(curM);
      fitActiveIndexRef.current = null;
      setFitActiveIndex(null);
    }
    const mNew = curM - FIT_RATE * curGrad;
    setFitHistory((h) => [...h, { m: curM, mNew, pointIndex, residual }]);
    setFitM(mNew);
  }

  function fitStart() {
    if (fitConverged || fitRunning) return;
    setFitRunning(true);
    fitIntervalRef.current = setInterval(fitTakeStep, FIT_STEP_INTERVAL_MS);
  }

  function fitReset() {
    fitStop();
    fitActiveIndexRef.current = null;
    setFitActiveIndex(null);
    setFitHistory([]);
    setFitM(randomStartM());
  }

  useEffect(() => fitStop, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sgd-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>
      <h1 className="sgd-title">Stochastic Gradient Descent</h1>
      <p className="sgd-lead">
        Regular gradient descent looks at every single data point before it takes one step. That's
        fine for five points, but real datasets can have millions. Stochastic gradient descent (SGD)
        cheats a little: it grabs just one random point, gets a rough idea of which way is downhill,
        and steps anyway. If you haven't seen plain gradient descent yet, start with{' '}
        <Link to="/learning/machine-learning/what-is-gradient-descent">Gradient Descent</Link>{' '}
        first.
      </p>

      <div className="sgd-layout">
        <div className="sgd-left">
          <div className="sgd-block">
            <span className="sgd-block-label">The setup</span>
            <p className="sgd-text">
              Say we're fitting a line {'$y = mx$'} through these 5 points, and we want to find the{' '}
              {'$m$'} that fits best.
            </p>
            <div className="sgd-points-grid">
              {POINTS.map((p, i) => (
                <span className="sgd-point-chip" key={i}>
                  ({p.x}, {p.y})
                </span>
              ))}
            </div>
            <p className="sgd-text">
              The loss for one point is how far off the line is, squared. The <strong>full</strong>{' '}
              loss averages that over every point:
            </p>
            <p className="sgd-math">{'$$L(m) = \\frac{1}{n}\\sum_i (m \\cdot x_i - y_i)^2$$'}</p>
          </div>

          <div className="sgd-block">
            <span className="sgd-block-label">Full batch vs. stochastic</span>
            <p className="sgd-text">
              <strong>Batch</strong> gradient descent computes the slope of {'$L(m)$'} using{' '}
              <strong>every</strong> point, then takes one step. It's accurate, but each step means
              touching all {POINTS.length} points.
            </p>
            <p className="sgd-text">
              <strong>Stochastic</strong> gradient descent grabs <strong>one random point</strong>{' '}
              {'$(x_i, y_i)$'}, pretends that point is the whole dataset, and steps using just its
              slope:
            </p>
            <p className="sgd-math">{'$$m_{i+1} = m_i - \\alpha \\cdot 2x_i(m_i x_i - y_i)$$'}</p>
            <p className="sgd-text">
              That's way cheaper per step, but noisier: one point might point slightly uphill even
              while the true average slope points downhill.
            </p>
          </div>

          <div className="sgd-block">
            <span className="sgd-block-label">Right now</span>
            <div className="sgd-readout-grid">
              <div className="sgd-readout">
                <span className="sgd-readout-label">m</span>
                <span className="sgd-readout-value">{m.toFixed(3)}</span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">true slope</span>
                <span className="sgd-readout-value">{grad.toFixed(3)}</span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">step</span>
                <span className="sgd-readout-value">
                  {step >= 0 ? '+' : ''}
                  {step.toFixed(3)}
                </span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">steps taken</span>
                <span className="sgd-readout-value">{history.length}</span>
              </div>
            </div>
            {converged && (
              <p className="sgd-converged">The true slope is basically zero, you've landed.</p>
            )}
          </div>

          <div className="sgd-block">
            <span className="sgd-block-label">Mode</span>
            <div className="sgd-rate-row">
              <button
                className={`sgd-rate-btn ${stochastic ? 'active' : ''}`}
                onClick={() => setStochastic(true)}
              >
                Stochastic
              </button>
              <button
                className={`sgd-rate-btn ${!stochastic ? 'active' : ''}`}
                onClick={() => setStochastic(false)}
              >
                Batch
              </button>
            </div>
            <p className="sgd-text sgd-rate-hint">
              Switch between them and hit Start. Batch glides straight down. Stochastic jitters
              around but still ends up in roughly the same place.
            </p>
          </div>
        </div>

        <div className="sgd-right">
          <span className="sgd-graph-hint">
            <strong>Drag the point</strong> to choose a starting {'$m$'}.
          </span>
          <StochasticGradientDescentGraph
            curveLatex={CURVE_LATEX}
            pointLatex={POINT_LATEX}
            points={POINTS}
            rate={RATE}
            stochastic={stochastic}
            startM={startM}
            getRandomStart={randomStartM}
            onStateChange={setState}
            className="sgd-desmos-container"
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
                      {h.grad >= 0 ? '' : '('}
                      {h.grad.toFixed(3)}
                      {h.grad >= 0 ? '' : ')'}
                      {h.pointIndex != null && (
                        <span className="sgd-history-point">
                          {' '}
                          using point ({POINTS[h.pointIndex].x}, {POINTS[h.pointIndex].y})
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
        <span className="sgd-block-label">Same idea, watching the line instead of the bowl</span>
        <p className="sgd-text">
          The loss curve above is honest but abstract, it's a step removed from what's actually
          happening. Here's the exact same descent, but watching the fitted line {'$y = mx$'} wiggle
          against the actual scattered points instead. The highlighted point is the one stochastic
          descent is using for the current step.
        </p>

        <div className="sgd-fit-layout">
          <ScatterFitCanvas
            dataPoints={POINTS}
            mRef={fitMRef}
            activeIndexRef={fitActiveIndexRef}
            range={15}
          />
          <div className="sgd-fit-side">
            <div className="sgd-rate-row">
              <button
                className={`sgd-rate-btn ${fitStochastic ? 'active' : ''}`}
                onClick={() => setFitStochastic(true)}
              >
                Stochastic
              </button>
              <button
                className={`sgd-rate-btn ${!fitStochastic ? 'active' : ''}`}
                onClick={() => setFitStochastic(false)}
              >
                Batch
              </button>
            </div>
            <div className="sgd-readout-grid sgd-fit-readout-grid">
              <div className="sgd-readout">
                <span className="sgd-readout-label">m</span>
                <span className="sgd-readout-value">{fitM.toFixed(3)}</span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">true slope</span>
                <span className="sgd-readout-value">{fitGrad.toFixed(3)}</span>
              </div>
              <div className="sgd-readout">
                <span className="sgd-readout-label">using</span>
                <span className="sgd-readout-value">
                  {fitActiveIndex != null
                    ? `(${POINTS[fitActiveIndex].x}, ${POINTS[fitActiveIndex].y})`
                    : fitStochastic
                      ? 'none yet'
                      : 'all points'}
                </span>
              </div>
            </div>
            {fitConverged && <p className="sgd-converged">The fit has settled.</p>}
            <div className="sgd-controls">
              <button
                className={`sgd-step-btn ${fitRunning ? 'running' : ''}`}
                onClick={fitRunning ? fitStop : fitStart}
                disabled={fitConverged}
              >
                <span className={`sgd-btn-icon ${fitRunning ? 'icon-stop' : 'icon-play'}`} />
                {fitConverged ? 'Converged' : fitRunning ? 'Stop' : 'Start'}
              </button>
              <button className="sgd-reset-btn" onClick={fitReset}>
                Reset
              </button>
            </div>

            {fitHistory.length > 0 && (
              <div className="sgd-block sgd-history-block">
                <span className="sgd-block-label">Step by step</span>
                <div className="sgd-history">
                  {fitHistory.map((h, i) => (
                    <div className="sgd-history-row" key={i}>
                      <span className="sgd-history-step">{i + 1}</span>
                      <span className="sgd-history-calc">
                        {h.pointIndex != null ? (
                          <>
                            residual at ({POINTS[h.pointIndex].x}, {POINTS[h.pointIndex].y}):{' '}
                            {h.m.toFixed(2)}&times;{POINTS[h.pointIndex].x} &minus;{' '}
                            {POINTS[h.pointIndex].y} = {h.residual >= 0 ? '+' : ''}
                            {h.residual.toFixed(2)}
                          </>
                        ) : (
                          <>using the average residual over all points</>
                        )}
                        {' '}&rarr; m: {h.m.toFixed(3)} &rarr; {h.mNew.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sgd-block sgd-block-full">
        <span className="sgd-block-label">Why bother with the noise</span>
        <p className="sgd-text">
          For 5 points, batch descent is obviously better, there's no reason to guess when you can
          just check everything. But real datasets can have millions or billions of points.
          Computing the exact slope means touching every single one before you're allowed to move at
          all.
        </p>
        <p className="sgd-text">
          SGD trades a little accuracy per step for a lot of speed: one point's slope is a rough
          guess, but it's a guess you can make thousands of times in the time it'd take to compute
          one exact batch slope. In practice, people often split the difference and use{' '}
          <strong>mini-batches</strong>, a small handful of random points per step instead of just
          one.
        </p>
      </div>
    </div>
  );
}

export default WhatIsStochasticGradientDescent;
