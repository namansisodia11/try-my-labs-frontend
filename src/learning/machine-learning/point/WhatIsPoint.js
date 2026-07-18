import { useState, useRef, useCallback } from 'react';
import './WhatIsPoint.css';
import Cartesian1DCanvas from '../../../common/mathbox/Cartesian1DCanvas';
import Cartesian2DCanvas from '../../../common/mathbox/Cartesian2DCanvas';
import Cartesian3DCanvas from '../../../common/mathbox/Cartesian3DCanvas';

const init1D = { x: 3 };
const init2D = { x: 2, y: 3 };
const init3D = { x: 2, y: 3, z: 1 };

function WhatIsPoint() {
  const [coords1D, setCoords1D] = useState({ x: init1D.x });
  const [coords2D, setCoords2D] = useState({ x: init2D.x, y: init2D.y });
  const [coords3D, setCoords3D] = useState({ x: init3D.x, y: init3D.y, z: init3D.z });
  const pt1D = useRef({ ...init1D });
  const pt2D = useRef({ ...init2D });
  const pt3D = useRef({ ...init3D });

  const handleDrag1D = useCallback(({ x }) => {
    setCoords1D({ x: +x.toFixed(2) });
  }, []);

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
          A <strong>point</strong> is just a location, that's all. No size, no direction, no
          length. Like when you drop a pin on the map to share your location. The pin is not a
          thing, it just says "here".
        </p>
      </section>

      <div className="point-card">
        <div className="point-explanation">
          <span className="point-label">1D</span>
          <p className="point-heading">Simplest case: just (x)</p>
          <p className="point-desc">
            On a number line, a point is one number only. That's it. Like seat number in a train
            coach: one number, and everyone knows exactly where you are sitting. Nowhere else to
            go.
          </p>
          <p className="point-desc">Drag the point left and right, see how x changes.</p>
        </div>
        <div className="point-demo">
          <p className="demo-caption">
            This is the point <strong style={{ color: '#3380e8' }}>P = ({coords1D.x})</strong>. One
            number, one location. Simple.
          </p>
          <Cartesian1DCanvas point={pt1D.current} onDrag={handleDrag1D} range={5} />
          <p className="canvas-note">Drag the blue dot along the number line.</p>
        </div>
      </div>

      <div className="point-card">
        <div className="point-explanation">
          <span className="point-label">2D</span>
          <p className="point-heading">In 2D, a point is a pair (x, y)</p>
          <p className="point-desc">
            Now you need two numbers: how far right (x) and how far up (y). Like giving directions
            to a friend: "go two shops right, then three floors up". Both numbers together point to
            one exact spot on the grid. No confusion possible.
          </p>
          <p className="point-desc">
            Drag the point on the canvas, the coordinates will update live in front of you.
          </p>
        </div>
        <div className="point-demo">
          <p className="demo-caption">
            This is the point{' '}
            <strong style={{ color: '#3380e8' }}>
              P = ({coords2D.x}, {coords2D.y})
            </strong>
            . x is <strong>{coords2D.x}</strong>, y is <strong>{coords2D.y}</strong>. Two numbers,
            one spot.
          </p>
          <Cartesian2DCanvas point={pt2D.current} onDrag={handleDrag2D} range={5} />
          <p className="canvas-note">
            Drag the blue dot anywhere on the grid. The coordinates update as you move it.
          </p>
        </div>
      </div>

      <div className="point-card">
        <div className="point-explanation">
          <span className="point-label">3D</span>
          <p className="point-heading">Add one more number: (x, y, z)</p>
          <p className="point-desc">
            In 3D, one more number comes: z, going in and out of the screen. Think of a flat
            address versus full address. (x, y) tells the building and z tells which floor. The
            blue lines show how far the point is from each plane, so you can read all three
            coordinates in one go.
          </p>
          <p className="point-desc">
            Drag the point to move it along the floor. Right-click and drag to orbit around, see it
            from any angle you like.
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
          <Cartesian3DCanvas point={pt3D.current} onDrag={handleDrag3D} range={4} />
          <p className="canvas-note">
            Drag the blue point to move it. Right-click drag to rotate the scene.
          </p>
        </div>
      </div>

      <section className="point-section point-nd-section">
        <p className="point-heading">What about 4D, 5D, or one million dimensions?</p>
        <p className="point-desc">
          Same funda, keep adding numbers. A point in 4D is four numbers: (x, y, z, w). In 100
          dimensions, 100 numbers. Math does not change at all.
        </p>
        <p className="point-desc">
          One catch: you cannot visualize it. Our brain gives up after 3D. But computer? Computer
          does not care, yaar. For it, a point with 1000 coordinates is same as a point with 2.
          In machine learning, one point can have thousands of coordinates, one for each feature
          in your data. Still just a location, only the space is much much bigger.
        </p>
        <p className="point-desc">
          And this is why points matter so much in ML. Every data sample you have is a point
          sitting somewhere in a high-dimensional space. Distance, similarity, clusters,
          everything else is built on top of this one idea. Master this, half the battle is done.
        </p>
      </section>
    </div>
  );
}

export default WhatIsPoint;
