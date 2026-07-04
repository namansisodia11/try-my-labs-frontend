import { useEffect, useRef, useState } from 'react';
import CurveDesmosGraph from './CurveDesmosGraph';

const STEP_INTERVAL_MS = 500;
const CONVERGE_THRESHOLD = 0.01;

// f: (x) => number, df: (x) => number — the curve and its derivative
// rate: number — learning rate (alpha)
// startX: number — initial x
// getRandomStart: () => number, optional, called on Reset to pick a fresh starting x
//   instead of returning to the original startX
// curveLatex, pointLatex, className: same shape as CurveDesmosGraph
// onStateChange: ({ x, slope, step, converged, history, running, start, stop, reset }) => void
//   called whenever the algorithm's state changes, so the page can render readouts/controls from it
function GradientDescentGraph({
  f,
  df,
  rate,
  startX,
  getRandomStart,
  curveLatex,
  pointLatex,
  className,
  onStateChange,
}) {
  const [x, setX] = useState(startX);
  const [trail, setTrail] = useState([]);
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const resetRef = useRef(null);
  const xRef = useRef(x);
  xRef.current = x;
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const intervalRef = useRef(null);

  const slope = df(x);
  const step = -rate * slope;
  const converged = Math.abs(slope) < CONVERGE_THRESHOLD;

  function stop() {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function takeStep() {
    const curX = xRef.current;
    const curSlope = df(curX);
    if (Math.abs(curSlope) < CONVERGE_THRESHOLD) {
      stop();
      return;
    }
    const curStep = -rateRef.current * curSlope;
    const xNew = curX + curStep;
    setHistory((h) => [...h, { x: curX, fx: f(curX), slope: curSlope, step: curStep, xNew }]);
    setTrail((t) => [...t, curX]);
    setX(xNew);
  }

  function start() {
    if (converged || running) return;
    setRunning(true);
    intervalRef.current = setInterval(takeStep, STEP_INTERVAL_MS);
  }

  function goTo(newX, options) {
    stop();
    setX(newX);
    setTrail([]);
    setHistory([]);
    if (resetRef.current) resetRef.current(newX, options);
  }

  function reset() {
    goTo(getRandomStart ? getRandomStart() : startX);
  }

  function pick(newX) {
    goTo(newX, { keepView: true });
  }

  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ x, slope, step, converged, history, running, start, stop, reset });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, slope, step, converged, history, running]);

  return (
    <CurveDesmosGraph
      curveLatex={curveLatex}
      pointLatex={pointLatex}
      f={f}
      x={x}
      trail={trail}
      onPick={pick}
      resetRef={resetRef}
      className={className}
    />
  );
}

export default GradientDescentGraph;
