/**
 * AtmosphericVacuumDistillation — PHASE 6.3
 * CDU (Atmospheric) + VDU (Vacuum) distillation with TBP curve modeling,
 * preheat train simulation, furnace optimization, pump-around heat balance,
 * product cut points, vacuum tower deep-cut analysis, and live animated tower.
 * All calculations are editable and handle industrial-scale values (billions of BPD).
 * Designed for oil & gas engineers, consultancies, and university students.
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ComposedChart, Area, ReferenceLine
} from 'recharts';

// ─── Color palette ───
const C = {
    primary: '#6366f1', success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
    dark: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9',
    muted: '#94a3b8', accent: '#06b6d4',
    lpg: '#f97316', lightNaphtha: '#fbbf24', heavyNaphtha: '#f59e0b',
    kerosene: '#10b981', diesel: '#06b6d4', lgo: '#3b82f6',
    hgo: '#6366f1', atmResidue: '#8b5cf6',
    lvgo: '#a855f7', hvgo: '#7c3aed', vacResidue: '#4c1d95',
};

// ─── Formatting utilities ───
function fmt(val: number, d = 1): string {
    if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(d) + ' T';
    if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(d) + ' B';
    if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(d) + ' M';
    if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(d) + ' K';
    return val.toFixed(d);
}

// ═══════════════════════════════════════════════════════════════════════
// COMPLEX DISTILLATION CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════

/** Steam properties */
function steamProps(tempF: number): { h_vapor_BTU_lb: number; h_liquid_BTU_lb: number; hfg_BTU_lb: number } {
    const t = tempF;
    const h_vapor = 1060 + t * 0.45;
    const h_liquid = (t - 32) * 1.0;
    const hfg = h_vapor - h_liquid;
    return { h_vapor_BTU_lb: h_vapor, h_liquid_BTU_lb: h_liquid, hfg_BTU_lb: hfg };
}

/** Heat required to heat crude from T_in to T_out */
function crudeHeatingDuty(crudeBpd: number, api: number, tInF: number, tOutF: number): { duty_MMBTU_hr: number; furnaceDuty_MMBTU_hr: number } {
    const sg = 141.5 / (api + 131.5);
    const lbPerBbl = sg * 350.263; // lb/bbl
    const lbPerHr = crudeBpd / 24 * lbPerBbl;
    // Specific heat correlation for liquid hydrocarbons
    const cp_BTU_lbF = (0.388 + 0.00045 * (tInF + tOutF) / 2) / Math.sqrt(sg);
    const duty_MMBTU_hr = lbPerHr * cp_BTU_lbF * (tOutF - tInF) / 1e6;
    // Furnace efficiency ~88%
    const furnaceDuty_MMBTU_hr = duty_MMBTU_hr / 0.88;
    return { duty_MMBTU_hr, furnaceDuty_MMBTU_hr };
}

/** Preheat train effectiveness */
function preheatTrainAnalysis(
    crudeBpd: number, api: number, preheatStages: number,
    furnaceOutletF: number, ambientF: number
): {
    preheatOutletF: number; heatRecovered_MMBTU_hr: number; exchangerCount: number;
    cokingRisk: 'low' | 'moderate' | 'high'; furnaceFuel_MMBTU_hr: number;
} {
    // More stages = better heat recovery but more exchangers
    const stageEffectiveness = 1 - Math.exp(-preheatStages * 0.3);
    const maxPreheatTemp = furnaceOutletF - 200; // approach temperature limit
    const preheatOutletF = ambientF + (maxPreheatTemp - ambientF) * stageEffectiveness;

    const totalHeating = crudeHeatingDuty(crudeBpd, api, ambientF, furnaceOutletF);
    const preheatHeating = crudeHeatingDuty(crudeBpd, api, ambientF, preheatOutletF);
    const heatRecovered = preheatHeating.duty_MMBTU_hr;

    const exchangerCount = Math.ceil(preheatStages * 4);
    const cokingRisk = furnaceOutletF > 700 ? 'high' : furnaceOutletF > 680 ? 'moderate' : 'low';
    const furnaceFuel = (totalHeating.duty_MMBTU_hr - heatRecovered) / 0.88;

    return { preheatOutletF, heatRecovered_MMBTU_hr: +heatRecovered.toFixed(1), exchangerCount, cokingRisk, furnaceFuel_MMBTU_hr: +furnaceFuel.toFixed(1) };
}

/** TBP Curve - Watson characterization factor based */
function tbpCurveYield(api: number, sulfurWtPct: number): { cutName: string; tbpRange: string; volPct: number; apiGravity: number; sulfurWtPct: number; color: string }[] {
    const Kw = (api + 131.5) / (1 + sulfurWtPct * 0.1); // simplified Watson K
    const lightBias = (api - 25) / 35; // lighter crudes produce more light ends

    const cuts = [
        { cutName: 'C1-C4 (Fuel Gas)', tbpRange: '<85°F', baseVol: 2 + lightBias * 3, color: C.lpg },
        { cutName: 'Light Naphtha', tbpRange: '85-180°F', baseVol: 8 + lightBias * 7, color: C.lightNaphtha },
        { cutName: 'Heavy Naphtha', tbpRange: '180-300°F', baseVol: 10 + lightBias * 5, color: C.heavyNaphtha },
        { cutName: 'Kerosene/Jet', tbpRange: '300-430°F', baseVol: 10 + lightBias * 2, color: C.kerosene },
        { cutName: 'Diesel/LGO', tbpRange: '430-550°F', baseVol: 15 + lightBias * 1, color: C.diesel },
        { cutName: 'Heavy Gas Oil', tbpRange: '550-650°F', baseVol: 10 - lightBias * 1, color: C.hgo },
        { cutName: 'Atm Residue', tbpRange: '>650°F', baseVol: 45 - lightBias * 17, color: C.atmResidue },
    ];

    let totalVol = 0;
    const rawCuts = cuts.map(c => {
        const vol = Math.max(1, c.baseVol);
        totalVol += vol;
        return { ...c, vol };
    });

    // Normalize to 100%
    return rawCuts.map(c => ({
        cutName: c.cutName,
        tbpRange: c.tbpRange,
        volPct: +((c.vol / totalVol) * 100).toFixed(1),
        apiGravity: +(api + (c.cutName.includes('Residue') ? -30 : c.cutName.includes('Gas Oil') ? -15 : c.cutName.includes('Naphtha') ? 15 : 0)).toFixed(1),
        sulfurWtPct: +(sulfurWtPct * (c.cutName.includes('Residue') ? 1.6 : c.cutName.includes('Gas Oil') ? 1.2 : c.cutName.includes('Naphtha') ? 0.15 : 0.8)).toFixed(2),
        color: c.color,
    }));
}

/** Vacuum distillation deep-cut analysis */
function vacuumDistillationYield(
    atmResidueVolPct: number, furnaceOutletF: number, vacuumLevel_mmHg: number,
    steamRate_lb_bbl: number, washZoneStages: number
): {
    lvgoVolPct: number; hvgoVolPct: number; vacResidueVolPct: number;
    vgoRecoveryPct: number; metalsInHVGO_ppm: number; ccrInHVGO_wtPct: number;
    cutPointF: number;
} {
    // Vacuum reduces effective boiling point
    // BP at vacuum ≈ BP_atm - (760 - P) * 0.1 in simplified terms
    const bpReductionF = (760 - vacuumLevel_mmHg) * 0.12;
    const effectiveCutPoint = 650 + bpReductionF;
    const cutPointF = Math.min(1150, 650 + (furnaceOutletF - 650) * 1.1);

    // VGO yield increases with furnace temp and vacuum level
    const vgoYieldFactor = (furnaceOutletF - 650) / 200 + (760 - vacuumLevel_mmHg) / 760;
    const totalVGOFromResidue = Math.min(70, Math.max(30, atmResidueVolPct * vgoYieldFactor * 0.85));

    const lvgoFraction = 0.4; // HVGO/LVGO split
    const lvgoVolPct = +(totalVGOFromResidue * lvgoFraction).toFixed(1);
    const hvgoVolPct = +(totalVGOFromResidue * (1 - lvgoFraction)).toFixed(1);
    const vacResidueVolPct = +(atmResidueVolPct - totalVGOFromResidue).toFixed(1);

    const vgoRecoveryPct = +(totalVGOFromResidue / atmResidueVolPct * 100).toFixed(1);

    // Wash zone performance - more stages = better metals/CCR removal
    const washEfficiency = 1 - Math.exp(-washZoneStages * 0.8);
    const metalsInHVGO_ppm = +(30 * (1 - washEfficiency) + furnaceOutletF * 0.02).toFixed(1);
    const ccrInHVGO_wtPct = +(0.8 * (1 - washEfficiency) + furnaceOutletF * 0.0003).toFixed(2);

    return { lvgoVolPct, hvgoVolPct, vacResidueVolPct, vgoRecoveryPct, metalsInHVGO_ppm, ccrInHVGO_wtPct, cutPointF: +cutPointF.toFixed(0) };
}

/** Pump-around heat balance */
function pumpAroundBalance(
    crudeBpd: number, api: number, topPA_drawF: number, topPA_returnF: number,
    midPA_drawF: number, midPA_returnF: number, lowerPA_drawF: number, lowerPA_returnF: number
): {
    topPA_MMBTU_hr: number; midPA_MMBTU_hr: number; lowerPA_MMBTU_hr: number;
    totalHeatRemoved_MMBTU_hr: number; pumparoundFraction: number;
} {
    const sg = 141.5 / (api + 131.5);
    const lbPerBbl = sg * 350.263;
    const totalLbPerHr = crudeBpd / 24 * lbPerBbl;

    // Pump-around circulation rates (typical ~15-25% of tower liquid)
    const paCirculationFraction = 0.20;
    const paFlow_lb_hr = totalLbPerHr * paCirculationFraction;

    const cp = 0.55; // BTU/lb·°F
    const topPA_MMBTU_hr = paFlow_lb_hr * cp * (topPA_drawF - topPA_returnF) / 1e6;
    const midPA_MMBTU_hr = paFlow_lb_hr * cp * (midPA_drawF - midPA_returnF) / 1e6;
    const lowerPA_MMBTU_hr = paFlow_lb_hr * cp * (lowerPA_drawF - lowerPA_returnF) / 1e6;
    const totalHeatRemoved = topPA_MMBTU_hr + midPA_MMBTU_hr + lowerPA_MMBTU_hr;

    // Total tower duty
    const totalDuty = crudeHeatingDuty(crudeBpd, api, 250, 700);
    const pumparoundFraction = totalDuty.duty_MMBTU_hr > 0 ? totalHeatRemoved / totalDuty.duty_MMBTU_hr * 100 : 0;

    return {
        topPA_MMBTU_hr: +topPA_MMBTU_hr.toFixed(1), midPA_MMBTU_hr: +midPA_MMBTU_hr.toFixed(1),
        lowerPA_MMBTU_hr: +lowerPA_MMBTU_hr.toFixed(1), totalHeatRemoved_MMBTU_hr: +totalHeatRemoved.toFixed(1),
        pumparoundFraction: +pumparoundFraction.toFixed(1),
    };
}

/** Overhead condenser duty */
function overheadSystem(crudeBpd: number, api: number, overheadTempF: number, refluxRatio: number): {
    condenserDuty_MMBTU_hr: number; refluxFlow_bpd: number; lightNaphthaProduct_bpd: number;
    sourWater_bpd: number; offgas_MMscfd: number;
} {
    const sg = 141.5 / (api + 131.5);
    const lightNaphthaYield = 0.08; // 8% of crude
    const lightNaphthaBpd = crudeBpd * lightNaphthaYield;
    const refluxFlow_bpd = lightNaphthaBpd * refluxRatio;

    const lbPerBbl = sg * 350.263 * 0.68; // lighter fraction
    const totalVapor_lb_hr = (lightNaphthaBpd + refluxFlow_bpd) / 24 * lbPerBbl;
    const cp = 0.52;
    const latentHeat = 130; // BTU/lb
    const condenserDuty_MMBTU_hr = totalVapor_lb_hr * (cp * (overheadTempF - 100) + latentHeat) / 1e6;

    const sourWater_bpd = crudeBpd * 0.002;
    const offgas_MMscfd = crudeBpd * 0.000015;

    return {
        condenserDuty_MMBTU_hr: +condenserDuty_MMBTU_hr.toFixed(1),
        refluxFlow_bpd: +refluxFlow_bpd.toFixed(0),
        lightNaphthaProduct_bpd: +lightNaphthaBpd.toFixed(0),
        sourWater_bpd: +sourWater_bpd.toFixed(0),
        offgas_MMscfd: +offgas_MMscfd.toFixed(1),
    };
}

// ═══════════════════════════════════════════════════════════════════════
// ANIMATED DISTILLATION TOWER (Canvas)
// ═══════════════════════════════════════════════════════════════════════
function AnimatedDistillationTower({
    cuts, furnaceOutletF, overheadTempF, refluxRatio, towerPressurePsig,
}: {
    cuts: ReturnType<typeof tbpCurveYield>; furnaceOutletF: number; overheadTempF: number; refluxRatio: number; towerPressurePsig: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    useEffect(() => {
        let running = true;
        let lastT = 0;
        const animate = (t: number) => {
            if (!running) return;
            const dt = lastT ? (t - lastT) / 1000 : 0.016;
            lastT = t;
            timeRef.current += dt;

            const c = canvasRef.current;
            if (!c) { requestAnimationFrame(animate); return; }
            const ctx = c.getContext('2d');
            if (!ctx) { requestAnimationFrame(animate); return; }
            const W = c.width, H = c.height;

            ctx.clearRect(0, 0, W, H);

            // Tower shell
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(60, 10, W - 120, H - 20, 8);
            ctx.fill();
            ctx.stroke();

            // Tower internals - trays
            const towerTop = 25;
            const towerBottom = H - 25;
            const towerHeight = towerBottom - towerTop;
            const numTrays = 40;
            for (let i = 0; i < numTrays; i++) {
                const trayY = towerTop + (towerHeight / numTrays) * i;
                ctx.strokeStyle = i % 2 === 0 ? '#334155' : '#475569';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(62, trayY);
                ctx.lineTo(W - 62, trayY);
                ctx.stroke();
            }

            // Feed flash zone (middle of tower)
            const flashY = towerTop + towerHeight * 0.55;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, flashY);
            ctx.lineTo(60, flashY);
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.font = '8px monospace';
            ctx.fillText('FEED', 2, flashY - 5);
            ctx.fillText(`${furnaceOutletF}°F`, 2, flashY + 12);

            // Vapor rising animation
            for (let i = 0; i < 25; i++) {
                const baseX = 80 + ((i * 137) % (W - 160));
                const vaporY = towerBottom - 5 - ((timeRef.current * 25 + i * 13) % towerHeight);
                if (vaporY > flashY && vaporY < towerTop + towerHeight * 0.95) {
                    const alpha = 0.3 + 0.3 * Math.sin(timeRef.current * 5 + i);
                    ctx.beginPath();
                    ctx.arc(baseX, vaporY, 2 + Math.sin(timeRef.current * 3 + i) * 1, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
                    ctx.fill();
                }
            }

            // Liquid downcomer animation
            for (let i = 0; i < 15; i++) {
                const baseX = 100 + ((i * 173) % (W - 200));
                const liquidY = towerTop + 10 + ((timeRef.current * 15 + i * 17) % towerHeight);
                if (liquidY < flashY + 20) {
                    ctx.beginPath();
                    ctx.arc(baseX, liquidY, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
                    ctx.fill();
                }
            }

            // Product draws (side streams)
            const draws = [
                { name: 'LG NAPHTHA', yFrac: 0.12, color: C.lightNaphtha },
                { name: 'HV NAPHTHA', yFrac: 0.22, color: C.heavyNaphtha },
                { name: 'KEROSENE', yFrac: 0.32, color: C.kerosene },
                { name: 'DIESEL', yFrac: 0.42, color: C.diesel },
                { name: 'HGO', yFrac: 0.50, color: C.hgo },
            ];

            draws.forEach(d => {
                const drawY = towerTop + towerHeight * d.yFrac;
                ctx.strokeStyle = d.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(W - 60, drawY);
                ctx.lineTo(W, drawY);
                ctx.stroke();
                ctx.fillStyle = d.color;
                ctx.font = '7px monospace';
                ctx.fillText(d.name, W - 55, drawY - 4);
            });

            // Overhead vapor
            ctx.strokeStyle = C.lpg;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(W / 2, towerTop);
            ctx.lineTo(W / 2, 5);
            ctx.stroke();
            ctx.fillStyle = C.lpg;
            ctx.font = '7px monospace';
            ctx.fillText(`OVHD ${overheadTempF}°F`, W / 2 - 25, 5);

            // Bottom residue
            ctx.strokeStyle = C.atmResidue;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(W / 2, towerBottom);
            ctx.lineTo(W / 2, H - 2);
            ctx.stroke();
            ctx.fillStyle = C.atmResidue;
            ctx.font = '7px monospace';
            ctx.fillText('ATM RESIDUE', W / 2 - 35, H - 5);

            // Reflux stream
            ctx.strokeStyle = '#06b6d4';
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(10, towerTop + 15);
            ctx.lineTo(60, towerTop + 15);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#06b6d4';
            ctx.font = '7px monospace';
            ctx.fillText(`REFLUX ${refluxRatio}:1`, 2, towerTop + 12);

            // Pressure indicator
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(`${towerPressurePsig} psig`, W - 80, towerTop + 15);

            // Tower label
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('ATMOSPHERIC CRUDE TOWER', W / 2 - 75, towerTop + 14);

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        return () => { running = false; };
    }, [cuts, furnaceOutletF, overheadTempF, refluxRatio, towerPressurePsig]);

    return <canvas ref={canvasRef} width={600} height={400} className="w-full border border-slate-700 rounded bg-[#0a0f1a]" />;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function AtmosphericVacuumDistillation() {
    // ─── Editable State ───
    const [crudeRateBpd, setCrudeRateBpd] = useState(250000);
    const [crudeApi, setCrudeApi] = useState(34);
    const [sulfurWtPct, setSulfurWtPct] = useState(1.2);
    const [furnaceOutletF, setFurnaceOutletF] = useState(680);
    const [overheadTempF, setOverheadTempF] = useState(105);
    const [towerPressurePsig, setTowerPressurePsig] = useState(18);
    const [refluxRatio, setRefluxRatio] = useState(2.5);
    const [preheatStages, setPreheatStages] = useState(8);
    const [vacuumLevel_mmHg, setVacuumLevel_mmHg] = useState(35);
    const [vacFurnaceOutletF, setVacFurnaceOutletF] = useState(770);
    const [steamRate_lb_bbl, setSteamRate_lb_bbl] = useState(25);
    const [washZoneStages, setWashZoneStages] = useState(3);

    // ─── Pump-around temperatures ───
    const [topPA_Draw, setTopPA_Draw] = useState(350);
    const [topPA_Return, setTopPA_Return] = useState(250);
    const [midPA_Draw, setMidPA_Draw] = useState(500);
    const [midPA_Return, setMidPA_Return] = useState(350);
    const [lowerPA_Draw, setLowerPA_Draw] = useState(620);
    const [lowerPA_Return, setLowerPA_Return] = useState(450);

    const [showAdvanced, setShowAdvanced] = useState(false);

    // ─── Calculations ───
    const cuts = useMemo(() => tbpCurveYield(crudeApi, sulfurWtPct), [crudeApi, sulfurWtPct]);

    const heating = useMemo(() => crudeHeatingDuty(crudeRateBpd, crudeApi, 120, furnaceOutletF), [crudeRateBpd, crudeApi, furnaceOutletF]);

    const preheat = useMemo(() => preheatTrainAnalysis(crudeRateBpd, crudeApi, preheatStages, furnaceOutletF, 80), [crudeRateBpd, crudeApi, preheatStages, furnaceOutletF]);

    const paBalance = useMemo(() => pumpAroundBalance(crudeRateBpd, crudeApi, topPA_Draw, topPA_Return, midPA_Draw, midPA_Return, lowerPA_Draw, lowerPA_Return), [crudeRateBpd, crudeApi, topPA_Draw, topPA_Return, midPA_Draw, midPA_Return, lowerPA_Draw, lowerPA_Return]);

    const overhead = useMemo(() => overheadSystem(crudeRateBpd, crudeApi, overheadTempF, refluxRatio), [crudeRateBpd, crudeApi, overheadTempF, refluxRatio]);

    const atmResidueVol = useMemo(() => {
        const residueCut = cuts.find(c => c.cutName === 'Atm Residue');
        return residueCut ? residueCut.volPct : 45;
    }, [cuts]);

    const vacuumYields = useMemo(() => vacuumDistillationYield(atmResidueVol, vacFurnaceOutletF, vacuumLevel_mmHg, steamRate_lb_bbl, washZoneStages), [atmResidueVol, vacFurnaceOutletF, vacuumLevel_mmHg, steamRate_lb_bbl, washZoneStages]);

    // Product flow rates
    const productFlows = useMemo(() => cuts.map(c => ({
        ...c,
        bpd: +(crudeRateBpd * c.volPct / 100).toFixed(0),
    })), [cuts, crudeRateBpd]);

    // Vacuum product flows
    const vacProductFlows = useMemo(() => {
        const atmResBpd = crudeRateBpd * atmResidueVol / 100;
        return [
            { name: 'LVGO', bpd: +(atmResBpd * vacuumYields.lvgoVolPct / 100).toFixed(0), color: C.lvgo },
            { name: 'HVGO', bpd: +(atmResBpd * vacuumYields.hvgoVolPct / 100).toFixed(0), color: C.hvgo },
            { name: 'Vac Residue', bpd: +(atmResBpd * vacuumYields.vacResidueVolPct / 100).toFixed(0), color: C.vacResidue },
        ];
    }, [crudeRateBpd, atmResidueVol, vacuumYields]);

    // TBP curve data for chart
    const tbpChartData = useMemo(() => {
        let cumulative = 0;
        return productFlows.map(p => {
            cumulative += p.volPct;
            return {
                name: p.cutName,
                midBP: p.tbpRange,
                volPct: p.volPct,
                cumulative: +cumulative.toFixed(1),
            };
        });
    }, [productFlows]);

    // Furnace fuel cost
    const fuelCostPerDay = useMemo(() => {
        const fuel_MMBTU_d = heating.furnaceDuty_MMBTU_hr * 24;
        const fuelCost_per_MMBTU = 4.5; // $4.50/MMBTU
        return fuel_MMBTU_d * fuelCost_per_MMBTU;
    }, [heating]);

    // Energy savings from preheat
    const energySavingsFromPreheat = useMemo(() => {
        return preheat.heatRecovered_MMBTU_hr * 24 * 4.5;
    }, [preheat]);

    // ─── Slider helper ───
    const Slider = ({ label, value, onChange, min, max, step = 1, unit = '', hint = '' }: {
        label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string; hint?: string;
    }) => (
        <div className="mb-1.5">
            <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-slate-400">{label}</span>
                <span className="text-cyan-400 font-mono">{fmt(value, 1)}{unit}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500" />
            {hint && <div className="text-[11px] text-slate-600 mt-0.5">{hint}</div>}
        </div>
    );

    return (
        <div className="space-y-4 text-slate-200">
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-cyan-400">🏭 Crude Distillation — Atmospheric & Vacuum</h2>
                    <p className="text-xs text-slate-500">Sub-Step 6.3: CDU + VDU with TBP curves, preheat train, pump-arounds, and deep-cut analysis</p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold ${preheat.cokingRisk === 'low' ? 'bg-emerald-900/50 text-emerald-400' : preheat.cokingRisk === 'moderate' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>
                    Coking Risk: {preheat.cokingRisk.toUpperCase()}
                </div>
            </div>

            {/* ─── Animated Tower + Controls ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <AnimatedDistillationTower
                        cuts={cuts} furnaceOutletF={furnaceOutletF}
                        overheadTempF={overheadTempF} refluxRatio={refluxRatio}
                        towerPressurePsig={towerPressurePsig}
                    />
                </div>

                {/* Controls */}
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3 space-y-0.5 max-h-[400px] overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Operating Parameters</h3>
                    <Slider label="Crude Rate" value={crudeRateBpd} onChange={setCrudeRateBpd} min={10000} max={2000000000} step={1000} unit=" BPD" hint="1K – 2B BPD" />
                    <Slider label="API Gravity" value={crudeApi} onChange={setCrudeApi} min={10} max={55} step={0.1} unit="°API" />
                    <Slider label="Sulfur" value={sulfurWtPct} onChange={setSulfurWtPct} min={0.1} max={5} step={0.1} unit=" wt%" />
                    <Slider label="Furnace Outlet" value={furnaceOutletF} onChange={setFurnaceOutletF} min={600} max={720} step={5} unit="°F" />
                    <Slider label="Overhead Temp" value={overheadTempF} onChange={setOverheadTempF} min={80} max={140} step={5} unit="°F" />
                    <Slider label="Tower Pressure" value={towerPressurePsig} onChange={setTowerPressurePsig} min={10} max={30} step={1} unit=" psig" />
                    <Slider label="Reflux Ratio" value={refluxRatio} onChange={setRefluxRatio} min={1} max={5} step={0.1} />
                    <Slider label="Preheat Stages" value={preheatStages} onChange={setPreheatStages} min={3} max={16} step={1} />
                    <Slider label="Vacuum Level" value={vacuumLevel_mmHg} onChange={setVacuumLevel_mmHg} min={10} max={100} step={5} unit=" mmHg" />
                    <Slider label="Vac Furnace T" value={vacFurnaceOutletF} onChange={setVacFurnaceOutletF} min={730} max={820} step={5} unit="°F" />
                    <Slider label="Steam Rate" value={steamRate_lb_bbl} onChange={setSteamRate_lb_bbl} min={10} max={50} step={1} unit=" lb/bbl" />
                    <Slider label="Wash Zone" value={washZoneStages} onChange={setWashZoneStages} min={1} max={6} step={1} unit=" stages" />
                </div>
            </div>

            {/* ─── KPI Cards ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                {[
                    { label: 'Heating Duty', value: `${fmt(heating.duty_MMBTU_hr, 0)} MMBTU/h`, color: 'text-red-400', bg: 'bg-red-900/30' },
                    { label: 'Furnace Fuel', value: `${fmt(heating.furnaceDuty_MMBTU_hr, 0)} MMBTU/h`, color: 'text-orange-400', bg: 'bg-orange-900/30' },
                    { label: 'Preheat Outlet', value: `${preheat.preheatOutletF.toFixed(0)}°F`, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
                    { label: 'Heat Recovered', value: `${fmt(preheat.heatRecovered_MMBTU_hr, 0)} MMBTU/h`, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
                    { label: 'PA Heat Removed', value: `${fmt(paBalance.totalHeatRemoved_MMBTU_hr, 0)} MMBTU/h`, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
                    { label: 'Condenser Duty', value: `${fmt(overhead.condenserDuty_MMBTU_hr, 0)} MMBTU/h`, color: 'text-blue-400', bg: 'bg-blue-900/30' },
                    { label: 'VGO Recovery', value: `${vacuumYields.vgoRecoveryPct}%`, color: 'text-violet-400', bg: 'bg-violet-900/30' },
                    { label: 'Fuel $/d', value: `$${fmt(fuelCostPerDay, 0)}`, color: 'text-amber-400', bg: 'bg-amber-900/30' },
                ].map((kpi, i) => (
                    <div key={i} className={`${kpi.bg} rounded p-2 text-center border border-slate-700/50`}>
                        <div className="text-[10px] text-slate-400">{kpi.label}</div>
                        <div className={`font-mono font-bold text-sm ${kpi.color}`}>{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* ─── Product Yield Table + TBP Chart ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">CDU Product Yields (TBP Cuts)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700">
                                    <th className="text-left py-1">Cut</th>
                                    <th className="text-right">TBP Range</th>
                                    <th className="text-right">Vol%</th>
                                    <th className="text-right">BPD</th>
                                    <th className="text-right">°API</th>
                                    <th className="text-right">S (wt%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productFlows.map((p, i) => (
                                    <tr key={i} className="border-b border-slate-800/50">
                                        <td className="py-1"><span style={{ color: p.color }}>●</span> {p.cutName}</td>
                                        <td className="text-right text-slate-400">{p.tbpRange}</td>
                                        <td className="text-right font-mono">{p.volPct}%</td>
                                        <td className="text-right font-mono text-cyan-400">{fmt(p.bpd, 0)}</td>
                                        <td className="text-right font-mono">{p.apiGravity}</td>
                                        <td className="text-right font-mono">{p.sulfurWtPct}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">TBP Curve (Cumulative Yield vs. Boiling Point)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={tbpChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="midBP" stroke="#94a3b8" fontSize={9} angle={-30} textAnchor="end" />
                            <YAxis stroke="#94a3b8" fontSize={10} label={{ value: 'Cumulative Vol%', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10 } }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px' }} />
                            <Bar dataKey="volPct" fill="#3b82f6" opacity={0.5} barSize={40} name="Vol%" />
                            <Line type="monotone" dataKey="cumulative" stroke="#facc15" strokeWidth={2} dot={{ r: 3 }} name="Cumulative %" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Vacuum Distillation Section ─── */}
            <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                <h3 className="text-xs font-bold text-violet-400 uppercase mb-2">Vacuum Distillation Unit (VDU) — Deep-Cut Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 mb-1">VDU Product Yields</h4>
                        <div className="space-y-1 text-[11px] font-mono">
                            {vacProductFlows.map((p, i) => (
                                <div key={i} className="flex justify-between">
                                    <span style={{ color: p.color }}>● {p.name}</span>
                                    <span className="text-cyan-400">{fmt(p.bpd, 0)} BPD</span>
                                </div>
                            ))}
                            <hr className="border-slate-700 my-1" />
                            <div className="flex justify-between">
                                <span className="text-slate-400">Effective Cut Point</span>
                                <span className="text-violet-400">{vacuumYields.cutPointF}°F (atm equiv)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">VGO Recovery</span>
                                <span className="text-emerald-400">{vacuumYields.vgoRecoveryPct}%</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 mb-1">HVGO Quality (Wash Zone)</h4>
                        <div className="space-y-1 text-[11px] font-mono">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Metals (Ni+V)</span>
                                <span className={vacuumYields.metalsInHVGO_ppm > 5 ? 'text-red-400' : 'text-emerald-400'}>{vacuumYields.metalsInHVGO_ppm} ppm</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">CCR</span>
                                <span className={vacuumYields.ccrInHVGO_wtPct > 0.5 ? 'text-red-400' : 'text-emerald-400'}>{vacuumYields.ccrInHVGO_wtPct} wt%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Wash Zone Stages</span>
                                <span className="text-cyan-400">{washZoneStages}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Steam Rate</span>
                                <span className="text-cyan-400">{steamRate_lb_bbl} lb/bbl</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 mb-1">Key VDU Operating Parameters</h4>
                        <div className="space-y-1 text-[11px] font-mono">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Furnace Outlet</span>
                                <span className="text-orange-400">{vacFurnaceOutletF}°F</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Vacuum Level</span>
                                <span className="text-blue-400">{vacuumLevel_mmHg} mmHg abs</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Atm Equiv. BP</span>
                                <span className="text-violet-400">~{Math.round(650 + (760 - vacuumLevel_mmHg) * 0.12)}°F</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Pump-Around + Preheat Economics ─── */}
            <div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                    {showAdvanced ? '\u25BC' : '\u25B6'} Advanced: Pump-Around Heat Balance & Energy Economics
                </button>
                {showAdvanced && (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-yellow-400 mb-2">Pump-Around Heat Balance</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Top PA (Draw/Return)</span><span className="text-cyan-400">{topPA_Draw} / {topPA_Return}°F</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Top PA Duty</span><span className="text-yellow-400">{fmt(paBalance.topPA_MMBTU_hr, 1)} MMBTU/h</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Mid PA (Draw/Return)</span><span className="text-cyan-400">{midPA_Draw} / {midPA_Return}°F</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Mid PA Duty</span><span className="text-yellow-400">{fmt(paBalance.midPA_MMBTU_hr, 1)} MMBTU/h</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Lower PA (Draw/Return)</span><span className="text-cyan-400">{lowerPA_Draw} / {lowerPA_Return}°F</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Lower PA Duty</span><span className="text-yellow-400">{fmt(paBalance.lowerPA_MMBTU_hr, 1)} MMBTU/h</span></div>
                                <hr className="border-slate-700 my-1" />
                                <div className="flex justify-between"><span className="text-slate-300 font-bold">Total PA Duty</span><span className="text-cyan-400 font-bold">{fmt(paBalance.totalHeatRemoved_MMBTU_hr, 1)} MMBTU/h</span></div>
                                <div className="flex justify-between"><span className="text-slate-300">% of Total Duty</span><span className="text-emerald-400">{paBalance.pumparoundFraction}%</span></div>
                            </div>
                            <div className="mt-2 space-y-1">
                                <Slider label="Top PA Draw" value={topPA_Draw} onChange={setTopPA_Draw} min={300} max={450} step={10} unit="°F" />
                                <Slider label="Top PA Return" value={topPA_Return} onChange={setTopPA_Return} min={200} max={350} step={10} unit="°F" />
                                <Slider label="Mid PA Draw" value={midPA_Draw} onChange={setMidPA_Draw} min={450} max={600} step={10} unit="°F" />
                                <Slider label="Mid PA Return" value={midPA_Return} onChange={setMidPA_Return} min={300} max={450} step={10} unit="°F" />
                                <Slider label="Lower PA Draw" value={lowerPA_Draw} onChange={setLowerPA_Draw} min={550} max={650} step={10} unit="°F" />
                                <Slider label="Lower PA Return" value={lowerPA_Return} onChange={setLowerPA_Return} min={400} max={550} step={10} unit="°F" />
                            </div>
                        </div>
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-emerald-400 mb-2">Energy Economics</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Total Heating Duty</span><span>{fmt(heating.duty_MMBTU_hr, 0)} MMBTU/h</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Furnace Duty (88% eff)</span><span>{fmt(heating.furnaceDuty_MMBTU_hr, 0)} MMBTU/h</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Heat Recovered</span><span className="text-emerald-400">{fmt(preheat.heatRecovered_MMBTU_hr, 0)} MMBTU/h</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Preheat Outlet Temp</span><span>{preheat.preheatOutletF.toFixed(0)}°F</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Exchanger Count</span><span>{preheat.exchangerCount}</span></div>
                                <hr className="border-slate-700 my-1" />
                                <div className="flex justify-between"><span className="text-slate-300 font-bold">Daily Fuel Cost</span><span className="text-amber-400 font-bold">${fmt(fuelCostPerDay, 0)}/d</span></div>
                                <div className="flex justify-between"><span className="text-emerald-300">Savings from Preheat</span><span className="text-emerald-400">${fmt(energySavingsFromPreheat, 0)}/d</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Exchangers</span><span>{preheat.exchangerCount} units</span></div>
                            </div>
                        </div>
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-blue-400 mb-2">Overhead System</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Condenser Duty</span><span>{fmt(overhead.condenserDuty_MMBTU_hr, 0)} MMBTU/h</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Reflux Flow</span><span>{fmt(overhead.refluxFlow_bpd, 0)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Light Naphtha Product</span><span>{fmt(overhead.lightNaphthaProduct_bpd, 0)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Sour Water</span><span>{fmt(overhead.sourWater_bpd, 0)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Off-Gas</span><span>{fmt(overhead.offgas_MMscfd, 1)} MMscfd</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Reflux Ratio</span><span>{refluxRatio}:1</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Equation Reference ─── */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-2 text-[10px] text-slate-600">
                <span className="font-bold text-slate-500">Key Equations:</span>{' '}
                Crude Heating: Q = ṁ · Cp · ΔT | Furnace Eff: η = Q_absorbed / Q_fired{' '}
                | TBP Yield: f(API, Kw, sulfur) | Vacuum BP Reduction: ΔT ≈ (760 − P) · 0.12°F/mmHg{' '}
                | VGO Recovery: f(T_furnace, P_vacuum, wash zone) | PA Duty: Q_pa = ṁ_pa · Cp · (T_draw − T_return){' '}
                | Stokes: v = g·d²·Δρ/(18·μ) | Preheat: Q_recovered = Σ(h_hot − h_cold)
            </div>
        </div>
    );
}