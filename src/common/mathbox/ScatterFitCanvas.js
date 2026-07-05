import { useEffect, useRef } from 'react';
import { BG_COLOR, AXIS_COLOR, AXIS_WIDTH, GRID_COLOR, GRID_WIDTH } from './canvasTheme';
import './CartesianCanvas.css';

// dataPoints: [{ x, y }] — fixed scatter, never dragged
// mRef: ref to a number — current slope of the fitted line y = m*x, read every frame
// activeIndexRef: ref to a number or null — index into dataPoints to highlight (the
//   point stochastic descent is currently using), read every frame
// range: number — grid spans [-range, range], pick big enough to fit every data point
//
// Builds its own MathBox scene directly instead of going through CartesianCanvas:
// there are no draggable points here, so the drag/hit-testing machinery shared by
// the other Cartesian*Canvas wrappers doesn't apply.
function ScatterFitCanvas({ dataPoints, mRef, activeIndexRef, range = 6 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox || !window.THREE) return;

    const THREE = window.THREE;
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

    view.array({
      id: 'sfc-line',
      channels: 3,
      width: 2,
      expr: (emit) => {
        emit(-range, -range * mRef.current, 0);
        emit(range, range * mRef.current, 0);
      },
    });
    view.line({ points: '#sfc-line', color: 0x4f46e5, width: 3 });

    view.array({
      id: 'sfc-residuals',
      channels: 3,
      width: dataPoints.length * 2,
      expr: (emit) => {
        dataPoints.forEach((p) => {
          emit(p.x, p.y, 0);
          emit(p.x, mRef.current * p.x, 0);
        });
      },
    });
    view.line({ points: '#sfc-residuals', color: 0xe53e3e, width: 1, opacity: 0.35 });

    view.array({
      id: 'sfc-data',
      channels: 3,
      width: dataPoints.length,
      expr: (emit) => {
        dataPoints.forEach((p) => emit(p.x, p.y, 0));
      },
    });
    view.point({ points: '#sfc-data', color: 0xe53e3e, size: 14, zIndex: 2 });

    view.array({
      id: 'sfc-active-colors',
      channels: 4,
      width: dataPoints.length,
      expr: (emit, i) => {
        if (activeIndexRef.current === i) emit(1, 0.72, 0.2, 1);
        else emit(1, 1, 1, 0);
      },
    });
    view.point({
      points: '#sfc-data',
      colors: '#sfc-active-colors',
      color: 'white',
      size: 26,
      zIndex: 1,
      zTest: false,
      zWrite: false,
    });

    return () => {
      three.renderer.dispose();
      container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mathbox-canvas-wrap">
      <div ref={containerRef} className="mathbox-canvas" />
      <div className="mathbox-hint">
        <span className="mathbox-hint-item">Scroll to zoom</span>
        <span className="mathbox-hint-item">Pan to move</span>
      </div>
    </div>
  );
}

export default ScatterFitCanvas;
