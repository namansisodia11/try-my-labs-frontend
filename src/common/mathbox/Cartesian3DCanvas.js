import { useCallback } from 'react';
import CartesianCanvas from './CartesianCanvas';
import { BG_COLOR, AXIS_WIDTH, GRID_COLOR, GRID_WIDTH } from './canvasTheme';

// point: { x, y, z } — mutable ref object, updated in-place on drag
// onDrag: ({ x, y, z }) => void
// range: number — grid spans [-range, range]
function Cartesian3DCanvas({ point, onDrag, range = 5 }) {
  const setup = useCallback((container, THREE) => {
    const mathbox = window.MathBox.mathBox({
      element: container,
      plugins: ['core', 'controls', 'cursor'],
      controls: { klass: THREE.OrbitControls },
      camera: { fov: 30 },
    });

    const three = mathbox.three;
    three.renderer.setClearColor(new THREE.Color(BG_COLOR), 1.0);
    three.camera.position.set(6, 5, 8);
    three.controls.target.set(0, 0, 0);
    three.controls.update();

    const view = mathbox.set('focus', 8).cartesian({
      range: [
        [-range, range],
        [-range, range],
        [-range, range],
      ],
      scale: [2, 2, 2],
    });

    view.grid({
      axes: 'xz',
      divideX: range * 2,
      divideY: range * 2,
      color: GRID_COLOR,
      opacity: 0.7,
      width: GRID_WIDTH,
    });
    view.axis({ axis: 1, color: 0xdd4444, width: AXIS_WIDTH });
    view.axis({ axis: 2, color: 0x44aa55, width: AXIS_WIDTH });
    view.axis({ axis: 3, color: 0x4455dd, width: AXIS_WIDTH });

    const pts = [[point.x ?? 0, point.y ?? 0, point.z ?? 0]];
    const hitRadius = 30;

    function onMove(idx, v) {
      const clamp = (val) => Math.max(-range, Math.min(range, val));
      pts[0][0] = clamp(v.x);
      pts[0][1] = clamp(v.y);
      pts[0][2] = clamp(v.z);
      point.x = pts[0][0];
      point.y = pts[0][1];
      point.z = pts[0][2];
      if (onDrag) onDrag({ x: pts[0][0], y: pts[0][1], z: pts[0][2] });
    }

    return { three, view, pts, n: 1, hitRadius, onMove };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CartesianCanvas setup={setup} hints={['Drag the blue point', 'Right-click drag to orbit']} />
  );
}

export default Cartesian3DCanvas;
