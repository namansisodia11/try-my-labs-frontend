import { useEffect, useRef } from 'react';
import './CartesianCanvas.css';

const RANGE = 5;

// mode: 'addition' | 'scaling'
function CartesianCanvas({ mode = 'addition' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox) return;

    const mathbox = window.MathBox.mathBox({
      element: container,
      plugins: ['core', 'controls', 'cursor'],
      controls: { klass: window.THREE.OrbitControls },
      camera: { fov: 30 },
    });

    const three = mathbox.three;
    three.renderer.setClearColor(new window.THREE.Color(0xfafafa), 1.0);
    three.camera.position.set(0, 0, 6);
    three.controls.target.set(0, 0, 0);
    three.controls.update();

    const view = mathbox.set('focus', 6).cartesian({
      range: [
        [-RANGE, RANGE],
        [-RANGE, RANGE],
      ],
      scale: [2, 2],
    });

    view.grid({ axes: 'xy', divideX: 10, divideY: 10, color: 0xcccccc, opacity: 1 });
    view.axis({ axis: 1, color: 0x666666, width: 3 });
    view.axis({ axis: 2, color: 0x666666, width: 3 });

    if (mode === 'addition') {
      const a = { x: 2, y: 1 };
      const b = { x: 1, y: 2 };
      const s = { x: a.x + b.x, y: a.y + b.y };

      view.array({
        id: 'va',
        data: [
          [0, 0, 0],
          [a.x, a.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#va', color: 0x4f46e5, width: 6, end: true });
      view.point({ points: '#va', color: 0x4f46e5, size: 14 });

      view.array({
        id: 'vb',
        data: [
          [0, 0, 0],
          [b.x, b.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#vb', color: 0xe53e3e, width: 6, end: true });
      view.point({ points: '#vb', color: 0xe53e3e, size: 14 });

      view.array({
        id: 'vs',
        data: [
          [0, 0, 0],
          [s.x, s.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#vs', color: 0x059669, width: 6, end: true });
      view.point({ points: '#vs', color: 0x059669, size: 14 });

      // Parallelogram dashes
      view.array({
        id: 'pa',
        data: [
          [a.x, a.y, 0],
          [s.x, s.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#pa', color: 0xe53e3e, width: 2, opacity: 0.4 });
      view.array({
        id: 'pb',
        data: [
          [b.x, b.y, 0],
          [s.x, s.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#pb', color: 0x4f46e5, width: 2, opacity: 0.4 });

      [
        { pos: [a.x + 0.2, a.y + 0.2, 0], text: 'a (2,1)', color: 0x4f46e5 },
        { pos: [b.x + 0.2, b.y + 0.2, 0], text: 'b (1,2)', color: 0xe53e3e },
        { pos: [s.x + 0.2, s.y + 0.2, 0], text: 'a+b (3,3)', color: 0x059669 },
      ].forEach(({ pos, text, color }, i) => {
        view.array({ id: `lp${i}`, data: [pos], channels: 3 });
        view.text({ id: `lt${i}`, data: [text] });
        view.label({ points: `#lp${i}`, text: `#lt${i}`, color, size: 18, offset: [0, 20] });
      });
    }

    if (mode === 'scaling') {
      const v = { x: 2, y: 1 };
      const scalars = [
        { c: 2, color: 0x059669 },
        { c: 0.5, color: 0xd97706 },
        { c: -1, color: 0xe53e3e },
      ];

      // Original vector v
      view.array({
        id: 'sv0',
        data: [
          [0, 0, 0],
          [v.x, v.y, 0],
        ],
        channels: 3,
      });
      view.line({ points: '#sv0', color: 0x4f46e5, width: 6, end: true });
      view.point({ points: '#sv0', color: 0x4f46e5, size: 14 });

      scalars.forEach(({ c, color }, i) => {
        const id = `sv${i + 1}`;
        view.array({
          id,
          data: [
            [0, 0, 0],
            [c * v.x, c * v.y, 0],
          ],
          channels: 3,
        });
        view.line({ points: `#${id}`, color, width: 4, end: true });
        view.point({ points: `#${id}`, color, size: 10 });
      });

      const labelDefs = [
        { pos: [v.x + 0.2, v.y + 0.2, 0], text: 'v (2,1)', color: 0x4f46e5 },
        { pos: [2 * v.x + 0.2, 2 * v.y + 0.2, 0], text: '2v (4,2)', color: 0x059669 },
        { pos: [0.5 * v.x + 0.2, 0.5 * v.y + 0.2, 0], text: '0.5v (1,0.5)', color: 0xd97706 },
        { pos: [-1 * v.x - 1.8, -1 * v.y - 0.4, 0], text: '-v (-2,-1)', color: 0xe53e3e },
      ];
      labelDefs.forEach(({ pos, text, color }, i) => {
        view.array({ id: `slp${i}`, data: [pos], channels: 3 });
        view.text({ id: `slt${i}`, data: [text] });
        view.label({ points: `#slp${i}`, text: `#slt${i}`, color, size: 18, offset: [0, 20] });
      });
    }

    return () => {
      three.renderer.dispose();
      container.innerHTML = '';
    };
  }, [mode]);

  return <div ref={containerRef} className="mathbox-canvas" />;
}

export default CartesianCanvas;
