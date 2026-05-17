import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface NodalNeuralSimulatorProps {
  pr: number;
  pwf: number;
  pwh: number;
}

export function NodalNeuralSimulator({ pr, pwf, pwh }: NodalNeuralSimulatorProps) {
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

      // Draw Pressure Gradient Line (System Path)
      // Path: Reservoir (0) -> Bottomhole (0.3) -> Wellhead (0.7) -> Separator (1.0)
      const points = [
        { x: 40, y: h - 40, p: pr, label: 'PR' },
        { x: w * 0.35, y: h - 100, p: pwf, label: 'PWF' },
        { x: w * 0.7, y: 60, p: pwh, label: 'PWH' },
        { x: w - 40, y: 40, p: pwh * 0.8, label: 'Psep' }
      ];

      // Map Pressure to Height (normalized)
      const maxP = Math.max(pr, 4000);
      const mapP = (p: number) => (h - 60) - (p / maxP) * (h - 120);

      ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)'; // Orange
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Nodes
      points.forEach((pt, i) => {
        const py = mapP(pt.p);
        
        // Node pulse
        ctx.fillStyle = `rgba(249, 115, 22, ${0.1 + Math.sin(time + i) * 0.1})`;
        ctx.beginPath();
        ctx.arc(pt.x, py, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(pt.x, py, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px Inter';
        ctx.fillText(pt.label, pt.x - 10, py - 15);
        ctx.fillStyle = '#fff';
        ctx.fillText(Math.round(pt.p).toString(), pt.x - 10, py + 20);
      });

      // Flow Animation
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      for (let i = 0; i < points.length - 1; i++) {
         const p1 = points[i];
         const p2 = points[i+1];
         const py1 = mapP(p1.p);
         const py2 = mapP(p2.p);
         
         const progress = (time + i * 0.25) % 1;
         const cx = p1.x + (p2.x - p1.x) * progress;
         const cy = py1 + (py2 - py1) * progress;
         
         ctx.beginPath();
         ctx.arc(cx, cy, 2, 0, Math.PI * 2);
         ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [pr, pwf, pwh]);

  return (
    <div className="relative w-full h-[400px] bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="w-full h-full"
      />
      
      <div className="absolute top-6 left-6">
        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest italic">System Energy Gradient</p>
        <h4 className="text-xl font-black text-white uppercase tracking-tighter mt-1">Live Nodal Map</h4>
      </div>

      <div className="absolute bottom-8 right-8">
         <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Pressure Balanced</span>
         </div>
      </div>
    </div>
  );
}
