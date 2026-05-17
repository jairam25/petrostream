import React, { useEffect, useRef } from 'react';

interface CCUSNeuralSimulatorProps {
  mode: 'capture' | 'storage' | 'monitoring' | 'transport';
  activeColor: string;
}

export function CCUSNeuralSimulator({ mode, activeColor }: CCUSNeuralSimulatorProps) {
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

      if (mode === 'capture') {
        // Amine scrubbing simulation
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;
        // Absorber
        ctx.strokeRect(w * 0.2, h * 0.2, w * 0.2, h * 0.6);
        // Regenerator
        ctx.strokeRect(w * 0.6, h * 0.3, w * 0.2, h * 0.5);
        
        // Solvent flow
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h * 0.7);
        ctx.lineTo(w * 0.6, h * 0.7);
        ctx.stroke();
        
        // Kinetic bubbles
        ctx.fillStyle = activeColor;
        for (let i = 0; i < 20; i++) {
          const y = ((i * 10 + time * 40) % (h * 0.5)) + h * 0.25;
          ctx.beginPath();
          ctx.arc(w * 0.3, h - y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (mode === 'storage') {
        // Geological storage plume
        ctx.fillStyle = activeColor + '33';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, 100 + Math.sin(time) * 10, 50 + Math.cos(time) * 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Residual trapping particles
        ctx.fillStyle = activeColor;
        for (let i = 0; i < 40; i++) {
          const x = w / 2 + (Math.random() - 0.5) * 150;
          const y = h / 2 + (Math.random() - 0.5) * 80;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (mode === 'monitoring') {
        // Seismic wave simulation
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const r = ((i * 40 + time * 50) % 200);
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (mode === 'transport') {
        // Pipeline flow simulation
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        
        // Flow particles
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 15; i++) {
          const x = ((i * 40 + time * 100) % w);
          ctx.beginPath();
          ctx.arc(x, h / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, activeColor]);

  return <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />;
}
