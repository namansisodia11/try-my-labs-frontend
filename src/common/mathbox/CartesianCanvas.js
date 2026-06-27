import { useEffect, useRef } from 'react';
import './CartesianCanvas.css';

// setup: (element, THREE) => { three, view, pts, n, hitRadius, onMove }
//   three:     MathBox three object (renderer / camera / canvas / controls)
//   view:      MathBox cartesian view node
//   pts:       mutable [[x,y,z], ...] shared with the caller
//   n:         number of draggable points
//   hitRadius: pixel hit detection radius
//   onMove:    (idx, unprojected THREE.Vector3, ptArr) => void
// hints: [string]
function CartesianCanvas({ setup, hints = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox || !window.THREE) return;

    const THREE = window.THREE;
    const { three, view, pts, n, hitRadius, onMove } = setup(container, THREE);

    const camera = three.camera;
    const canvas = three.canvas;
    const pointSize = 20;

    view.array({ id: 'drag-points', channels: 3, width: n, data: pts });

    let hovered = -1;
    let dragging = -1;

    view.point({ points: '#drag-points', color: [0.15, 0.4, 0.85, 1], size: pointSize, zIndex: 2 });

    view.array({
      id: 'drag-colors',
      channels: 4,
      width: n,
      expr: (emit, i) => {
        if (dragging === i || hovered === i) emit(1, 1, 1, 0.9);
        else emit(1, 1, 1, 0);
      },
    });
    view.point({
      points: '#drag-points',
      colors: '#drag-colors',
      color: 'white',
      size: pointSize * 0.4,
      zIndex: 3,
      zTest: false,
      zWrite: false,
    });

    const viewMatrix = view[0].controller.viewMatrix;
    const viewMatrixInv = new THREE.Matrix4().copy(viewMatrix).invert();
    const scratch = new THREE.Vector3();
    const mat = new THREE.Matrix4();
    const matInv = new THREE.Matrix4();
    const projected = new THREE.Vector3();
    const vector = new THREE.Vector3();

    function mathToScreen(mx, my, mz) {
      scratch.set(mx, my, mz).applyMatrix4(viewMatrix);
      scratch.project(camera);
      const dpr = window.devicePixelRatio || 1;
      return {
        sx: ((scratch.x + 1) / 2) * canvas.offsetWidth * dpr,
        sy: ((-scratch.y + 1) / 2) * canvas.offsetHeight * dpr,
      };
    }

    function hitTest(mouseX, mouseY) {
      for (let i = 0; i < n; i++) {
        const { sx, sy } = mathToScreen(pts[i][0], pts[i][1], pts[i][2] ?? 0);
        const dx = mouseX - sx;
        const dy = mouseY - sy;
        if (dx * dx + dy * dy < hitRadius * hitRadius) return i;
      }
      return -1;
    }

    function movePoint(idx, offsetX, offsetY) {
      const screenX = (offsetX / canvas.offsetWidth) * 2 - 1.0;
      const screenY = -((offsetY / canvas.offsetHeight) * 2 - 1.0);

      projected.set(pts[idx][0], pts[idx][1], pts[idx][2] ?? 0).applyMatrix4(viewMatrix);
      mat.multiplyMatrices(camera.projectionMatrix, matInv.copy(camera.matrixWorld).invert());
      const e = mat.elements;
      const px = projected.x,
        py = projected.y,
        pz = projected.z;
      const pw = 1 / (e[3] * px + e[7] * py + e[11] * pz + e[15]);
      const ndcZ = (e[2] * px + e[6] * py + e[10] * pz + e[14]) * pw;

      vector.set(screenX, screenY, ndcZ).unproject(camera);
      vector.applyMatrix4(viewMatrixInv);

      onMove(idx, vector, pts[idx]);
    }

    function onMouseDown(e) {
      const dpr = window.devicePixelRatio || 1;
      const i = hitTest(e.offsetX * dpr, e.offsetY * dpr);
      if (i < 0) return;
      e.preventDefault();
      e.stopPropagation();
      dragging = i;
      hovered = i;
    }

    function onMouseMove(e) {
      const dpr = window.devicePixelRatio || 1;
      if (dragging >= 0) {
        e.preventDefault();
        movePoint(dragging, e.offsetX, e.offsetY);
        return;
      }
      hovered = hitTest(e.offsetX * dpr, e.offsetY * dpr);
    }

    function onMouseUp(e) {
      if (dragging < 0) return;
      e.preventDefault();
      dragging = -1;
    }

    function onTouchStart(e) {
      if (e.touches.length !== 1 || e.targetTouches.length !== 1) return;
      const touch = e.targetTouches[0];
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const i = hitTest((touch.pageX - rect.left) * dpr, (touch.pageY - rect.top) * dpr);
      if (i < 0) return;
      e.preventDefault();
      dragging = i;
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd, false);
      canvas.addEventListener('touchcancel', onTouchEnd, false);
    }

    function onTouchMove(e) {
      if (e.touches.length !== 1 || dragging < 0) return;
      e.preventDefault();
      const touch = e.targetTouches[0];
      const rect = canvas.getBoundingClientRect();
      movePoint(dragging, touch.pageX - rect.left, touch.pageY - rect.top);
    }

    function onTouchEnd(e) {
      if (dragging < 0) return;
      e.preventDefault();
      dragging = -1;
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    }

    function post() {
      const wantEnabled = hovered < 0 && dragging < 0;
      if (three.controls.enabled !== wantEnabled) three.controls.enabled = wantEnabled;
      canvas.style.cursor = dragging >= 0 || hovered >= 0 ? 'pointer' : '';
    }

    canvas.addEventListener('mousedown', onMouseDown, true);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    three.on('post', post);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown, true);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      three.off('post', post);
      three.renderer.dispose();
      container.innerHTML = '';
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mathbox-canvas-wrap">
      <div ref={containerRef} className="mathbox-canvas" />
      {hints.length > 0 && (
        <div className="mathbox-hint">
          {hints.map((h) => (
            <span key={h} className="mathbox-hint-item">
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default CartesianCanvas;
