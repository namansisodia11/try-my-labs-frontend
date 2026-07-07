import { useEffect, useRef } from 'react';
import { BG_COLOR, AXIS_COLOR, AXIS_WIDTH, GRID_COLOR, GRID_WIDTH } from './canvasTheme';
import './CartesianCanvas.css';

// pointsRef: ref to [{ x, y }] — current scatter, read every frame so points can
//   change (e.g. on reset) without remounting the MathBox scene
// mRef: ref to a number — current slope of the fitted line y = m*x, read every frame
// activeIndexRef: ref to a number, 'all', or null — which point(s) to highlight as
//   currently in use (a single index for stochastic, 'all' for batch), read every frame
// xRange/yRange: [min, max] — grid bounds, pick big enough to fit every data point
// pointCount: number — fixed number of scatter points, sizes the MathBox arrays once
// resetViewRef: ref that gets a function() attached to it, call it to snap the
//   camera back to its initial position/zoom (e.g. alongside a data reset)
//
// Builds its own MathBox scene directly instead of going through CartesianCanvas:
// there are no draggable points here, so the drag/hit-testing machinery shared by
// the other Cartesian*Canvas wrappers doesn't apply.
function ScatterFitCanvas({
  pointsRef,
  mRef,
  activeIndexRef,
  xRange = [-6, 6],
  yRange = [-6, 6],
  pointCount,
  resetViewRef,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox || !window.THREE) return;

    const THREE = window.THREE;
    const ortho = 10000;
    const vertical = 2.5;
    const fov = Math.atan(vertical / ortho) * (360 / Math.PI);
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;

    const mathbox = window.MathBox.mathBox({
      element: container,
      plugins: ['core', 'controls', 'cursor'],
      controls: { klass: THREE.OrbitControls },
      camera: { fov, near: ortho / 4, far: ortho * 4 },
    });

    const three = mathbox.three;
    three.renderer.setClearColor(new THREE.Color(BG_COLOR), 1.0);
    three.controls.noPan = true;

    const resetView = () => {
      three.camera.position.set(0, 0, ortho);
      three.camera.lookAt(0, 0, 0);
      three.controls.target.set(0, 0, 0);
      three.controls.update();
    };
    resetView();
    if (resetViewRef) resetViewRef.current = resetView;

    const view = mathbox.set('focus', ortho / 1.5).cartesian({
      range: [
        [xMin, xMax],
        [yMin, yMax],
      ],
      scale: [2, 2],
    });

    view.grid({
      axes: 'xy',
      divideX: xMax - xMin,
      divideY: yMax - yMin,
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
        [xMax * 0.92, yMin + (yMax - yMin) * 0.04, 0],
        [xMin + (xMax - xMin) * 0.02, yMax * 0.92, 0],
      ],
    });
    view.text({ data: ['x', 'y'] });
    view.label({ points: '#axis-labels-pos', color: AXIS_COLOR, size: 18, offset: [0, 0] });

    view.array({
      id: 'sfc-line',
      channels: 3,
      width: 2,
      expr: (emit) => {
        emit(xMin, xMin * mRef.current, 0);
        emit(xMax, xMax * mRef.current, 0);
      },
    });
    view.line({ points: '#sfc-line', color: 0x4f46e5, width: 3 });

    view.array({
      id: 'sfc-residuals',
      channels: 3,
      width: pointCount * 2,
      expr: (emit) => {
        pointsRef.current.forEach((p) => {
          emit(p.x, p.y, 0);
          emit(p.x, mRef.current * p.x, 0);
        });
      },
    });
    view.line({ points: '#sfc-residuals', color: 0x9ca3af, width: 2, opacity: 0.8 });

    view.array({
      id: 'sfc-data',
      channels: 3,
      width: pointCount,
      expr: (emit) => {
        pointsRef.current.forEach((p) => emit(p.x, p.y, 0));
      },
    });
    view.point({ points: '#sfc-data', color: 0x4338ca, size: 14, zIndex: 2 });

    view.array({
      id: 'sfc-active-colors',
      channels: 4,
      width: pointCount,
      expr: (emit, i) => {
        if (activeIndexRef.current === i || activeIndexRef.current === 'all') {
          emit(1, 0.72, 0.2, 1);
        } else {
          emit(1, 1, 1, 0);
        }
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
      if (resetViewRef && resetViewRef.current === resetView) resetViewRef.current = null;
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
