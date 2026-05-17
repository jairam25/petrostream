import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface CompletionNeuralSimulatorProps {
  mode: 'perf' | 'sand' | 'smart' | 'wellbore';
  params: {
    spf?: number;
    pen?: number;
    phase?: number;
    intensity?: number;
  };
}

export function CompletionNeuralSimulator({ mode, params }: CompletionNeuralSimulatorProps) {
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

      if (mode === 'perf') {
        // Draw Wellbore Cross-section
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = 60;
        
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Perforations
        const spf = params.spf || 6;
        const phase = params.phase || 60;
        const pen = params.pen || 12;
        
        ctx.strokeStyle = '#14b8a6'; // Teal
        ctx.lineWidth = 3;
        
        const numShots = 12; // Visual fixed
        for (let i = 0; i < numShots; i++) {
           const angle = (i * phase * Math.PI) / 180;
           const startX = centerX + Math.cos(angle) * radius;
           const startY = centerY + Math.sin(angle) * radius;
           const endX = centerX + Math.cos(angle) * (radius + pen * 5);
           const endY = centerY + Math.sin(angle) * (radius + pen * 5);
           
           ctx.beginPath();
           ctx.moveTo(startX, startY);
           ctx.lineTo(endX, endY);
           ctx.stroke();
           
           // Crushed zone glow
           ctx.fillStyle = 'rgba(20, 184, 166, 0.1)';
           ctx.beginPath();
           ctx.arc(endX, endY, 10, 0, Math.PI * 2);
           ctx.fill();
        }
      } 
      else if (mode === 'sand') {
        // Screen & Gravel Pack
        const midX = w / 2;
        
        // Casing
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(midX - 100, 20, 200, h - 40);
        
        // Screen
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(midX - 40, 20, 80, h - 40);
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1;
        for (let y = 25; y < h - 25; y += 10) {
           ctx.strokeRect(midX - 35, y, 70, 5);
        }

        // Formation Sand Particles
        ctx.fillStyle = 'rgba(255, 165, 0, 0.4)';
        for (let i = 0; i < 200; i++) {
           const x = midX + (Math.random() * 100 + 40) * (Math.random() > 0.5 ? 1 : -1);
           const y = Math.random() * (h - 60) + 30;
           const speed = 0.5 + Math.random();
           const currentY = (y + time * speed * 20) % (h - 60) + 30;
           ctx.beginPath();
           ctx.arc(x, currentY, 2, 0, Math.PI * 2);
           ctx.fill();
           
           // Filtering animation
           if (Math.abs(x - midX) < 45) {
              ctx.fillStyle = '#14b8a6';
              ctx.beginPath();
              ctx.arc(x, currentY, 1, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(255, 165, 0, 0.4)';
           }
        }
      }
      else if (mode === 'smart') {
         // ICV Actuation
         const midY = h / 2;
         const opening = Math.sin(time) * 0.5 + 0.5;
         
         ctx.strokeStyle = '#14b8a6';
         ctx.lineWidth = 8;
         // Pipe walls
         ctx.beginPath();
         ctx.moveTo(20, midY - 60);
         ctx.lineTo(w - 20, midY - 60);
         ctx.moveTo(20, midY + 60);
         ctx.lineTo(w - 20, midY + 60);
         ctx.stroke();
         
         // Valve plates
         ctx.fillStyle = '#1e293b';
         ctx.fillRect(w/2 - 10, midY - 60, 20, 120);
         
         ctx.fillStyle = '#14b8a6';
         const gap = opening * 100;
         ctx.fillRect(w/2 - 10, midY - 60, 20, (120 - gap) / 2);
         ctx.fillRect(w/2 - 10, midY + 60 - (120 - gap) / 2, 20, (120 - gap) / 2);
         
         // Flow lines
         ctx.strokeStyle = 'rgba(20, 184, 166, 0.3)';
         ctx.lineWidth = 2;
         for (let i = 0; i < 10; i++) {
            const y = midY - 30 + i * 6;
            if (Math.abs(y - midY) < gap / 2) {
               ctx.beginPath();
               ctx.moveTo(w/2 - 100, y);
               ctx.lineTo(w/2 + 100, y);
               ctx.stroke();
            }
         }
      }
      else if ((mode as string) === 'wellbore') {
        const midX = w / 2;
        // Outer Casing
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 4;
        ctx.strokeRect(midX - 80, 20, 160, h - 40);

        // Inner Tubing
        const tubGrad = ctx.createLinearGradient(midX - 30, 0, midX + 30, 0);
        tubGrad.addColorStop(0, '#0f172a');
        tubGrad.addColorStop(0.5, '#334155');
        tubGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = tubGrad;
        ctx.fillRect(midX - 30, 20, 60, h - 40);

        // Kinetic Flow Particles
        ctx.fillStyle = '#14b8a6';
        for (let i = 0; i < 40; i++) {
          const y = ((i * 15 + time * 60) % (h - 40)) + 20;
          ctx.beginPath();
          ctx.arc(midX + (Math.sin(i + time) * 15), h - y, 2, 0, Math.PI * 2);
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
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="w-full h-full"
      />
      
      <div className="absolute top-6 right-6 text-right">
        <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest italic">Completion Dynamics AI</p>
        <h4 className="text-xl font-black text-white uppercase tracking-tighter mt-1">{mode === 'perf' ? 'Gun Phasing' : mode === 'sand' ? 'Filter Efficiency' : 'Smart Valve'}</h4>
      </div>

      <div className="absolute bottom-8 left-8">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Simulation Active</span>
         </div>
      </div>
    </div>
  );
}
