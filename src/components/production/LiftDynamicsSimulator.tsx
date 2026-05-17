import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LiftDynamicsSimulatorProps {
  method: 'beam' | 'gas' | 'pcp' | 'plunger' | 'jet' | 'esp';
  intensity: number;
}

export function LiftDynamicsSimulator({ method, intensity }: LiftDynamicsSimulatorProps) {
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
      time += 0.05 + intensity * 0.1;

      if (method === 'beam') {
        // Draw Dyno Card
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const centerX = w / 2;
        const centerY = h / 2;
        const baseW = 100;
        const baseH = 150;
        
        // Typical "Fluid Pound" or "Normal" card shape
        for (let i = 0; i < 360; i++) {
           const rad = (i * Math.PI) / 180;
           const x = centerX + Math.cos(rad) * baseW;
           // Distortion based on pump condition (simplified)
           const distortion = Math.sin(rad * 2) * 20 * intensity;
           const y = centerY + Math.sin(rad) * baseH + distortion;
           if (i === 0) ctx.moveTo(x, y);
           else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Fill for work area
        ctx.fillStyle = 'rgba(234, 179, 8, 0.1)';
        ctx.fill();

        // Stroke line for current position
        const pX = centerX + Math.cos(time) * baseW;
        const pY = centerY + Math.sin(time) * baseH;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(pX, pY, 6, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (method === 'gas') {
        // Gas lift unloading mandrels
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(w * 0.4, 20);
        ctx.lineTo(w * 0.4, h - 20);
        ctx.stroke();

        // Mandrels/Valves
        for (let i = 1; i <= 5; i++) {
           const y = (i / 6) * h;
           const active = (Math.sin(time - i) > 0);
           ctx.fillStyle = active ? '#22d3ee' : '#1e293b';
           ctx.beginPath();
           ctx.arc(w * 0.4, y, 8, 0, Math.PI * 2);
           ctx.fill();
           
           if (active) {
              // Gas bubbles from valve
              ctx.fillStyle = 'rgba(255,255,255,0.4)';
              for (let j = 0; j < 5; j++) {
                 const bx = w * 0.4 + Math.sin(time * 5 + j) * 20;
                 const by = y - ((time * 50 + j * 20) % 60);
                 ctx.beginPath();
                 ctx.arc(bx, by, 3, 0, Math.PI * 2);
                 ctx.fill();
              }
           }
        }
      }
      else if (method === 'pcp') {
        // Helical rotor animation
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 10;
        const centerX = w / 2;
        
        for (let y = 20; y < h - 20; y += 2) {
           const offset = Math.sin((y / 40) + time) * 30;
           ctx.fillStyle = '#10b981';
           ctx.beginPath();
           ctx.arc(centerX + offset, y, 15, 0, Math.PI * 2);
           ctx.fill();
        }
      }
      else if (method === 'esp') {
         // Multi-stage pump impeller rotation
         ctx.strokeStyle = '#3b82f6';
         for(let i = 0; i < 8; i++) {
            const y = 50 + i * 50;
            ctx.save();
            ctx.translate(w/2, y);
            ctx.rotate(time * 2);
            ctx.lineWidth = 2;
            ctx.strokeRect(-25, -5, 50, 10);
            ctx.restore();
            
            // Flow arrows
            ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
            const flowY = (y - time * 50) % h;
            ctx.beginPath();
            ctx.moveTo(w/2 - 5, flowY);
            ctx.lineTo(w/2, flowY - 10);
            ctx.lineTo(w/2 + 5, flowY);
            ctx.fill();
         }
      }
      else if (method === 'plunger') {
         // Plunger Lift: Rise and Fall cycle
         const cycleTime = time % 10;
         const isRising = cycleTime < 4;
         const plungerY = isRising 
            ? h - 40 - (cycleTime / 4) * (h - 80) // Rising
            : 40 + ((cycleTime - 4) / 6) * (h - 80); // Falling

         // Tubing
         ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
         ctx.lineWidth = 40;
         ctx.beginPath();
         ctx.moveTo(w/2, 20);
         ctx.lineTo(w/2, h - 20);
         ctx.stroke();

         // Liquid Slug
         if (isRising) {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
            ctx.fillRect(w/2 - 15, 20, 30, plungerY - 20);
         }

         // Plunger
         ctx.fillStyle = '#a855f7';
         ctx.shadowBlur = 15;
         ctx.shadowColor = '#a855f7';
         ctx.beginPath();
         ctx.roundRect(w/2 - 15, plungerY, 30, 10, 2);
         ctx.fill();
         ctx.shadowBlur = 0;

         // Pressure Buildup indicator
         if (!isRising) {
            ctx.fillStyle = `rgba(255, 255, 255, ${((cycleTime - 4) / 6) * 0.3})`;
            ctx.font = 'bold 10px Inter';
            ctx.fillText('PRESSURE BUILDUP', w/2 + 30, h - 40);
         }
      }
      else if (method === 'jet') {
         // Jet Pump: Venturi Effect and Entrainment
         const centerX = w / 2;
         const centerY = h / 2;

         // Power Fluid (Top input)
         ctx.strokeStyle = '#ec4899';
         ctx.lineWidth = 4;
         ctx.beginPath();
         ctx.moveTo(centerX, 20);
         ctx.lineTo(centerX, centerY - 20);
         ctx.stroke();

         // Nozzle
         ctx.fillStyle = '#1e293b';
         ctx.beginPath();
         ctx.moveTo(centerX - 20, centerY - 20);
         ctx.lineTo(centerX + 20, centerY - 20);
         ctx.lineTo(centerX + 5, centerY);
         ctx.lineTo(centerX - 5, centerY);
         ctx.closePath();
         ctx.fill();

         // Jet Stream (High velocity)
         ctx.strokeStyle = '#ec4899';
         ctx.lineWidth = 2;
         for (let i = 0; i < 5; i++) {
            const y = centerY + ((time * 100 + i * 20) % 100);
            ctx.beginPath();
            ctx.moveTo(centerX, y);
            ctx.lineTo(centerX, y + 15);
            ctx.stroke();
         }

         // Entrained Fluid (Reservoir)
         ctx.strokeStyle = 'rgba(255,255,255,0.2)';
         ctx.lineWidth = 2;
         for (let i = 0; i < 6; i++) {
            const side = i % 2 === 0 ? 1 : -1;
            const rx = centerX + side * (40 - (time * 20 % 30));
            const ry = centerY + 10;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.quadraticCurveTo(centerX, ry + 10, centerX, ry + 40);
            ctx.stroke();
         }

         // Throat/Diffuser
         ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
         ctx.beginPath();
         ctx.moveTo(centerX - 10, centerY + 10);
         ctx.lineTo(centerX + 10, centerY + 10);
         ctx.lineTo(centerX + 30, h - 40);
         ctx.lineTo(centerX - 30, h - 40);
         ctx.closePath();
         ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [method, intensity]);

  return (
    <div className="relative w-full h-[400px] bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="w-full h-full"
      />
      
      <div className="absolute top-6 left-6">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Real-Time Dynamics Simulator</p>
        <h4 className="text-xl font-black text-white uppercase tracking-tighter mt-1">{method} Unit</h4>
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-4">
         <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</p>
            <p className="text-lg font-black text-white">{(85 + intensity * 10).toFixed(1)}%</p>
         </div>
         <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
         </div>
      </div>
    </div>
  );
}
