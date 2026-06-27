import { useEffect, useRef } from 'react';
import './CartesianCanvas.css';

// Single-point mode:  point: { x, y },  onDrag: ({ x, y }) => void
// Multi-point mode:   points: [{ x, y }, ...],  onDrag: (index, { x, y }) => void
// Optional:          draw: (view, pts) => void  — called after axes, receives live pts array
// range: number — grid spans [-range, range]
function Cartesian2DCanvas({ point, points, onDrag, draw, range = 5 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox || !window.THREE) return;

    const THREE = window.THREE;

    // Pseudo-orthographic: camera far away with tiny FOV, same trick as Demo2D in coffee
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
    const camera = three.camera;
    const canvas = three.canvas;

    three.renderer.setClearColor(new THREE.Color(0xfafafa), 1.0);
    camera.position.set(0, 0, ortho);
    camera.lookAt(0, 0, 0);
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

    view.grid({ axes: 'xy', divideX: range * 2, divideY: range * 2, color: 0xcccccc, opacity: 1 });
    view.axis({ axis: 1, color: 0x666666, width: 3 });
    view.axis({ axis: 2, color: 0x666666, width: 3 });

    const sources = points || [point];
    const pts = sources.map((p) => [p.x ?? 0, p.y ?? 0, 0]);
    const n = pts.length;

    const pointSize = 30;
    const hiliteColor = [0, 0.5, 0.5, 0.75];
    const hitRadius = pointSize;

    view.array({ id: 'drag-points', channels: 3, width: n, data: pts });

    let hovered = -1;
    let dragging = -1;

    view.point({ points: '#drag-points', color: [0.2, 0.5, 0.9, 1], size: pointSize, zIndex: 2 });

    view.array({
      id: 'drag-colors',
      channels: 4,
      width: n,
      expr: (emit, i) => {
        if (dragging === i || hovered === i) emit(...hiliteColor);
        else emit(1, 1, 1, 0);
      },
    });
    view.point({
      points: '#drag-points',
      colors: '#drag-colors',
      color: 'white',
      size: pointSize,
      zIndex: 3,
      zTest: false,
      zWrite: false,
    });

    if (draw) draw(view, pts);

    // MathBox cartesian maps math coords to world coords via viewMatrix.
    // We project through it then through the camera to get screen position.
    const viewMatrix = view[0].controller.viewMatrix;
    const viewMatrixInv = new THREE.Matrix4().copy(viewMatrix).invert();
    const scratch = new THREE.Vector3();

    function mathToScreen(mx, my, mz) {
      scratch.set(mx, my, mz).applyMatrix4(viewMatrix);
      scratch.project(camera);
      const dpr = window.devicePixelRatio || 1;
      const sx = ((scratch.x + 1) / 2) * canvas.offsetWidth * dpr;
      const sy = ((-scratch.y + 1) / 2) * canvas.offsetHeight * dpr;
      return { sx, sy };
    }

    function hitTest(mouseX, mouseY) {
      for (let i = 0; i < n; i++) {
        const { sx, sy } = mathToScreen(pts[i][0], pts[i][1], 0);
        const dx = mouseX - sx;
        const dy = mouseY - sy;
        if (dx * dx + dy * dy < hitRadius * hitRadius) return i;
      }
      return -1;
    }

    const mat = new THREE.Matrix4();
    const matInv = new THREE.Matrix4();
    const projected = new THREE.Vector3();
    const vector = new THREE.Vector3();

    function movePoint(idx, offsetX, offsetY) {
      const screenX = (offsetX / canvas.offsetWidth) * 2 - 1.0;
      const screenY = -((offsetY / canvas.offsetHeight) * 2 - 1.0);

      // Project current point to get its NDC depth (z)
      projected.set(pts[idx][0], pts[idx][1], 0).applyMatrix4(viewMatrix);
      mat.multiplyMatrices(camera.projectionMatrix, matInv.copy(camera.matrixWorld).invert());
      const e = mat.elements;
      const px = projected.x,
        py = projected.y,
        pz = projected.z;
      const pw = 1 / (e[3] * px + e[7] * py + e[11] * pz + e[15]);
      const ndcZ = (e[2] * px + e[6] * py + e[10] * pz + e[14]) * pw;

      // Unproject mouse at same depth, then back to math space
      vector.set(screenX, screenY, ndcZ).unproject(camera);
      vector.applyMatrix4(viewMatrixInv);

      const clamp = (v) => Math.max(-range, Math.min(range, v));
      pts[idx][0] = clamp(vector.x);
      pts[idx][1] = clamp(vector.y);

      const src = sources[idx];
      src.x = pts[idx][0];
      src.y = pts[idx][1];

      if (onDrag) {
        if (points) onDrag(idx, { x: pts[idx][0], y: pts[idx][1] });
        else onDrag({ x: pts[idx][0], y: pts[idx][1] });
      }
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
      const ox = (touch.pageX - rect.left) * dpr;
      const oy = (touch.pageY - rect.top) * dpr;
      const i = hitTest(ox, oy);
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
      <div className="mathbox-hint">
        <span className="mathbox-hint-item">Drag the blue point</span>
      </div>
    </div>
  );
}

export default Cartesian2DCanvas;
