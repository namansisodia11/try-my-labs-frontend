import { useState, useRef, useCallback } from 'react';
import DraggableCartesianCanvas from '../../../common/mathbox/DraggableCartesianCanvas';

const initialPoint = { x: 1, y: 1 };

function DraggablePointDemo() {
  const [coords, setCoords] = useState({ x: initialPoint.x, y: initialPoint.y });
  const pt = useRef(initialPoint);

  const handleDrag = useCallback(({ x, y }) => {
    setCoords({ x: +x.toFixed(2), y: +y.toFixed(2) });
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Draggable Point</h1>
      <p style={{ color: '#555', marginBottom: 20, fontSize: '0.95rem' }}>
        Click and drag the blue point on the canvas.
      </p>
      <DraggableCartesianCanvas point={pt.current} onDrag={handleDrag} range={5} />
      <div style={{ marginTop: 16, fontFamily: 'monospace', fontSize: '1rem', color: '#333' }}>
        P = ({coords.x}, {coords.y})
      </div>
    </div>
  );
}

export default DraggablePointDemo;
