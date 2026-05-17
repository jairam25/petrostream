/**
 * NaphthaGasolineComplex — PHASE 6.4
 * Naphtha Hydrotreating + Catalytic Reforming + Isomerization + Alkylation + Gasoline Blending
 * Includes: octane blending (non-linear), RVP blending, benzene management,
 * reformer hydrogen production, alkylate premium blendstock, isomerate optimization.
 * All calculations handle industrial-scale values. Editable parameters throughout.
 * Designed for oil & gas engineers, consultancies, and university students.
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, ReferenceLine, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const C = {
    primary: '#6366f1', success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
    dark: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9',
    muted: '#94a3b8', accent: '#06b6d4',
    reformate: '#f97316', isomerate: '#10b981', alkylate: '#6366f1',
    fccNaphtha: '#fbbf24', lsn: '#94a3b8', butane: '#ec4899', ethanol: '#06b6d4',
    regular: '#3b82f6', mid: '#f59e0b', premium: '#ef4444',
    h2: '#06b6d4', benzene: '#ef4444',
};

function fmt(val: number, d = 1): string {
    if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(d) + ' T';
    if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(d) + ' B';
    if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(d) + ' M';
    if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(d) + ' K';
    return val.toFixed(d);
}

// ═══════════════════════════════════════════════════════════════════════
// COMPLEX CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════

interface NaphthaFeed { name: string; bpd: number; ron: number; sulfurPpmWt: number; olefinsVolPct: number; naphthenesVolPct: number; paraffinsVolPct: number; aromaticsVolPct: number; }

interface HydrotreaterResult {
    productBpd: number; productSulfurPpm: number; h2Consumption_scf_bbl: number;
    reactorTempF: number; productRon: number; lightEndsBpd: number; offgas_MMscfd: number;
}

function naphthaHydrotreater(feed: NaphthaFeed, severity: number, reactorPressurePsig: number): HydrotreaterResult {
    const lhsv = 3 - severity * 1.5;
    const effectFactor = severity / lhsv;
    const hds = 1 - Math.exp(-effectFactor * 2.5);
    const productSulfurPpm = feed.sulfurPpmWt * (1 - hds);
    const h2Consumption = 50 + severity * 350 + feed.sulfurPpmWt / 10 * 0.5;
    const reactorTempF = 550 + severity * 100;
    const olefinsSaturated = feed.olefinsVolPct * hds;
    const productRon = feed.ron - olefinsSaturated * 0.8;
    const lightEndsBpd = feed.bpd * severity * 0.02;
    const offgas = feed.bpd * severity * 0.00001;

    return {
        productBpd: +(feed.bpd * (1 - severity * 0.01)).toFixed(0),
        productSulfurPpm: +productSulfurPpm.toFixed(1),
        h2Consumption_scf_bbl: +h2Consumption.toFixed(0),
        reactorTempF: +reactorTempF.toFixed(0),
        productRon: +productRon.toFixed(1),
        lightEndsBpd: +lightEndsBpd.toFixed(0),
        offgas_MMscfd: +offgas.toFixed(1),
    };
}

interface ReformerResult {
    reformateBpd: number; reformateRon: number; reformateBenzeneVolPct: number;
    h2Production_MMscfd: number; lpgBpd: number; fuelGas_MMscfd: number;
    catalystCycleDays: number; aromaticsYieldVolPct: number;
}

function catalyticReformer(heavyNaphthaBpd: number, naphthaNaphthenesVolPct: number, naphthaAromaticsVolPct: number,
    severity: number, reactorPressurePsig: number, h2hcRatio: number, isCCR: boolean): ReformerResult {
    const waat = 890 + severity * 90;
    const dearomatizationEfficiency = severity * (1 + (350 - reactorPressurePsig) / 350);
    const naphtheneToAromatics = naphthaNaphthenesVolPct * dearomatizationEfficiency;
    const newAromaticsVolPct = naphthaAromaticsVolPct + naphtheneToAromatics;
    const aromaticsYieldVolPct = Math.min(75, +newAromaticsVolPct.toFixed(1));

    const reformateVolYield = 1 - severity * 0.12 - (reactorPressurePsig - 50) * 0.0003;
    const reformateBpd = +(heavyNaphthaBpd * reformateVolYield).toFixed(0);

    const baseRon = 60 + severity * 50;
    const reformateRon = Math.min(108, +(baseRon + aromaticsYieldVolPct * 0.35).toFixed(1));

    const reformateBenzeneVolPct = +(aromaticsYieldVolPct * 0.18).toFixed(1);

    const h2Yield = 1200 + severity * 800 + (350 - reactorPressurePsig) * 5;
    const h2Production_MMscfd = +(heavyNaphthaBpd * h2Yield / 1e6).toFixed(1);

    const lpgBpd = +(heavyNaphthaBpd * severity * 0.08).toFixed(0);
    const fuelGas_MMscfd = +(heavyNaphthaBpd * severity * 0.00002).toFixed(1);
    const catalystCycleDays = isCCR ? Infinity : +((24 - severity * 18) * 30).toFixed(0);

    return {
        reformateBpd, reformateRon, reformateBenzeneVolPct, h2Production_MMscfd, lpgBpd,
        fuelGas_MMscfd, catalystCycleDays, aromaticsYieldVolPct
    };
}

interface IsomerateResult {
    isomerateBpd: number; isomerateRon: number; isomConversionPct: number; h2Consumption_scf_bbl: number;
}

function isomerizationUnit(lightNaphthaBpd: number, normalParaffinsVolPct: number,
    recycleFraction: number, catalystType: 'chlorided' | 'zeolite'): IsomerateResult {
    const equilibriumConversion = catalystType === 'chlorided' ? 0.92 : 0.82;
    const effectiveConversion = equilibriumConversion + (1 - equilibriumConversion) * recycleFraction * 0.85;
    const isomConversionPct = +(effectiveConversion * 100).toFixed(1);
    const isomerateRon = catalystType === 'chlorided' ? 82 + recycleFraction * 12 : 78 + recycleFraction * 10;
    const isomerateBpd = +(lightNaphthaBpd * (1 - normalParaffinsVolPct * (1 - effectiveConversion) * 0.08)).toFixed(0);
    const h2Consumption = catalystType === 'chlorided' ? 15 : 10;

    return { isomerateBpd, isomerateRon: +isomerateRon.toFixed(1), isomConversionPct, h2Consumption_scf_bbl: h2Consumption };
}

interface AlkylateResult {
    alkylateBpd: number; alkylateRon: number; propaneBpd: number; nButaneBpd: number;
    acidConsumption_lb_bbl: number; refrigerationDuty_MMBTU_hr: number;
}

function alkylationUnit(olefinBpd: number, isobutaneToOlefinRatio: number,
    acidStrengthPct: number, reactorTempF: number, catalystType: 'HF' | 'H2SO4'): AlkylateResult {
    const olefinType = 0.65;
    const alkylateYield = 1.7 + (isobutaneToOlefinRatio - 5) * 0.03;
    const alkylateBpd = +(olefinBpd * alkylateYield).toFixed(0);
    const baseRon = catalystType === 'HF' ? 94 : 93;
    const alkylateRon = +(baseRon + (isobutaneToOlefinRatio - 5) * 0.5 + (acidStrengthPct - (catalystType === 'HF' ? 83 : 88)) * 0.2).toFixed(1);

    const acidConsumption = catalystType === 'H2SO4' ? 15 + (105 - acidStrengthPct) * 0.8 : 0.5;
    const refrigerationDuty = catalystType === 'H2SO4' ? olefinBpd * 0.025 * (55 - reactorTempF) / 30 : 0;
    const propaneBpd = +(olefinBpd * 0.08).toFixed(0);
    const nButaneBpd = +(olefinBpd * 0.04).toFixed(0);

    return {
        alkylateBpd, alkylateRon: Math.min(99, alkylateRon), propaneBpd, nButaneBpd,
        acidConsumption_lb_bbl: +acidConsumption.toFixed(1),
        refrigerationDuty_MMBTU_hr: +refrigerationDuty.toFixed(1)
    };
}

// ─── GASOLINE BLENDING (Non-linear octane, RVP Raoult's Law) ───

interface BlendComponent {
    name: string; bpd: number; ron: number; rvpPsi: number; sulfurPpm: number;
    aromaticsVolPct: number; olefinsVolPct: number; benzeneVolPct: number;
    t10F: number; t50F: number; t90F: number; ethanolVolPct: number;
    costPerBbl: number; blendingOctaneIndex: number; color: string;
    locked: boolean;
}

interface BlendSpec {
    name: string; grade: 'regular' | 'mid' | 'premium';
    minAKI: number; maxRVP: number; maxSulfurPpm: number;
    maxBenzeneVolPct: number; maxAromaticsVolPct: number; maxOlefinsVolPct: number;
    maxT10F: number; maxT50F: number; maxT90F: number; targetEthanolVolPct: number;
    demandBpd: number; pricePerBbl: number; color: string;
}

interface BlendResult {
    totalBpd: number; blendedAKI: number; blendedRVP: number; blendedSulfurPpm: number;
    blendedBenzene: number; blendedAromatics: number; blendedOlefins: number;
    blendedT10: number; blendedT50: number; blendedT90: number;
    blendCostPerBbl: number; blendRevenuePerDay: number; blendMarginPerDay: number;
    giveawayOctane: number; allSpecsPass: boolean; failedSpecs: string[];
}

function gasolineBlendCalculation(components: BlendComponent[], spec: BlendSpec, ethanolTargetBpd: number): BlendResult {
    let totalHydrocarbonBpd = 0;
    let totalBlendBpd = 0;

    // Weighted properties for hydrocarbon portion
    let sumRonXVol = 0, sumRvpXVol = 0, sumSulfurXVol = 0, sumAromXVol = 0, sumOlefXVol = 0, sumBenzXVol = 0;
    let sumT10XVol = 0, sumT50XVol = 0, sumT90XVol = 0;
    const activeComponents = components.filter(c => c.bpd > 0);

    activeComponents.forEach(c => {
        // Non-linear octane blending using blending index approach
        const octaneContribution = c.bpd * (c.ron * (1 + c.blendingOctaneIndex / 100));
        sumRonXVol += octaneContribution;
        sumRvpXVol += c.bpd * c.rvpPsi;
        sumSulfurXVol += c.bpd * Math.max(0.1, c.sulfurPpm);
        sumAromXVol += c.bpd * c.aromaticsVolPct;
        sumOlefXVol += c.bpd * c.olefinsVolPct;
        sumBenzXVol += c.bpd * c.benzeneVolPct;
        sumT10XVol += c.bpd * c.t10F;
        sumT50XVol += c.bpd * c.t50F;
        sumT90XVol += c.bpd * c.t90F;
        totalHydrocarbonBpd += c.bpd;
    });

    // Add ethanol separately (high blending RVP ~18 psi, high blending octane ~115)
    const ethanolRVPContribution = ethanolTargetBpd * 18;
    const ethanolOctaneContribution = ethanolTargetBpd * 115 * 1.15;

    totalBlendBpd = totalHydrocarbonBpd + ethanolTargetBpd;

    const blendedRon = totalBlendBpd > 0 ? +(sumRonXVol + ethanolOctaneContribution) / totalBlendBpd : 0;
    const blendedMon = blendedRon - 8;
    const blendedAKI = +(blendedRon + blendedMon) / 2;
    const blendedRVP = totalBlendBpd > 0 ? +(sumRvpXVol + ethanolRVPContribution) / totalBlendBpd : 0;
    const blendedSulfurPpm = totalHydrocarbonBpd > 0 ? +sumSulfurXVol / totalHydrocarbonBpd : 0;
    const blendedBenzene = totalBlendBpd > 0 ? +sumBenzXVol / totalBlendBpd : 0;
    const blendedAromatics = totalBlendBpd > 0 ? +(sumAromXVol + ethanolTargetBpd * 0) / totalBlendBpd : 0;
    const blendedOlefins = totalBlendBpd > 0 ? +sumOlefXVol / totalBlendBpd : 0;
    const blendedT10 = totalHydrocarbonBpd > 0 ? +sumT10XVol / totalHydrocarbonBpd : 0;
    const blendedT50 = totalHydrocarbonBpd > 0 ? +sumT50XVol / totalHydrocarbonBpd : 0;
    const blendedT90 = totalHydrocarbonBpd > 0 ? +sumT90XVol / totalHydrocarbonBpd : 0;

    const ethanolVolPct = totalBlendBpd > 0 ? +(ethanolTargetBpd / totalBlendBpd * 100).toFixed(1) : 0;
    const DI = blendedT10 * 1.5 + blendedT50 * 3 + blendedT90 + ethanolVolPct * 1.33;

    const blendCostPerBbl = activeComponents.reduce((sum, c) => sum + c.costPerBbl * c.bpd / totalHydrocarbonBpd, 0);
    const blendRevenuePerDay = totalBlendBpd * spec.pricePerBbl;
    const blendMarginPerDay = blendRevenuePerDay - activeComponents.reduce((sum, c) => sum + c.costPerBbl * c.bpd, 0) - ethanolTargetBpd * 55;

    const giveawayOctane = +(blendedAKI - spec.minAKI).toFixed(1);

    const failedSpecs: string[] = [];
    if (blendedAKI < spec.minAKI) failedSpecs.push(`AKI ${blendedAKI.toFixed(1)} < ${spec.minAKI}`);
    if (blendedRVP > spec.maxRVP) failedSpecs.push(`RVP ${blendedRVP.toFixed(1)} > ${spec.maxRVP}`);
    if (blendedSulfurPpm > spec.maxSulfurPpm) failedSpecs.push(`S ${blendedSulfurPpm.toFixed(0)} > ${spec.maxSulfurPpm} ppm`);
    if (blendedBenzene > spec.maxBenzeneVolPct) failedSpecs.push(`Bz ${blendedBenzene.toFixed(2)} > ${spec.maxBenzeneVolPct}%`);
    if (blendedAromatics > spec.maxAromaticsVolPct) failedSpecs.push(`Arom ${blendedAromatics.toFixed(1)} > ${spec.maxAromaticsVolPct}%`);
    if (blendedOlefins > spec.maxOlefinsVolPct) failedSpecs.push(`Olef ${blendedOlefins.toFixed(1)} > ${spec.maxOlefinsVolPct}%`);

    return {
        totalBpd: +totalBlendBpd.toFixed(0), blendedAKI: +blendedAKI.toFixed(1),
        blendedRVP: +blendedRVP.toFixed(1), blendedSulfurPpm: +blendedSulfurPpm.toFixed(0),
        blendedBenzene: +blendedBenzene.toFixed(2), blendedAromatics: +blendedAromatics.toFixed(1),
        blendedOlefins: +blendedOlefins.toFixed(1), blendedT10: +blendedT10.toFixed(0),
        blendedT50: +blendedT50.toFixed(0), blendedT90: +blendedT90.toFixed(0),
        blendCostPerBbl: +blendCostPerBbl.toFixed(2), blendRevenuePerDay: +blendRevenuePerDay.toFixed(0),
        blendMarginPerDay: +blendMarginPerDay.toFixed(0), giveawayOctane,
        allSpecsPass: failedSpecs.length === 0, failedSpecs,
    };
}

// ═══════════════════════════════════════════════════════════════════════
// ANIMATED REFORMER REACTOR
// ═══════════════════════════════════════════════════════════════════════

function AnimatedReformerTrain({ severity, h2Production }: { severity: number; h2Production: number }) {
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
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W, H);

            // 4 reactors in series with inter-heaters
            const reactors = [
                { x: 60, label: 'R1', temp: 900 + severity * 40 },
                { x: 150, label: 'R2', temp: 920 + severity * 35 },
                { x: 240, label: 'R3', temp: 940 + severity * 30 },
                { x: 330, label: 'R4 (CCR)', temp: 960 + severity * 25 },
            ];

            reactors.forEach((r, i) => {
                const rx = r.x, ry = 50;
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(rx, ry, 70, 120, 6);
                ctx.fill();
                ctx.stroke();

                // Catalyst bed animation
                for (let row = 0; row < 10; row++) {
                    for (let col = 0; col < 6; col++) {
                        const px = rx + 8 + col * 11;
                        const py = ry + 15 + row * 11 + Math.sin(timeRef.current * 2 + row + col) * 1.5;
                        ctx.beginPath();
                        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                        const alpha = 0.3 + 0.3 * Math.sin(timeRef.current * 3 + row * col);
                        ctx.fillStyle = `rgba(251, 146, 60, ${alpha})`;
                        ctx.fill();
                    }
                }

                ctx.fillStyle = '#f1f5f9';
                ctx.font = 'bold 11px monospace';
                ctx.fillText(r.label, rx + 20, ry + 15);
                ctx.fillStyle = '#f59e0b';
                ctx.font = '9px monospace';
                ctx.fillText(`${r.temp.toFixed(0)}°F`, rx + 10, ry + 30);

                // Inter-heater flame
                if (i < 3) {
                    const flameX = rx + 85;
                    const flameY = ry + 90;
                    for (let f = 0; f < 5; f++) {
                        const fy = flameY - f * 6 + Math.sin(timeRef.current * 8 + f) * 2;
                        ctx.beginPath();
                        ctx.arc(flameX + Math.sin(timeRef.current * 12 + f) * 2, fy, 4 - f * 0.5, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(239, 68, 68, ${0.8 - f * 0.15})`;
                        ctx.fill();
                    }
                    ctx.fillStyle = '#ef4444';
                    ctx.font = '7px monospace';
                    ctx.fillText('HEAT', flameX - 10, flameY + 15);
                }
            });

            // Feed arrow
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(10, 110);
            ctx.lineTo(60, 110);
            ctx.stroke();
            ctx.fillStyle = '#06b6d4';
            ctx.font = '9px monospace';
            ctx.fillText('HN', 15, 105);

            // Product arrow
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(400, 110);
            ctx.lineTo(W - 30, 110);
            ctx.stroke();
            ctx.fillStyle = '#f97316';
            ctx.font = '9px monospace';
            ctx.fillText('REFORMATE', 410, 105);

            // H2 production indicator
            ctx.fillStyle = '#06b6d4';
            ctx.font = 'bold 10px monospace';
            const h2Pulse = 0.6 + 0.4 * Math.sin(timeRef.current * 1.5);
            ctx.fillText(`H₂: ${h2Production.toFixed(1)} MMscfd`, W - 140, 30);

            // Title
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('CATALYTIC REFORMER TRAIN (CCR)', W / 2 - 120, 20);

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        return () => { running = false; };
    }, [severity, h2Production]);

    return <canvas ref={canvasRef} width={580} height={200} className="w-full border border-slate-700 rounded" />;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function NaphthaGasolineComplex() {
    // Naphtha feed
    const [straightRunBpd, setStraightRunBpd] = useState(60000);
    const [fccNaphthaBpd, setFccNaphthaBpd] = useState(30000);
    const [cokerNaphthaBpd, setCokerNaphthaBpd] = useState(5000);

    // NHT
    const [nhtSeverity, setNhtSeverity] = useState(0.5);
    const [nhtPressure, setNhtPressure] = useState(400);

    // Naphtha splitter
    const [lightNaphthaFraction, setLightNaphthaFraction] = useState(0.35);

    // Reformer
    const [reformerSeverity, setReformerSeverity] = useState(0.7);
    const [reformerPressure, setReformerPressure] = useState(120);
    const [h2hcRatio, setH2hcRatio] = useState(5);
    const [isCCR, setIsCCR] = useState(true);

    // Isomerization
    const [isomRecycleFraction, setIsomRecycleFraction] = useState(0.8);
    const [isomCatalystType, setIsomCatalystType] = useState<'chlorided' | 'zeolite'>('chlorided');

    // Alkylation
    const [fccOlefinsBpd, setFccOlefinsBpd] = useState(8000);
    const [iC4toOlefinRatio, setIC4toOlefinRatio] = useState(8);
    const [acidStrength, setAcidStrength] = useState(90);
    const [alkylationTemp, setAlkylationTemp] = useState(45);
    const [alkyCatalystType, setAlkyCatalystType] = useState<'HF' | 'H2SO4'>('H2SO4');

    // Gasoline blending
    const [ethanolBlendBpd, setEthanolBlendBpd] = useState(5000);
    const [showBlendOptimizer, setShowBlendOptimizer] = useState(true);

    // ─── Feed characterization ───
    const straightRunFeed: NaphthaFeed = {
        name: 'Straight-Run', bpd: straightRunBpd, ron: 52, sulfurPpmWt: 200,
        olefinsVolPct: 2, naphthenesVolPct: 35, paraffinsVolPct: 53, aromaticsVolPct: 10,
    };
    const fccFeed: NaphthaFeed = {
        name: 'FCC', bpd: fccNaphthaBpd, ron: 92, sulfurPpmWt: 800,
        olefinsVolPct: 28, naphthenesVolPct: 12, paraffinsVolPct: 25, aromaticsVolPct: 35,
    };

    const totalNaphthaForNHT = straightRunBpd + fccNaphthaBpd + cokerNaphthaBpd;
    const combinedFeed: NaphthaFeed = {
        name: 'Combined', bpd: totalNaphthaForNHT, ron: 65, sulfurPpmWt: 380,
        olefinsVolPct: 12, naphthenesVolPct: 25, paraffinsVolPct: 42, aromaticsVolPct: 21,
    };

    // ─── Calculations ───
    const nhtResult = useMemo(() => naphthaHydrotreater(combinedFeed, nhtSeverity, nhtPressure),
        [combinedFeed.bpd, nhtSeverity, nhtPressure]);

    const lightNaphthaBpd = useMemo(() => +(nhtResult.productBpd * lightNaphthaFraction).toFixed(0),
        [nhtResult.productBpd, lightNaphthaFraction]);
    const heavyNaphthaBpd = useMemo(() => +(nhtResult.productBpd - lightNaphthaBpd).toFixed(0),
        [nhtResult.productBpd, lightNaphthaBpd]);

    const reformerResult = useMemo(() => catalyticReformer(heavyNaphthaBpd, combinedFeed.naphthenesVolPct, combinedFeed.aromaticsVolPct,
        reformerSeverity, reformerPressure, h2hcRatio, isCCR),
        [heavyNaphthaBpd, reformerSeverity, reformerPressure, h2hcRatio, isCCR]);

    const isomResult = useMemo(() => isomerizationUnit(lightNaphthaBpd, 0.55, isomRecycleFraction, isomCatalystType),
        [lightNaphthaBpd, isomRecycleFraction, isomCatalystType]);

    const alkyResult = useMemo(() => alkylationUnit(fccOlefinsBpd, iC4toOlefinRatio, acidStrength, alkylationTemp, alkyCatalystType),
        [fccOlefinsBpd, iC4toOlefinRatio, acidStrength, alkylationTemp, alkyCatalystType]);

    // ─── Gasoline Blend Components ───
    const blendComponents = useMemo((): BlendComponent[] => [
        {
            name: 'Reformate', bpd: reformerResult.reformateBpd, ron: reformerResult.reformateRon, rvpPsi: 2.5,
            sulfurPpm: 0.5, aromaticsVolPct: reformerResult.aromaticsYieldVolPct, olefinsVolPct: 2,
            benzeneVolPct: reformerResult.reformateBenzeneVolPct, t10F: 160, t50F: 240, t90F: 340,
            ethanolVolPct: 0, costPerBbl: 105, blendingOctaneIndex: 5, color: C.reformate, locked: false
        },
        {
            name: 'Isomerate', bpd: isomResult.isomerateBpd, ron: isomResult.isomerateRon, rvpPsi: 8.5,
            sulfurPpm: 0.5, aromaticsVolPct: 2, olefinsVolPct: 1,
            benzeneVolPct: 0.5, t10F: 110, t50F: 140, t90F: 175,
            ethanolVolPct: 0, costPerBbl: 98, blendingOctaneIndex: 3, color: C.isomerate, locked: false
        },
        {
            name: 'Alkylate', bpd: alkyResult.alkylateBpd, ron: alkyResult.alkylateRon, rvpPsi: 2.8,
            sulfurPpm: 0, aromaticsVolPct: 0, olefinsVolPct: 0,
            benzeneVolPct: 0, t10F: 190, t50F: 210, t90F: 240,
            ethanolVolPct: 0, costPerBbl: 115, blendingOctaneIndex: 8, color: C.alkylate, locked: false
        },
        {
            name: 'FCC Naphtha', bpd: fccNaphthaBpd * 0.6, ron: 92, rvpPsi: 4.5,
            sulfurPpm: 30, aromaticsVolPct: 30, olefinsVolPct: 25,
            benzeneVolPct: 0.5, t10F: 130, t50F: 220, t90F: 350,
            ethanolVolPct: 0, costPerBbl: 92, blendingOctaneIndex: 6, color: C.fccNaphtha, locked: false
        },
        {
            name: 'LSR Naphtha', bpd: straightRunBpd * 0.15, ron: 62, rvpPsi: 10,
            sulfurPpm: 100, aromaticsVolPct: 8, olefinsVolPct: 1,
            benzeneVolPct: 1, t10F: 100, t50F: 140, t90F: 185,
            ethanolVolPct: 0, costPerBbl: 82, blendingOctaneIndex: 1, color: C.lsn, locked: false
        },
        {
            name: 'n-Butane', bpd: alkyResult.nButaneBpd, ron: 93, rvpPsi: 52,
            sulfurPpm: 0, aromaticsVolPct: 0, olefinsVolPct: 0,
            benzeneVolPct: 0, t10F: 30, t50F: 32, t90F: 34,
            ethanolVolPct: 0, costPerBbl: 60, blendingOctaneIndex: 10, color: C.butane, locked: false
        },
    ], [reformerResult, isomResult, alkyResult, fccNaphthaBpd, straightRunBpd]);

    // Blend specs
    const blendSpecs = useMemo((): BlendSpec[] => [
        {
            name: 'Regular 87', grade: 'regular', minAKI: 87, maxRVP: 9, maxSulfurPpm: 10,
            maxBenzeneVolPct: 0.62, maxAromaticsVolPct: 35, maxOlefinsVolPct: 18,
            maxT10F: 158, maxT50F: 250, maxT90F: 374, targetEthanolVolPct: 10,
            demandBpd: 50000, pricePerBbl: 125, color: C.regular
        },
        {
            name: 'Mid 89', grade: 'mid', minAKI: 89, maxRVP: 8.5, maxSulfurPpm: 10,
            maxBenzeneVolPct: 0.62, maxAromaticsVolPct: 35, maxOlefinsVolPct: 18,
            maxT10F: 158, maxT50F: 250, maxT90F: 374, targetEthanolVolPct: 10,
            demandBpd: 15000, pricePerBbl: 132, color: C.mid
        },
        {
            name: 'Premium 93', grade: 'premium', minAKI: 93, maxRVP: 8, maxSulfurPpm: 10,
            maxBenzeneVolPct: 0.62, maxAromaticsVolPct: 35, maxOlefinsVolPct: 18,
            maxT10F: 158, maxT50F: 250, maxT90F: 374, targetEthanolVolPct: 10,
            demandBpd: 8000, pricePerBbl: 148, color: C.premium
        },
    ], []);

    const regularBlend = useMemo(() => gasolineBlendCalculation(blendComponents, blendSpecs[0], ethanolBlendBpd * 0.6),
        [blendComponents, ethanolBlendBpd]);
    const midBlend = useMemo(() => gasolineBlendCalculation(blendComponents, blendSpecs[1], ethanolBlendBpd * 0.25),
        [blendComponents, ethanolBlendBpd]);
    const premiumBlend = useMemo(() => gasolineBlendCalculation(blendComponents, blendSpecs[2], ethanolBlendBpd * 0.15),
        [blendComponents, ethanolBlendBpd]);

    const totalGasolineBpd = regularBlend.totalBpd + midBlend.totalBpd + premiumBlend.totalBpd;
    const totalGasolineMargin = regularBlend.blendMarginPerDay + midBlend.blendMarginPerDay + premiumBlend.blendMarginPerDay;

    // Octane blending chart
    const octaneChartData = useMemo(() => blendComponents.filter(c => c.bpd > 0).map(c => ({
        name: c.name, RON: c.ron, 'Blend Octane Index': c.ron * (1 + c.blendingOctaneIndex / 100), BPD: c.bpd,
    })), [blendComponents]);

    // Radar chart for blend specs
    const radarData = useMemo(() => [
        { spec: 'AKI', value: regularBlend.blendedAKI, target: blendSpecs[0].minAKI, fullMark: 100 },
        { spec: 'RVP', value: Math.min(15, regularBlend.blendedRVP), target: blendSpecs[0].maxRVP, fullMark: 15 },
        { spec: 'Sulfur', value: Math.min(15, regularBlend.blendedSulfurPpm), target: blendSpecs[0].maxSulfurPpm, fullMark: 15 },
        { spec: 'Benzene', value: regularBlend.blendedBenzene * 100, target: blendSpecs[0].maxBenzeneVolPct * 100, fullMark: 1 },
        { spec: 'Aromatics', value: regularBlend.blendedAromatics, target: blendSpecs[0].maxAromaticsVolPct, fullMark: 40 },
        { spec: 'Olefins', value: regularBlend.blendedOlefins, target: blendSpecs[0].maxOlefinsVolPct, fullMark: 20 },
    ], [regularBlend]);

    const Slider = ({ label, value, onChange, min, max, step = 1, unit = '', hint = '' }: {
        label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string; hint?: string;
    }) => (
        <div className="mb-1">
            <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-slate-400">{label}</span>
                <span className="text-cyan-400 font-mono">{fmt(value, 1)}{unit}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500" />
            {hint && <div className="text-[11px] text-slate-600">{hint}</div>}
        </div>
    );

    return (
        <div className="space-y-4 text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-orange-400">⛽ Naphtha Processing & Gasoline Production</h2>
                    <p className="text-xs text-slate-500">Sub-Step 6.4: NHT → Reformer → Isomerization → Alkylation → Gasoline Blending</p>
                </div>
                <div className="px-3 py-1 rounded text-xs font-bold bg-cyan-900/50 text-cyan-400">
                    H₂ Production: {fmt(reformerResult.h2Production_MMscfd, 1)} MMscfd
                </div>
            </div>

            {/* Animated Reformer + Key Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <AnimatedReformerTrain severity={reformerSeverity} h2Production={reformerResult.h2Production_MMscfd} />
                </div>
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3 space-y-0.5 max-h-[400px] overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Process Parameters</h3>
                    <Slider label="Straight-Run Feed" value={straightRunBpd} onChange={setStraightRunBpd} min={5000} max={500000000} step={1000} unit=" BPD" hint="Up to 500M BPD" />
                    <Slider label="FCC Naphtha" value={fccNaphthaBpd} onChange={setFccNaphthaBpd} min={1000} max={200000000} step={1000} unit=" BPD" />
                    <Slider label="NHT Severity" value={nhtSeverity} onChange={setNhtSeverity} min={0.1} max={1} step={0.05} />
                    <Slider label="Reformer Severity" value={reformerSeverity} onChange={setReformerSeverity} min={0.3} max={1} step={0.05} />
                    <Slider label="Reformer Pressure" value={reformerPressure} onChange={setReformerPressure} min={50} max={350} step={10} unit=" psig" />
                    <Slider label="H₂/HC Ratio" value={h2hcRatio} onChange={setH2hcRatio} min={3} max={8} step={0.5} />
                    <Slider label="Isom Recycle" value={isomRecycleFraction} onChange={setIsomRecycleFraction} min={0} max={0.95} step={0.05} />
                    <Slider label="Olefins to Alky" value={fccOlefinsBpd} onChange={setFccOlefinsBpd} min={500} max={50000000} step={500} unit=" BPD" />
                    <Slider label="iC4/Olefin Ratio" value={iC4toOlefinRatio} onChange={setIC4toOlefinRatio} min={5} max={15} step={0.5} />
                    <Slider label="Alky Acid Strength" value={acidStrength} onChange={setAcidStrength} min={80} max={98} step={0.5} unit="%" />
                    <Slider label="Ethanol Blend" value={ethanolBlendBpd} onChange={setEthanolBlendBpd} min={0} max={50000000} step={100} unit=" BPD" />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                {[
                    { label: 'NHT Product', value: `${fmt(nhtResult.productBpd, 0)} BPD`, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
                    { label: 'NHT Sulfur Out', value: `${nhtResult.productSulfurPpm.toFixed(1)} ppm`, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
                    { label: 'Reformate', value: `${fmt(reformerResult.reformateBpd, 0)} BPD`, color: 'text-orange-400', bg: 'bg-orange-900/30' },
                    { label: 'Reformate RON', value: `${reformerResult.reformateRon}`, color: 'text-amber-400', bg: 'bg-amber-900/30' },
                    { label: 'Isomerate', value: `${fmt(isomResult.isomerateBpd, 0)} BPD`, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
                    { label: 'Isomerate RON', value: `${isomResult.isomerateRon}`, color: 'text-green-400', bg: 'bg-green-900/30' },
                    { label: 'Alkylate', value: `${fmt(alkyResult.alkylateBpd, 0)} BPD`, color: 'text-indigo-400', bg: 'bg-indigo-900/30' },
                    { label: 'Alkylate RON', value: `${alkyResult.alkylateRon}`, color: 'text-violet-400', bg: 'bg-violet-900/30' },
                ].map((kpi, i) => (
                    <div key={i} className={`${kpi.bg} rounded p-2 text-center border border-slate-700/50`}>
                        <div className="text-[10px] text-slate-400">{kpi.label}</div>
                        <div className={`font-mono font-bold text-sm ${kpi.color}`}>{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* Product Flow + Octane Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Component Production Summary</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={octaneChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                            <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={90} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                            <Bar dataKey="BPD" fill="#6366f1" name="BPD" barSize={20} />
                            <Bar dataKey="RON" fill="#f59e0b" name="RON" barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Blend Component Octane Map</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={octaneChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                            <YAxis stroke="#94a3b8" fontSize={10} label={{ value: 'RON', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10 } }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                            <Bar dataKey="RON" fill="#f59e0b" opacity={0.7} barSize={30} name="Measured RON" />
                            <Line type="monotone" dataKey="Blend Octane Index" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Blending Index" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gasoline Blend Optimizer */}
            <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-amber-400 uppercase">Gasoline Blending Optimization — Real-Time Blend Analysis</h3>
                    <button onClick={() => setShowBlendOptimizer(!showBlendOptimizer)}
                        className="text-xs text-cyan-400 hover:text-cyan-300">
                        {showBlendOptimizer ? '▼ Hide' : '▶ Show'} Details
                    </button>
                </div>

                {/* Blend Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    {[regularBlend, midBlend, premiumBlend].map((blend, i) => (
                        <div key={i} className={`rounded p-3 border ${blend.allSpecsPass ? 'border-emerald-700/50 bg-emerald-900/20' : 'border-red-700/50 bg-red-900/20'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm" style={{ color: blendSpecs[i].color }}>{blendSpecs[i].name}</span>
                                <span className={`text-xs font-mono ${blend.allSpecsPass ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {blend.allSpecsPass ? '✓ PASS' : '✗ FAIL'}
                                </span>
                            </div>
                            <div className="space-y-0.5 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Volume</span><span className="text-cyan-400">{fmt(blend.totalBpd, 0)} BPD</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">AKI</span><span className={blend.blendedAKI >= blendSpecs[i].minAKI ? 'text-emerald-400' : 'text-red-400'}>{blend.blendedAKI} (min {blendSpecs[i].minAKI})</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">RVP</span><span className={blend.blendedRVP <= blendSpecs[i].maxRVP ? 'text-emerald-400' : 'text-red-400'}>{blend.blendedRVP} psi</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Sulfur</span><span className={blend.blendedSulfurPpm <= blendSpecs[i].maxSulfurPpm ? 'text-emerald-400' : 'text-red-400'}>{blend.blendedSulfurPpm.toFixed(0)} ppm</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Benzene</span><span>{blend.blendedBenzene.toFixed(2)}%</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Cost</span><span className="text-amber-400">${blend.blendCostPerBbl}/bbl</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Margin</span><span className="text-emerald-400">${fmt(blend.blendMarginPerDay, 0)}/d</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Giveaway</span><span className={blend.giveawayOctane > 1 ? 'text-amber-400' : 'text-emerald-400'}>{blend.giveawayOctane} octane</span></div>
                            </div>
                            {blend.failedSpecs.length > 0 && (
                                <div className="mt-1 text-[10px] text-red-400">
                                    {blend.failedSpecs.map((f, j) => <div key={j}>⚠ {f}</div>)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {showBlendOptimizer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-400 mb-1">Blend Composition</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={[
                                        ...blendComponents.filter(c => c.bpd > 0).map(c => ({ name: c.name, value: c.bpd, color: c.color })),
                                        { name: 'Ethanol', value: ethanolBlendBpd, color: C.ethanol },
                                    ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} ${fmt(value, 0)}`}>
                                        {[...blendComponents.filter(c => c.bpd > 0).map(c => c.color), C.ethanol].map((color, i) => <Cell key={i} fill={color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-400 mb-1">Regular 87 — Spec Radar</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="spec" stroke="#94a3b8" fontSize={9} />
                                    <PolarRadiusAxis stroke="#94a3b8" fontSize={8} />
                                    <Radar name="Blend" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                                    <Radar name="Target" dataKey="target" stroke="#f59e0b" fill="none" strokeDasharray="4 4" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Economics Summary */}
            <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Gasoline Complex Economics</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px] font-mono">
                    <div className="text-center"><div className="text-slate-400">Total Gasoline</div><div className="text-cyan-400 font-bold">{fmt(totalGasolineBpd, 0)} BPD</div></div>
                    <div className="text-center"><div className="text-slate-400">H₂ Produced</div><div className="text-blue-400 font-bold">{fmt(reformerResult.h2Production_MMscfd, 1)} MMscfd</div></div>
                    <div className="text-center"><div className="text-slate-400">LPG from Reformer</div><div className="text-orange-400 font-bold">{fmt(reformerResult.lpgBpd, 0)} BPD</div></div>
                    <div className="text-center"><div className="text-slate-400">Total Blend Margin</div><div className="text-emerald-400 font-bold">${fmt(totalGasolineMargin, 0)}/d</div></div>
                    <div className="text-center"><div className="text-slate-400">Reformer Cycle</div><div className="text-violet-400 font-bold">{isCCR ? 'Continuous' : `${reformerResult.catalystCycleDays} days`}</div></div>
                </div>
            </div>

            {/* Equation Reference */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-2 text-[10px] text-slate-600">
                <span className="font-bold text-slate-500">Key Equations:</span>{' '}
                HDS: S_out = S_in · exp(−k·P_H2·τ) | Reforming: N → A + 3H₂ (ΔH = +205 kJ/mol){' '}
                | Octane Blend: AKI = (RON + MON)/2, MON ≈ RON − 8 | RVP Blend: Σ(xi · RVPi){' '}
                | Alkylate: iC4 + C4= → iC8 (RON ~93–98) | Isom: n-C5 ⇌ i-C5 (Keq at 150°C){' '}
                | Driveability: DI = 1.5·T10 + 3·T50 + T90 + 1.33·EtOH%
            </div>
        </div>
    );
}