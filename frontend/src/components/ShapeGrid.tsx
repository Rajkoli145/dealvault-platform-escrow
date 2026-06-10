import { useRef, useEffect } from 'react';

interface ShapeGridProps {
  direction?: 'right' | 'left' | 'up' | 'down' | 'diagonal';
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  size?: number; // fallback/alias
  hoverFillColor?: string;
  hoverColor?: string; // fallback/alias
  shape?: 'square' | 'hexagon' | 'circle' | 'triangle';
  hoverTrailAmount?: number;
  className?: string;
}

export default function ShapeGrid({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  size,
  hoverFillColor = '#222',
  hoverColor,
  shape = 'square',
  hoverTrailAmount = 0,
  className = ''
}: ShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const numSquaresX = useRef<number>(0);
  const numSquaresY = useRef<number>(0);
  const gridOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoveredSquare = useRef<{ x: number; y: number } | null>(null);
  const trailCells = useRef<Array<{ x: number; y: number }>>([]);
  const cellOpacities = useRef<Map<string, number>>(new Map());

  const actualSquareSize = size !== undefined ? size : squareSize;
  const actualHoverFillColor = hoverColor !== undefined ? hoverColor : hoverFillColor;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isHex = shape === 'hexagon';
    const isTri = shape === 'triangle';
    const hexHoriz = actualSquareSize * 1.5;
    const hexVert = actualSquareSize * Math.sqrt(3);

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / actualSquareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / actualSquareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawHex = (cx: number, cy: number, sz: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const vx = cx + sz * Math.cos(angle);
        const vy = cy + sz * Math.sin(angle);
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
    };

    const drawCircle = (cx: number, cy: number, sz: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, sz / 2, 0, Math.PI * 2);
      ctx.closePath();
    };

    const drawTriangle = (cx: number, cy: number, sz: number, flip: boolean) => {
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(cx, cy + sz / 2);
        ctx.lineTo(cx + sz / 2, cy - sz / 2);
        ctx.lineTo(cx - sz / 2, cy - sz / 2);
      } else {
        ctx.moveTo(cx, cy - sz / 2);
        ctx.lineTo(cx + sz / 2, cy + sz / 2);
        ctx.lineTo(cx - sz / 2, cy + sz / 2);
      }
      ctx.closePath();
    };

    const drawGrid = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHoriz);
        const offsetX = ((gridOffset.current.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((gridOffset.current.y % hexVert) + hexVert) % hexVert;

        const cols = Math.ceil(canvas.width / hexHoriz) + 3;
        const rows = Math.ceil(canvas.height / hexVert) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * hexHoriz + offsetX;
            const cy = row * hexVert + ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) + offsetY;

            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawHex(cx, cy, actualSquareSize);
              ctx.fillStyle = actualHoverFillColor;
              ctx.fill();
              ctx.globalAlpha = 1;
            }

            drawHex(cx, cy, actualSquareSize);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
          }
        }
      } else if (isTri) {
        const halfW = actualSquareSize / 2;
        const colShift = Math.floor(gridOffset.current.x / halfW);
        const rowShift = Math.floor(gridOffset.current.y / actualSquareSize);
        const offsetX = ((gridOffset.current.x % halfW) + halfW) % halfW;
        const offsetY = ((gridOffset.current.y % actualSquareSize) + actualSquareSize) % actualSquareSize;

        const cols = Math.ceil(canvas.width / halfW) + 4;
        const rows = Math.ceil(canvas.height / actualSquareSize) + 4;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * halfW + offsetX;
            const cy = row * actualSquareSize + actualSquareSize / 2 + offsetY;
            const flip = ((col + colShift + row + rowShift) % 2 + 2) % 2 !== 0;

            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawTriangle(cx, cy, actualSquareSize, flip);
              ctx.fillStyle = actualHoverFillColor;
              ctx.fill();
              ctx.globalAlpha = 1;
            }

            drawTriangle(cx, cy, actualSquareSize, flip);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
          }
        }
      } else if (shape === 'circle') {
        const offsetX = ((gridOffset.current.x % actualSquareSize) + actualSquareSize) % actualSquareSize;
        const offsetY = ((gridOffset.current.y % actualSquareSize) + actualSquareSize) % actualSquareSize;

        const cols = Math.ceil(canvas.width / actualSquareSize) + 3;
        const rows = Math.ceil(canvas.height / actualSquareSize) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * actualSquareSize + actualSquareSize / 2 + offsetX;
            const cy = row * actualSquareSize + actualSquareSize / 2 + offsetY;

            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawCircle(cx, cy, actualSquareSize);
              ctx.fillStyle = actualHoverFillColor;
              ctx.fill();
              ctx.globalAlpha = 1;
            }

            drawCircle(cx, cy, actualSquareSize);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
          }
        }
      } else {
        const offsetX = ((gridOffset.current.x % actualSquareSize) + actualSquareSize) % actualSquareSize;
        const offsetY = ((gridOffset.current.y % actualSquareSize) + actualSquareSize) % actualSquareSize;

        const cols = Math.ceil(canvas.width / actualSquareSize) + 3;
        const rows = Math.ceil(canvas.height / actualSquareSize) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const sx = col * actualSquareSize + offsetX;
            const sy = row * actualSquareSize + offsetY;

            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.globalAlpha = alpha;
              ctx.fillStyle = actualHoverFillColor;
              ctx.fillRect(sx, sy, actualSquareSize, actualSquareSize);
              ctx.globalAlpha = 1;
            }

            ctx.strokeStyle = borderColor;
            ctx.strokeRect(sx, sy, actualSquareSize, actualSquareSize);
          }
        }
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateCellOpacities = () => {
      const targets = new Map<string, number>();

      if (hoveredSquare.current) {
        targets.set(`${hoveredSquare.current.x},${hoveredSquare.current.y}`, 1);
      }

      if (hoverTrailAmount > 0) {
        for (let i = 0; i < trailCells.current.length; i++) {
          const t = trailCells.current[i];
          const key = `${t.x},${t.y}`;
          if (!targets.has(key)) {
            targets.set(key, (trailCells.current.length - i) / (trailCells.current.length + 1));
          }
        }
      }

      targets.forEach((_, key) => {
        if (!cellOpacities.current.has(key)) {
          cellOpacities.current.set(key, 0);
        }
      });

      cellOpacities.current.forEach((opacity, key) => {
        const target = targets.get(key) || 0;
        const next = opacity + (target - opacity) * 0.15;
        if (next < 0.005) {
          cellOpacities.current.delete(key);
        } else {
          cellOpacities.current.set(key, next);
        }
      });
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      const wrapX = isHex ? hexHoriz * 2 : actualSquareSize;
      const wrapY = isHex ? hexVert : isTri ? actualSquareSize * 2 : actualSquareSize;

      switch (direction) {
        case 'right':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + wrapX) % wrapX;
          break;
        case 'left':
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + wrapX) % wrapX;
          break;
        case 'up':
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + wrapY) % wrapY;
          break;
        case 'down':
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + wrapY) % wrapY;
          break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + wrapX) % wrapX;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + wrapY) % wrapY;
          break;
        default:
          break;
      }

      updateCellOpacities();
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (mouseX < 0 || mouseY < 0 || mouseX > rect.width || mouseY > rect.height) {
        hoveredSquare.current = null;
        return;
      }

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHoriz);
        const offsetX = ((gridOffset.current.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((gridOffset.current.y % hexVert) + hexVert) % hexVert;
        const adjustedX = mouseX - offsetX;
        const adjustedY = mouseY - offsetY;

        const col = Math.round(adjustedX / hexHoriz);
        const rowOffset = (col + colShift) % 2 !== 0 ? hexVert / 2 : 0;
        const row = Math.round((adjustedY - rowOffset) / hexVert);

        if (
          !hoveredSquare.current ||
          hoveredSquare.current.x !== col ||
          hoveredSquare.current.y !== row
        ) {
          if (hoveredSquare.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquare.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquare.current = { x: col, y: row };
        }
      } else if (isTri) {
        const halfW = actualSquareSize / 2;
        const offsetX = ((gridOffset.current.x % halfW) + halfW) % halfW;
        const offsetY = ((gridOffset.current.y % actualSquareSize) + actualSquareSize) % actualSquareSize;

        const adjustedX = mouseX - offsetX;
        const adjustedY = mouseY - offsetY;

        const col = Math.round(adjustedX / halfW);
        const row = Math.floor(adjustedY / actualSquareSize);

        if (
          !hoveredSquare.current ||
          hoveredSquare.current.x !== col ||
          hoveredSquare.current.y !== row
        ) {
          if (hoveredSquare.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquare.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquare.current = { x: col, y: row };
        }
      } else if (shape === 'circle') {
        const offsetX = ((gridOffset.current.x % actualSquareSize) + actualSquareSize) % actualSquareSize;
        const offsetY = ((gridOffset.current.y % actualSquareSize) + actualSquareSize) % actualSquareSize;

        const adjustedX = mouseX - offsetX;
        const adjustedY = mouseY - offsetY;

        const col = Math.round(adjustedX / actualSquareSize);
        const row = Math.round(adjustedY / actualSquareSize);

        if (
          !hoveredSquare.current ||
          hoveredSquare.current.x !== col ||
          hoveredSquare.current.y !== row
        ) {
          if (hoveredSquare.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquare.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquare.current = { x: col, y: row };
        }
      } else {
        const offsetX = ((gridOffset.current.x % actualSquareSize) + actualSquareSize) % actualSquareSize;
        const offsetY = ((gridOffset.current.y % actualSquareSize) + actualSquareSize) % actualSquareSize;

        const adjustedX = mouseX - offsetX;
        const adjustedY = mouseY - offsetY;

        const col = Math.floor(adjustedX / actualSquareSize);
        const row = Math.floor(adjustedY / actualSquareSize);

        if (
          !hoveredSquare.current ||
          hoveredSquare.current.x !== col ||
          hoveredSquare.current.y !== row
        ) {
          if (hoveredSquare.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquare.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquare.current = { x: col, y: row };
        }
      }
    };

    const handleMouseLeave = () => {
      if (hoveredSquare.current && hoverTrailAmount > 0) {
        trailCells.current.unshift({ ...hoveredSquare.current });
        if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
      }
      hoveredSquare.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, actualHoverFillColor, actualSquareSize, shape, hoverTrailAmount]);

  return <canvas ref={canvasRef} className={`w-full h-full border-none block ${className}`}></canvas>;
}
