import React, { useEffect, useRef } from 'react';

/**
 * RetailNeuralSimulator — Animated fuel retail station visualization showing
 * fuel dispensers, underground storage tanks (USTs), traffic flow, price signs,
 * convenience store, car wash, EV chargers, and environmental monitoring.
 * All visual elements are linked to retail engineering calculations.
 */
export function RetailNeuralSimulator() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        // ── Particle / entity definitions ──────────────────────────────
        interface FuelParticle {
            x: number; y: number;
            targetY: number;
            speed: number;
            size: number;
            type: 'gasoline' | 'diesel' | 'vapor';
            opacity: number;
            dispenserIdx: number;
            phase: 'tank' | 'piping' | 'dispensing' | 'complete';
            progress: number;
        }

        interface Vehicle {
            x: number; y: number;
            lane: number;
            speed: number;
            size: [number, number];
            color: string;
            fueling: boolean;
            fuelTimer: number;
            fuelDuration: number;
            dispenserIdx: number;
            exitTimer: number;
            isEV: boolean;
        }

        interface RoadParticle {
            x: number; y: number;
            lane: number;
            speed: number;
            size: [number, number];
            color: string;
        }

        // Particles and simulation state
        let fuelParticles: FuelParticle[] = [];
        let vehicles: Vehicle[] = [];
        let roadTraffic: RoadParticle[] = [];
        let dispenserStates: { active: boolean; timer: number; fuelType: 'gasoline' | 'diesel' }[] = [];
        let tankLevels: { gasoline: number; diesel: number; maxG: number; maxD: number } = { gasoline: 12000, diesel: 10000, maxG: 15000, maxD: 12000 };
        let priceDigits: { gas: number; diesel: number } = { gas: 3.49, diesel: 3.89 };
        let evChargeStates: { active: boolean; progress: number; timer: number }[] = [];

        const NUM_DISPENSERS = 6;
        const NUM_EV_STALLS = 2;

        const resetSimulation = (w: number, h: number) => {
            fuelParticles = [];
            vehicles = [];
            roadTraffic = [];
            evChargeStates = [];

            dispenserStates = Array.from({ length: NUM_DISPENSERS }, () => ({
                active: false, timer: 0, fuelType: (Math.random() > 0.4 ? 'gasoline' : 'diesel') as 'gasoline' | 'diesel',
            }));

            for (let i = 0; i < NUM_EV_STALLS; i++) {
                evChargeStates.push({ active: Math.random() > 0.5, progress: Math.random() * 0.7, timer: Math.random() * 300 });
            }

            // Seed road traffic
            for (let i = 0; i < 20; i++) {
                const lane = Math.floor(Math.random() * 4);
                const isLeft = lane < 2;
                roadTraffic.push({
                    x: isLeft ? -Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
                    y: lane < 2 ? h * 0.82 + lane * 16 : h * 0.82 + lane * 16,
                    lane,
                    speed: isLeft ? 1.2 + Math.random() * 2.5 : -(1.2 + Math.random() * 2.5),
                    size: [20 + Math.random() * 15, 8 + Math.random() * 4],
                    color: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#e2e8f0'][Math.floor(Math.random() * 6)],
                });
            }
        };

        const spawnFuelParticle = (w: number, h: number, dIdx: number) => {
            const tankX = 0.18 * w + (dIdx < 3 ? 0 : 0.07 * w);
            const tankY = 0.55 * h;
            fuelParticles.push({
                x: tankX + (Math.random() - 0.5) * 20,
                y: tankY,
                targetY: 0.35 * h,
                speed: 0.8 + Math.random() * 1.5,
                size: 2 + Math.random() * 2,
                type: dispenserStates[dIdx].fuelType,
                opacity: 0.9 + Math.random() * 0.1,
                dispenserIdx: dIdx,
                phase: 'tank',
                progress: 0,
            });
        };

        const updateFuelParticles = () => {
            for (let i = fuelParticles.length - 1; i >= 0; i--) {
                const p = fuelParticles[i];
                if (p.phase === 'tank') {
                    p.y -= p.speed;
                    p.progress += p.speed / 80;
                    if (p.progress >= 0.5) {
                        p.phase = 'piping';
                    }
                } else if (p.phase === 'piping') {
                    p.x += (p.dispenserIdx < 3 ? -1 : 1) * p.speed * 0.6;
                    p.y -= p.speed * 0.3;
                    p.progress += p.speed / 120;
                    if (p.progress >= 0.8) {
                        p.phase = 'dispensing';
                    }
                } else if (p.phase === 'dispensing') {
                    p.y -= p.speed * 0.8;
                    p.opacity -= 0.015;
                    p.size += 0.03;
                    if (p.opacity <= 0 || p.y < 0.2 * canvasRef.current!.height) {
                        fuelParticles.splice(i, 1);
                    }
                }
            }
        };

        const updateVehicles = (w: number, _h: number) => {
            for (let i = vehicles.length - 1; i >= 0; i--) {
                const v = vehicles[i];
                if (!v.fueling) {
                    v.x += v.speed;
                    // Check if vehicle arrives at a dispenser
                    const dIdx = v.dispenserIdx;
                    const dispX = 0.38 * w + (dIdx % 3) * 0.06 * w;
                    if (Math.abs(v.x - dispX) < 3 && v.speed > 0) {
                        v.fueling = true;
                        v.speed = 0;
                        dispenserStates[dIdx].active = true;
                        dispenserStates[dIdx].timer = 0;
                        v.fuelDuration = 80 + Math.random() * 200;
                    }
                } else {
                    dispenserStates[v.dispenserIdx].timer += 1.6;
                    if (dispenserStates[v.dispenserIdx].timer >= v.fuelDuration) {
                        dispenserStates[v.dispenserIdx].active = false;
                        dispenserStates[v.dispenserIdx].timer = 0;
                        v.fueling = false;
                        v.speed = 1.5 + Math.random();
                        v.exitTimer = 0;
                        // Consume fuel
                        const amt = 8 + Math.random() * 20;
                        if (dispenserStates[v.dispenserIdx].fuelType === 'gasoline') {
                            tankLevels.gasoline = Math.max(0, tankLevels.gasoline - amt);
                        } else {
                            tankLevels.diesel = Math.max(0, tankLevels.diesel - amt);
                        }
                    }
                }
                if (!v.fueling && v.x > w + 60) {
                    vehicles.splice(i, 1);
                }
            }
            // Spawn new vehicles
            if (vehicles.length < 4 && Math.random() > 0.97) {
                const dIdx = Math.floor(Math.random() * NUM_DISPENSERS);
                vehicles.push({
                    x: -40 - Math.random() * 60,
                    y: _h * 0.32 + (dIdx >= 3 ? _h * 0.08 : 0),
                    lane: dIdx >= 3 ? 1 : 0,
                    speed: 1.5 + Math.random() * 2,
                    size: [28 + Math.random() * 12, 11 + Math.random() * 4],
                    color: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#e2e8f0'][Math.floor(Math.random() * 6)],
                    fueling: false,
                    fuelTimer: 0,
                    fuelDuration: 0,
                    dispenserIdx: dIdx,
                    exitTimer: 0,
                    isEV: false,
                });
            }
        };

        const updateRoadTraffic = (w: number) => {
            for (let i = roadTraffic.length - 1; i >= 0; i--) {
                const t = roadTraffic[i];
                t.x += t.speed;
                if (t.speed > 0 && t.x > w + 80) {
                    t.x = -80 - Math.random() * 100;
                } else if (t.speed < 0 && t.x < -80) {
                    t.x = w + 80 + Math.random() * 100;
                }
            }
        };

        const updateTankLevels = () => {
            // Slowly refill tanks (simulation delivery)
            if (tankLevels.gasoline < tankLevels.maxG * 0.3 && Math.random() > 0.99) {
                tankLevels.gasoline = Math.min(tankLevels.maxG, tankLevels.gasoline + 7000);
            }
            if (tankLevels.diesel < tankLevels.maxD * 0.3 && Math.random() > 0.99) {
                tankLevels.diesel = Math.min(tankLevels.maxD, tankLevels.diesel + 7000);
            }
            // Price fluctuation
            priceDigits.gas += (Math.random() - 0.5) * 0.003;
            priceDigits.diesel += (Math.random() - 0.5) * 0.003;
            priceDigits.gas = Math.max(2.79, Math.min(5.49, priceDigits.gas));
            priceDigits.diesel = Math.max(3.19, Math.min(6.49, priceDigits.diesel));
        };

        // ── Drawing helpers ────────────────────────────────────────────
        const drawRoad = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            // Road surface
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, h * 0.80, w, h * 0.12);
            // Lane markings
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([20, 15]);
            for (let lane = 1; lane < 4; lane++) {
                const y = h * 0.80 + lane * (h * 0.03);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            // Edge lines
            ctx.setLineDash([]);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.strokeRect(0, h * 0.80, w, h * 0.12);
            ctx.globalAlpha = 1;
            // Sidewalk
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, h * 0.78, w, h * 0.02);
        };

        const drawUSTs = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const tankY = h * 0.58;
            // UST shells
            const drawTank = (x: number, product: 'gasoline' | 'diesel', level: number, max: number) => {
                const tw = 70, th = 22;
                // Outer shell (secondary containment)
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(x - tw / 2, tankY - th / 2 - 3, tw, th + 6, 6);
                ctx.fill();
                ctx.stroke();
                // Inner tank
                const fillRatio = level / max;
                const grad = ctx.createLinearGradient(0, tankY - th / 2, 0, tankY + th / 2);
                if (product === 'gasoline') {
                    grad.addColorStop(0, '#fbbf24');
                    grad.addColorStop(1, '#d97706');
                } else {
                    grad.addColorStop(0, '#22d3ee');
                    grad.addColorStop(1, '#0891b2');
                }
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(x - tw / 2, tankY - th / 2, tw, th, 4);
                ctx.fill();
                // Fill level
                const fillH = th * fillRatio;
                ctx.fillStyle = product === 'gasoline' ? '#fbbf2440' : '#22d3ee40';
                ctx.beginPath();
                ctx.roundRect(x - tw / 2, tankY + th / 2 - fillH, tw, fillH, [0, 0, 4, 4]);
                ctx.fill();
                // Label
                ctx.fillStyle = '#94a3b8';
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(product === 'gasoline' ? '87 GAS' : 'DSL', x, tankY + th + 12);
                ctx.fillText(`${Math.round(level)}g`, x, tankY + th + 22);
            };

            drawTank(w * 0.15, 'gasoline', tankLevels.gasoline, tankLevels.maxG);
            drawTank(w * 0.28, 'diesel', tankLevels.diesel, tankLevels.maxD);

            // Interstitial monitoring lines
            ctx.strokeStyle = '#ef444460';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(w * 0.10, tankY - 14);
            ctx.lineTo(w * 0.33, tankY - 14);
            ctx.stroke();
            ctx.setLineDash([]);

            // ATG probe indicators
            for (let tx of [w * 0.15, w * 0.28]) {
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(tx, tankY - 10, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#4ade80';
                ctx.beginPath();
                ctx.arc(tx, tankY - 10, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const drawDispensers = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const startX = w * 0.36;
            const dispY = h * 0.35;
            const spacing = w * 0.06;

            for (let i = 0; i < NUM_DISPENSERS; i++) {
                const x = startX + i * spacing;
                const isActive = dispenserStates[i].active;
                const fuelType = dispenserStates[i].fuelType;

                // Base
                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.roundRect(x - 8, dispY + 10, 16, 28, 3);
                ctx.fill();
                // Display
                ctx.fillStyle = '#020617';
                ctx.beginPath();
                ctx.roundRect(x - 7, dispY + 5, 14, 14, 2);
                ctx.fill();
                if (isActive) {
                    // Active display
                    ctx.fillStyle = '#22d3ee';
                    ctx.font = '7px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${(dispenserStates[i].timer * 0.1).toFixed(1)}G`, x, dispY + 15);
                } else {
                    ctx.fillStyle = '#64748b';
                    ctx.font = '6px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('READY', x, dispY + 14);
                }

                // Nozzle / Hose
                ctx.strokeStyle = fuelType === 'gasoline' ? '#fbbf24' : '#22d3ee';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, dispY + 18);
                ctx.quadraticCurveTo(x + 6, dispY + 30, x + 4, dispY + 24);
                ctx.stroke();

                // Nozzle tip
                ctx.fillStyle = fuelType === 'gasoline' ? '#f59e0b' : '#0891b2';
                ctx.beginPath();
                ctx.arc(x + 4, dispY + 23, 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Active glow
                if (isActive) {
                    ctx.fillStyle = fuelType === 'gasoline' ? '#fbbf2420' : '#22d3ee20';
                    ctx.beginPath();
                    ctx.arc(x, dispY + 15, 12, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Breakaway valve indicator
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(x, dispY + 20, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const drawCanopy = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const cx = w * 0.45, cy = h * 0.30;
            const cw = w * 0.18, ch = 22;
            // Roof
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(cx - cw / 2, cy - ch, cw, ch, [4, 4, 0, 0]);
            ctx.fill();
            ctx.stroke();
            // Brand fascia
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(cx - cw / 2 + 2, cy - ch + 2, cw - 4, 6);
            ctx.fillStyle = '#fbbf24';
            ctx.font = '6px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PETROSTREAM', cx, cy - ch + 8);
            // Columns
            for (let col = -1; col <= 1; col += 2) {
                ctx.fillStyle = '#475569';
                ctx.fillRect(cx + col * cw * 0.35 - 3, cy, 6, cy - (cy - ch) - 6);
            }
            // Canopy lights
            for (let lx = -3; lx <= 3; lx++) {
                const lxx = cx + lx * (cw / 8);
                ctx.fillStyle = '#fef08a';
                ctx.beginPath();
                ctx.arc(lxx, cy - ch + 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const drawConvenienceStore = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const sx = w * 0.2, sy = h * 0.32;
            const sw = w * 0.12, sh = h * 0.18;
            // Building
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(sx, sy, sw, sh, 4);
            ctx.fill();
            ctx.stroke();
            // Roof
            ctx.fillStyle = '#334155';
            ctx.fillRect(sx - 2, sy - 4, sw + 4, 8);
            // Windows
            ctx.fillStyle = '#fef08a30';
            ctx.fillRect(sx + 6, sy + 8, sw * 0.35, 14);
            ctx.fillRect(sx + sw - sw * 0.35 - 6, sy + 8, sw * 0.35, 14);
            // Door
            ctx.fillStyle = '#22d3ee30';
            ctx.fillRect(sx + sw / 2 - 5, sy + sh - 20, 10, 18);
            // Sign
            ctx.fillStyle = '#fbbf24';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('C-STORE', sx + sw / 2, sy - 6);
            // Profit indicator
            const profitPulse = 0.5 + 0.5 * Math.sin(time * 2);
            ctx.fillStyle = `rgba(34, 197, 94, ${0.3 + profitPulse * 0.7})`;
            ctx.beginPath();
            ctx.arc(sx + sw / 2, sy + sh / 2, sw * 0.6, 0, Math.PI * 2);
            ctx.fill();
        };

        const drawCarWash = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const wx = w * 0.62, wy = h * 0.38;
            const ww = w * 0.06, wh = h * 0.09;
            // Wash bay
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(wx, wy, ww, wh, 4);
            ctx.fill();
            ctx.stroke();
            // Water spray
            const sprayPhase = Math.sin(time * 3) * 0.3 + 0.5;
            for (let s = 0; s < 4; s++) {
                ctx.fillStyle = `rgba(34, 211, 238, ${0.2 + sprayPhase * 0.5})`;
                ctx.beginPath();
                ctx.arc(wx + ww * 0.3 + s * 4, wy + wh * 0.5, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            // Water reclaim indicator
            ctx.fillStyle = '#22d3ee';
            ctx.font = '6px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('IBA WASH', wx + ww / 2, wy - 4);
            ctx.fillText('85% REC', wx + ww / 2, wy + wh + 10);
        };

        const drawEVChargers = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const ex = w * 0.72, ey = h * 0.48;
            for (let i = 0; i < NUM_EV_STALLS; i++) {
                const x = ex + i * w * 0.04;
                // Charger pedestal
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.roundRect(x - 3, ey, 6, 16, 2);
                ctx.fill();
                // Connector cable
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, ey + 16);
                ctx.quadraticCurveTo(x + 4, ey + 22, x + 2, ey + 20);
                ctx.stroke();
                // Status light
                const cs = evChargeStates[i];
                ctx.fillStyle = cs?.active ? '#22c55e' : '#64748b';
                ctx.beginPath();
                ctx.arc(x, ey - 1, 2.5, 0, Math.PI * 2);
                ctx.fill();
                if (cs?.active) {
                    // Charging glow
                    const glowPhase = Math.sin(time * 4 + i) * 0.3 + 0.5;
                    ctx.fillStyle = `rgba(34, 197, 94, ${0.15 + glowPhase * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(x, ey + 8, 10, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#a3e635';
                ctx.font = '5px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('DCFC', x, ey + 28);
                ctx.fillText(cs?.active ? `${Math.round((cs.progress || 0) * 100)}%` : 'IDLE', x, ey + 34);
            }
        };

        const drawPriceSign = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const px = w * 0.24, py = h * 0.08;
            // Sign pole
            ctx.fillStyle = '#64748b';
            ctx.fillRect(px - 2, py + 14, 4, h * 0.1);
            // Sign board
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(px - 18, py, 36, 28, 3);
            ctx.fill();
            ctx.stroke();
            // Prices
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`$${priceDigits.gas.toFixed(2)}`, px, py + 11);
            ctx.fillStyle = '#22d3ee';
            ctx.font = '7px monospace';
            ctx.fillText(`D $${priceDigits.diesel.toFixed(2)}`, px, py + 22);
        };

        const drawEnvironmentalMonitor = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const mx = w * 0.06, my = h * 0.65;
            // Monitoring wells
            for (let m = 0; m < 2; m++) {
                const x = mx + m * 18;
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.arc(x, my, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Water level indicator
                const wlPhase = Math.sin(time * 1.5 + m) * 0.3 + 0.5;
                ctx.fillStyle = `rgba(34, 211, 238, ${0.3 + wlPhase * 0.4})`;
                ctx.beginPath();
                ctx.arc(x, my, 3, 0, Math.PI * 2);
                ctx.fill();
                // BTEX indicator
                const btexLevel = 0.5 + Math.sin(time * 2 + m) * 0.3;
                ctx.fillStyle = btexLevel > 0.7 ? '#ef4444' : '#22c55e';
                ctx.beginPath();
                ctx.arc(x + 7, my - 7, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#64748b';
                ctx.font = '5px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('BTEX', x + 7, my - 10);
            }
            ctx.fillStyle = '#94a3b8';
            ctx.font = '6px monospace';
            ctx.fillText('GW MONITOR', mx, my + 14);
        };

        const drawSpillContainment = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const sx = w * 0.10, sy = h * 0.72;
            // Spill bucket
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(sx, sy, 12, 8, 2);
            ctx.fill();
            ctx.stroke();
            // Fill connection indicator
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(sx + 6, sy + 4, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '5px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('FILL', sx + 6, sy + 16);
            // Overfill prevention alarm
            ctx.fillStyle = tankLevels.gasoline > tankLevels.maxG * 0.9 ? '#ef4444' : '#22c55e';
            ctx.beginPath();
            ctx.arc(sx + 6, sy - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        };

        const drawEMVTerminal = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            const tx = w * 0.52, ty = h * 0.42;
            // POS terminal
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.roundRect(tx, ty, 14, 10, 2);
            ctx.fill();
            ctx.stroke();
            // Screen
            ctx.fillStyle = '#22d3ee';
            ctx.font = '5px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('EMV', tx + 7, ty + 7);
            // PCI compliance checkmark
            ctx.fillStyle = '#22c55e';
            ctx.font = '6px monospace';
            ctx.fillText('✓ PCI', tx + 7, ty - 4);
        };

        const drawTitleBlock = (ctx: CanvasRenderingContext2D, w: number, _h: number) => {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('RETAIL STATION NEURAL SIM', w - 12, 16);
            ctx.fillText('FUEL DISPENSING · UST · CONVENIENCE · EV', w - 12, 28);
        };

        // ── Main render loop ────────────────────────────────────────────
        const render = () => {
            if (!ctx || !canvas) return;
            const w = canvas.width;
            const h = canvas.height;
            time += 0.016;

            // Initialize if needed
            if (roadTraffic.length === 0) resetSimulation(w, h);

            // Background — industrial dark
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, '#060a12');
            bgGrad.addColorStop(0.3, '#0a101c');
            bgGrad.addColorStop(0.7, '#080e18');
            bgGrad.addColorStop(1, '#0c1420');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Grid overlay
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 0.3;
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

            // Station layout ground
            ctx.fillStyle = '#1a2236';
            ctx.fillRect(0, h * 0.24, w, h * 0.54);

            // Forecourt concrete (lighter)
            const forecourtGrad = ctx.createLinearGradient(0, 0, 0, h);
            forecourtGrad.addColorStop(0.35, '#2d3a50');
            forecourtGrad.addColorStop(0.5, '#334155');
            ctx.fillStyle = forecourtGrad;
            ctx.fillRect(w * 0.08, h * 0.28, w * 0.6, h * 0.42);

            // Draw all station elements
            drawRoad(ctx, w, h);
            drawUSTs(ctx, w, h);
            drawEnvironmentalMonitor(ctx, w, h);
            drawSpillContainment(ctx, w, h);
            drawConvenienceStore(ctx, w, h);
            drawCanopy(ctx, w, h);
            drawDispensers(ctx, w, h);
            drawCarWash(ctx, w, h);
            drawEVChargers(ctx, w, h);
            drawPriceSign(ctx, w, h);
            drawEMVTerminal(ctx, w, h);
            drawTitleBlock(ctx, w, h);

            // Draw road traffic
            for (const t of roadTraffic) {
                ctx.fillStyle = t.color;
                ctx.beginPath();
                ctx.roundRect(t.x - t.size[0] / 2, t.y - t.size[1] / 2, t.size[0], t.size[1], 3);
                ctx.fill();
                // Headlight/tail light
                ctx.fillStyle = t.speed > 0 ? '#fef08a' : '#ef4444';
                ctx.beginPath();
                ctx.arc(t.x + (t.speed > 0 ? t.size[0] / 2 - 2 : -t.size[0] / 2 + 2), t.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw vehicles at station
            for (const v of vehicles) {
                ctx.fillStyle = v.color;
                ctx.beginPath();
                ctx.roundRect(v.x - v.size[0] / 2, v.y - v.size[1] / 2, v.size[0], v.size[1], 3);
                ctx.fill();
                // Windows
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(v.x + 2, v.y - v.size[1] / 2 + 2, v.size[0] * 0.3, v.size[1] - 4);
                // Fueling indicator
                if (v.fueling) {
                    const dIdx = v.dispenserIdx;
                    const dispX = 0.38 * w + (dIdx % 3) * 0.06 * w;
                    ctx.strokeStyle = dispenserStates[dIdx].fuelType === 'gasoline' ? '#fbbf24' : '#22d3ee';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    ctx.moveTo(dispX, 0.35 * h + 12);
                    ctx.lineTo(v.x, v.y - v.size[1] / 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

            // Draw fuel particles
            for (const p of fuelParticles) {
                ctx.fillStyle = p.type === 'gasoline'
                    ? `rgba(251, 191, 36, ${p.opacity})`
                    : `rgba(34, 211, 238, ${p.opacity})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                // Trail
                ctx.fillStyle = p.type === 'gasoline'
                    ? `rgba(251, 191, 36, ${p.opacity * 0.3})`
                    : `rgba(34, 211, 238, ${p.opacity * 0.3})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y + p.size * 2, p.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }

            // Spawn fuel particles for active dispensers
            for (let d = 0; d < NUM_DISPENSERS; d++) {
                if (dispenserStates[d].active && Math.random() > 0.6) {
                    spawnFuelParticle(w, h, d);
                }
            }

            // Update simulation
            updateFuelParticles();
            updateVehicles(w, h);
            updateRoadTraffic(w);
            updateTankLevels();

            // Update EV charge states
            for (let e = 0; e < evChargeStates.length; e++) {
                if (evChargeStates[e].active) {
                    evChargeStates[e].progress += 0.0008;
                    evChargeStates[e].timer += 1;
                    if (evChargeStates[e].progress >= 1) {
                        evChargeStates[e].active = false;
                        evChargeStates[e].progress = 0;
                        evChargeStates[e].timer = 0;
                    }
                } else if (Math.random() > 0.998) {
                    evChargeStates[e].active = true;
                    evChargeStates[e].progress = 0;
                    evChargeStates[e].timer = 0;
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        // ── Resize handling ─────────────────────────────────────────────
        const handleResize = () => {
            if (!canvas) return;
            const parent = canvas.parentElement;
            if (!parent) return;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            resetSimulation(canvas.width, canvas.height);
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }
        handleResize();
        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
}

export default RetailNeuralSimulator;