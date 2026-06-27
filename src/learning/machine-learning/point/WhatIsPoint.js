import { useState, useRef, useCallback } from 'react';
import './WhatIsPoint.css';
import Draggable2D from '../../../common/mathbox/Draggable2D';
import Draggable3D from '../../../common/mathbox/Draggable3D';

const init2D = { x: 2, y: 3 };
const init3D = { x: 2, y: 3, z: 1 };

function WhatIsPoint() {
  const [coords2D, setCoords2D] = useState({ x: init2D.x, y: init2D.y });
  const [coords3D, setCoords3D] = useState({ x: init3D.x, y: init3D.y, z: init3D.z });
  const pt2D = useRef({ ...init2D });
  const pt3D = useRef({ ...init3D });

  const handleDrag2D = useCallback(({ x, y }) => {
    setCoords2D({ x: +x.toFixed(2), y: +y.toFixed(2) });
  }, []);

  const handleDrag3D = useCallback(({ x, y, z }) => {
    setCoords3D({ x: +x.toFixed(2), y: +y.toFixed(2), z: +z.toFixed(2) });
  }, []);

  return (
    <div className="point-container">
      <section className="point-section">
        <h1 className="point-title">What is a Point?</h1>
        <p className="point-lead">
          A <strong>point</strong> is just a location in space. No size, no direction, no length.
          Just a place.
        </p>
      </section>

      <div className="point-card">
        <div className="point-explanation">
          <span className="point-label">2D</span>
          <p className="point-heading">A point is a pair (x, y)</p>
          <p className="point-desc">
            In 2D, you describe it with two numbers: how far right (x) and how far up (y). Together
            they pinpoint exactly one spot on the grid, and no other.
          </p>
          <p className="point-desc">
            Drag the point on the canvas and watch the coordinates update in real time.
          </p>
        </div>
        <div className="point-demo">
          <p className="demo-caption">
            This is the point{' '}
            <strong style={{ color: '#3380e8' }}>
              P = ({coords2D.x}, {coords2D.y})
            </strong>
            . Its x-coordinate is <strong>{coords2D.x}</strong> and its y-coordinate is{' '}
            <strong>{coords2D.y}</strong>.
          </p>
          <Draggable2D point={pt2D.current} onDrag={handleDrag2D} range={5} />
          <p className="canvas-note">
            Drag the blue dot anywhere on the grid. The coordinates update as you move it.
          </p>
        </div>
      </div>

      <div className="point-card">
        <div className="point-explanation">
          <span className="point-label">3D</span>
          <p className="point-heading">Add a third number: (x, y, z)</p>
          <p className="point-desc">
            In 3D, a point needs one more number: z, which goes in and out of the screen. The blue
            lines show how far the point is from each plane, so you can read off all three
            coordinates at once.
          </p>
          <p className="point-desc">
            Drag the point to move it along the floor. Right-click drag to orbit around and see it
            from any angle.
          </p>
        </div>
        <div className="point-demo">
          <p className="demo-caption">
            Point{' '}
            <strong style={{ color: '#3380e8' }}>
              P = ({coords3D.x}, {coords3D.y}, {coords3D.z})
            </strong>
            . Drag it to move along the xz-plane. The projection lines update as you go.
          </p>
          <Draggable3D point={pt3D.current} onDrag={handleDrag3D} range={4} />
          <p className="canvas-note">
            Drag the blue point to move it. Right-click drag to rotate the scene.
          </p>
        </div>
      </div>

      <p className="point-closing">
        That is all a point is. A location. Two numbers in 2D, three in 3D. No arrows, no magnitude,
        no direction. When you start adding those things, you get a vector, but that is a different
        story.
      </p>
    </div>
  );
}

export default WhatIsPoint;
