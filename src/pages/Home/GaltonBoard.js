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
    const pegTop = 30;

    let width;
    let height;
    let pegBottom;
    let rowGap;
    let colGap;
    let center;
    let binFloor;
    let maxBinHeight;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      pegBottom = height - 104;
      rowGap = (pegBottom - pegTop) / ROWS;
      colGap = Math.min(28, width / (BINS + 2));
      center = width / 2;
      binFloor = height - 20;
      const binAreaTop = pegBottom + 14;
      maxBinHeight = binFloor - binAreaTop;
    }

    resize();
    window.addEventListener('resize', resize);

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
      const turns = [];
      let col = 0;
      for (let row = 0; row < ROWS; row++) {
        const goRight = Math.random() < 0.5;
        turns.push(goRight);
        col += goRight ? 0.5 : -0.5;
        offsets.push(col);
      }
      balls.push({
        offsets,
        turns,
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
      for (let i = 0; i < BINS; i++) {
        const targetH = (binCounts[i] / maxCount) * maxBinHeight;
        displayH[i] += (targetH - displayH[i]) * 0.12;
        const x = center + (i - ROWS / 2) * colGap;

        ctx.fillStyle = 'rgba(99, 102, 241, 0.85)';
        ctx.fillRect(x - colGap / 2 + 1, binFloor - displayH[i], colGap - 2, displayH[i]);

        if (binCounts[i] > 0) {
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(binCounts[i], x, binFloor + 13);
        }
      }

      // once enough balls have piled up, trace the normal curve they're approximating
      if (totalDropped > 40) {
        const sigma = Math.sqrt(ROWS) / 2;
        const mean = ROWS / 2;
        const gaussian = (i) => Math.exp(-((i - mean) ** 2) / (2 * sigma * sigma));
        const peak = Math.max(...binCounts.map((_, i) => gaussian(i)));

        ctx.beginPath();
        for (let i = 0; i < BINS; i++) {
          const x = center + (i - ROWS / 2) * colGap;
          const y = binFloor - (gaussian(i) / peak) * maxBinHeight;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(79, 70, 229, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'italic 12px "Georgia", serif';
        ctx.fillStyle = 'rgba(79, 70, 229, 0.6)';
        ctx.textAlign = 'right';
        ctx.fillText('y = e^(-x²/2σ²)', width, binFloor - maxBinHeight - 4);
      }

      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, binFloor);
      ctx.lineTo(width, binFloor);
      ctx.stroke();

      let leadBall = null;
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

          // the ball nearest its peg mid-bounce is the clearest one to annotate
          if (t > 0.35 && t < 0.75 && (!leadBall || ball.progress > leadBall.progress)) {
            leadBall = { x: fromX, y: pegY(i), goRight: ball.turns[i] };
          }
        }

        ctx.beginPath();
        ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // show the coin-flip the lead ball just made at its peg: two faint paths, the taken one lit up
      if (leadBall) {
        const { x, y, goRight } = leadBall;
        const forkX = x + (goRight ? 1 : -1) * colGap * 0.55;
        const forkY = y + rowGap * 0.6;
        const otherX = x - (goRight ? 1 : -1) * colGap * 0.55;

        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#d1d5db';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(otherX, forkY);
        ctx.stroke();

        ctx.strokeStyle = '#4f46e5';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(forkX, forkY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#4f46e5';
        ctx.textAlign = goRight ? 'left' : 'right';
        ctx.fillText(goRight ? 'right ½' : 'left ½', x + (goRight ? 1 : -1) * 8, y - 6);
      }

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText(`${totalDropped} balls dropped`, width, 16);

      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="galton-board-canvas" />;
}

export default GaltonBoard;
