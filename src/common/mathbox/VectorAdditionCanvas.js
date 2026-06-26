import { useCallback } from 'react';
import CartesianCanvas from './CartesianCanvas';

// a: { x, y }  b: { x, y }  range: number  cameraZ: number  fov: number
function VectorAdditionCanvas({ a, b, range, cameraZ, fov }) {
  const draw = useCallback(
    (view) => {
      const s = { x: a.x + b.x, y: a.y + b.y };

      view.array({
        id: 'va',
        data: [
          [0, 0, 0],
          [a.x, a.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#va', color: 0x4f46e5, width: 3, end: true });
      view.point({ points: '#va', color: 0x4f46e5, size: 8 });

      view.array({
        id: 'vb',
        data: [
          [0, 0, 0],
          [b.x, b.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#vb', color: 0xe53e3e, width: 3, end: true });
      view.point({ points: '#vb', color: 0xe53e3e, size: 8 });

      view.array({
        id: 'vs',
        data: [
          [0, 0, 0],
          [s.x, s.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#vs', color: 0x059669, width: 3, end: true });
      view.point({ points: '#vs', color: 0x059669, size: 8 });

      // Parallelogram dashes
      view.array({
        id: 'pa',
        data: [
          [a.x, a.y, 0],
          [s.x, s.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#pa', color: 0xe53e3e, width: 1, opacity: 0.3 });
      view.array({
        id: 'pb',
        data: [
          [b.x, b.y, 0],
          [s.x, s.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#pb', color: 0x4f46e5, width: 1, opacity: 0.3 });

      [
        { pos: [a.x + 0.2, a.y + 0.2, 0], text: `a (${a.x},${a.y})`, color: 0x4f46e5 },
        { pos: [b.x + 0.2, b.y + 0.2, 0], text: `b (${b.x},${b.y})`, color: 0xe53e3e },
        { pos: [s.x + 0.2, s.y + 0.2, 0], text: `a+b (${s.x},${s.y})`, color: 0x059669 },
      ].forEach(({ pos, text, color }, i) => {
        view.array({ id: `lp${i}`, data: [pos], channels: 3 });
        view.text({ id: `lt${i}`, data: [text] });
        view.label({ points: `#lp${i}`, text: `#lt${i}`, color, size: 14, offset: [0, 16] });
      });
    },
    [a, b],
  );

  return <CartesianCanvas draw={draw} range={range} cameraZ={cameraZ} fov={fov} />;
}

export default VectorAdditionCanvas;
