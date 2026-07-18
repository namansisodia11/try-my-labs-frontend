import { useState } from 'react';
import { Link } from 'react-router-dom';
import GradientDescentWithMomentumGraph from '../../../common/desmos/GradientDescentWithMomentumGraph';
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

const initialState = (startX) => ({
  x: startX,
  slope: df(startX),
  lastStep: 0,
  converged: false,
  history: [],
  running: false,
  start: () => {},
  stop: () => {},
  reset: () => {},
});

function WhatIsGradientDescentWithMomentum() {
  const mathReady = useMathJax();
  const [startX] = useState(randomStartX);
  const [beta, setBeta] = useState(0.8);
  const [state, setState] = useState(() => initialState(startX));

  const { x, slope, lastStep, converged, history, running, start, stop, reset } = state;

  return (
    <div className="gdwm-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>
      <h1 className="gdwm-title">Gradient Descent with Momentum</h1>
      <p className="gdwm-lead">
        Plain gradient descent has zero memory. It looks at the slope right now, takes a step, and
        forgets everything. Momentum fixes this: it remembers which way it was already going and
        keeps some of that speed. Think of a cyclist coming down a slope. The road becomes flat,
        but does the cycle stop immediately? No na, it keeps rolling. Same idea. If plain
        gradient descent is new for you, first see{' '}
        <Link to="/learning/machine-learning/what-is-gradient-descent">Gradient Descent</Link>,
        then come back.
      </p>

      <div className="gdwm-layout">
        <div className="gdwm-left">
          <div className="gdwm-block">
            <span className="gdwm-block-label">The problem with plain descent</span>
            <p className="gdwm-text">
              Say step {'$i$'} is at {'$x_i$'}. Regular gradient descent decides the next step
              using only the slope right there:
            </p>
            <p className="gdwm-math">{"$$x_{i+1} = x_i - \\alpha \\cdot f'(x_i)$$"}</p>
            <p className="gdwm-text">
              Problem comes on flat-ish stretches. Slope is tiny, so steps are also tiny. Crossing
              a shallow valley floor takes forever, like being stuck behind a tractor on a single
              lane road.
            </p>
          </div>

          <div className="gdwm-block">
            <span className="gdwm-block-label">Adding memory</span>
            <p className="gdwm-text">
              Momentum takes the normal gradient step, then adds back a fraction of{' '}
              <strong>whatever step it took last time</strong>. That's the whole trick, nothing
              more.
            </p>
            <p className="gdwm-math">
              {"$$x_{i+1} = x_i - \\alpha \\cdot f'(x_i) + \\beta \\cdot (x_i - x_{i-1})$$"}
            </p>
            <p className="gdwm-text">
              {'$(x_i - x_{i-1})$'} is just the last step's move. {'$\\beta$'} decides how much of
              it carries forward, somewhere between 0 and 1. {'$\\beta = 0$'} means no memory at
              all, back to plain gradient descent. Bigger the {'$\\beta$'}, more the old step
              keeps pushing you ahead.
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
                Slope and last step are basically zero. Landed. Done.
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
              Try {'$\\beta = 0.9$'} once. Watch it barrel through the flat stretch like a Rajdhani
              express instead of crawling.
            </p>
          </div>
        </div>

        <div className="gdwm-right">
          <span className="gdwm-graph-hint">
            <strong>Drag the point</strong> to choose a starting spot.
          </span>
          <GradientDescentWithMomentumGraph
            curveLatex={CURVE_LATEX}
            pointLatex={POINT_LATEX}
            f={f}
            df={df}
            rate={RATE}
            beta={beta}
            startX={startX}
            getRandomStart={randomStartX}
            onStateChange={setState}
            className="gdwm-desmos-container"
          />
          <div className="gdwm-controls">
            <button
              className={`gdwm-step-btn ${running ? 'running' : ''}`}
              onClick={running ? stop : start}
              disabled={converged}
            >
              <span className={`gdwm-btn-icon ${running ? 'icon-stop' : 'icon-play'}`} />
              {converged ? 'Converged' : running ? 'Stop' : 'Start'}
            </button>
            <button className="gdwm-reset-btn" onClick={reset}>
              Reset
            </button>
          </div>
          <p className="gdwm-run-note">
            Try different {'$\\beta$'} values and hit Start. You will see yourself how much
            momentum changes the ride.
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
                      {h.slope >= 0 ? '' : ')'} + {beta} &times; {h.lastStep >= 0 ? '' : '('}
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
          Momentum can overshoot. It keeps carrying part of the last step, so sometimes it blows
          right past the minimum and has to swing back, this side, that side, before settling.
          Like braking late at a speed breaker. High {'$\\beta$'} makes this worse, low{' '}
          {'$\\beta$'} makes it barely different from plain descent.
        </p>
      </div>
    </div>
  );
}

export default WhatIsGradientDescentWithMomentum;
