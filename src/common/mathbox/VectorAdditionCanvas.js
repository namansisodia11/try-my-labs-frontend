import { useRef, useCallback } from 'react';
import Cartesian2DCanvas from './Cartesian2DCanvas';

// a: { x, y }  b: { x, y }  range: number  onDrag: (idx, {x,y}) => void
function VectorAdditionCanvas({ a, b, range = 5, onDrag }) {
  const aRef = useRef(a);
  const bRef = useRef(b);

  // pts is the live array owned by Cartesian2DCanvas: [[ax,ay,0],[bx,by,0]]
  const draw = useCallback((view, pts) => {
    // vectors a and b from origin
    view.array({
      id: 'va',
      channels: 3,
      width: 2,
      expr: (emit) => {
        emit(0, 0, 0);
        emit(pts[0][0], pts[0][1], 0);
      },
    });
    view.line({ points: '#va', color: 0x4f46e5, width: 3, end: true });

    view.array({
      id: 'vb',
      channels: 3,
      width: 2,
      expr: (emit) => {
        emit(0, 0, 0);
        emit(pts[1][0], pts[1][1], 0);
      },
    });
    view.line({ points: '#vb', color: 0xe53e3e, width: 3, end: true });

    // sum vector
    view.array({
      id: 'vs',
      channels: 3,
      width: 2,
      expr: (emit) => {
        emit(0, 0, 0);
        emit(pts[0][0] + pts[1][0], pts[0][1] + pts[1][1], 0);
      },
    });
    view.line({ points: '#vs', color: 0x059669, width: 3, end: true });

    // parallelogram dashes
    view.array({
      id: 'pa',
      channels: 3,
      width: 2,
      expr: (emit) => {
        emit(pts[0][0], pts[0][1], 0);
        emit(pts[0][0] + pts[1][0], pts[0][1] + pts[1][1], 0);
      },
    });
    view.line({ points: '#pa', color: 0xe53e3e, width: 1, opacity: 0.3 });

    view.array({
      id: 'pb',
      channels: 3,
      width: 2,
      expr: (emit) => {
        emit(pts[1][0], pts[1][1], 0);
        emit(pts[0][0] + pts[1][0], pts[0][1] + pts[1][1], 0);
      },
    });
    view.line({ points: '#pb', color: 0x4f46e5, width: 1, opacity: 0.3 });

    // labels
    const labelDefs = [
      {
        id: 'la',
        color: 0x4f46e5,
        expr: (emit) => emit(pts[0][0] + 0.2, pts[0][1] + 0.2, 0),
        text: () => `a (${+pts[0][0].toFixed(1)},${+pts[0][1].toFixed(1)})`,
      },
      {
        id: 'lb',
        color: 0xe53e3e,
        expr: (emit) => emit(pts[1][0] + 0.2, pts[1][1] + 0.2, 0),
        text: () => `b (${+pts[1][0].toFixed(1)},${+pts[1][1].toFixed(1)})`,
      },
      {
        id: 'ls',
        color: 0x059669,
        expr: (emit) => emit(pts[0][0] + pts[1][0] + 0.2, pts[0][1] + pts[1][1] + 0.2, 0),
        text: () =>
          `a+b (${+(pts[0][0] + pts[1][0]).toFixed(1)},${+(pts[0][1] + pts[1][1]).toFixed(1)})`,
      },
    ];
    labelDefs.forEach(({ id, color, expr, text }) => {
      view.array({ id: `lp-${id}`, channels: 3, width: 1, expr });
      view.text({ id: `lt-${id}`, width: 1, expr: (emit) => emit(text()) });
      view.label({ points: `#lp-${id}`, text: `#lt-${id}`, color, size: 14, offset: [0, 16] });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDrag = useCallback(
    (idx, { x, y }) => {
      if (idx === 0) {
        aRef.current.x = x;
        aRef.current.y = y;
      } else {
        bRef.current.x = x;
        bRef.current.y = y;
      }
      if (onDrag) onDrag(idx, { x, y });
    },
    [onDrag],
  );

  return (
    <Cartesian2DCanvas
      points={[aRef.current, bRef.current]}
      onDrag={handleDrag}
      draw={draw}
      range={range}
    />
  );
}

export default VectorAdditionCanvas;
