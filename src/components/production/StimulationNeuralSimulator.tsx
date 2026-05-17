import React, { useEffect, useRef } from 'react';

interface StimulationNeuralSimulatorProps {
  mode: 'acid' | 'frac';
  params: {
    intensity?: number;
    length?: number;
    width?: number;
  };
}

export function StimulationNeuralSimulator({ mode, params }: StimulationNeuralSimulatorProps) {
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
      const centerX = w / 2;
      const centerY = h / 2;
      time += 0.02;

      if (mode === 'acid') {
        // Wormhole simulation
        ctx.strokeStyle = '#fb7185'; // Rose
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        for (let i = 0; i < 20; i++) {
          const x = centerX + Math.cos(i + time) * (i * 5);
          const y = centerY + Math.sin(i * 2 + time) * (i * 8);
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Particles entering wormholes
        ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
        for (let i = 0; i < 30; i++) {
          const x = centerX + (Math.random() - 0.5) * 100;
          const y = centerY + (Math.random() - 0.5) * 100;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (mode === 'frac') {
        // Hydraulic Frac Propagation
        const fracLen = (params.length || 500) / 10;
        const fracWidth = (params.width || 0.25) * 10;

        ctx.fillStyle = 'rgba(251, 113, 133, 0.1)';
        ctx.fillRect(centerX - fracLen, centerY - fracWidth, fracLen * 2, fracWidth * 2);

        // Kinetic stress lines
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - fracLen, centerY);
        ctx.lineTo(centerX + fracLen, centerY);
        ctx.stroke();

        // Proppant particles
        ctx.fillStyle = '#fb7185';
        for (let i = 0; i < 50; i++) {
          const x = centerX - fracLen + (Math.random() * fracLen * 2);
          const y = centerY - fracWidth + (Math.random() * fracWidth * 2);
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, params]);

  return (
    <div className="relative w-full h-[400px] bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
      <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
      <div className="absolute top-6 right-6 text-right">
        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest italic">Stimulation Dynamics AI</p>
        <h4 className="text-xl font-black text-white uppercase tracking-tighter mt-1">{mode === 'acid' ? 'Matrix Wormholing' : 'Fracture Geometry'}</h4>
      </div>
    </div>
  );
}
