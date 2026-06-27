import { useRef, useCallback } from 'react';
import Cartesian2DCanvas from './Cartesian2DCanvas';

// vector: { x, y }  scalars: [{ c, color }]  range: number  onDrag: ({x,y}) => void
function VectorScalingCanvas({ vector, scalars, range = 5, onDrag }) {
  const vecRef = useRef(vector);

  const draw = useCallback((view, pts) => {
    // base vector v
    view.array({
      id: 'sv0',
      channels: 3,
      width: 2,
      expr: (emit) => {
        emit(0, 0, 0);
        emit(pts[0][0], pts[0][1], 0);
      },
    });
    view.line({ points: '#sv0', color: 0x4f46e5, width: 3, end: true });

    // scaled vectors
    scalars.forEach(({ c, color }, i) => {
      const id = `sv${i + 1}`;
      view.array({
        id,
        channels: 3,
        width: 2,
        expr: (emit) => {
          emit(0, 0, 0);
          emit(c * pts[0][0], c * pts[0][1], 0);
        },
      });
      view.line({ points: `#${id}`, color, width: 2, end: true });
    });

    // labels for v and each scaled vector
    [{ c: 1, color: 0x4f46e5 }, ...scalars].forEach(({ c, color }, i) => {
      view.array({
        id: `slp${i}`,
        channels: 3,
        width: 1,
        expr: (emit) => {
          const lx = c * pts[0][0];
          const ly = c * pts[0][1];
          const ox = lx < 0 ? -1.8 : 0.2;
          const oy = ly < 0 ? -0.4 : 0.2;
          emit(lx + ox, ly + oy, 0);
        },
      });
      view.text({
        id: `slt${i}`,
        width: 1,
        expr: (emit) => {
          const x = pts[0][0],
            y = pts[0][1];
          const label =
            c === 1
              ? `v (${+x.toFixed(1)},${+y.toFixed(1)})`
              : `${c}v (${+(c * x).toFixed(1)},${+(c * y).toFixed(1)})`;
          emit(label);
        },
      });
      view.label({ points: `#slp${i}`, text: `#slt${i}`, color, size: 14, offset: [0, 16] });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDrag = useCallback(
    (_, { x, y }) => {
      vecRef.current.x = x;
      vecRef.current.y = y;
      if (onDrag) onDrag({ x, y });
    },
    [onDrag],
  );

  return (
    <Cartesian2DCanvas points={[vecRef.current]} onDrag={handleDrag} draw={draw} range={range} />
  );
}

export default VectorScalingCanvas;
