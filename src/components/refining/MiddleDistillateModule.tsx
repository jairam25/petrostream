/**
 * MiddleDistillateModule — PHASE 6.5
 * Diesel Hydrotreating + Kerosene/Jet Fuel Processing + ULSD Blending
 * Includes: HDS kinetics, cetane improvement, refractory sulfur (4,6-DMDBT),
 * jet fuel freeze point/smoke point, lubricity, cold flow properties.
 * All calculations handle industrial-scale values. Editable parameters throughout.
 * Designed for oil & gas engineers, consultancies, and university students.
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, ReferenceLine, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const C = {
    primary: '#6366f1', success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
    dark: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9',
    muted: '#94a3b8', accent: '#06b6d4',
    diesel: '#06b6d4', jet: '#f59e0b', lco: '#ef4444', srdiesel: '#10b981',
    ulsd: '#3b82f6', kerosene: '#fbbf24', cokerGasOil: '#8b5cf6',
};

function fmt(val: number, d = 1): string {
    if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(d) + ' T';
    if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(d) + ' B';
    if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(d) + ' M';
    if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(d) + ' K';
    return val.toFixed(d);
}

// ═══════════════════════════════════════════════════════════════════════
// DIESEL HYDROTREATING CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════

interface DieselFeed {
    name: string; bpd: number; sulfurWtPct: number; nitrogenPpm: number;
    aromaticsVolPct: number; cetaneNumber: number; density_kg_m3: number;
    t50F: number; t90F: number; t95F: number;
}

interface DieselHTResult {
    productBpd: number; productSulfurPpm: number; productNitrogenPpm: number;
    productCetane: number; productAromaticsVolPct: number; h2Consumption_scf_bbl: number;
    reactorTempF: number; wast: number; totalH2_MMscfd: number;
    lightEndsBpd: number; naphthaProductBpd: number; productDensity_kg_m3: number;
}

function dieselHydrotreater(feed: DieselFeed, targetSulfurPpm: number, reactorPressurePsig: number,
    catalystAgeYears: number, catalystType: 'CoMo' | 'NiMo'): DieselHTResult {
    // HDS kinetics - refractory sulfur requires deeper severity
    const lnSoS = -Math.log(targetSulfurPpm * 1e-6 / (feed.sulfurWtPct * 1e-2));
    const k0 = catalystType === 'NiMo' ? 4.5 : 3.2;
    const pressureFactor = (reactorPressurePsig / 600) ** 0.65;
    const relativeWaat = 625 + lnSoS / (k0 * pressureFactor) * 25;
    const reactorTempF = +(relativeWaat + catalystAgeYears * 8).toFixed(0);
    const wast = reactorTempF;

    const lhsv = 1.5 - (targetSulfurPpm < 10 ? 0.8 : 0);
    const severityFactor = Math.min(1, (reactorTempF - 600) / 150 * (reactorPressurePsig / 800) * (1 / lhsv));
    const sulfurRemoval = 1 - Math.exp(-severityFactor * 4);

    const productSulfurPpm = Math.max(targetSulfurPpm * 0.8, feed.sulfurWtPct * 1e4 * (1 - sulfurRemoval));
    const nitrogenRemoval = sulfurRemoval * 0.85;
    const productNitrogenPpm = feed.nitrogenPpm * (1 - nitrogenRemoval);

    // Cetane improvement from aromatic saturation (NiMo better than CoMo)
    const aromaticsSaturation = severityFactor * (catalystType === 'NiMo' ? 0.55 : 0.35);
    const productAromaticsVolPct = feed.aromaticsVolPct * (1 - aromaticsSaturation);
    const cetaneGain = aromaticsSaturation * 15 + (catalystType === 'NiMo' ? 5 : 2);
    const productCetane = Math.min(65, feed.cetaneNumber + cetaneGain);

    const h2Consumption = 400 + feed.sulfurWtPct * 120 + feed.nitrogenPpm * 0.02 + aromaticsSaturation * 200;
    const totalH2_MMscfd = feed.bpd * h2Consumption / 1e6;

    const productBpd = +(feed.bpd * (1 - severityFactor * 0.015)).toFixed(0);
    const lightEndsBpd = +(feed.bpd * severityFactor * 0.01).toFixed(0);
    const naphthaProductBpd = +(feed.bpd * severityFactor * 0.02).toFixed(0);
    const productDensity_kg_m3 = +(feed.density_kg_m3 - aromaticsSaturation * 15).toFixed(0);

    return {
        productBpd, productSulfurPpm: +productSulfurPpm.toFixed(1),
        productNitrogenPpm: +productNitrogenPpm.toFixed(0),
        productCetane: +productCetane.toFixed(1),
        productAromaticsVolPct: +productAromaticsVolPct.toFixed(1),
        h2Consumption_scf_bbl: +h2Consumption.toFixed(0),
        reactorTempF, wast, totalH2_MMscfd: +totalH2_MMscfd.toFixed(1),
        lightEndsBpd, naphthaProductBpd,
        productDensity_kg_m3,
    };
}

// ═══════════════════════════════════════════════════════════════════════
// JET FUEL / KEROSENE PROCESSING
// ═══════════════════════════════════════════════════════════════════════

interface JetFuelResult {
    jetProductBpd: number; freezePointC: number; flashPointC: number;
    smokePoint_mm: number; sulfurWtPct: number; mercaptanSulfurPpm: number;
    thermalStability_deposit: number; msep_rating: number; density_kg_m3: number;
    specificEnergy_MJ_kg: number; passesSpec: boolean; failedTests: string[];
}

function jetFuelProcessing(keroseneBpd: number, keroseneAPI: number, keroseneSulfurWtPct: number,
    freezePointTargetC: number, smokePointTarget_mm: number, processingType: 'Merox' | 'Hydrotreating'): JetFuelResult {
    const sg = 141.5 / (keroseneAPI + 131.5);
    const density_kg_m3 = +(sg * 999.012).toFixed(0);

    // Freeze point (lower API = more paraffinic = higher freeze point)
    const baseFreezePointC = -60 + (keroseneAPI - 40) * 1.5;
    const freezePointC = +Math.min(freezePointTargetC, baseFreezePointC).toFixed(1);

    const flashPointC = +Math.max(38, 42 + (keroseneAPI - 38) * 0.5).toFixed(1);

    // Smoke point: higher = cleaner burning
    const baseSmokePoint_mm = 22 + (keroseneAPI - 35) * 0.5;
    const smokePoint_mm = processingType === 'Hydrotreating' ? +Math.min(30, baseSmokePoint_mm + 3).toFixed(1) : +baseSmokePoint_mm.toFixed(1);

    // Sulfur
    const sulfurWtPct = processingType === 'Hydrotreating' ? Math.max(0.001, keroseneSulfurWtPct * 0.15) : keroseneSulfurWtPct;
    const mercaptanSulfurPpm = processingType === 'Hydrotreating' ? 5 : 15;

    // Thermal stability (JFTOT)
    const thermalStability_deposit = processingType === 'Hydrotreating' ? 1.5 : 2.5;
    const msep_rating = processingType === 'Hydrotreating' ? 95 : 85;

    const specificEnergy_MJ_kg = +(42.8 + (keroseneAPI - 38) * 0.05).toFixed(2);

    const jetProductBpd = +(keroseneBpd * (processingType === 'Hydrotreating' ? 0.985 : 0.998)).toFixed(0);

    const failedTests: string[] = [];
    if (freezePointC > -40) failedTests.push(`Freeze ${freezePointC}°C > -40°C`);
    if (flashPointC < 38) failedTests.push(`Flash ${flashPointC}°C < 38°C`);
    if (smokePoint_mm < 19) failedTests.push(`Smoke ${smokePoint_mm}mm < 19mm`);
    if (sulfurWtPct > 0.3) failedTests.push(`S ${(sulfurWtPct * 100).toFixed(2)}% > 0.3%`);
    if (thermalStability_deposit >= 3) failedTests.push(`JFTOT deposit ${thermalStability_deposit} ≥ 3`);

    return {
        jetProductBpd, freezePointC, flashPointC, smokePoint_mm,
        sulfurWtPct: +sulfurWtPct.toFixed(3), mercaptanSulfurPpm,
        thermalStability_deposit: +thermalStability_deposit.toFixed(1),
        msep_rating, density_kg_m3, specificEnergy_MJ_kg,
        passesSpec: failedTests.length === 0, failedTests,
    };
}

// ═══════════════════════════════════════════════════════════════════════
// DIESEL BLENDING
// ═══════════════════════════════════════════════════════════════════════

interface DieselBlendComponent {
    name: string; bpd: number; cetaneNumber: number; sulfurPpm: number;
    density_kg_m3: number; cloudPointC: number; cfppC: number;
    t90F: number; flashPointC: number; lubricity_um: number;
    costPerBbl: number; color: string;
}

interface DieselBlendResult {
    totalBpd: number; blendedCetane: number; blendedSulfurPpm: number;
    blendedDensity: number; blendedCloud: number; blendedCFPP: number;
    blendedT90: number; blendedFlash: number; blendedLubricity: number;
    blendCostPerBbl: number; passesULSD: boolean; failedSpecs: string[];
    seasonalGrade: string;
}

function dieselBlendCalculation(components: DieselBlendComponent[], biodieselBpd: number,
    cetaneImproverBpd: number, cfppAdditiveBpd: number, lubricityAdditiveBpd: number,
    season: 'summer' | 'winter' | 'arctic'): DieselBlendResult {
    const activeComponents = components.filter(c => c.bpd > 0);
    let totalHydrocarbonBpd = activeComponents.reduce((s, c) => s + c.bpd, 0);
    const totalBpd = totalHydrocarbonBpd + biodieselBpd;

    // Weighted averages for hydrocarbon portion
    let sumCetaneXVol = 0, sumSulfurXVol = 0, sumDensityXVol = 0, sumCloudXVol = 0, sumCFPPXVol = 0;
    let sumT90XVol = 0, sumFlashXVol = 0, sumLubricityXVol = 0;

    activeComponents.forEach(c => {
        sumCetaneXVol += c.bpd * c.cetaneNumber;
        sumSulfurXVol += c.bpd * Math.max(0.1, c.sulfurPpm);
        sumDensityXVol += c.bpd * c.density_kg_m3;
        sumCloudXVol += c.bpd * c.cloudPointC;
        sumCFPPXVol += c.bpd * c.cfppC;
        sumT90XVol += c.bpd * c.t90F;
        sumFlashXVol += c.bpd * c.flashPointC;
        sumLubricityXVol += c.bpd * c.lubricity_um;
    });

    const blendedCetane = totalBpd > 0 ? +(sumCetaneXVol + biodieselBpd * 55) / totalBpd + cetaneImproverBpd * 0.8 : 0;
    const blendedSulfurPpm = totalHydrocarbonBpd > 0 ? +sumSulfurXVol / totalHydrocarbonBpd : 0;
    const blendedDensity = totalBpd > 0 ? +(sumDensityXVol + biodieselBpd * 880) / totalBpd : 0;
    const blendedCloud = totalBpd > 0 ? +sumCloudXVol / totalBpd - cfppAdditiveBpd * 2 : 0;
    const blendedCFPP = totalBpd > 0 ? +(sumCFPPXVol + cfppAdditiveBpd * (-5)) / totalBpd : 0;
    const blendedT90 = totalHydrocarbonBpd > 0 ? +sumT90XVol / totalHydrocarbonBpd : 0;
    const blendedFlash = totalBpd > 0 ? +(sumFlashXVol + biodieselBpd * 130) / totalBpd : 0;
    const blendedLubricity = totalBpd > 0 ? +(sumLubricityXVol + lubricityAdditiveBpd * (-100)) / totalBpd : 0;

    const seasonalGrade = season === 'arctic' ? 'Arctic Diesel' : season === 'winter' ? 'Winter Diesel' : 'Summer Diesel';

    const failedSpecs: string[] = [];
    const maxSulfur = 10;
    const minCetane = 40;
    const maxCFPP = season === 'arctic' ? -44 : season === 'winter' ? -20 : -5;
    const maxLubricity = 460;

    if (blendedSulfurPpm > maxSulfur) failedSpecs.push(`S ${blendedSulfurPpm.toFixed(0)} > ${maxSulfur} ppm`);
    if (blendedCetane < minCetane) failedSpecs.push(`Cetane ${blendedCetane.toFixed(1)} < ${minCetane}`);
    if (blendedCFPP > maxCFPP) failedSpecs.push(`CFPP ${blendedCFPP.toFixed(0)} > ${maxCFPP}°C`);
    if (blendedLubricity > maxLubricity) failedSpecs.push(`HFRR ${blendedLubricity.toFixed(0)} > ${maxLubricity} μm`);

    const blendCostPerBbl = activeComponents.reduce((sum, c) => sum + c.costPerBbl * c.bpd / totalHydrocarbonBpd, 0);

    return {
        totalBpd: +totalBpd.toFixed(0),
        blendedCetane: +blendedCetane.toFixed(1), blendedSulfurPpm: +blendedSulfurPpm.toFixed(0),
        blendedDensity: +blendedDensity.toFixed(1), blendedCloud: +blendedCloud.toFixed(1),
        blendedCFPP: +blendedCFPP.toFixed(0), blendedT90: +blendedT90.toFixed(0),
        blendedFlash: +blendedFlash.toFixed(0), blendedLubricity: +blendedLubricity.toFixed(0),
        blendCostPerBbl: +blendCostPerBbl.toFixed(2),
        passesULSD: failedSpecs.length === 0, failedSpecs, seasonalGrade,
    };
}

// ═══════════════════════════════════════════════════════════════════════
// ANIMATED DIESEL HYDROTREATER REACTOR
// ═══════════════════════════════════════════════════════════════════════

function AnimatedHydrotreater({ reactorTempF, pressure, sulfurIn, sulfurOut }: {
    reactorTempF: number; pressure: number; sulfurIn: number; sulfurOut: number;
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
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W, H);

            // Reactor vessel
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(80, 20, W - 160, H - 40, 12);
            ctx.fill();
            ctx.stroke();

            // Catalyst beds (3 beds)
            const beds = [{ y: 45, h: 45 }, { y: 110, h: 50 }, { y: 180, h: 55 }];
            beds.forEach((bed, bi) => {
                for (let row = 0; row < bed.h / 8; row++) {
                    for (let col = 0; col < 18; col++) {
                        const px = 95 + col * ((W - 190) / 18);
                        const py = bed.y + row * 8 + Math.sin(timeRef.current * 3 + row + col + bi) * 2;
                        ctx.beginPath();
                        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                        const alpha = 0.25 + 0.25 * Math.sin(timeRef.current * 2.5 + row * col * 0.5);
                        if (sulfurOut < 10) {
                            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
                        } else if (sulfurOut < 500) {
                            ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
                        } else {
                            ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
                        }
                        ctx.fill();
                    }
                }

                // H2 quench zone between beds
                if (bi < 2) {
                    const qY = bed.y + bed.h;
                    ctx.strokeStyle = '#06b6d4';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath();
                    ctx.moveTo(15, qY);
                    ctx.lineTo(80, qY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.fillStyle = '#06b6d4';
                    ctx.font = '8px monospace';
                    ctx.fillText('H₂ Q', 5, qY + 4);
                }
            });

            // Feed arrow
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(15, 35);
            ctx.lineTo(80, 35);
            ctx.stroke();
            ctx.fillStyle = '#f59e0b';
            ctx.font = '9px monospace';
            ctx.fillText(`FEED (S:${sulfurIn.toFixed(0)}ppm)`, 3, 28);

            // Product arrow
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(W - 80, H / 2);
            ctx.lineTo(W - 15, H / 2);
            ctx.stroke();
            ctx.fillStyle = '#10b981';
            ctx.font = '9px monospace';
            ctx.fillText(`ULSD (S:${sulfurOut.toFixed(1)}ppm)`, W - 80, H / 2 + 15);

            // Reactor conditions
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('DIESEL HYDROTREATER', W / 2 - 70, 18);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.fillText(`T: ${reactorTempF}°F | P: ${pressure} psig`, W - 200, 18);

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        return () => { running = false; };
    }, [reactorTempF, pressure, sulfurIn, sulfurOut]);

    return <canvas ref={canvasRef} width={580} height={280} className="w-full border border-slate-700 rounded" />;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function MiddleDistillateModule() {
    // Diesel feed rates
    const [srDieselBpd, setSrDieselBpd] = useState(45000);
    const [lcoBpd, setLcoBpd] = useState(15000);
    const [cokerGasOilBpd, setCokerGasOilBpd] = useState(8000);

    // Diesel HDT
    const [targetSulfurPpm, setTargetSulfurPpm] = useState(8);
    const [dhtPressure, setDhtPressure] = useState(900);
    const [catalystAge, setCatalystAge] = useState(2);
    const [catalystType, setCatalystType] = useState<'CoMo' | 'NiMo'>('NiMo');

    // Kerosene
    const [keroseneBpd, setKeroseneBpd] = useState(25000);
    const [keroseneAPI, setKeroseneAPI] = useState(42);
    const [keroseneSulfur, setKeroseneSulfur] = useState(0.15);
    const [jetProcessingType, setJetProcessingType] = useState<'Merox' | 'Hydrotreating'>('Hydrotreating');

    // Diesel blending
    const [biodieselBpd, setBiodieselBpd] = useState(3000);
    const [cetaneImproverBpd, setCetaneImproverBpd] = useState(50);
    const [cfppAdditiveBpd, setCfppAdditiveBpd] = useState(20);
    const [lubricityAdditiveBpd, setLubricityAdditiveBpd] = useState(5);
    const [season, setSeason] = useState<'summer' | 'winter' | 'arctic'>('winter');

    const [showAdvanced, setShowAdvanced] = useState(false);

    // ─── Feed definitions ───
    const srDieselFeed: DieselFeed = {
        name: 'SR Diesel', bpd: srDieselBpd, sulfurWtPct: 1.0, nitrogenPpm: 150,
        aromaticsVolPct: 25, cetaneNumber: 52, density_kg_m3: 845,
        t50F: 520, t90F: 630, t95F: 660,
    };
    const lcoFeed: DieselFeed = {
        name: 'LCO', bpd: lcoBpd, sulfurWtPct: 2.5, nitrogenPpm: 600,
        aromaticsVolPct: 70, cetaneNumber: 22, density_kg_m3: 940,
        t50F: 540, t90F: 660, t95F: 690,
    };
    const cgoFeed: DieselFeed = {
        name: 'Coker GO', bpd: cokerGasOilBpd, sulfurWtPct: 2.8, nitrogenPpm: 800,
        aromaticsVolPct: 55, cetaneNumber: 30, density_kg_m3: 920,
        t50F: 550, t90F: 670, t95F: 700,
    };

    const combinedDieselBpd = srDieselBpd + lcoBpd + cokerGasOilBpd;
    const combinedFeed: DieselFeed = {
        name: 'Combined', bpd: combinedDieselBpd,
        sulfurWtPct: +((srDieselBpd * 1.0 + lcoBpd * 2.5 + cokerGasOilBpd * 2.8) / combinedDieselBpd).toFixed(2),
        nitrogenPpm: +((srDieselBpd * 150 + lcoBpd * 600 + cokerGasOilBpd * 800) / combinedDieselBpd).toFixed(0),
        aromaticsVolPct: +((srDieselBpd * 25 + lcoBpd * 70 + cokerGasOilBpd * 55) / combinedDieselBpd).toFixed(0),
        cetaneNumber: +((srDieselBpd * 52 + lcoBpd * 22 + cokerGasOilBpd * 30) / combinedDieselBpd).toFixed(0),
        density_kg_m3: +((srDieselBpd * 845 + lcoBpd * 940 + cokerGasOilBpd * 920) / combinedDieselBpd).toFixed(0),
        t50F: 540, t90F: 650, t95F: 680,
    };

    // ─── Calculations ───
    const dhtResult = useMemo(() => dieselHydrotreater(combinedFeed, targetSulfurPpm, dhtPressure, catalystAge, catalystType),
        [combinedFeed.bpd, combinedFeed.sulfurWtPct, combinedFeed.nitrogenPpm, combinedFeed.aromaticsVolPct,
        combinedFeed.cetaneNumber, targetSulfurPpm, dhtPressure, catalystAge, catalystType]);

    const jetResult = useMemo(() => jetFuelProcessing(keroseneBpd, keroseneAPI, keroseneSulfur, -47, 25, jetProcessingType),
        [keroseneBpd, keroseneAPI, keroseneSulfur, jetProcessingType]);

    // Diesel blending components
    const dieselComponents = useMemo((): DieselBlendComponent[] => [
        {
            name: 'Hydrotreated Diesel', bpd: dhtResult.productBpd, cetaneNumber: dhtResult.productCetane,
            sulfurPpm: dhtResult.productSulfurPpm, density_kg_m3: dhtResult.productDensity_kg_m3,
            cloudPointC: -8, cfppC: -12, t90F: 640, flashPointC: 62, lubricity_um: 520,
            costPerBbl: 105, color: C.diesel
        },
        {
            name: 'SR Diesel (untreated)', bpd: srDieselBpd * 0.1, cetaneNumber: 52,
            sulfurPpm: 10000, density_kg_m3: 845,
            cloudPointC: -6, cfppC: -10, t90F: 630, flashPointC: 60, lubricity_um: 350,
            costPerBbl: 100, color: C.srdiesel
        },
    ], [dhtResult, srDieselBpd]);

    const dieselBlend = useMemo(() => dieselBlendCalculation(
        dieselComponents, biodieselBpd, cetaneImproverBpd, cfppAdditiveBpd, lubricityAdditiveBpd, season
    ), [dieselComponents, biodieselBpd, cetaneImproverBpd, cfppAdditiveBpd, lubricityAdditiveBpd, season]);

    // HDS kinetics chart
    const hdsChartData = useMemo(() => {
        const points = [];
        for (let sev = 0; sev <= 1; sev += 0.05) {
            const removal = 1 - Math.exp(-sev * 4);
            const sOut = combinedFeed.sulfurWtPct * 1e4 * (1 - removal);
            points.push({ severity: +(sev * 100).toFixed(0), sulfurPpm: +Math.max(0.1, sOut).toFixed(1), removalPct: +(removal * 100).toFixed(1) });
        }
        return points;
    }, [combinedFeed.sulfurWtPct]);

    // Jet fuel radar
    const jetRadarData = useMemo(() => [
        { spec: 'Freeze Pt', value: Math.max(-60, jetResult.freezePointC), target: -47, fullMark: -30 },
        { spec: 'Flash Pt', value: jetResult.flashPointC, target: 38, fullMark: 80 },
        { spec: 'Smoke Pt', value: jetResult.smokePoint_mm, target: 25, fullMark: 35 },
        { spec: 'MSEP', value: jetResult.msep_rating, target: 85, fullMark: 100 },
        { spec: 'Stability', value: 4 - jetResult.thermalStability_deposit, target: 1, fullMark: 4 },
        { spec: 'Energy', value: (jetResult.specificEnergy_MJ_kg - 41) * 5, target: 9, fullMark: 12 },
    ], [jetResult]);

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
                    <h2 className="text-lg font-bold text-cyan-400">🛢️ Middle Distillate Processing — Diesel & Jet Fuel</h2>
                    <p className="text-xs text-slate-500">Sub-Step 6.5: Diesel HDT + Jet/Kerosene Processing + ULSD Blending</p>
                </div>
                <div className="flex gap-2">
                    <div className={`px-3 py-1 rounded text-xs font-bold ${dhtResult.productSulfurPpm < 10 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                        S: {dhtResult.productSulfurPpm.toFixed(1)} ppm {dhtResult.productSulfurPpm < 10 ? '✓ ULSD' : '✗'}
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-bold ${jetResult.passesSpec ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                        Jet: {jetResult.passesSpec ? '✓ PASS' : '✗ FAIL'}
                    </div>
                </div>
            </div>

            {/* Animated Hydrotreater + Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <AnimatedHydrotreater reactorTempF={dhtResult.reactorTempF} pressure={dhtPressure}
                        sulfurIn={combinedFeed.sulfurWtPct * 1e4} sulfurOut={dhtResult.productSulfurPpm} />
                </div>
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3 space-y-0.5 max-h-[400px] overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Process Parameters</h3>
                    <Slider label="SR Diesel Feed" value={srDieselBpd} onChange={setSrDieselBpd} min={5000} max={500000000} step={1000} unit=" BPD" hint="Up to 500M BPD" />
                    <Slider label="LCO Feed" value={lcoBpd} onChange={setLcoBpd} min={1000} max={200000000} step={1000} unit=" BPD" />
                    <Slider label="Coker Gas Oil" value={cokerGasOilBpd} onChange={setCokerGasOilBpd} min={1000} max={100000000} step={500} unit=" BPD" />
                    <Slider label="Target Sulfur" value={targetSulfurPpm} onChange={setTargetSulfurPpm} min={1} max={500} step={1} unit=" ppm" hint="ULSD < 10 ppm" />
                    <Slider label="DHT Pressure" value={dhtPressure} onChange={setDhtPressure} min={400} max={1500} step={25} unit=" psig" />
                    <Slider label="Catalyst Age" value={catalystAge} onChange={setCatalystAge} min={0} max={6} step={0.5} unit=" yr" />
                    <Slider label="Kerosene Feed" value={keroseneBpd} onChange={setKeroseneBpd} min={5000} max={200000000} step={1000} unit=" BPD" />
                    <Slider label="Kerosene API" value={keroseneAPI} onChange={setKeroseneAPI} min={30} max={50} step={0.5} unit="°API" />
                    <Slider label="Biodiesel" value={biodieselBpd} onChange={setBiodieselBpd} min={0} max={50000000} step={100} unit=" BPD" />
                    <Slider label="Cetane Improver" value={cetaneImproverBpd} onChange={setCetaneImproverBpd} min={0} max={500} step={10} unit=" BPD" />
                    <Slider label="CFPP Additive" value={cfppAdditiveBpd} onChange={setCfppAdditiveBpd} min={0} max={100} step={2} unit=" BPD" />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                {[
                    { label: 'DHT Product', value: `${fmt(dhtResult.productBpd, 0)} BPD`, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
                    { label: 'Product Sulfur', value: `${dhtResult.productSulfurPpm.toFixed(1)} ppm`, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
                    { label: 'Product Cetane', value: `${dhtResult.productCetane.toFixed(1)}`, color: 'text-blue-400', bg: 'bg-blue-900/30' },
                    { label: 'H₂ Consumption', value: `${dhtResult.totalH2_MMscfd.toFixed(1)} MMscfd`, color: 'text-indigo-400', bg: 'bg-indigo-900/30' },
                    { label: 'Jet Product', value: `${fmt(jetResult.jetProductBpd, 0)} BPD`, color: 'text-amber-400', bg: 'bg-amber-900/30' },
                    { label: 'Jet Freeze Pt', value: `${jetResult.freezePointC}°C`, color: 'text-orange-400', bg: 'bg-orange-900/30' },
                    { label: 'Smoke Point', value: `${jetResult.smokePoint_mm} mm`, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
                    { label: 'ULSD Blend', value: `${fmt(dieselBlend.totalBpd, 0)} BPD`, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
                ].map((kpi, i) => (
                    <div key={i} className={`${kpi.bg} rounded p-2 text-center border border-slate-700/50`}>
                        <div className="text-[10px] text-slate-400">{kpi.label}</div>
                        <div className={`font-mono font-bold text-sm ${kpi.color}`}>{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* HDS Kinetics + Diesel Blend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">HDS Kinetics — Sulfur vs. Severity</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={hdsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="severity" stroke="#94a3b8" fontSize={9} label={{ value: 'Severity %', position: 'bottom', style: { fill: '#94a3b8', fontSize: 10 } }} />
                            <YAxis yAxisId="left" stroke="#ef4444" fontSize={10} label={{ value: 'Sulfur ppm', angle: -90, position: 'insideLeft', style: { fill: '#ef4444', fontSize: 10 } }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} label={{ value: 'Removal %', angle: 90, position: 'insideRight', style: { fill: '#10b981', fontSize: 10 } }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                            <Area yAxisId="left" type="monotone" dataKey="sulfurPpm" fill="#ef4444" fillOpacity={0.15} stroke="#ef4444" strokeWidth={2} name="Sulfur ppm" />
                            <Line yAxisId="right" type="monotone" dataKey="removalPct" stroke="#10b981" strokeWidth={2} dot={false} name="Removal %" />
                            <ReferenceLine yAxisId="left" y={10} stroke="#06b6d4" strokeDasharray="5 5" label={{ value: 'ULSD Limit', fill: '#06b6d4', fontSize: 9 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">ULSD Blend Properties — {dieselBlend.seasonalGrade}</h3>
                    <div className="grid grid-cols-2 gap-y-1 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-400">Total Volume</span><span className="text-cyan-400">{fmt(dieselBlend.totalBpd, 0)} BPD</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Cetane</span><span className={dieselBlend.blendedCetane >= 40 ? 'text-emerald-400' : 'text-red-400'}>{dieselBlend.blendedCetane}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Sulfur</span><span className={dieselBlend.blendedSulfurPpm <= 10 ? 'text-emerald-400' : 'text-red-400'}>{dieselBlend.blendedSulfurPpm.toFixed(0)} ppm</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Density</span><span>{dieselBlend.blendedDensity} kg/m³</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Cloud Pt</span><span>{dieselBlend.blendedCloud.toFixed(0)}°C</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">CFPP</span><span>{dieselBlend.blendedCFPP.toFixed(0)}°C</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">T90</span><span>{dieselBlend.blendedT90.toFixed(0)}°F</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Flash Pt</span><span>{dieselBlend.blendedFlash}°C</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">HFRR</span><span className={dieselBlend.blendedLubricity <= 460 ? 'text-emerald-400' : 'text-red-400'}>{dieselBlend.blendedLubricity.toFixed(0)} μm</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Cost</span><span className="text-amber-400">${dieselBlend.blendCostPerBbl}/bbl</span></div>
                    </div>
                    <div className={`mt-2 px-2 py-1 rounded text-xs ${dieselBlend.passesULSD ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                        {dieselBlend.passesULSD ? '✓ Meets ULSD Specifications' : '✗ Fails: ' + dieselBlend.failedSpecs.join(', ')}
                    </div>
                </div>
            </div>

            {/* Jet Fuel + Advanced */}
            <div>
                <button onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    {showAdvanced ? '\u25BC' : '\u25B6'} Advanced: Jet Fuel Spec Radar & Refinery Diesel Pool
                </button>
                {showAdvanced && (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-amber-400 mb-2">Jet A-1 Specification</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Freeze Point</span><span className={jetResult.freezePointC <= -47 ? 'text-emerald-400' : 'text-red-400'}>{jetResult.freezePointC}°C (≤ -47)</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Flash Point</span><span>{jetResult.flashPointC}°C (≥ 38)</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Smoke Point</span><span>{jetResult.smokePoint_mm} mm (≥ 25)</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Sulfur</span><span>{jetResult.sulfurWtPct.toFixed(3)}% (≤ 0.3)</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Mercaptan S</span><span>{jetResult.mercaptanSulfurPpm} ppm (≤ 30)</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">MSEP</span><span>{jetResult.msep_rating} (≥ 85)</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">JFTOT Deposit</span><span className={jetResult.thermalStability_deposit < 3 ? 'text-emerald-400' : 'text-red-400'}>{jetResult.thermalStability_deposit} (&lt; 3)</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Density</span><span>{jetResult.density_kg_m3} kg/m³</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Energy</span><span>{jetResult.specificEnergy_MJ_kg} MJ/kg</span></div>
                            </div>
                            <div className="mt-2">
                                <div className="text-[11px] text-slate-500">Processing: {jetProcessingType}</div>
                                <select value={jetProcessingType} onChange={e => setJetProcessingType(e.target.value as any)}
                                    className="mt-1 text-[10px] bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200">
                                    <option value="Merox">Merox Sweetening</option>
                                    <option value="Hydrotreating">Hydrotreating</option>
                                </select>
                            </div>
                        </div>
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-amber-400 mb-2">Jet Fuel — Spec Radar</h4>
                            <ResponsiveContainer width="100%" height={220}>
                                <RadarChart data={jetRadarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="spec" stroke="#94a3b8" fontSize={9} />
                                    <PolarRadiusAxis stroke="#94a3b8" fontSize={7} />
                                    <Radar name="Actual" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                                    <Radar name="Target" dataKey="target" stroke="#10b981" fill="none" strokeDasharray="3 3" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Diesel Yield & Cetane Improvement</h4>
                            <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between"><span className="text-slate-400">Feed Cetane</span><span className="text-red-400">{combinedFeed.cetaneNumber}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Product Cetane</span><span className="text-emerald-400">{dhtResult.productCetane.toFixed(1)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Cetane Gain</span><span className="text-cyan-400">+{(dhtResult.productCetane - combinedFeed.cetaneNumber).toFixed(1)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Aromatics Reduction</span><span>{combinedFeed.aromaticsVolPct}% → {dhtResult.productAromaticsVolPct}%</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Density Reduction</span><span>{combinedFeed.density_kg_m3} → {dhtResult.productDensity_kg_m3} kg/m³</span></div>
                                <hr className="border-slate-700 my-1" />
                                <div className="flex justify-between"><span className="text-slate-400">Catalyst Type</span><span className="text-indigo-400">{catalystType}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">WAAT</span><span>{dhtResult.wast}°F</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">By-product Naphtha</span><span>{fmt(dhtResult.naphthaProductBpd, 0)} BPD</span></div>
                            </div>
                            <div className="mt-2">
                                <select value={catalystType} onChange={e => setCatalystType(e.target.value as any)}
                                    className="text-[10px] bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200">
                                    <option value="CoMo">CoMo/Al₂O₃ (std HDS)</option>
                                    <option value="NiMo">NiMo/Al₂O₃ (deep HDS + HDN)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Refinery Diesel Pool Summary */}
            <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Refinery Distillate Pool Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="text-center"><div className="text-slate-400">Total Diesel Pool</div><div className="text-cyan-400 font-bold">{fmt(dieselBlend.totalBpd, 0)} BPD</div></div>
                    <div className="text-center"><div className="text-slate-400">ULSD Sulfur</div><div className="text-emerald-400 font-bold">{dieselBlend.blendedSulfurPpm.toFixed(0)} ppm</div></div>
                    <div className="text-center"><div className="text-slate-400">Jet/Kerosene</div><div className="text-amber-400 font-bold">{fmt(jetResult.jetProductBpd, 0)} BPD</div></div>
                    <div className="text-center"><div className="text-slate-400">Total H₂ for DHT</div><div className="text-indigo-400 font-bold">{dhtResult.totalH2_MMscfd.toFixed(1)} MMscfd</div></div>
                </div>
            </div>

            {/* Equation Reference */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded p-2 text-[10px] text-slate-600">
                <span className="font-bold text-slate-500">Key Equations:</span>{' '}
                HDS: ln(S₀/S) = k · P_H2ⁿ · exp(−Ea/RT) · 1/LHSV{' '}
                | Cetane Gain: ΔCN ≈ 5–15 from aromatic saturation{' '}
                | Refractory S: 4,6-DMDBT sterically hindered — requires 2x severity{' '}
                | CFPP = f(cloud point, additive) — cold flow improver{' '}
                | JFTOT: Thermal Oxidation Stability at 260°C | HFRR: Lubricity after desulfurization{' '}
                | Jet Freeze: f(n-paraffins) | Smoke Point: f(aromatics, H-content)
            </div>
        </div>
    );
}