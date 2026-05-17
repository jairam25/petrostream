import React, { useEffect, useRef } from 'react';

export function ReservoirNeuralSimulator() {
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

      // Draw Porous Matrix
      ctx.fillStyle = '#0a0f18';
      ctx.fillRect(0, 0, w, h);

      // Pore Throats
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * w;
        const y = (Math.cos(i * 678.90) * 0.5 + 0.5) * h;
        ctx.beginPath();
        ctx.arc(x, y, 15 + Math.sin(time + i) * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Oil Molecules (Black/Brown)
      ctx.fillStyle = '#261a0d';
      for (let i = 0; i < 100; i++) {
        const x = ((i * 137.21 + time * 30) % w);
        const y = (Math.sin(i * 456.78 + time) * 0.5 + 0.5) * h;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Gas Molecules (White/Cyan)
      ctx.fillStyle = '#0ea5e966';
      for (let i = 0; i < 40; i++) {
        const x = ((i * 789.01 + time * 80) % w);
        const y = (Math.cos(i * 234.56 + time) * 0.5 + 0.5) * h;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pressure Pulse
      ctx.strokeStyle = '#0ea5e933';
      ctx.lineWidth = 2;
      const pulseX = (time * 100) % w;
      ctx.beginPath();
      ctx.moveTo(pulseX, 0);
      ctx.lineTo(pulseX, h);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full h-48 bg-black/40 rounded-2xl overflow-hidden border border-white/5 relative group">
      <div className="absolute top-6 left-8 z-10">
        <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic">Reservoir Dynamics Simulator</h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Multi-Phase Porous Flow · Darcy Vector Field</p>
      </div>
      <canvas ref={canvasRef} width={1200} height={300} className="w-full h-full" />
    </div>
  );
}
