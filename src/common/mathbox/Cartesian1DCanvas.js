import { useCallback } from 'react';
import CartesianCanvas from './CartesianCanvas';
import { BG_COLOR, AXIS_COLOR, AXIS_WIDTH, GRID_WIDTH } from './canvasTheme';

// point: { x } — mutable ref object, updated in-place on drag
// onDrag: ({ x }) => void
// range: number — number line spans [-range, range]
function Cartesian1DCanvas({ point, onDrag, range = 5 }) {
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
        [-1, 1],
      ],
      scale: [2, 0.5],
    });

    view.axis({ axis: 1, color: AXIS_COLOR, width: AXIS_WIDTH });
    view.scale({ axis: 1, divide: range * 2 });
    view.ticks({ classes: ['foo'], width: GRID_WIDTH * 1.5, color: AXIS_COLOR });
    view.label({ color: AXIS_COLOR, offset: [0, -20], size: 14 });

    const pts = [[point.x ?? 0, 0, 0]];
    const hitRadius = 30;

    function onMove(idx, v) {
      const clamp = (val) => Math.max(-range, Math.min(range, val));
      pts[0][0] = clamp(v.x);
      // y stays 0 — constrained to number line
      point.x = pts[0][0];
      if (onDrag) onDrag({ x: pts[0][0] });
    }

    return { three, view, pts, n: 1, hitRadius, onMove };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <CartesianCanvas setup={setup} hints={['Drag the blue point']} />;
}

export default Cartesian1DCanvas;
