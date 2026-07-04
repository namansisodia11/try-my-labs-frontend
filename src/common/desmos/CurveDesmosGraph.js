import React, { useRef } from 'react';
import useDesmosCalculator from './useDesmosCalculator';

// curveLatex: string, e.g. 'y = \\frac{x^4}{4} - x^3 - \\frac{x^2}{2} + 3.4x'
// pointLatex: (varName) => string, e.g. (a) => `(${a}, \\frac{${a}^4}{4} - ...)`
// f: (x) => number, used to plot trail points
// x, trail, onPick, resetRef, className: same shape as before
function CurveDesmosGraph({ curveLatex, pointLatex, f, x, trail, onPick, resetRef, className }) {
  const containerRef = useRef(null);
  const maxTrailRef = useRef(0);
  const lastSyncedARef = useRef(x);
  const calcRef = useDesmosCalculator(containerRef, (calculator, Desmos) => {
    calculator.setMathBounds({ left: -3, right: 5, bottom: -4, top: 4 });

    calculator.setExpression({
      id: 'curve',
      latex: curveLatex,
      color: '#e85d4a',
      lineWidth: 3,
    });

    calculator.setExpression({ id: 'a', latex: `a = ${x}` });

    calculator.setExpression({
      id: 'pick-halo',
      latex: pointLatex('a'),
      color: '#6366f1',
      pointSize: 34,
      pointOpacity: 0.25,
      dragMode: Desmos.DragModes.NONE,
      secret: true,
    });
    calculator.setExpression({
      id: 'pick',
      latex: pointLatex('a'),
      color: '#6366f1',
      pointSize: 16,
      dragMode: Desmos.DragModes.X,
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
      resetRef.current = (newX, options = {}) => {
        for (let i = 0; i < maxTrailRef.current; i++) {
          calculator.removeExpression({ id: `trail-${i}` });
        }
        calculator.removeExpression({ id: 'path' });
        maxTrailRef.current = 0;
        lastSyncedARef.current = newX;
        calculator.setExpression({ id: 'a', latex: `a = ${newX}` });
        if (!options.keepView) {
          calculator.setMathBounds({ left: -3, right: 5, bottom: -4, top: 4 });
        }
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
        color: '#6366f1',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, trail, calcRef, f]);

  return <div ref={containerRef} className={className} />;
}

export default CurveDesmosGraph;
