import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface VLPFlowSimulatorProps {
  pattern: 'bubble' | 'slug' | 'churn' | 'annular';
  intensity: number; // 0 to 1
}

export function VLPFlowSimulator({ pattern, intensity }: VLPFlowSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      
      // Draw Tubing Walls (Metallic Gradient)
      const wallGrad = ctx.createLinearGradient(w * 0.15, 0, w * 0.25, 0);
      wallGrad.addColorStop(0, '#1e293b');
      wallGrad.addColorStop(0.5, '#475569');
      wallGrad.addColorStop(1, '#1e293b');
      
      ctx.fillStyle = wallGrad;
      ctx.fillRect(w * 0.15, 0, w * 0.08, h); // Left wall
      ctx.fillRect(w * 0.77, 0, w * 0.08, h); // Right wall

      // Background Fluid (Oil/Water) - Realistic Darker Fluid
      const fluidGrad = ctx.createLinearGradient(w * 0.23, 0, w * 0.77, 0);
      fluidGrad.addColorStop(0, '#05070a');
      fluidGrad.addColorStop(0.5, '#0f172a');
      fluidGrad.addColorStop(1, '#05070a');
      ctx.fillStyle = fluidGrad;
      ctx.fillRect(w * 0.23, 0, w * 0.54, h);

      const speed = 1 + intensity * 5;
      offset -= speed;

      if (pattern === 'bubble') {
        ctx.fillStyle = '#60a5fa99'; // Blueish bubbles
        for (let i = 0; i < 40; i++) {
          const x = w * 0.25 + (Math.sin(i * 123) * 0.5 + 0.5) * w * 0.5;
          const y = ((i * 30 + offset) % h + h) % h;
          const size = 2 + (Math.cos(i * 456) * 0.5 + 0.5) * 4;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          // Highlight on bubble
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(x - size/3, y - size/3, size/4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#60a5fa99';
        }
      } else if (pattern === 'slug') {
        for (let i = 0; i < 3; i++) {
          const y = ((i * 200 + offset) % h + h) % h;
          // Taylor Bubble
          const slugGrad = ctx.createLinearGradient(w * 0.3, y, w * 0.7, y);
          slugGrad.addColorStop(0, '#cbd5e122');
          slugGrad.addColorStop(0.5, '#f8fafc44');
          slugGrad.addColorStop(1, '#cbd5e122');
          ctx.fillStyle = slugGrad;
          ctx.beginPath();
          ctx.roundRect(w * 0.3, y, w * 0.4, 120, 20);
          ctx.fill();
          // Liquid slug between bubbles
          ctx.fillStyle = '#1e293b66';
          ctx.fillRect(w * 0.23, y - 40, w * 0.54, 40);
        }
      } else if (pattern === 'churn') {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (let i = 0; i < 60; i++) {
          const x = w * 0.25 + (Math.sin(i * 123 + offset * 0.1) * 0.5 + 0.5) * w * 0.5;
          const y = ((i * 20 + offset * 1.5) % h + h) % h;
          const size = 2 + Math.random() * 6;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (pattern === 'annular') {
        // Liquid film on walls
        ctx.fillStyle = '#3b82f633';
        const wave = Math.sin(offset * 0.1) * 3;
        ctx.fillRect(w * 0.23, 0, 8 + wave, h);
        ctx.fillRect(w * 0.77 - 8 - wave, 0, 8 + wave, h);
        
        // Gas core mist kinetic
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 150; i++) {
          const x = w * 0.3 + (Math.sin(i * 99) * 0.5 + 0.5) * w * 0.4;
          const y = ((i * 10 + offset * 2) % h + h) % h;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [pattern, intensity]);

  return (
    <div className="relative w-48 h-[500px] bg-black/40 rounded-2xl border border-white/5 overflow-hidden group">
      <canvas 
        ref={canvasRef} 
        width={192} 
        height={500} 
        className="w-full h-full"
      />
      
      {/* Overlay info */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">{pattern}</p>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-purple-500" 
            initial={{ width: 0 }}
            animate={{ width: `${intensity * 100}%` }}
          />
        </div>
      </div>

      {/* Gloss effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
    </div>
  );
}
