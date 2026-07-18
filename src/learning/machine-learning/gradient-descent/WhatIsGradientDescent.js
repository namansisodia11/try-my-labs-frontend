import { useState } from 'react';
import { Link } from 'react-router-dom';
import GradientDescentGraph from '../../../common/desmos/GradientDescentGraph';
import useMathJax from '../../../common/hooks/useMathJax';
import './WhatIsGradientDescent.css';

const CURVE_LATEX = 'y = \\frac{x^4}{4} - x^3 - \\frac{x^2}{2} + 3.4x';
const POINT_LATEX = (a) => `(${a}, \\frac{${a}^4}{4} - ${a}^3 - \\frac{${a}^2}{2} + 3.4${a})`;

function f(x) {
  return x ** 4 / 4 - x ** 3 - x ** 2 / 2 + 3.4 * x;
}

function df(x) {
  return x ** 3 - 3 * x ** 2 - x + 3.4;
}

const START_RANGE = [-1.9, 3.7];
const LEARNING_RATES = [0.02, 0.05, 0.1, 0.3];

function randomStartX() {
  const [min, max] = START_RANGE;
  return min + Math.random() * (max - min);
}

const DEFAULT_RATE = 0.1;

const initialState = (startX, rate) => ({
  x: startX,
  slope: df(startX),
  step: -rate * df(startX),
  converged: false,
  history: [],
  running: false,
  start: () => {},
  stop: () => {},
  reset: () => {},
});

function WhatIsGradientDescent() {
  const mathReady = useMathJax();
  const [startX] = useState(randomStartX);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [state, setState] = useState(() => initialState(startX, DEFAULT_RATE));

  const { x, slope, step, converged, history, running, start, stop, reset } = state;

  return (
    <div className="gd-container" style={{ visibility: mathReady ? 'visible' : 'hidden' }}>
      <h1 className="gd-title">Gradient Descent</h1>
      <p className="gd-lead">
        Gradient descent is the simple funda behind how most of machine learning actually learns.
        Start anywhere, see which side is downhill, take a small step, again check. That's it. No
        magic formula for the minimum, just a rule for moving closer to it, step by step. If
        reading a curve's slope is new for you, first go through{' '}
        <Link to="/learning/machine-learning/what-is-minima-maxima">Minima and Maxima</Link>, then
        come back here.
      </p>

      <div className="gd-layout">
        <div className="gd-left">
          <div className="gd-block">
            <span className="gd-block-label">The curve and its derivative</span>
            <p className="gd-text">
              To know which side is downhill at any point, differentiate {'$f(x)$'} and you get{' '}
              {"$f'(x)$"}, the slope. That one number is all the algorithm needs.
            </p>
            <p className="gd-math">{'$$f(x) = \\dfrac{x^4}{4} - x^3 - \\dfrac{x^2}{2} + 3.4x$$'}</p>
            <p className="gd-math">{"$$f'(x) = x^3 - 3x^2 - x + 3.4$$"}</p>
          </div>

          <div className="gd-block">
            <span className="gd-block-label">The update rule</span>
            <p className="gd-text">
              Every step, move a little in the opposite direction of the slope. That's it. Full
              algorithm, one line.
            </p>
            <p className="gd-math">{"$$x_{i+1} = x_i - \\alpha \\cdot f'(x_i)$$"}</p>
            <p className="gd-text">
              {'$\\alpha$'} is the <strong>learning rate</strong>, meaning how big a step to take.
              Too small, and you will crawl for ages. Too big, and you jump right over the valley.
              Like salt in dal, the amount has to be just right.
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
              <div className="gd-readout">
                <span className="gd-readout-label">steps taken</span>
                <span className="gd-readout-value">{history.length}</span>
              </div>
            </div>
            {converged && <p className="gd-converged">Slope is basically zero. Landed. Done.</p>}
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
              Try 0.3 once. Watch how it overshoots past the valley, this side, that side, before
              finally settling down.
            </p>
          </div>
        </div>

        <div className="gd-right">
          <span className="gd-graph-hint">
            <strong>Drag the point</strong> to choose a starting spot.
          </span>
          <GradientDescentGraph
            curveLatex={CURVE_LATEX}
            pointLatex={POINT_LATEX}
            f={f}
            df={df}
            rate={rate}
            startX={startX}
            getRandomStart={randomStartX}
            onStateChange={setState}
            className="gd-desmos-container"
          />
          <div className="gd-controls">
            <button
              className={`gd-step-btn ${running ? 'running' : ''}`}
              onClick={running ? stop : start}
              disabled={converged}
            >
              <span className={`gd-btn-icon ${running ? 'icon-stop' : 'icon-play'}`} />
              {converged ? 'Converged' : running ? 'Stop' : 'Start'}
            </button>
            <button className="gd-reset-btn" onClick={reset}>
              Reset
            </button>
          </div>

          {history.length > 0 && (
            <div className="gd-block gd-history-block">
              <span className="gd-block-label">Step by step</span>
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
            </div>
          )}
        </div>
      </div>

      <div className="gd-block gd-block-full">
        <span className="gd-block-label">Why it can go wrong</span>
        <p className="gd-text">
          Gradient descent only looks at the slope right under its feet, nothing else. It has no
          idea whether the valley it is falling into is the deepest one or just the closest one.
          Start on the wrong side of a bump, and it will happily settle in a local minimum and
          think the job is done. It is not.
        </p>
        <p className="gd-text">
          And the learning rate matters just as much as the starting point. Too small, you waste
          hundred steps crawling to the answer. Too large, every step flings you past the minimum,
          and if it is large enough, the whole thing diverges instead of converging. Total waste.
        </p>
      </div>
    </div>
  );
}

export default WhatIsGradientDescent;
