import { useEffect, useRef } from 'react';
import './CartesianCanvas.css';
import { BG_COLOR, AXIS_COLOR, AXIS_WIDTH, GRID_COLOR, GRID_WIDTH } from './canvasTheme';

// f(x) = x^4/4 - x^3 - x^2/2 + 3.4x   df = x^3 - 3x^2 - x + 3.4
// Critical points: x≈-1.1 (global min, f≈-2.65), x≈1.1 (local max, f≈2.17), x≈2.9 (local min, f≈-1.05)
function f(x)  { return x ** 4 / 4 - x ** 3 - x ** 2 / 2 + 3.4 * x; }
function df(x) { return x ** 3 - 3 * x ** 2 - x + 3.4; }

const CRIT = [
  { x: -1.1, label: 'global min', offset: [-8, -34] },
  { x:  1.1, label: 'local max',  offset: [ 0,  28] },
  { x:  2.9, label: 'local min',  offset: [ 8, -34] },
];

const X_MIN = -1.9;
const X_MAX =  3.9;
const Y_MIN = -3.5;
const Y_MAX =  5;
const N = 500;
const CURVE_COLOR   = 0xe85d4a;
const TANGENT_COLOR = 0xf59e0b;

// Clip tangent y=m*(x-tx)+ty to the cartesian box, return two [x,y] endpoints
function clipTangent(tx, ty, m) {
  const pts = [];
  for (const bx of [X_MIN, X_MAX]) {
    const by = ty + m * (bx - tx);
    if (by >= Y_MIN - 1e-9 && by <= Y_MAX + 1e-9) pts.push([bx, by]);
  }
  if (Math.abs(m) > 1e-9) {
    for (const by of [Y_MIN, Y_MAX]) {
      const bx = tx + (by - ty) / m;
      if (bx > X_MIN + 1e-9 && bx < X_MAX - 1e-9) pts.push([bx, by]);
    }
  }
  if (pts.length < 2) return [[Math.max(X_MIN, tx - 0.2), ty], [Math.min(X_MAX, tx + 0.2), ty]];
  pts.sort((a, b) => a[0] - b[0]);
  return [pts[0], pts[pts.length - 1]];
}

function GradientDescentCurveCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox || !window.THREE) return;

    const THREE = window.THREE;
    const ortho = 10000;
    const fov = Math.atan(2.5 / ortho) * (360 / Math.PI);

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
    three.controls.noPan   = true;
    three.controls.target.set(0, 0, 0);
    three.controls.update();

    const view = mathbox.set('focus', ortho / 1.5).cartesian({
      range: [[X_MIN, X_MAX], [Y_MIN, Y_MAX]],
      scale: [2, 2],
    });

    view.grid({ axes: 'xy', divideX: 10, divideY: 10, color: GRID_COLOR, opacity: 1, width: GRID_WIDTH });
    view.axis({ axis: 1, color: AXIS_COLOR, width: AXIS_WIDTH });
    view.axis({ axis: 2, color: AXIS_COLOR, width: AXIS_WIDTH });

    view.array({ id: 'ax-lbl', channels: 3, width: 2, data: [[X_MAX - 0.15, 0.5, 0], [0.12, Y_MAX - 0.7, 0]] });
    view.text({ data: ['x', 'y'] });
    view.label({ points: '#ax-lbl', color: AXIS_COLOR, size: 16, offset: [0, 0] });

    // Static curve — pre-sampled, no clamping needed (boundary values are 1.82, well inside frame)
    const curveData = [];
    for (let i = 0; i <= N; i++) {
      const x = X_MIN + ((X_MAX - X_MIN) * i) / N;
      curveData.push([x, f(x), 0]);
    }
    view.array({ id: 'curve', channels: 3, width: N + 1, data: curveData });
    view.line({ points: '#curve', color: CURVE_COLOR, width: 4, zIndex: 2 });

    // Critical-point markers
    CRIT.forEach((c, i) => {
      const pt = [[c.x, f(c.x), 0]];
      view.array({ id: `crit${i}`, channels: 3, width: 1, data: pt });
      view.point({ points: `#crit${i}`, color: CURVE_COLOR, size: 10, zIndex: 3 });
      view.text({ data: [c.label] });
      view.label({ points: `#crit${i}`, color: 0x888ea0, size: 11, offset: c.offset });
    });

    // Shared mutable point — MathBox holds the array reference; in-place mutations appear next frame
    const pt = [0.5, f(0.5), 0];

    // Tangent: recomputed from pt every frame
    view.array({
      id: 'tangent', channels: 3, width: 2,
      expr: (emit) => {
        const m = df(pt[0]);
        const [p0, p1] = clipTangent(pt[0], pt[1], m);
        emit(p0[0], p0[1], 0);
        emit(p1[0], p1[1], 0);
      },
    });
    view.line({ points: '#tangent', color: TANGENT_COLOR, width: 2, zIndex: 4 });

    // Draggable dot
    view.array({ id: 'drag-pts', channels: 3, width: 1, data: [pt] });
    view.point({ points: '#drag-pts', color: 0xffffff,    size: 22, zIndex: 5 });
    view.point({ points: '#drag-pts', color: CURVE_COLOR, size: 13, zIndex: 6 });

    // Slope label follows the dot
    view.array({ id: 'slbl-pos', channels: 3, width: 1, expr: (emit) => { emit(pt[0], pt[1], 0); } });
    view.text({ id: 'slbl-txt', width: 1, expr: (emit) => {
      const s = df(pt[0]);
      emit(`slope = ${s >= 0 ? '+' : ''}${s.toFixed(2)}`);
    }});
    view.label({ points: '#slbl-pos', text: '#slbl-txt', color: TANGENT_COLOR, size: 14, offset: [0, -34] });

    // Drag interaction
    const camera     = three.camera;
    const canvas     = three.canvas;
    const viewMat    = view[0].controller.viewMatrix;
    const viewMatInv = new THREE.Matrix4().copy(viewMat).invert();
    const mat = new THREE.Matrix4(), matInv = new THREE.Matrix4();
    const proj = new THREE.Vector3(), vec = new THREE.Vector3();
    let dragging = false, hovered = false;

    function toScreen(wx, wy) {
      const s = new THREE.Vector3(wx, wy, 0).applyMatrix4(viewMat);
      s.project(camera);
      const dpr = window.devicePixelRatio || 1;
      return { sx: ((s.x + 1) / 2) * canvas.offsetWidth * dpr, sy: ((-s.y + 1) / 2) * canvas.offsetHeight * dpr };
    }

    function hit(ox, oy) {
      const dpr = window.devicePixelRatio || 1;
      const { sx, sy } = toScreen(pt[0], pt[1]);
      const dx = ox * dpr - sx, dy = oy * dpr - sy;
      return dx * dx + dy * dy < 32 * 32;
    }

    function unprojectX(ox, oy) {
      const sx =   (ox / canvas.offsetWidth)  * 2 - 1;
      const sy = -((oy / canvas.offsetHeight) * 2 - 1);
      proj.set(pt[0], pt[1], 0).applyMatrix4(viewMat);
      mat.multiplyMatrices(camera.projectionMatrix, matInv.copy(camera.matrixWorld).invert());
      const e = mat.elements;
      const pw   = 1 / (e[3]*proj.x + e[7]*proj.y + e[11]*proj.z + e[15]);
      const ndcZ = (e[2]*proj.x + e[6]*proj.y + e[10]*proj.z + e[14]) * pw;
      vec.set(sx, sy, ndcZ).unproject(camera).applyMatrix4(viewMatInv);
      pt[0] = Math.max(X_MIN, Math.min(X_MAX, vec.x));
      pt[1] = f(pt[0]);
    }

    function onMouseDown(e) {
      if (!hit(e.offsetX, e.offsetY)) return;
      e.preventDefault(); e.stopPropagation(); dragging = true;
    }
    function onMouseMove(e) {
      if (dragging) { e.preventDefault(); unprojectX(e.offsetX, e.offsetY); return; }
      hovered = hit(e.offsetX, e.offsetY);
    }
    function onMouseUp(e) { if (!dragging) return; e.preventDefault(); dragging = false; }
    function post() {
      const want = !dragging && !hovered;
      if (three.controls.enabled !== want) three.controls.enabled = want;
      canvas.style.cursor = dragging || hovered ? 'ew-resize' : '';
    }

    canvas.addEventListener('mousedown', onMouseDown, true);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mouseup',   onMouseUp,   false);
    three.on('post', post);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown, true);
      canvas.removeEventListener('mousemove', onMouseMove, false);
      canvas.removeEventListener('mouseup',   onMouseUp,   false);
      three.off('post', post);
      three.renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="mathbox-canvas-wrap">
      <div ref={containerRef} className="mathbox-canvas" />
      <div className="mathbox-hint">
        <span className="mathbox-hint-item">Drag the dot along the curve</span>
        <span className="mathbox-hint-item">Scroll to zoom</span>
      </div>
    </div>
  );
}

export default GradientDescentCurveCanvas;
