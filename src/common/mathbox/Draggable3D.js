import { useEffect, useRef } from 'react';
import './CartesianCanvas.css';

// point: { x, y, z } — mutable ref object, updated in-place on drag
// onDrag: ({ x, y, z }) => void
// range: number — grid spans [-range, range]
function Draggable3D({ point, onDrag, range = 5 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox || !window.THREE) return;

    const THREE = window.THREE;

    const mathbox = window.MathBox.mathBox({
      element: container,
      plugins: ['core', 'controls', 'cursor'],
      controls: { klass: THREE.OrbitControls },
      camera: { fov: 30 },
    });

    const three = mathbox.three;
    const camera = three.camera;
    const canvas = three.canvas;

    three.renderer.setClearColor(new THREE.Color(0xfafafa), 1.0);
    camera.position.set(6, 5, 8);
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
      color: 0xcccccc,
      opacity: 0.6,
    });
    view.axis({ axis: 1, color: 0xee5555, width: 3 });
    view.axis({ axis: 2, color: 0x55aa55, width: 3 });
    view.axis({ axis: 3, color: 0x5555ee, width: 3 });

    const pointSize = 30;
    const hiliteColor = [0, 0.5, 0.5, 0.75];
    const hitRadius = pointSize;

    const pts = [[point.x ?? 0, point.y ?? 0, point.z ?? 0]];

    view.array({ id: 'drag-points', channels: 3, width: 1, data: pts });

    let hovered = -1;
    let dragging = -1;

    view.point({ points: '#drag-points', color: [0.2, 0.5, 0.9, 1], size: pointSize, zIndex: 2 });

    view.array({
      id: 'drag-colors',
      channels: 4,
      width: 1,
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

    function isNear(mouseX, mouseY) {
      const { sx, sy } = mathToScreen(pts[0][0], pts[0][1], pts[0][2]);
      const dx = mouseX - sx;
      const dy = mouseY - sy;
      return dx * dx + dy * dy < hitRadius * hitRadius;
    }

    const mat = new THREE.Matrix4();
    const matInv = new THREE.Matrix4();
    const projected = new THREE.Vector3();
    const vector = new THREE.Vector3();

    function movePoint(offsetX, offsetY) {
      const screenX = (offsetX / canvas.offsetWidth) * 2 - 1.0;
      const screenY = -((offsetY / canvas.offsetHeight) * 2 - 1.0);

      projected.set(pts[0][0], pts[0][1], pts[0][2]).applyMatrix4(viewMatrix);
      mat.multiplyMatrices(camera.projectionMatrix, matInv.copy(camera.matrixWorld).invert());
      const e = mat.elements;
      const px = projected.x,
        py = projected.y,
        pz = projected.z;
      const pw = 1 / (e[3] * px + e[7] * py + e[11] * pz + e[15]);
      const ndcZ = (e[2] * px + e[6] * py + e[10] * pz + e[14]) * pw;

      vector.set(screenX, screenY, ndcZ).unproject(camera);
      vector.applyMatrix4(viewMatrixInv);

      const clamp = (v) => Math.max(-range, Math.min(range, v));
      pts[0][0] = clamp(vector.x);
      pts[0][1] = clamp(vector.y);
      pts[0][2] = clamp(vector.z);
      point.x = pts[0][0];
      point.y = pts[0][1];
      point.z = pts[0][2];
      if (onDrag) onDrag({ x: pts[0][0], y: pts[0][1], z: pts[0][2] });
    }

    function onMouseDown(e) {
      const dpr = window.devicePixelRatio || 1;
      if (!isNear(e.offsetX * dpr, e.offsetY * dpr)) return;
      e.preventDefault();
      e.stopPropagation();
      dragging = 0;
      hovered = 0;
    }

    function onMouseMove(e) {
      const dpr = window.devicePixelRatio || 1;
      if (dragging >= 0) {
        e.preventDefault();
        movePoint(e.offsetX, e.offsetY);
        return;
      }
      hovered = isNear(e.offsetX * dpr, e.offsetY * dpr) ? 0 : -1;
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
      if (!isNear(ox, oy)) return;
      e.preventDefault();
      dragging = 0;
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd, false);
      canvas.addEventListener('touchcancel', onTouchEnd, false);
    }

    function onTouchMove(e) {
      if (e.touches.length !== 1 || dragging < 0) return;
      e.preventDefault();
      const touch = e.targetTouches[0];
      const rect = canvas.getBoundingClientRect();
      movePoint(touch.pageX - rect.left, touch.pageY - rect.top);
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
      if (dragging >= 0 || hovered >= 0) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'move';
      }
      three.controls.enabled = hovered < 0 && dragging < 0;
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
        <span className="mathbox-hint-item">Right-click drag to orbit</span>
      </div>
    </div>
  );
}

export default Draggable3D;
