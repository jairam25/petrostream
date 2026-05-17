import React, { useEffect, useRef } from 'react';

/**
 * RefiningNeuralSimulator — Animated distillation column, FCC riser/reactor,
 * molecule transformation, and process flow visualization for the refining stage.
 * Industrial-grade canvas animation linking visual elements to refinery calculations.
 */
export function RefiningNeuralSimulator() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        // Particle systems for process visualization
        interface Molecule {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            type: 'crude' | 'vapor' | 'gasoline' | 'diesel' | 'gas' | 'coke' | 'catalyst' | 'hydrogen';
            life: number;
            maxLife: number;
        }

        interface Droplet {
            x: number;
            y: number;
            vy: number;
            size: number;
            opacity: number;
        }

        let molecules: Molecule[] = [];
        let droplets: Droplet[] = [];
        let catalystParticles: Molecule[] = [];

        const resetParticles = (w: number, h: number) => {
            molecules = [];
            droplets = [];
            catalystParticles = [];

            // Crude molecules rising through the atmospheric distillation column
            for (let i = 0; i < 60; i++) {
                molecules.push({
                    x: 0.15 * w + (Math.random() - 0.5) * 30,
                    y: 0.75 * h + Math.random() * 40,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: -0.3 - Math.random() * 0.8,
                    size: 2 + Math.random() * 3,
                    type: 'crude',
                    life: 0,
                    maxLife: 200 + Math.random() * 300,
                });
            }

            // Vapor molecules rising to top of column
            for (let i = 0; i < 40; i++) {
                molecules.push({
                    x: 0.15 * w + (Math.random() - 0.5) * 25,
                    y: 0.2 * h + Math.random() * 0.6 * h,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -0.5 - Math.random() * 1.0,
                    size: 1 + Math.random() * 2,
                    type: 'vapor',
                    life: Math.random() * 100,
                    maxLife: 150 + Math.random() * 200,
                });
            }

            // FCC riser particles — catalyst + feed
            for (let i = 0; i < 80; i++) {
                catalystParticles.push({
                    x: 0.55 * w + (Math.random() - 0.5) * 20,
                    y: 0.95 * h - Math.random() * 0.65 * h,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: -1.5 - Math.random() * 2.5,
                    size: 1.5 + Math.random() * 3,
                    type: Math.random() > 0.6 ? 'catalyst' : 'gasoline',
                    life: Math.random() * 50,
                    maxLife: 60 + Math.random() * 100,
                });
            }

            // Hydrogen / gas molecules in network
            for (let i = 0; i < 30; i++) {
                molecules.push({
                    x: 0.35 * w + Math.random() * 0.45 * w,
                    y: 0.1 * h + Math.random() * 0.8 * h,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    size: 1 + Math.random() * 1.5,
                    type: 'hydrogen',
                    life: Math.random() * 80,
                    maxLife: 120 + Math.random() * 200,
                });
            }
        };

        const render = () => {
            if (!ctx || !canvas) return;
            const w = canvas.width;
            const h = canvas.height;
            time += 0.016;

            // Initialize particles if needed
            if (molecules.length === 0) resetParticles(w, h);

            // Background — dark industrial
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, '#060a12');
            bgGrad.addColorStop(0.5, '#0a101c');
            bgGrad.addColorStop(1, '#080e18');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Invisible grid
            ctx.strokeStyle = '#1e293b22';
            ctx.lineWidth = 1;
            for (let gx = 0; gx < w; gx += 40) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, h);
                ctx.stroke();
            }
            for (let gy = 0; gy < h; gy += 40) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(w, gy);
                ctx.stroke();
            }

            // ── Atmospheric Distillation Column (left side) ──
            const colX = 0.15 * w;
            const colTop = 0.08 * h;
            const colBot = 0.88 * h;
            const colW = 55;

            // Column body with gradient
            const colGrad = ctx.createLinearGradient(colX - colW / 2, 0, colX + colW / 2, 0);
            colGrad.addColorStop(0, '#1e293b');
            colGrad.addColorStop(0.3, '#334155');
            colGrad.addColorStop(0.5, '#475569');
            colGrad.addColorStop(0.7, '#334155');
            colGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = colGrad;
            ctx.beginPath();
            ctx.roundRect(colX - colW / 2, colTop, colW, colBot - colTop, 6);
            ctx.fill();
            ctx.strokeStyle = '#0ea5e944';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Trays inside column
            const trayCount = 28;
            for (let t = 0; t < trayCount; t++) {
                const ty = colTop + 20 + (t / trayCount) * (colBot - colTop - 40);
                ctx.strokeStyle = '#47556966';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(colX - colW / 2 + 4, ty);
                ctx.lineTo(colX + colW / 2 - 4, ty);
                ctx.stroke();

                // Tray weir/downcomer indicators
                const weirSide = t % 2 === 0 ? -1 : 1;
                ctx.fillStyle = '#0ea5e933';
                ctx.fillRect(colX + weirSide * colW / 3, ty - 2, colW / 6, 4);
            }

            // Liquid on trays — pulsing level
            for (let t = 0; t < trayCount; t++) {
                const ty = colTop + 20 + (t / trayCount) * (colBot - colTop - 40);
                const liquidLevel = 3 + Math.sin(time * 3 + t * 0.5) * 1.5;
                const hue = 30 + t * 2; // warmer at bottom, cooler at top
                ctx.fillStyle = `hsla(${hue}, 80%, ${40 + t * 0.8}%, 0.5)`;
                ctx.fillRect(colX - colW / 2 + 5, ty - liquidLevel, colW - 10, liquidLevel);
            }

            // Furnace glow at bottom
            const furnaceGlow = ctx.createRadialGradient(colX, colBot + 10, 5, colX, colBot + 10, 50);
            furnaceGlow.addColorStop(0, '#f9731677');
            furnaceGlow.addColorStop(0.5, '#ea580c33');
            furnaceGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = furnaceGlow;
            ctx.beginPath();
            ctx.arc(colX, colBot + 8, 45, 0, Math.PI * 2);
            ctx.fill();

            // Pulsing furnace flame
            const flameH = 15 + Math.sin(time * 8) * 5;
            const flameGrad = ctx.createLinearGradient(0, colBot + 8, 0, colBot + 8 - flameH);
            flameGrad.addColorStop(0, '#f97316');
            flameGrad.addColorStop(0.4, '#fbbf24');
            flameGrad.addColorStop(1, '#fef08a33');
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.moveTo(colX - 12, colBot + 8);
            ctx.quadraticCurveTo(colX - 4, colBot + 8 - flameH, colX, colBot + 8 - flameH - 5);
            ctx.quadraticCurveTo(colX + 4, colBot + 8 - flameH, colX + 12, colBot + 8);
            ctx.fill();

            // Overhead condenser
            ctx.fillStyle = '#334155';
            ctx.fillRect(colX - 40, colTop - 18, 80, 18);
            ctx.strokeStyle = '#0ea5e966';
            ctx.lineWidth = 1;
            ctx.strokeRect(colX - 40, colTop - 18, 80, 18);

            // Condenser fins
            for (let fi = 0; fi < 6; fi++) {
                ctx.strokeStyle = '#64748b';
                ctx.beginPath();
                ctx.moveTo(colX - 35 + fi * 14, colTop - 16);
                ctx.lineTo(colX - 35 + fi * 14, colTop - 4);
                ctx.stroke();
            }

            // Overhead vapor line
            ctx.strokeStyle = '#0ea5e988';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(colX, colTop);
            ctx.lineTo(colX, colTop - 18);
            ctx.stroke();

            // Overhead accumulator
            ctx.fillStyle = '#1e3a5f';
            ctx.beginPath();
            ctx.ellipse(colX, colTop - 24, 25, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0ea5e9';
            ctx.stroke();

            // Side draws with labels
            const sideDraws = [
                { label: 'GAS', y: 0.13, color: '#f472b6' },
                { label: 'L.NPH', y: 0.22, color: '#a78bfa' },
                { label: 'H.NPH', y: 0.32, color: '#818cf8' },
                { label: 'KERO', y: 0.44, color: '#38bdf8' },
                { label: 'DSL', y: 0.56, color: '#34d399' },
                { label: 'HGO', y: 0.68, color: '#fbbf24' },
                { label: 'RESID', y: 0.82, color: '#f97316' },
            ];

            sideDraws.forEach((sd) => {
                const sdy = colTop + sd.y * (colBot - colTop);
                ctx.strokeStyle = `${sd.color}88`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(colX + colW / 2, sdy);
                ctx.lineTo(colX + colW / 2 + 25, sdy);
                ctx.stroke();

                // Product dot
                ctx.fillStyle = sd.color;
                ctx.beginPath();
                ctx.arc(colX + colW / 2 + 28, sdy, 3, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = `${sd.color}cc`;
                ctx.font = 'bold 7px Inter, system-ui';
                ctx.textAlign = 'left';
                ctx.fillText(sd.label, colX + colW / 2 + 34, sdy + 3);
            });

            // ── Vacuum Distillation Column (right of CDU) ──
            const vduX = colX + 120;
            const vduTop = 0.15 * h;
            const vduBot = 0.85 * h;
            const vduW = 50;

            const vduGrad = ctx.createLinearGradient(vduX - vduW / 2, 0, vduX + vduW / 2, 0);
            vduGrad.addColorStop(0, '#1e293b');
            vduGrad.addColorStop(0.3, '#334155');
            vduGrad.addColorStop(0.5, '#475569');
            vduGrad.addColorStop(0.7, '#334155');
            vduGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = vduGrad;
            ctx.beginPath();
            ctx.roundRect(vduX - vduW / 2, vduTop, vduW, vduBot - vduTop, 6);
            ctx.fill();
            ctx.strokeStyle = '#a855f744';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Vacuum structured packing (cross-hatch)
            ctx.strokeStyle = '#a855f722';
            ctx.lineWidth = 0.5;
            for (let py = vduTop + 10; py < vduBot - 10; py += 12) {
                const tilt = Math.sin(py * 0.01) * 3;
                ctx.beginPath();
                ctx.moveTo(vduX - vduW / 2 + 4, py + tilt);
                ctx.lineTo(vduX + vduW / 2 - 4, py - tilt);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(vduX - vduW / 2 + 4, py - tilt);
                ctx.lineTo(vduX + vduW / 2 - 4, py + tilt);
                ctx.stroke();
            }

            // VDU side draws
            [['LVGO', 0.55, '#38bdf8'], ['HVGO', 0.7, '#fbbf24'], ['VR', 0.85, '#ef4444']].forEach(([label, yFrac, color]) => {
                const sdy = vduTop + (yFrac as number) * (vduBot - vduTop);
                ctx.strokeStyle = `${color}88`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(vduX + vduW / 2, sdy);
                ctx.lineTo(vduX + vduW / 2 + 22, sdy);
                ctx.stroke();
                ctx.fillStyle = color as string;
                ctx.beginPath();
                ctx.arc(vduX + vduW / 2 + 25, sdy, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `${color}cc`;
                ctx.font = 'bold 7px Inter, system-ui';
                ctx.textAlign = 'left';
                ctx.fillText(label as string, vduX + vduW / 2 + 30, sdy + 3);
            });

            // Transfer line CDU → VDU
            ctx.strokeStyle = '#f9731688';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.moveTo(colX + colW / 2, colTop + 0.82 * (colBot - colTop));
            ctx.lineTo(vduX - vduW / 2, vduTop + 0.1 * (vduBot - vduTop));
            ctx.stroke();
            ctx.setLineDash([]);

            // ── FCC Riser & Reactor (right side) ──
            const fccX = 0.72 * w;
            const riserBot = 0.88 * h;
            const riserTop = 0.22 * h;
            const riserW = 22;

            // Riser
            const riserGrad = ctx.createLinearGradient(fccX - riserW / 2, 0, fccX + riserW / 2, 0);
            riserGrad.addColorStop(0, '#ef444444');
            riserGrad.addColorStop(0.3, '#f9731655');
            riserGrad.addColorStop(0.5, '#fbbf2466');
            riserGrad.addColorStop(0.7, '#f9731655');
            riserGrad.addColorStop(1, '#ef444444');
            ctx.fillStyle = riserGrad;
            ctx.beginPath();
            ctx.roundRect(fccX - riserW / 2, riserTop, riserW, riserBot - riserTop, 4);
            ctx.fill();
            ctx.strokeStyle = '#f9731688';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Regenerator vessel
            const regenX = fccX + 45;
            const regenY = riserTop - 10;
            const regenW = 40;
            const regenH = 50;
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(regenX - regenW / 2, regenY, regenW, regenH, 8);
            ctx.fill();
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Spent catalyst standpipe
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(regenX - regenW / 2 + 8, regenY);
            ctx.quadraticCurveTo(regenX - regenW / 2 - 15, regenY - 5, fccX + riserW / 2, riserTop + 10);
            ctx.stroke();

            // Regenerated catalyst return
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(regenX + regenW / 2 - 8, regenY + regenH);
            ctx.quadraticCurveTo(regenX + regenW / 2 + 15, riserBot + 15, fccX - riserW / 2, riserBot - 10);
            ctx.stroke();

            // ── Reactor/Separator vessel above riser ──
            const reactorX = fccX;
            const reactorY = riserTop - 35;
            const reactorW = 50;
            const reactorH = 35;
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(reactorX - reactorW / 2, reactorY, reactorW, reactorH, 8);
            ctx.fill();
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Cyclone separators inside reactor
            for (let cy = 0; cy < 3; cy++) {
                const cyX = reactorX - 12 + cy * 12;
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cyX, reactorY + 25);
                ctx.lineTo(cyX, reactorY + 8);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(cyX, reactorY + 6, 5, 0, Math.PI * 2);
                ctx.stroke();
                // Cyclone spin
                const spin = time * (3 + cy) % (Math.PI * 2);
                ctx.strokeStyle = '#0ea5e966';
                ctx.beginPath();
                ctx.arc(cyX, reactorY + 6, 3, spin, spin + Math.PI * 1.2);
                ctx.stroke();
            }

            // Vapor line to fractionator
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(reactorX, reactorY);
            ctx.lineTo(reactorX, reactorY - 20);
            ctx.stroke();

            // ── Hydrocracker Reactor ──
            const hcX = 0.88 * w;
            const hcY = 0.28 * h;
            const hcW = 35;
            const hcH = 100;
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(hcX - hcW / 2, hcY, hcW, hcH, 6);
            ctx.fill();
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Catalyst bed layers
            for (let bed = 0; bed < 3; bed++) {
                const by = hcY + 12 + bed * 30;
                ctx.fillStyle = '#34d39922';
                ctx.fillRect(hcX - hcW / 2 + 3, by, hcW - 6, 16);
                ctx.strokeStyle = '#34d39955';
                ctx.strokeRect(hcX - hcW / 2 + 3, by, hcW - 6, 16);

                // H2 quench between beds
                if (bed < 2) {
                    ctx.strokeStyle = '#34d39988';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    ctx.moveTo(hcX - hcW / 2, by + 22);
                    ctx.lineTo(hcX - hcW / 2 - 15, by + 22);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

            // ── Coker Drums ──
            const cokerX = 0.88 * w;
            const cokerY = 0.68 * h;
            const cokeW = 30;
            const cokeH = 60;

            // Drum 1
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(cokerX - cokeW / 2 - 20, cokerY, cokeW, cokeH, 6);
            ctx.fill();
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Coke fill level (pulsing)
            const cokeLevel = 0.3 + Math.abs(Math.sin(time * 0.3)) * 0.5;
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(cokerX - cokeW / 2 - 20 + 2, cokerY + cokeH - cokeLevel * cokeH, cokeW - 4, cokeLevel * cokeH - 2);
            // Coke texture
            ctx.fillStyle = '#29252433';
            for (let cx = 0; cx < 8; cx++) {
                for (let cy = 0; cy < Math.floor(cokeLevel * 12); cy++) {
                    if (Math.random() > 0.6) {
                        ctx.fillRect(
                            cokerX - cokeW / 2 - 18 + cx * 3.5,
                            cokerY + cokeH - (cy + 1) * (cokeLevel * cokeH / 12) + Math.random() * 3,
                            2 + Math.random() * 2,
                            1 + Math.random() * 2
                        );
                    }
                }
            }

            // Drum 2
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(cokerX - cokeW / 2 + 20, cokerY, cokeW, cokeH, 6);
            ctx.fill();
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            const cokeLevel2 = 0.6 + Math.abs(Math.cos(time * 0.3 + 1.5)) * 0.3;
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(cokerX - cokeW / 2 + 22, cokerY + cokeH - cokeLevel2 * cokeH, cokeW - 4, cokeLevel2 * cokeH - 2);

            // ── Process Flow Arrows (Connecting Units) ──
            ctx.strokeStyle = '#47556988';
            ctx.lineWidth = 1;
            const flowArrows = [
                [fccX, hcY + hcH, hcX, hcY],
                [colX + 200, 0.55 * h, hcX, hcY + 20],
                [vduX, 0.85 * h, cokerX - 20, cokerY],
            ];

            flowArrows.forEach(([fx, fy, tx, ty]) => {
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(fx, fy);
                ctx.lineTo(tx, ty);
                ctx.stroke();
                // Arrowhead
                const angle = Math.atan2(ty - fy, tx - fx);
                ctx.setLineDash([]);
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                const ax = tx - Math.cos(angle) * 8;
                const ay = ty - Math.sin(angle) * 8;
                ctx.moveTo(tx, ty);
                ctx.lineTo(ax - Math.sin(angle) * 4, ay + Math.cos(angle) * 4);
                ctx.lineTo(ax + Math.sin(angle) * 4, ay - Math.cos(angle) * 4);
                ctx.fill();
            });

            // ── Hydrogen Pipeline Network ──
            const h2PathY = 0.05 * h;
            ctx.strokeStyle = '#22d3ee44';
            ctx.lineWidth = 1;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.moveTo(0.08 * w, h2PathY);
            ctx.lineTo(0.72 * w, h2PathY);
            ctx.lineTo(0.72 * w, hcY + 17);
            ctx.stroke();
            ctx.setLineDash([]);

            // H2 label
            ctx.fillStyle = '#22d3ee88';
            ctx.font = 'bold 7px Inter, system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('H₂ HEADER', 0.35 * w, h2PathY - 6);

            // ── Animate Molecules ──
            molecules.forEach((m, i) => {
                m.life += 1;
                m.x += m.vx;
                m.y += m.vy;

                // Reset dead molecules
                if (m.life > m.maxLife || m.y < 0 || m.y > h || m.x < 0 || m.x > w) {
                    if (m.type === 'crude' || m.type === 'vapor') {
                        m.x = colX + (Math.random() - 0.5) * 30;
                        m.y = m.type === 'crude' ? colBot - 10 - Math.random() * 20 : colTop + Math.random() * (colBot - colTop);
                        m.vy = m.type === 'crude' ? -0.3 - Math.random() * 0.8 : -0.5 - Math.random() * 1.0;
                    } else {
                        m.x = 0.35 * w + Math.random() * 0.45 * w;
                        m.y = 0.1 * h + Math.random() * 0.8 * h;
                        m.vx = (Math.random() - 0.5) * 0.4;
                        m.vy = (Math.random() - 0.5) * 0.4;
                    }
                    m.life = 0;
                    m.maxLife = 150 + Math.random() * 300;
                }

                // Color by type
                const colors: Record<string, string> = {
                    crude: '#78350f',
                    vapor: '#bae6fd44',
                    gasoline: '#fbbf24',
                    diesel: '#fbbf2488',
                    gas: '#0ea5e944',
                    coke: '#1c1917',
                    catalyst: '#f97316',
                    hydrogen: '#22d3ee88',
                };

                ctx.fillStyle = colors[m.type] || '#ffffff33';
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
                ctx.fill();

                // Glow for hot particles
                if (m.type === 'catalyst' || m.type === 'crude') {
                    ctx.fillStyle = m.type === 'catalyst' ? '#f9731622' : '#78350f22';
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.size * 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Animate catalyst particles in riser
            catalystParticles.forEach((cp, i) => {
                cp.life += 1;
                cp.x += cp.vx;
                cp.y += cp.vy;

                if (cp.life > cp.maxLife || cp.y < riserTop || cp.y > riserBot) {
                    cp.x = fccX + (Math.random() - 0.5) * 16;
                    cp.y = riserBot - Math.random() * 10;
                    cp.vy = -1.5 - Math.random() * 2.5;
                    cp.life = 0;
                    cp.maxLife = 60 + Math.random() * 100;
                    cp.type = Math.random() > 0.6 ? 'catalyst' : 'gasoline';
                }

                ctx.fillStyle = cp.type === 'catalyst' ? '#f97316' : '#fbbf2488';
                ctx.beginPath();
                ctx.arc(cp.x, cp.y, cp.size, 0, Math.PI * 2);
                ctx.fill();

                if (cp.type === 'catalyst') {
                    ctx.fillStyle = '#f9731618';
                    ctx.beginPath();
                    ctx.arc(cp.x, cp.y, cp.size * 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // ── Reformer reactor bank ──
            const refX = 0.38 * w;
            const refY = 0.55 * h;
            for (let r = 0; r < 3; r++) {
                const rx = refX + r * 30;
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(rx - 10, refY, 20, 45);
                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 1;
                ctx.strokeRect(rx - 10, refY, 20, 45);

                // Inter-heaters glow
                if (r < 2) {
                    ctx.fillStyle = '#f9731633';
                    ctx.fillRect(rx + 10, refY + 10, 10, 8);
                }
            }

            // ── Heat Exchanger Preheat Train ──
            const hxY = 0.92 * h;
            for (let i = 0; i < 6; i++) {
                const hxx = 0.1 * w + i * 55;
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(hxx, hxY, 35, 16);
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1;
                ctx.strokeRect(hxx, hxY, 35, 16);

                // Heat flow animation
                const heatAlpha = 0.3 + Math.sin(time * 4 + i) * 0.2;
                ctx.fillStyle = `rgba(249, 115, 22, ${heatAlpha})`;
                ctx.fillRect(hxx + 2, hxY + 5, 31, 6);
            }

            // ── Labels ──
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 8px Inter, system-ui';
            ctx.textAlign = 'center';

            ctx.fillText('CDU', colX, colTop - 28);
            ctx.fillText('VDU', vduX, vduTop - 10);
            ctx.fillText('FCC', fccX, riserTop - 50);
            ctx.fillText('HC', hcX, hcY - 10);
            ctx.fillText('COKER', cokerX, cokerY - 10);
            ctx.fillText('REFORMER', refX + 30, refY - 8);
            ctx.fillText('PREHEAT TRAIN', 0.25 * w, hxY - 10);
            ctx.fillText('REGENERATOR', regenX, regenY - 10);
            ctx.fillText('REACTOR', reactorX, reactorY - 8);

            // ── Animated Data Overlay ──
            ctx.fillStyle = '#0ea5e9';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'right';

            const throughput = 250000 + Math.sin(time * 0.5) * 10000;
            ctx.fillText(`THROUGHPUT: ${throughput.toLocaleString(undefined, { maximumFractionDigits: 0 })} BPD`, w - 20, 20);

            const gasolineYield = 48 + Math.sin(time * 1.2) * 3;
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(`GASOLINE YIELD: ${gasolineYield.toFixed(1)}%`, w - 20, 36);

            const dieselYield = 28 + Math.cos(time * 0.8) * 2;
            ctx.fillStyle = '#34d399';
            ctx.fillText(`DIESEL YIELD: ${dieselYield.toFixed(1)}%`, w - 20, 52);

            const h2Prod = 45 + Math.sin(time * 0.7) * 5;
            ctx.fillStyle = '#22d3ee';
            ctx.fillText(`H₂ PROD: ${h2Prod.toFixed(1)} MMSCFD`, w - 20, 68);

            // Status indicators
            const statusX = 20;
            const statusY = 20;

            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(statusX, statusY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#22c55e88';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('CDU ONLINE', statusX + 10, statusY + 3);

            ctx.beginPath();
            ctx.arc(statusX, statusY + 16, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText('FCC ONLINE', statusX + 10, statusY + 19);

            ctx.beginPath();
            ctx.arc(statusX, statusY + 32, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText('HC ONLINE', statusX + 10, statusY + 35);

            ctx.beginPath();
            ctx.arc(statusX, statusY + 48, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText('SRU ONLINE', statusX + 10, statusY + 51);

            // ── Emissions Stack ──
            const stackX = 0.92 * w;
            const stackBot = 0.88 * h;
            const stackTop = 0.02 * h;
            ctx.fillStyle = '#334155';
            ctx.fillRect(stackX - 6, stackTop, 12, stackBot - stackTop);
            ctx.strokeStyle = '#64748b';
            ctx.strokeRect(stackX - 6, stackTop, 12, stackBot - stackTop);

            // Stack emissions
            for (let ei = 0; ei < 8; ei++) {
                const ex = stackX + (ei - 3.5) * 2.5 + Math.sin(time * 2 + ei) * 3;
                const ey = stackTop - ei * 4 - Math.abs(Math.sin(time + ei)) * 8;
                ctx.fillStyle = '#94a3b844';
                ctx.beginPath();
                ctx.arc(ex, ey, 1.5 + ei * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }

            // ── Tank Farm (bottom right) ──
            for (let tk = 0; tk < 4; tk++) {
                const tkX = 0.78 * w + tk * 25;
                const tkY = 0.90 * h;
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(tkX, tkY, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1;
                ctx.stroke();

                const level = 0.4 + Math.sin(time + tk) * 0.3;
                ctx.fillStyle = ['#fbbf2488', '#fbbf2466', '#0ea5e966', '#34d39966'][tk];
                ctx.beginPath();
                ctx.arc(tkX, tkY, 7, Math.PI, Math.PI + Math.PI * level);
                ctx.fill();
            }

            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 7px Inter, system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('PRODUCT TANK FARM', 0.815 * w, 0.96 * h);

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="w-full h-64 bg-black/40 rounded-2xl overflow-hidden border border-white/5 relative group">
            <div className="absolute top-6 left-8 z-10">
                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest italic">Refinery Process Simulator</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">CDU · VDU · FCC · HC · Coker · Reformer · H₂ Network</p>
            </div>
            <div className="absolute top-6 right-8 z-10 flex gap-3">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded-full border border-white/5">LIVE</span>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded-full border border-amber-500/20">DYNAMIC YIELDS</span>
            </div>
            <canvas ref={canvasRef} width={1400} height={400} className="w-full h-full" />
        </div>
    );
}