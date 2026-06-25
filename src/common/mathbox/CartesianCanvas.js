import { useEffect, useRef } from 'react';

// Initialises MathBox renderer, camera, cartesian view, axes and grid.
// Returns { three, view } for further drawing.
function initMathbox(container, range) {
  const mathbox = window.MathBox.mathBox({
    element: container,
    plugins: ['core', 'controls', 'cursor'],
    controls: { klass: window.THREE.OrbitControls },
  });

  const three = mathbox.three;
  three.renderer.setClearColor(new window.THREE.Color(0xfafafa), 1.0);
  three.camera.position.set(0, 0, 4);
  three.controls.target.set(0, 0, 0);
  three.controls.update();

  const view = mathbox.cartesian({
    range: [
      [-range, range],
      [-range, range],
    ],
    scale: [1, 1],
  });

  view.axis({ axis: 1, color: 0x999999, width: 2 });
  view.axis({ axis: 2, color: 0x999999, width: 2 });
  view.grid({ axes: 'xy', divideX: 10, divideY: 10, opacity: 0.3 });

  return { three, view };
}

// Draws a single vector from (0,0) to (x,y).
function drawVector(view, id, x, y, color) {
  view.interval({
    id,
    width: 2,
    expr: function (emit, _, idx) {
      if (idx === 0) emit(0, 0);
      else emit(x, y);
    },
    channels: 2,
  });
  view.line({ points: `#${id}`, color, width: 6 });
  view.point({ points: `#${id}`, color, size: 10 });
}

// Draws each vector from origin and the resultant (sum) vector.
// vectors: [{ x, y, color }]
function drawVectorAddition(view, vectors) {
  vectors.forEach(({ x, y, color }, i) => {
    drawVector(view, `vec${i}`, x, y, color);
  });

  const sumX = vectors.reduce((acc, v) => acc + v.x, 0);
  const sumY = vectors.reduce((acc, v) => acc + v.y, 0);
  // resultant drawn in grey so it's visually distinct from the input vectors
  drawVector(view, 'vecSum', sumX, sumY, 0x888888);
}

// vectors: [{ x, y, color }]
// operation: 'addition' | 'basic' (default)
function CartesianCanvas({ vectors = [], operation = 'basic', range = 3 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.MathBox) return;

    const { three, view } = initMathbox(container, range);

    if (operation === 'addition') {
      drawVectorAddition(view, vectors);
    } else {
      vectors.forEach(({ x, y, color }, i) => {
        drawVector(view, `vec${i}`, x, y, color);
      });
    }

    return () => {
      three.renderer.dispose();
      container.innerHTML = '';
    };
  }, [vectors, operation, range]);

  return <div ref={containerRef} className="mathbox-canvas" />;
}

export default CartesianCanvas;
