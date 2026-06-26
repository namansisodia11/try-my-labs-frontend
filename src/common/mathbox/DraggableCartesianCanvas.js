import { useEffect, useRef } from 'react';
import './CartesianCanvas.css';

// point: { x, y }  — mutable object updated on drag
// onDrag: ({ x, y }) => void  — called after each drag move
// range: number
// cameraZ: number
// fov: number
function DraggableCartesianCanvas({ point, onDrag, range = 5, cameraZ = 8, fov = 30 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox || !window.THREE) return;

    const THREE = window.THREE;

    const mathbox = window.MathBox.mathBox({
      element: container,
      plugins: ['core', 'controls', 'cursor'],
      controls: { klass: THREE.OrbitControls },
      camera: { fov },
    });

    const three = mathbox.three;
    three.renderer.setClearColor(new THREE.Color(0xfafafa), 1.0);
    three.camera.position.set(0, 0, cameraZ);
    three.controls.target.set(0, 0, 0);
    three.controls.noRotate = true;
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

    // pts is read live by MathBox each frame
    const pts = [[point.x, point.y, 0]];

    view.array({ id: 'drag-points', channels: 3, width: 1, data: pts });

    // Highlight ring — visible when hovered or dragging
    let hovered = false;
    let dragging = false;

    view
      .array({
        id: 'drag-colors',
        channels: 4,
        width: 1,
        expr: (emit) => {
          if (dragging || hovered) {
            emit(0, 0.5, 0.9, 0.5);
          } else {
            emit(1, 1, 1, 0);
          }
        },
      })
      .point({
        points: '#drag-points',
        colors: '#drag-colors',
        color: 'white',
        size: 38,
        zIndex: 2,
        zTest: false,
        zWrite: false,
      });

    view.point({ points: '#drag-points', color: [0.2, 0.5, 0.9, 1], size: 22, zIndex: 3 });

    const canvas = three.canvas;
    const camera = three.camera;

    // MathBox cartesian: scale=[2,2], range=[-r,r]
    // world_coord = mathbox_coord * (2 / range)  =>  mathbox_coord = world_coord * (range / 2)
    const worldToMath = range / 2;

    // Convert canvas offsetX/Y to MathBox cartesian coords via ray-z0-plane intersection
    function canvasToMath(offsetX, offsetY) {
      const ndcX = (offsetX / canvas.offsetWidth) * 2 - 1;
      const ndcY = -((offsetY / canvas.offsetHeight) * 2 - 1);
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const t = -camera.position.z / dir.z;
      const wx = camera.position.x + dir.x * t;
      const wy = camera.position.y + dir.y * t;
      return { x: wx * worldToMath, y: wy * worldToMath };
    }

    // Hit radius in MathBox units: ~30px worth of world space
    function hitRadius() {
      const ndcA = new THREE.Vector3(0, 0, 0.5).unproject(camera);
      const ndcB = new THREE.Vector3((30 / canvas.offsetWidth) * 2, 0, 0.5).unproject(camera);
      const dir = ndcB.clone().sub(camera.position).normalize();
      const t = -camera.position.z / dir.z;
      const wx = camera.position.x + dir.x * t;
      const ref = ndcA.clone().sub(camera.position).normalize();
      const tr = -camera.position.z / ref.z;
      const wrx = camera.position.x + ref.x * tr;
      return Math.abs((wx - wrx) * worldToMath);
    }

    function isNearPoint(offsetX, offsetY) {
      const m = canvasToMath(offsetX, offsetY);
      const dx = m.x - pts[0][0];
      const dy = m.y - pts[0][1];
      const r = hitRadius();
      return dx * dx + dy * dy < r * r;
    }

    function movePoint(offsetX, offsetY) {
      const m = canvasToMath(offsetX, offsetY);
      const clamp = (v) => Math.max(-range, Math.min(range, v));
      const mx = clamp(m.x);
      const my = clamp(m.y);
      pts[0][0] = mx;
      pts[0][1] = my;
      point.x = mx;
      point.y = my;
      if (onDrag) onDrag({ x: mx, y: my });
    }

    function onMouseDown(e) {
      if (!isNearPoint(e.offsetX, e.offsetY)) return;
      e.stopPropagation();
      e.preventDefault();
      dragging = true;
      three.controls.enabled = false;
    }

    function onMouseMove(e) {
      hovered = isNearPoint(e.offsetX, e.offsetY);
      canvas.style.cursor = hovered || dragging ? 'grab' : '';
      if (!dragging) return;
      e.stopPropagation();
      e.preventDefault();
      movePoint(e.offsetX, e.offsetY);
    }

    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      three.controls.enabled = true;
    }

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const touch = e.targetTouches[0];
      const rect = canvas.getBoundingClientRect();
      const ox = touch.pageX - rect.left;
      const oy = touch.pageY - rect.top;
      if (!isNearPoint(ox, oy)) return;
      e.preventDefault();
      dragging = true;
      three.controls.enabled = false;
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd, false);
      canvas.addEventListener('touchcancel', onTouchEnd, false);
    }

    function onTouchMove(e) {
      if (!dragging || e.touches.length !== 1) return;
      e.preventDefault();
      const touch = e.targetTouches[0];
      const rect = canvas.getBoundingClientRect();
      movePoint(touch.pageX - rect.left, touch.pageY - rect.top);
    }

    function onTouchEnd() {
      dragging = false;
      three.controls.enabled = true;
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    }

    // capture phase so we beat OrbitControls
    canvas.addEventListener('mousedown', onMouseDown, true);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown, true);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      three.renderer.dispose();
      container.innerHTML = '';
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mathbox-canvas-wrap">
      <div ref={containerRef} className="mathbox-canvas" />
      <div className="mathbox-hint">
        <span className="mathbox-hint-item">Drag the blue point</span>
      </div>
    </div>
  );
}

export default DraggableCartesianCanvas;
