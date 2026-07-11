import React, { useEffect, useRef } from 'react';
import './GaltonBoard.css';

const ROWS = 12;
const BINS = ROWS + 1;
const DROP_MS = 180;
const ROW_MS = 210;

function GaltonBoard() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const pegTop = 30;
    const pegBottom = height - 90;
    const rowGap = (pegBottom - pegTop) / ROWS;
    const colGap = Math.min(28, width / (BINS + 2));
    const center = width / 2;
    const binFloor = height - 6;
    const binAreaTop = pegBottom + 14;
    const maxBinHeight = binFloor - binAreaTop;

    const pegY = (row) => pegTop + row * rowGap;

    const binCounts = new Array(BINS).fill(0);
    const displayH = new Array(BINS).fill(0);
    const balls = [];
    let lastDrop = 0;
    let totalDropped = 0;
    let frame;

    function dropBall() {
      // offsets[r] is the ball's horizontal distance from center at peg row r, in colGap units
      const offsets = [0];
      let col = 0;
      for (let row = 0; row < ROWS; row++) {
        col += Math.random() < 0.5 ? -0.5 : 0.5;
        offsets.push(col);
      }
      balls.push({
        offsets,
        finalBin: Math.round(col + ROWS / 2),
        progress: 0,
        speed: 0.9 + Math.random() * 0.25,
        lastTick: 0,
      });
      totalDropped += 1;
    }

    function draw(now) {
      if (!lastDrop) lastDrop = now;
      if (now - lastDrop > DROP_MS) {
        lastDrop = now;
        dropBall();
      }

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#cbd5e1';
      for (let row = 0; row <= ROWS; row++) {
        for (let col = 0; col <= row; col++) {
          const x = center + (col - row / 2) * colGap;
          ctx.beginPath();
          ctx.arc(x, pegY(row), 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const maxCount = Math.max(1, ...binCounts);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.85)';
      for (let i = 0; i < BINS; i++) {
        const targetH = (binCounts[i] / maxCount) * maxBinHeight;
        displayH[i] += (targetH - displayH[i]) * 0.12;
        const x = center + (i - ROWS / 2) * colGap;
        ctx.fillRect(x - colGap / 2 + 1, binFloor - displayH[i], colGap - 2, displayH[i]);
      }

      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, binFloor);
      ctx.lineTo(width, binFloor);
      ctx.stroke();

      ctx.fillStyle = '#4f46e5';
      for (let bi = balls.length - 1; bi >= 0; bi--) {
        const ball = balls[bi];
        // clamp dt so returning from a background tab doesn't teleport balls
        const dt = ball.lastTick ? Math.min(now - ball.lastTick, 50) : 0;
        ball.lastTick = now;
        ball.progress += (dt / ROW_MS) * ball.speed;

        // segment ROWS is the free fall from the last peg row into the pile
        if (ball.progress >= ROWS + 1) {
          binCounts[ball.finalBin] += 1;
          balls.splice(bi, 1);
          continue;
        }

        let x;
        let y;
        if (ball.progress >= ROWS) {
          const t = ball.progress - ROWS;
          x = center + ball.offsets[ROWS] * colGap;
          const pileTop = binFloor - displayH[ball.finalBin] - 4;
          y = pegY(ROWS) + (pileTop - pegY(ROWS)) * t * t;
        } else {
          const i = Math.floor(ball.progress);
          const t = ball.progress - i;
          const fromX = center + ball.offsets[i] * colGap;
          const toX = center + ball.offsets[i + 1] * colGap;
          // sideways movement happens late, like rolling off the peg
          x = fromX + (toX - fromX) * t * t * (3 - 2 * t);
          y = pegY(i) + rowGap * (0.4 * t + 0.6 * t * t) - Math.sin(t * Math.PI) * rowGap * 0.25;
        }

        ctx.beginPath();
        ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText(`${totalDropped} balls dropped`, width, 16);

      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="galton-board">
      <span className="galton-board-label">Randomness, piling up</span>
      <p className="galton-board-text">
        Each ball bounces left or right at every peg, a coin flip each time. One ball's path looks
        totally random. Thousands of them stack into a bell curve, because most left/right
        sequences roughly cancel out and only land far from center if you get a long unlikely
        streak.
      </p>
      <canvas ref={canvasRef} className="galton-board-canvas" />
    </section>
  );
}

export default GaltonBoard;
