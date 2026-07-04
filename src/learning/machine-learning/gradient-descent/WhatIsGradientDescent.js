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
        Gradient descent is how a lot of machine learning actually learns: start somewhere, check
        which way is downhill, take a small step, repeat. No formula for the minimum, just a rule
        for moving closer to it. If you haven't seen how to read a curve's slope yet, check out{' '}
        <Link to="/learning/machine-learning/what-is-minima-maxima">Minima and Maxima</Link> first.
      </p>

      <div className="gd-layout">
        <div className="gd-left">
          <div className="gd-block">
            <span className="gd-block-label">The curve and its derivative</span>
            <p className="gd-text">
              To know which way is downhill at any point, we differentiate {'$f(x)$'} to get{' '}
              {"$f'(x)$"}, the slope.
            </p>
            <p className="gd-math">{'$$f(x) = \\dfrac{x^4}{4} - x^3 - \\dfrac{x^2}{2} + 3.4x$$'}</p>
            <p className="gd-math">{"$$f'(x) = x^3 - 3x^2 - x + 3.4$$"}</p>
          </div>

          <div className="gd-block">
            <span className="gd-block-label">The update rule</span>
            <p className="gd-text">
              At every step, move a little in the opposite direction of the slope. That's it, that's
              the whole algorithm.
            </p>
            <p className="gd-math">{"$$x_{i+1} = x_i - \\alpha \\cdot f'(x_i)$$"}</p>
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
              <div className="gd-readout">
                <span className="gd-readout-label">steps taken</span>
                <span className="gd-readout-value">{history.length}</span>
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
