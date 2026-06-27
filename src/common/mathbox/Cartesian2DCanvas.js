import { useCallback } from 'react';
import CartesianCanvas from './CartesianCanvas';
import { BG_COLOR, AXIS_COLOR, AXIS_WIDTH, GRID_COLOR, GRID_WIDTH } from './canvasTheme';

// Single-point mode:  point: { x, y },  onDrag: ({ x, y }) => void
// Multi-point mode:   points: [{ x, y }, ...],  onDrag: (index, { x, y }) => void
// Optional:          draw: (view, pts) => void  — called after axes, receives live pts array
// range: number — grid spans [-range, range]
function Cartesian2DCanvas({ point, points, onDrag, draw, range = 5 }) {
  const setup = useCallback((container, THREE) => {
    const ortho = 10000;
    const vertical = 2.5;
    const fov = Math.atan(vertical / ortho) * (360 / Math.PI);

    const mathbox = window.MathBox.mathBox({
      element: container,
      plugins: ['core', 'controls', 'cursor'],
      controls: { klass: THREE.OrbitControls },
      camera: { fov, near: ortho / 4, far: ortho * 4 },
    });

    const three = mathbox.three;
    three.renderer.setClearColor(new THREE.Color(BG_COLOR), 1.0);
    three.camera.position.set(0, 0, ortho);
    three.camera.lookAt(0, 0, 0);
    three.controls.noRotate = true;
    three.controls.noPan = true;
    three.controls.target.set(0, 0, 0);
    three.controls.update();

    const view = mathbox.set('focus', ortho / 1.5).cartesian({
      range: [
        [-range, range],
        [-range, range],
      ],
      scale: [2, 2],
    });

    view.grid({
      axes: 'xy',
      divideX: range * 2,
      divideY: range * 2,
      color: GRID_COLOR,
      opacity: 1,
      width: GRID_WIDTH,
    });
    view.axis({ axis: 1, color: AXIS_COLOR, width: AXIS_WIDTH });
    view.axis({ axis: 2, color: AXIS_COLOR, width: AXIS_WIDTH });

    view.array({
      id: 'axis-labels-pos',
      channels: 3,
      width: 2,
      data: [
        [range * 0.92, 0.28, 0],
        [0.28, range * 0.92, 0],
      ],
    });
    view.text({ data: ['x', 'y'] });
    view.label({ points: '#axis-labels-pos', color: AXIS_COLOR, size: 18, offset: [0, 0] });

    const sources = points || [point];
    const pts = sources.map((p) => [p.x ?? 0, p.y ?? 0, 0]);
    const n = pts.length;
    const hitRadius = 30;

    if (draw) draw(view, pts);

    function onMove(idx, v) {
      const clamp = (val) => Math.max(-range, Math.min(range, val));
      pts[idx][0] = clamp(v.x);
      pts[idx][1] = clamp(v.y);
      sources[idx].x = pts[idx][0];
      sources[idx].y = pts[idx][1];
      if (onDrag) {
        if (points) onDrag(idx, { x: pts[idx][0], y: pts[idx][1] });
        else onDrag({ x: pts[idx][0], y: pts[idx][1] });
      }
    }

    return { three, view, pts, n, hitRadius, onMove };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <CartesianCanvas setup={setup} hints={['Drag the blue point']} />;
}

export default Cartesian2DCanvas;
