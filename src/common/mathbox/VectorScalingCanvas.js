import { useCallback } from 'react';
import CartesianCanvas from './CartesianCanvas';

// vector: { x, y }  scalars: [{ c, color }]  range: number  cameraZ: number  fov: number
function VectorScalingCanvas({ vector, scalars, range, cameraZ, fov }) {
  const draw = useCallback(
    (view) => {
      const { x, y } = vector;

      view.array({
        id: 'sv0',
        data: [
          [0, 0, 0],
          [x, y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#sv0', color: 0x4f46e5, width: 3, end: true });
      view.point({ points: '#sv0', color: 0x4f46e5, size: 8 });

      scalars.forEach(({ c, color }, i) => {
        const id = `sv${i + 1}`;
        view.array({
          id,
          data: [
            [0, 0, 0],
            [c * x, c * y, 0],
          ],
          channels: 3,
        });
        view.line({ points: `#${id}`, color, width: 2, end: true });
        view.point({ points: `#${id}`, color, size: 6 });
      });

      const labelFor = (c, color, i) => {
        const lx = c * x;
        const ly = c * y;
        const label =
          c === 1 ? `v (${x},${y})` : `${c}v (${+(c * x).toFixed(2)},${+(c * y).toFixed(2)})`;
        // nudge negative vectors left so label doesn't overlap origin
        const ox = lx < 0 ? -1.8 : 0.2;
        const oy = ly < 0 ? -0.4 : 0.2;
        return { pos: [lx + ox, ly + oy, 0], text: label, color };
      };

      [{ c: 1, color: 0x4f46e5 }, ...scalars]
        .map(({ c, color }, i) => labelFor(c, color, i))
        .forEach(({ pos, text, color }, i) => {
          view.array({ id: `slp${i}`, data: [pos], channels: 3 });
          view.text({ id: `slt${i}`, data: [text] });
          view.label({ points: `#slp${i}`, text: `#slt${i}`, color, size: 14, offset: [0, 16] });
        });
    },
    [vector, scalars],
  );

  return <CartesianCanvas draw={draw} range={range} cameraZ={cameraZ} fov={fov} />;
}

export default VectorScalingCanvas;
