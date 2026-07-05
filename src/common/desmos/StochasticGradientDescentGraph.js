import { useEffect, useRef, useState } from 'react';
import CurveDesmosGraph from './CurveDesmosGraph';

const STEP_INTERVAL_MS = 500;
const BATCH_CONVERGE_THRESHOLD = 0.01;
// stochastic gradients jitter around the true minimum instead of settling at
// exactly zero, so it needs a looser band or it would never stop
const STOCHASTIC_CONVERGE_THRESHOLD = 0.1;
// keeps the loss bowl inside CurveDesmosGraph's fixed -4..4 bounds so it reads
// as a wide curve instead of a narrow, steep spike
const LOSS_SCALE = 30;

// points: [{ x, y }] — the dataset being fit with y = m*x
// rate: number — learning rate (alpha)
// stochastic: boolean — true picks one random point's gradient each step, false averages all points
// startM: number — initial m
// getRandomStart: () => number, optional, called on Reset to pick a fresh starting m
//   instead of returning to the original startM
// curveLatex, pointLatex, className: same shape as CurveDesmosGraph, but for the loss curve L(m)
// onStateChange: ({ m, grad, step, converged, history, running, start, stop, reset }) => void
//   called whenever the algorithm's state changes, so the page can render readouts/controls from it
function StochasticGradientDescentGraph({
  points,
  rate,
  stochastic,
  startM,
  getRandomStart,
  curveLatex,
  pointLatex,
  className,
  onStateChange,
}) {
  const [m, setM] = useState(startM);
  const [trail, setTrail] = useState([]);
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const resetRef = useRef(null);
  const mRef = useRef(m);
  mRef.current = m;
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const stochasticRef = useRef(stochastic);
  stochasticRef.current = stochastic;
  const intervalRef = useRef(null);

  function loss(mVal) {
    return points.reduce((s, { x, y }) => s + (mVal * x - y) ** 2, 0) / points.length / LOSS_SCALE;
  }

  function fullGrad(mVal) {
    return (
      points.reduce((s, { x, y }) => s + 2 * x * (mVal * x - y), 0) / points.length / LOSS_SCALE
    );
  }

  function pointGrad(mVal, point) {
    return (2 * point.x * (mVal * point.x - point.y)) / LOSS_SCALE;
  }

  const grad = fullGrad(m);
  const step = -rate * grad;
  const convergeThreshold = stochastic ? STOCHASTIC_CONVERGE_THRESHOLD : BATCH_CONVERGE_THRESHOLD;
  const converged = Math.abs(grad) < convergeThreshold;

  function stop() {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function takeStep() {
    const curM = mRef.current;
    const curThreshold = stochasticRef.current
      ? STOCHASTIC_CONVERGE_THRESHOLD
      : BATCH_CONVERGE_THRESHOLD;
    if (Math.abs(fullGrad(curM)) < curThreshold) {
      stop();
      return;
    }
    let curGrad;
    let pointIndex = null;
    if (stochasticRef.current) {
      pointIndex = Math.floor(Math.random() * points.length);
      curGrad = pointGrad(curM, points[pointIndex]);
    } else {
      curGrad = fullGrad(curM);
    }
    const curStep = -rateRef.current * curGrad;
    const mNew = curM + curStep;
    setHistory((h) => [...h, { m: curM, grad: curGrad, step: curStep, mNew, pointIndex }]);
    setTrail((t) => [...t, curM]);
    setM(mNew);
  }

  function start() {
    if (converged || running) return;
    setRunning(true);
    intervalRef.current = setInterval(takeStep, STEP_INTERVAL_MS);
  }

  function goTo(newM, options) {
    stop();
    setM(newM);
    setTrail([]);
    setHistory([]);
    if (resetRef.current) resetRef.current(newM, options);
  }

  function reset() {
    goTo(getRandomStart ? getRandomStart() : startM);
  }

  function pick(newM) {
    goTo(newM, { keepView: true });
  }

  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ m, grad, step, converged, history, running, start, stop, reset });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, grad, step, converged, history, running]);

  return (
    <CurveDesmosGraph
      curveLatex={curveLatex}
      pointLatex={pointLatex}
      f={loss}
      x={m}
      trail={trail}
      onPick={pick}
      resetRef={resetRef}
      className={className}
    />
  );
}

export default StochasticGradientDescentGraph;
