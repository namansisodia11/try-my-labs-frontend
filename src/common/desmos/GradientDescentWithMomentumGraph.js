import { useEffect, useRef, useState } from 'react';
import CurveDesmosGraph from './CurveDesmosGraph';

const STEP_INTERVAL_MS = 500;
// looser than plain descent's 0.01: momentum overshoots and oscillates near the
// minimum, so waiting for a near-exact zero would bounce for way too many steps
const CONVERGE_THRESHOLD = 0.05;

// f: (x) => number, df: (x) => number — the curve and its derivative
// rate: number — learning rate (alpha), beta: number — momentum
// startX: number — initial x
// getRandomStart: () => number, optional, called on Reset to pick a fresh starting x
//   instead of returning to the original startX
// curveLatex, pointLatex, className: same shape as CurveDesmosGraph
// onStateChange: ({ x, slope, lastStep, converged, history, running, start, stop, reset }) => void
//   called whenever the momentum algorithm's state changes, so the page can render readouts/controls from it
function GradientDescentWithMomentumGraph({
  f,
  df,
  rate,
  beta,
  startX,
  getRandomStart,
  curveLatex,
  pointLatex,
  className,
  onStateChange,
}) {
  const [x, setX] = useState(startX);
  const [prevX, setPrevX] = useState(startX);
  const [trail, setTrail] = useState([]);
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const resetRef = useRef(null);
  const xRef = useRef(x);
  xRef.current = x;
  const prevXRef = useRef(prevX);
  prevXRef.current = prevX;
  const betaRef = useRef(beta);
  betaRef.current = beta;
  const intervalRef = useRef(null);

  const slope = df(x);
  const lastStep = x - prevX;
  const converged = Math.abs(slope) < CONVERGE_THRESHOLD && Math.abs(lastStep) < CONVERGE_THRESHOLD;

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
    const curLastStep = curX - prevXRef.current;
    const curStep = rate * curSlope - betaRef.current * curLastStep;
    if (Math.abs(curSlope) < CONVERGE_THRESHOLD && Math.abs(curStep) < CONVERGE_THRESHOLD) {
      stop();
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
  }

  function start() {
    if (converged || running) return;
    setRunning(true);
    intervalRef.current = setInterval(takeStep, STEP_INTERVAL_MS);
  }

  function goTo(newX, options) {
    stop();
    setX(newX);
    setPrevX(newX);
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
      onStateChange({ x, slope, lastStep, converged, history, running, start, stop, reset });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, slope, lastStep, converged, history, running]);

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

export default GradientDescentWithMomentumGraph;
