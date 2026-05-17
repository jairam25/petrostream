import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface IPRNeuralSimulatorProps {
  mode: 'radial' | 'composite' | 'horizontal';
  params: {
    skin?: number;
    k?: number;
    pr?: number;
    pb?: number;
    L?: number;
  };
}

export function IPRNeuralSimulator({ mode, params }: IPRNeuralSimulatorProps) {
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
      time += 0.01;

      const centerX = w / 2;
      const centerY = h / 2;

      if (mode === 'radial') {
        // Pressure gradient circles
        const skin = params.skin || 0;
        const numCircles = 8;
        
        for (let i = 0; i < numCircles; i++) {
           const radius = 20 + i * 25;
           const alpha = 0.5 - (i / numCircles) * 0.4;
           ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
           ctx.lineWidth = 1;
           ctx.beginPath();
           ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
           ctx.stroke();
           
           // Flow vectors
           ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
           for (let j = 0; j < 8; j++) {
              const angle = (j * 45 + time * 20) * (Math.PI / 180);
              const vx = centerX + Math.cos(angle) * radius;
              const vy = centerY + Math.sin(angle) * radius;
              ctx.beginPath();
              ctx.arc(vx, vy, 2, 0, Math.PI * 2);
              ctx.fill();
           }
        }
        
        // Wellbore & Skin Zone
        ctx.fillStyle = skin > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30 + Math.abs(skin) * 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (mode === 'composite') {
         // Bubble point transition
         const pr = params.pr || 4000;
         const pb = params.pb || 2500;
         const ratio = pb / pr;
         
         // Reservoir zone
         ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
         ctx.beginPath();
         ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
         ctx.fill();
         
         // Gas breakout zone (near wellbore)
         const gasRadius = 150 * (1 - ratio);
         const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, gasRadius);
         gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)'); // Gas
         gradient.addColorStop(1, 'rgba(59, 130, 246, 0)'); // Liquid
         
         ctx.fillStyle = gradient;
         ctx.beginPath();
         ctx.arc(centerX, centerY, gasRadius, 0, Math.PI * 2);
         ctx.fill();
         
         // Bubbles animation
         ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
         for (let i = 0; i < 30; i++) {
            const angle = (i * 12 + time * 50) * (Math.PI / 180);
            const dist = (i * 5 + time * 100) % gasRadius;
            const bx = centerX + Math.cos(angle) * dist;
            const by = centerY + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(bx, by, 2, 0, Math.PI * 2);
            ctx.fill();
         }
      }
      else if (mode === 'horizontal') {
         // Ellipsoidal drainage
         const L = params.L || 2000;
         const scale = 150 / 10000;
         const halfL = (L / 2) * scale;
         
         ctx.strokeStyle = '#3b82f6';
         ctx.lineWidth = 2;
         ctx.beginPath();
         ctx.ellipse(centerX, centerY, halfL + 40, 60, 0, 0, Math.PI * 2);
         ctx.stroke();
         
         ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
         ctx.fill();
         
         // Horizontal section
         ctx.strokeStyle = '#fff';
         ctx.lineWidth = 4;
         ctx.beginPath();
         ctx.moveTo(centerX - halfL, centerY);
         ctx.lineTo(centerX + halfL, centerY);
         ctx.stroke();
         
         // Inflow arrows
         ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
         for (let i = 0; i < 10; i++) {
            const x = centerX - halfL + (i / 9) * (halfL * 2);
            const yOffset = Math.sin(time * 5 + i) * 10;
            ctx.beginPath();
            ctx.moveTo(x, centerY - 30 + yOffset);
            ctx.lineTo(x, centerY - 10 + yOffset);
            ctx.stroke();
         }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, params]);

  return (
    <div className="relative w-full h-[400px] bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="w-full h-full"
      />
      
      <div className="absolute top-6 left-6">
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Reservoir Dynamics AI</p>
        <h4 className="text-xl font-black text-white uppercase tracking-tighter mt-1">{mode === 'radial' ? 'Radial Inflow' : mode === 'composite' ? 'Two-Phase Flow' : 'Drainage Ellipsoid'}</h4>
      </div>

      <div className="absolute bottom-8 right-8 text-right">
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Engine v4.2</span>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
         </div>
      </div>
    </div>
  );
}
