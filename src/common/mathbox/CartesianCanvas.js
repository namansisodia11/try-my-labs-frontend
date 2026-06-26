import { useEffect, useRef } from 'react';
import './CartesianCanvas.css';

// draw: (view) => void  — called once after grid/axes are set up
// range: number         — grid spans [-range, range] on both axes (default 5)
// cameraZ: number       — camera distance on Z axis (default 6)
// fov: number           — camera field of view in degrees (default 30)
function CartesianCanvas({ draw, range = 5, cameraZ = 8, fov = 30 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox) return;

    const mathbox = window.MathBox.mathBox({
      element: container,
      plugins: ['core', 'controls', 'cursor'],
      controls: { klass: window.THREE.OrbitControls },
      camera: { fov },
    });

    const three = mathbox.three;
    three.renderer.setClearColor(new window.THREE.Color(0xfafafa), 1.0);
    three.camera.position.set(0, 0, cameraZ);
    three.controls.target.set(0, 0, 0);
    three.controls.update();

    const view = mathbox.set('focus', cameraZ).cartesian({
      range: [
        [-range, range],
        [-range, range],
      ],
      scale: [2, 2],
    });

    view.grid({ axes: 'xy', divideX: range * 2, divideY: range * 2, color: 0xcccccc, opacity: 1 });
    view.axis({ axis: 1, color: 0x666666, width: 3 });
    view.axis({ axis: 2, color: 0x666666, width: 3 });

    draw(view);

    return () => {
      three.renderer.dispose();
      container.innerHTML = '';
    };
  }, [draw, range, cameraZ, fov]);

  return (
    <div className="mathbox-canvas-wrap">
      <div ref={containerRef} className="mathbox-canvas" />
      <div className="mathbox-hint">
        <span className="mathbox-hint-item" title="Scroll to zoom">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Scroll to zoom
        </span>
        <span className="mathbox-hint-item" title="Drag to rotate">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Drag to pan
        </span>
      </div>
    </div>
  );
}

export default CartesianCanvas;
