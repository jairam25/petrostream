import React, { useEffect, useRef } from 'react';

interface PVTNeuralSimulatorProps {
  mode: 'envelope' | 'flash' | 'grading';
  params?: any;
}

export function PVTNeuralSimulator({ mode, params }: PVTNeuralSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      time += 0.02;

      if (mode === 'envelope') {
        // PT Envelope Simulation
        const pb = params?.pb || 3000;
        const pd = params?.pd || 4000;
        
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Draw a generic PT curve
        ctx.moveTo(50, h - 50);
        ctx.bezierCurveTo(w * 0.3, h * 0.2, w * 0.7, h * 0.2, w - 50, h - 50);
        ctx.stroke();

        // Critical Point
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Kinetic Molecules
        ctx.fillStyle = '#f59e0b66';
        for (let i = 0; i < 30; i++) {
          const x = (i * 15 + time * 20) % (w - 100) + 50;
          const y = h * 0.5 + Math.sin(time + i) * 20;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (mode === 'flash') {
        // Flash Chamber Simulation
        ctx.strokeStyle = '#3b82f6';
        ctx.strokeRect(w * 0.3, h * 0.2, w * 0.4, h * 0.6);
        
        // Liquid Level
        const level = 0.6 + Math.sin(time) * 0.02;
        ctx.fillStyle = '#3b82f633';
        ctx.fillRect(w * 0.3, h * (0.8 - level * 0.6), w * 0.4, h * level * 0.6);
        
        // Bubbles rising
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 15; i++) {
          const y = ((i * 20 - time * 40) % (h * 0.5)) + h * 0.7;
          if (y > h * 0.2 && y < h * 0.8) {
             ctx.beginPath();
             ctx.arc(w * 0.5 + Math.sin(time * 2 + i) * 20, y, 2, 0, Math.PI * 2);
             ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, params]);

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full" />;
}
