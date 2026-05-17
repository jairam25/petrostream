import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    FileText,
    Layers,
    AlertTriangle,
    Activity,
    PieChart,
    Info,
    ChevronRight,
    Building2,
    Ship,
    Anchor,
    Factory,
    Droplets,
    Wind,
    Clock,
    Target,
    ArrowRight,
    CircleDot,
    AlertCircle,
    Shield,
    CheckCircle2,
    XCircle,
    Percent,
    TrendingDown,
    Wallet,
    Landmark,
    BadgeDollarSign,
    Scale,
    ArrowUpDown,
    Binary,
    Dice1,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import {
    classifyReserves,
    estimateWellCount,
    generateProductionProfile,
    estimateCAPEX,
    runCashFlow,
    screenDevelopmentConcepts,
    buildTornadoData,
    estimateRecoveryFactor,
    screenArtificialLift,
    compareConcepts,
    runMonteCarlo,
} from '../../lib/appraisal';
import type {
    ReservesCategory,
    ProductionProfile,
    CAPEXBreakdown,
    CashFlowResult,
    AnnualCashFlow,
    MonteCarloResult,
    TornadoItem,
    DevelopmentConcept,
} from '../../lib/appraisal';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    ScatterChart,
    Scatter,
    ComposedChart,
} from 'recharts';

// ---------- TAB DEFINITIONS ----------
type AppraisalTab = 'speprms' | 'concepts' | 'wellcount' | 'profile' | 'capex' | 'cashflow' | 'montecarlo' | 'tornado' | 'decision';

const tabs: { id: AppraisalTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'speprms', label: 'SPE-PRMS', icon: Layers },
    { id: 'concepts', label: 'Concepts', icon: Building2 },
    { id: 'wellcount', label: 'Well Count', icon: Target },
    { id: 'profile', label: 'Profile', icon: TrendingUp },
    { id: 'capex', label: 'CAPEX', icon: DollarSign },
    { id: 'cashflow', label: 'Cash Flow', icon: Wallet },
    { id: 'montecarlo', label: 'Monte Carlo', icon: Dice1 },
    { id: 'tornado', label: 'Tornado', icon: ArrowUpDown },
    { id: 'decision', label: 'FID Decision', icon: CheckCircle2 },
];

// ---------- UTILITY ----------
const formatMM = (v: number) => `$${(v / 1).toFixed(0)} MM`;
const formatBbl = (v: number) => `${(v / 1).toFixed(1)} MMbbl`;
const formatPct = (v: number) => `${v.toFixed(1)}%`;

// ---------- MODERN GLASS METRIC CARD ----------
function MetricCard({ label, value, unit, accent = 'cyan', size = 'normal' }: {
    label: string; value: string; unit?: string; accent?: string; size?: 'normal' | 'large';
}) {
    const accentColors: Record<string, string> = {
        cyan: 'from-cyan-400 to-cyan-600',
        amber: 'from-amber-400 to-orange-600',
        emerald: 'from-emerald-400 to-green-600',
        rose: 'from-rose-400 to-pink-600',
        violet: 'from-violet-400 to-purple-600',
        slate: 'from-slate-400 to-slate-600',
    };
    return (
        <div className="glass-card rounded-2xl p-5 border-white/5 bg-white/[0.02]">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{label}</p>
            <p className={cn(
                'font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent',
                accentColors[accent] || accentColors.cyan,
                size === 'large' ? 'text-3xl' : 'text-xl',
            )}>{value}</p>
            {unit && <p className="text-[10px] text-slate-600 font-mono uppercase mt-0.5">{unit}</p>}
        </div>
    );
}

// ---------- MAIN COMPONENT ----------
export function AppraisalDecisionModule() {
    const [activeTab, setActiveTab] = useState<AppraisalTab>('speprms');

    // --- SPE-PRMS State ---
    const [volP90, setVolP90] = useState(85);
    const [volP50, setVolP50] = useState(150);
    const [volP10, setVolP10] = useState(240);
    const [rfP90, setRfP90] = useState(22);
    const [rfP50, setRfP50] = useState(32);
    const [rfP10, setRfP10] = useState(42);

    // --- Concept Screening ---
    const [waterDepth, setWaterDepth] = useState(350);
    const [distInfra, setDistInfra] = useState(25);
    const [fieldSizeBoe, setFieldSizeBoe] = useState(450);
    const [peakRate, setPeakRate] = useState(85000);
    const [envSens, setEnvSens] = useState<'low' | 'moderate' | 'high'>('moderate');

    // --- Well Count ---
    const [drainageAcres, setDrainageAcres] = useState(80);
    const [totalAcres, setTotalAcres] = useState(12000);
    const [injProdRatio, setInjProdRatio] = useState(0.5);
    const [wellSpacing, setWellSpacing] = useState(600);
    const [pattern, setPattern] = useState<'5spot' | '7spot' | '9spot' | 'line_drive' | 'irregular'>('5spot');

    // --- Production Profile ---
    const [recoverableMMbbl, setRecoverableMMbbl] = useState(180);
    const [plateauBopd, setPlateauBopd] = useState(75000);
    const [rampYrs, setRampYrs] = useState(3);
    const [plateauYrs, setPlateauYrs] = useState(7);
    const [declineRate, setDeclineRate] = useState(0.12);
    const [declineType, setDeclineType] = useState<'exponential' | 'hyperbolic' | 'harmonic'>('hyperbolic');
    const [hyperbolicB, setHyperbolicB] = useState(0.5);
    const [minEconRate, setMinEconRate] = useState(2000);
    const [downtime, setDowntime] = useState(0.92);

    // --- CAPEX ---
    const [producerCost, setProducerCost] = useState(8.5);
    const [injectorCost, setInjectorCost] = useState(6.0);
    const [facilityType, setFacilityType] = useState<'onshore_cpf' | 'offshore_platform' | 'fpso' | 'subsea_tieback' | 'tlp' | 'spar' | 'semi_submersible'>('fpso');
    const [procCap, setProcCap] = useState(85000);
    const [watInjCap, setWatInjCap] = useState(60000);
    const [gasCompCap, setGasCompCap] = useState(40);
    const [pipeKm, setPipeKm] = useState(80);
    const [pipeDia, setPipeDia] = useState(16);
    const [exportTerm, setExportTerm] = useState(0);
    const [engPct, setEngPct] = useState(15);
    const [contPct, setContPct] = useState(20);
    const [ownerPct, setOwnerPct] = useState(5);

    // --- Fiscal ---
    const [royaltyRate, setRoyaltyRate] = useState(0.125);
    const [incomeTaxRate, setIncomeTaxRate] = useState(0.35);
    const [costRecoveryCeil, setCostRecoveryCeil] = useState(0.60);
    const [profitOilSplit, setProfitOilSplit] = useState(0.55);
    const [isConcession, setIsConcession] = useState(false);
    const [deprYrs, setDeprYrs] = useState(10);
    const [abandonCost, setAbandonCost] = useState(120);
    const [bonusPay, setBonusPay] = useState(0);
    const [oilPrice, setOilPrice] = useState(75);
    const [gasPrice, setGasPrice] = useState(3.5);
    const [gor, setGor] = useState(800);
    const [baseWC, setBaseWC] = useState(0.05);

    // --- Monte Carlo ---
    const [mcIterations, setMcIterations] = useState(1000);

    // ---- COMPUTATIONS ----

    const reserves = useMemo(() => classifyReserves(volP90, volP50, volP10, rfP90, rfP50, rfP10), [volP90, volP50, volP10, rfP90, rfP50, rfP10]);

    const conceptScreen = useMemo(() => screenDevelopmentConcepts({
        waterDepthM: waterDepth, distanceToInfrastructureKm: distInfra, fieldSizeMMboe: fieldSizeBoe,
        peakRateBopd: peakRate, reservoirDepthFt: 8000, h2sContentPpm: 10, co2ContentPercent: 2,
        environmentalSensitivity: envSens,
    }), [waterDepth, distInfra, fieldSizeBoe, peakRate, envSens]);

    const wellCounts = useMemo(() => estimateWellCount({
        drainageAreaAcresPerWell: drainageAcres, totalFieldAcres: totalAcres,
        injectorProducerRatio: injProdRatio, wellSpacingFeet: wellSpacing, patternType: pattern,
    }), [drainageAcres, totalAcres, injProdRatio, wellSpacing, pattern]);

    const prodProfile = useMemo(() => generateProductionProfile({
        recoverableReservesMMbbl: recoverableMMbbl, plateauRateBopd: plateauBopd,
        rampUpDurationYears: rampYrs, plateauDurationYears: plateauYrs,
        declineRateAnnual: declineRate, declineType, hyperbolicB,
        minimumEconomicRateBopd: minEconRate, fieldLifeMaxYears: 30, downtimeFactor: downtime,
    }), [recoverableMMbbl, plateauBopd, rampYrs, plateauYrs, declineRate, declineType, hyperbolicB, minEconRate, downtime]);

    const capexResult = useMemo(() => estimateCAPEX({
        producerWellCostMM: producerCost, injectorWellCostMM: injectorCost,
        numberOfProducers: wellCounts.totalProducers, numberOfInjectors: wellCounts.totalInjectors,
        facilityType, processingCapacityBopd: procCap, waterInjectionCapacityBwpd: watInjCap,
        gasCompressionMMscfd: gasCompCap, pipelineLengthKm: pipeKm, pipelineDiameterInches: pipeDia,
        exportTerminalCostMM: exportTerm, engineeringPercentOfDirect: engPct, contingencyPercentOfTotal: contPct,
        ownerCostsPercent: ownerPct,
    }), [producerCost, injectorCost, wellCounts, facilityType, procCap, watInjCap, gasCompCap, pipeKm, pipeDia, exportTerm, engPct, contPct, ownerPct]);

    const waterCutProfile = useMemo(() => prodProfile.years.map(y => Math.min(0.95, baseWC * Math.exp(0.06 * y))), [prodProfile, baseWC]);

    const cashFlow = useMemo(() => runCashFlow(
        prodProfile, oilPrice, capexResult,
        {
            fixedOpexMMPerYear: 30, variableOpexPerBbl: 8, wellOpexPerWellPerYear: 35000,
            numberOfWells: wellCounts.totalWells, waterHandlingCostPerBbl: 0.5, gasProcessingCostPerMscf: 1.2,
        },
        {
            royaltyRate, incomeTaxRate, costRecoveryCeiling: costRecoveryCeil,
            profitOilSplitGovt: profitOilSplit, isConcession, depreciationYears: deprYrs,
            abandonmentCostMM: abandonCost, abandonmentYear: prodProfile.fieldLifeYears,
            indirectTaxPercent: 3, bonusPaymentMM: bonusPay, bonusYear: 0,
        },
        [0.20, 0.35, 0.25, 0.15, 0.05],
        gor, waterCutProfile, gasPrice,
    ), [prodProfile, oilPrice, capexResult, wellCounts, royaltyRate, incomeTaxRate, costRecoveryCeil, profitOilSplit, isConcession, deprYrs, abandonCost, gor, waterCutProfile, gasPrice, bonusPay]);

    // Monte Carlo
    const mcResult = useMemo(() => {
        const sensitivityMap: Record<string, (p: any, v: number) => void> = {
            'Oil Price': (p, v) => { p.oilPrice = v; },
            'CAPEX': (p, v) => { p.capexConfig.producerWellCostMM *= v; p.capexConfig.injectorWellCostMM *= v; },
            'OPEX': (p, v) => { p.opexConfig.variableOpexPerBbl *= v; },
            'Reserves': (p, v) => {
                p.productionProfile = generateProductionProfile({
                    recoverableReservesMMbbl: recoverableMMbbl * v, plateauRateBopd: plateauBopd,
                    rampUpDurationYears: rampYrs, plateauDurationYears: plateauYrs,
                    declineRateAnnual: declineRate, declineType, hyperbolicB,
                    minimumEconomicRateBopd: minEconRate, fieldLifeMaxYears: 30, downtimeFactor: downtime,
                });
            },
            'Production Rate': (p, v) => {
                p.productionProfile = generateProductionProfile({
                    recoverableReservesMMbbl: recoverableMMbbl, plateauRateBopd: plateauBopd * v,
                    rampUpDurationYears: rampYrs, plateauDurationYears: plateauYrs,
                    declineRateAnnual: declineRate, declineType, hyperbolicB,
                    minimumEconomicRateBopd: minEconRate, fieldLifeMaxYears: 30, downtimeFactor: downtime,
                });
            },
        };
        return runMonteCarlo(mcIterations, [
            { name: 'Oil Price', distribution: 'lognormal', mean: oilPrice, stdDev: oilPrice * 0.3 },
            { name: 'CAPEX', distribution: 'triangular', min: 0.8, max: 1.4, mostLikely: 1.0 },
            { name: 'OPEX', distribution: 'triangular', min: 0.85, max: 1.25, mostLikely: 1.0 },
            { name: 'Reserves', distribution: 'normal', mean: 1.0, stdDev: 0.15 },
            { name: 'Production Rate', distribution: 'normal', mean: 1.0, stdDev: 0.1 },
        ], {
            productionProfile: prodProfile, oilPrice, capexConfig: {
                producerWellCostMM: producerCost, injectorWellCostMM: injectorCost,
                numberOfProducers: wellCounts.totalProducers, numberOfInjectors: wellCounts.totalInjectors,
                facilityType, processingCapacityBopd: procCap, waterInjectionCapacityBwpd: watInjCap,
                gasCompressionMMscfd: gasCompCap, pipelineLengthKm: pipeKm, pipelineDiameterInches: pipeDia,
                exportTerminalCostMM: exportTerm, engineeringPercentOfDirect: engPct,
                contingencyPercentOfTotal: contPct, ownerCostsPercent: ownerPct,
            },
            opexConfig: {
                fixedOpexMMPerYear: 30, variableOpexPerBbl: 8, wellOpexPerWellPerYear: 35000,
                numberOfWells: wellCounts.totalWells, waterHandlingCostPerBbl: 0.5, gasProcessingCostPerMscf: 1.2
            },
            fiscalTerms: {
                royaltyRate, incomeTaxRate, costRecoveryCeiling: costRecoveryCeil,
                profitOilSplitGovt: profitOilSplit, isConcession, depreciationYears: deprYrs,
                abandonmentCostMM: abandonCost, abandonmentYear: prodProfile.fieldLifeYears,
                indirectTaxPercent: 3, bonusPaymentMM: bonusPay, bonusYear: 0
            },
            capexPhasing: [0.20, 0.35, 0.25, 0.15, 0.05], gor, waterCut: waterCutProfile, gasPrice,
        }, sensitivityMap);
    }, [mcIterations, oilPrice, gasPrice, producerCost, injectorCost, wellCounts, facilityType, procCap, watInjCap, gasCompCap, pipeKm, pipeDia, exportTerm, engPct, contPct, ownerPct, royaltyRate, incomeTaxRate, costRecoveryCeil, profitOilSplit, isConcession, deprYrs, abandonCost, bonusPay, gor, waterCutProfile, prodProfile, recoverableMMbbl, plateauBopd, rampYrs, plateauYrs, declineRate, declineType, hyperbolicB, minEconRate, downtime]);

    // Tornado
    const tornado = useMemo(() => {
        const baseNpv = cashFlow.npvAt10;
        const sens: Array<{ parameter: string; lowMultiplier: number; highMultiplier: number; unit: string; applyToCashFlow: (m: number) => number }> = [
            {
                parameter: 'Oil Price', lowMultiplier: 40, highMultiplier: 110, unit: '$/bbl',
                applyToCashFlow: (m) => runCashFlow(prodProfile, m, capexResult,
                    { fixedOpexMMPerYear: 30, variableOpexPerBbl: 8, wellOpexPerWellPerYear: 35000, numberOfWells: wellCounts.totalWells, waterHandlingCostPerBbl: 0.5, gasProcessingCostPerMscf: 1.2 },
                    { royaltyRate, incomeTaxRate, costRecoveryCeiling: costRecoveryCeil, profitOilSplitGovt: profitOilSplit, isConcession, depreciationYears: deprYrs, abandonmentCostMM: abandonCost, abandonmentYear: prodProfile.fieldLifeYears, indirectTaxPercent: 3, bonusPaymentMM: bonusPay, bonusYear: 0 },
                    [0.20, 0.35, 0.25, 0.15, 0.05], gor, waterCutProfile, gasPrice).npvAt10,
            },
            {
                parameter: 'CAPEX Multiplier', lowMultiplier: 0.8, highMultiplier: 1.4, unit: 'x',
                applyToCashFlow: (m) => {
                    const adjCapex = estimateCAPEX({ producerWellCostMM: producerCost * m, injectorWellCostMM: injectorCost * m, numberOfProducers: wellCounts.totalProducers, numberOfInjectors: wellCounts.totalInjectors, facilityType, processingCapacityBopd: procCap, waterInjectionCapacityBwpd: watInjCap, gasCompressionMMscfd: gasCompCap, pipelineLengthKm: pipeKm * m, pipelineDiameterInches: pipeDia, exportTerminalCostMM: exportTerm * m, engineeringPercentOfDirect: engPct, contingencyPercentOfTotal: contPct, ownerCostsPercent: ownerPct });
                    return runCashFlow(prodProfile, oilPrice, adjCapex,
                        { fixedOpexMMPerYear: 30, variableOpexPerBbl: 8, wellOpexPerWellPerYear: 35000, numberOfWells: wellCounts.totalWells, waterHandlingCostPerBbl: 0.5, gasProcessingCostPerMscf: 1.2 },
                        { royaltyRate, incomeTaxRate, costRecoveryCeiling: costRecoveryCeil, profitOilSplitGovt: profitOilSplit, isConcession, depreciationYears: deprYrs, abandonmentCostMM: abandonCost, abandonmentYear: prodProfile.fieldLifeYears, indirectTaxPercent: 3, bonusPaymentMM: bonusPay, bonusYear: 0 },
                        [0.20, 0.35, 0.25, 0.15, 0.05], gor, waterCutProfile, gasPrice).npvAt10;
                },
            },
            {
                parameter: 'OPEX per bbl', lowMultiplier: 4, highMultiplier: 14, unit: '$/bbl',
                applyToCashFlow: (m) => runCashFlow(prodProfile, oilPrice, capexResult,
                    { fixedOpexMMPerYear: 30, variableOpexPerBbl: m, wellOpexPerWellPerYear: 35000, numberOfWells: wellCounts.totalWells, waterHandlingCostPerBbl: 0.5, gasProcessingCostPerMscf: 1.2 },
                    { royaltyRate, incomeTaxRate, costRecoveryCeiling: costRecoveryCeil, profitOilSplitGovt: profitOilSplit, isConcession, depreciationYears: deprYrs, abandonmentCostMM: abandonCost, abandonmentYear: prodProfile.fieldLifeYears, indirectTaxPercent: 3, bonusPaymentMM: bonusPay, bonusYear: 0 },
                    [0.20, 0.35, 0.25, 0.15, 0.05], gor, waterCutProfile, gasPrice).npvAt10,
            },
            {
                parameter: 'Reserves', lowMultiplier: 0.7, highMultiplier: 1.3, unit: 'x',
                applyToCashFlow: (m) => {
                    const adjProfile = generateProductionProfile({ recoverableReservesMMbbl: recoverableMMbbl * m, plateauRateBopd: plateauBopd, rampUpDurationYears: rampYrs, plateauDurationYears: plateauYrs, declineRateAnnual: declineRate, declineType, hyperbolicB, minimumEconomicRateBopd: minEconRate, fieldLifeMaxYears: 30, downtimeFactor: downtime });
                    return runCashFlow(adjProfile, oilPrice, capexResult,
                        { fixedOpexMMPerYear: 30, variableOpexPerBbl: 8, wellOpexPerWellPerYear: 35000, numberOfWells: wellCounts.totalWells, waterHandlingCostPerBbl: 0.5, gasProcessingCostPerMscf: 1.2 },
                        { royaltyRate, incomeTaxRate, costRecoveryCeiling: costRecoveryCeil, profitOilSplitGovt: profitOilSplit, isConcession, depreciationYears: deprYrs, abandonmentCostMM: abandonCost, abandonmentYear: prodProfile.fieldLifeYears, indirectTaxPercent: 3, bonusPaymentMM: bonusPay, bonusYear: 0 },
                        [0.20, 0.35, 0.25, 0.15, 0.05], gor, waterCutProfile, gasPrice).npvAt10;
                },
            },
            {
                parameter: 'Royalty Rate', lowMultiplier: 0.05, highMultiplier: 0.20, unit: 'fraction',
                applyToCashFlow: (m) => runCashFlow(prodProfile, oilPrice, capexResult,
                    { fixedOpexMMPerYear: 30, variableOpexPerBbl: 8, wellOpexPerWellPerYear: 35000, numberOfWells: wellCounts.totalWells, waterHandlingCostPerBbl: 0.5, gasProcessingCostPerMscf: 1.2 },
                    { royaltyRate: m, incomeTaxRate, costRecoveryCeiling: costRecoveryCeil, profitOilSplitGovt: profitOilSplit, isConcession, depreciationYears: deprYrs, abandonmentCostMM: abandonCost, abandonmentYear: prodProfile.fieldLifeYears, indirectTaxPercent: 3, bonusPaymentMM: bonusPay, bonusYear: 0 },
                    [0.20, 0.35, 0.25, 0.15, 0.05], gor, waterCutProfile, gasPrice).npvAt10,
            },
            {
                parameter: 'Discount Rate', lowMultiplier: 0.06, highMultiplier: 0.15, unit: 'fraction',
                applyToCashFlow: (m) => {
                    // Use runCashFlow but override discount — we approximate by scaling NPV
                    const base = runCashFlow(prodProfile, oilPrice, capexResult,
                        { fixedOpexMMPerYear: 30, variableOpexPerBbl: 8, wellOpexPerWellPerYear: 35000, numberOfWells: wellCounts.totalWells, waterHandlingCostPerBbl: 0.5, gasProcessingCostPerMscf: 1.2 },
                        { royaltyRate, incomeTaxRate, costRecoveryCeiling: costRecoveryCeil, profitOilSplitGovt: profitOilSplit, isConcession, depreciationYears: deprYrs, abandonmentCostMM: abandonCost, abandonmentYear: prodProfile.fieldLifeYears, indirectTaxPercent: 3, bonusPaymentMM: bonusPay, bonusYear: 0 },
                        [0.20, 0.35, 0.25, 0.15, 0.05], gor, waterCutProfile, gasPrice);
                    // Manual re-discount
                    let npv = 0;
                    for (const f of base.annualFlows) {
                        npv += f.freeCashFlowMM / Math.pow(1 + m, f.year);
                    }
                    return npv;
                },
            },
        ];
        return buildTornadoData(baseNpv, sens);
    }, [cashFlow, prodProfile, capexResult, oilPrice, gasPrice, wellCounts, royaltyRate, incomeTaxRate, costRecoveryCeil, profitOilSplit, isConcession, deprYrs, abandonCost, bonusPay, gor, waterCutProfile, recoverableMMbbl, plateauBopd, rampYrs, plateauYrs, declineRate, declineType, hyperbolicB, minEconRate, downtime, producerCost, injectorCost, facilityType, procCap, watInjCap, gasCompCap, pipeKm, pipeDia, exportTerm, engPct, contPct, ownerPct]);

    // Recovery Factor
    const rfEstimate = useMemo(() => estimateRecoveryFactor('combination', 250, 0.22, 1.5, 32), []);

    // FID Decision
    const fidRecommendation = useMemo(() => {
        const npvPositive = cashFlow.npvAt10 > 0;
        const irrAboveHurdle = cashFlow.irr > 12;
        const paybackReasonable = cashFlow.paybackYears > 0 && cashFlow.paybackYears < 8;
        const mcProbPositive = mcResult.probabilityNpvPositive > 70;

        if (npvPositive && irrAboveHurdle && paybackReasonable && mcProbPositive) {
            return { decision: 'SANCTION (FID)', color: 'emerald', icon: CheckCircle2, desc: 'All economic criteria met. Recommend Final Investment Decision.' };
        } else if (npvPositive && mcResult.probabilityNpvPositive > 50) {
            return { decision: 'DEFER / OPTIMIZE', color: 'amber', icon: Clock, desc: 'Marginal economics. Optimize concept or wait for better conditions.' };
        } else {
            return { decision: 'DO NOT SANCTION', color: 'rose', icon: XCircle, desc: 'Economic criteria not met. Re-evaluate development concept.' };
        }
    }, [cashFlow, mcResult]);

    const profileChart = useMemo(() => prodProfile.years.map((y, i) => ({ year: y, rate: Math.round(prodProfile.rates[i]), cum: +prodProfile.cumulative[i].toFixed(1) })), [prodProfile]);

    const cashFlowChart = useMemo(() => cashFlow.annualFlows.slice(0, 25).map(f => ({
        year: f.year,
        revenue: +f.grossRevenueMM.toFixed(0),
        opex: +f.opexMM.toFixed(0),
        capex: +f.capexMM.toFixed(0),
        fcf: +f.freeCashFlowMM.toFixed(0),
        cum: +f.cumulativeCashFlowMM.toFixed(0),
    })), [cashFlow]);

    const mcHistogram = useMemo(() => mcResult.histogram.map(b => ({
        range: `${(b.binStart).toFixed(0)}`,
        count: b.count,
        binStart: b.binStart,
        binEnd: b.binEnd,
    })), [mcResult]);

    const tornadoChart = useMemo(() => tornado.map(t => ({
        parameter: t.parameter,
        low: +t.lowNpv.toFixed(0),
        high: +t.highNpv.toFixed(0),
        range: +t.range.toFixed(0),
    })), [tornado]);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* ---------- TAB NAVIGATION ---------- */}
            <div className="flex flex-wrap gap-2 p-3 bg-black/40 border-b border-white/5 rounded-2xl">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest",
                            activeTab === t.id
                                ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        <t.icon size={13} />
                        {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* ==================== SPE-PRMS ==================== */}
                {activeTab === 'speprms' && (
                    <motion.div key="speprms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard label="1P Reserves (P90)" value={formatBbl(reserves.proved1P)} unit="MMstb" accent="emerald" />
                            <MetricCard label="2P Reserves (P50)" value={formatBbl(reserves.provedProbable2P)} unit="MMstb" accent="cyan" />
                            <MetricCard label="3P Reserves (P10)" value={formatBbl(reserves.provedProbablePossible3P)} unit="MMstb" accent="amber" />
                            <MetricCard label="Contingent Resources" value={formatBbl(reserves.contingentResources)} unit="MMstb" accent="violet" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Volumetric Inputs */}
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-4">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={16} className="text-cyan-400" /> Volumetric Distribution
                                </h3>
                                <InputWithSlider label="P90 Volume (MMstb)" value={volP90} onChange={setVolP90} min={10} max={500} step={1} />
                                <InputWithSlider label="P50 Volume (MMstb)" value={volP50} onChange={setVolP50} min={10} max={500} step={1} />
                                <InputWithSlider label="P10 Volume (MMstb)" value={volP10} onChange={setVolP10} min={10} max={500} step={1} />
                            </div>
                            {/* Recovery Factors */}
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-4">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <Percent size={16} className="text-amber-400" /> Recovery Factors (%)
                                </h3>
                                <InputWithSlider label="RF P90 (%)" value={rfP90} onChange={setRfP90} min={5} max={60} step={0.5} />
                                <InputWithSlider label="RF P50 (%)" value={rfP50} onChange={setRfP50} min={5} max={60} step={0.5} />
                                <InputWithSlider label="RF P10 (%)" value={rfP10} onChange={setRfP10} min={5} max={60} step={0.5} />
                            </div>
                            {/* Classification Summary */}
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-3">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">SPE-PRMS Classification</h3>
                                <div className="space-y-2 text-[11px] font-mono">
                                    {[
                                        { label: 'Proved (1P)', val: reserves.proved1P, color: 'text-emerald-400' },
                                        { label: 'Probable (2P-1P)', val: reserves.provedProbable2P - reserves.proved1P, color: 'text-cyan-400' },
                                        { label: 'Possible (3P-2P)', val: reserves.provedProbablePossible3P - reserves.provedProbable2P, color: 'text-amber-400' },
                                    ].map(r => (
                                        <div key={r.label} className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                            <span className="text-slate-400">{r.label}</span>
                                            <span className={cn('font-black', r.color)}>{formatBbl(r.val)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 text-[10px] text-slate-500 italic leading-relaxed">
                                    SPE-PRMS framework. 1P = low estimate (reasonable certainty), 2P = best estimate, 3P = high estimate. Recovery factor applied to in-place volumes.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== DEVELOPMENT CONCEPTS ==================== */}
                {activeTab === 'concepts' && (
                    <motion.div key="concepts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-4 lg:col-span-3">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <Building2 size={16} className="text-cyan-400" /> Concept Screening
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <InputWithSlider label="Water Depth (m)" value={waterDepth} onChange={setWaterDepth} min={0} max={3500} step={50} />
                                    <InputWithSlider label="Dist to Infrastructure (km)" value={distInfra} onChange={setDistInfra} min={0} max={200} step={5} />
                                    <InputWithSlider label="Field Size (MMboe)" value={fieldSizeBoe} onChange={setFieldSizeBoe} min={10} max={2000} step={10} />
                                    <InputWithSlider label="Peak Rate (bopd)" value={peakRate} onChange={setPeakRate} min={5000} max={300000} step={1000} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Environmental Sensitivity</label>
                                        <select value={envSens} onChange={e => setEnvSens(e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono">
                                            <option value="low">Low</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-3">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Viable Concepts</h3>
                                {conceptScreen.viableConcepts.map((c, i) => (
                                    <div key={c.type} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <span className="text-[10px] font-black text-cyan-400 w-6">#{i + 1}</span>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white uppercase">{c.type.replace(/_/g, ' ')}</p>
                                            <p className="text-[10px] text-slate-500">{c.reason}</p>
                                        </div>
                                        <span className="text-lg font-black text-amber-400">{c.score}/10</span>
                                    </div>
                                ))}
                                {conceptScreen.viableConcepts.length === 0 && (
                                    <p className="text-xs text-slate-500 italic">No concepts match current parameters. Adjust inputs.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== WELL COUNT ==================== */}
                {activeTab === 'wellcount' && (
                    <motion.div key="wellcount" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-4 lg:col-span-2">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <Target size={16} className="text-cyan-400" /> Well Count Estimation
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputWithSlider label="Drainage Area (acres/well)" value={drainageAcres} onChange={setDrainageAcres} min={10} max={640} step={5} />
                                    <InputWithSlider label="Total Field Acres" value={totalAcres} onChange={setTotalAcres} min={100} max={50000} step={100} />
                                    <InputWithSlider label="Well Spacing (ft)" value={wellSpacing} onChange={setWellSpacing} min={100} max={2000} step={50} />
                                    <InputWithSlider label="Inj/Prod Ratio" value={injProdRatio} onChange={setInjProdRatio} min={0} max={3} step={0.1} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Pattern Type</label>
                                        <select value={pattern} onChange={e => setPattern(e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono">
                                            <option value="5spot">5-Spot</option>
                                            <option value="7spot">7-Spot</option>
                                            <option value="9spot">9-Spot</option>
                                            <option value="line_drive">Line Drive</option>
                                            <option value="irregular">Irregular</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <MetricCard label="Total Producers" value={wellCounts.totalProducers.toString()} accent="cyan" size="large" />
                                <MetricCard label="Total Injectors" value={wellCounts.totalInjectors.toString()} accent="amber" size="large" />
                                <MetricCard label="Total Wells" value={wellCounts.totalWells.toString()} accent="emerald" size="large" />
                                <div className="text-[10px] text-slate-500 font-mono uppercase text-center">
                                    Grid: {wellCounts.wellsPerRow} × {wellCounts.rows}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== PRODUCTION PROFILE ==================== */}
                {activeTab === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-4">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Profile Parameters</h3>
                                <InputWithSlider label="Recoverable Reserves (MMstb)" value={recoverableMMbbl} onChange={setRecoverableMMbbl} min={10} max={2000} step={10} />
                                <InputWithSlider label="Plateau Rate (bopd)" value={plateauBopd} onChange={setPlateauBopd} min={5000} max={300000} step={1000} />
                                <InputWithSlider label="Ramp-Up (years)" value={rampYrs} onChange={setRampYrs} min={1} max={10} step={0.5} />
                                <InputWithSlider label="Plateau Duration (years)" value={plateauYrs} onChange={setPlateauYrs} min={1} max={20} step={0.5} />
                                <InputWithSlider label="Annual Decline Rate" value={declineRate} onChange={setDeclineRate} min={0.02} max={0.40} step={0.01} />
                                <InputWithSlider label="Hyperbolic b-factor" value={hyperbolicB} onChange={setHyperbolicB} min={0} max={1} step={0.05} />
                                <InputWithSlider label="Downtime Factor" value={downtime} onChange={setDowntime} min={0.75} max={1.0} step={0.01} />
                                <InputWithSlider label="Min Econ Rate (bopd)" value={minEconRate} onChange={setMinEconRate} min={500} max={10000} step={500} />
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Decline Type</label>
                                    <select value={declineType} onChange={e => setDeclineType(e.target.value as any)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono">
                                        <option value="exponential">Exponential</option>
                                        <option value="hyperbolic">Hyperbolic (Arps)</option>
                                        <option value="harmonic">Harmonic</option>
                                    </select>
                                </div>
                            </div>
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] lg:col-span-2 space-y-4">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Production Profile</h3>
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                    <MetricCard label="Field Life" value={`${prodProfile.fieldLifeYears} yrs`} accent="cyan" />
                                    <MetricCard label="Ultimate Rec." value={formatBbl(prodProfile.ultimateRecoveryMMbbl)} accent="emerald" />
                                    <MetricCard label="Peak Rate" value={`${Math.round(prodProfile.peakRateBopd).toLocaleString()}`} unit="bopd" accent="amber" />
                                    <MetricCard label="Plateau Rate" value={`${Math.round(prodProfile.plateauRateActual).toLocaleString()}`} unit="bopd" accent="violet" />
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <ComposedChart data={profileChart}>
                                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                                        <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Rate (bopd)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Cum (MMstb)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
                                        <Legend />
                                        <Bar yAxisId="right" dataKey="cum" fill="#06b6d4" opacity={0.3} radius={[4, 4, 0, 0]} name="Cumulative (MMstb)" />
                                        <Area yAxisId="left" type="monotone" dataKey="rate" stroke="#f59e0b" fill="url(#rateGrad)" strokeWidth={2} name="Oil Rate (bopd)" />
                                        <defs>
                                            <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== CAPEX ==================== */}
                {activeTab === 'capex' && (
                    <motion.div key="capex" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-4 lg:col-span-2">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign size={16} className="text-amber-400" /> CAPEX Parameters
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <InputWithSlider label="Producer Cost ($MM)" value={producerCost} onChange={setProducerCost} min={1} max={50} step={0.5} />
                                    <InputWithSlider label="Injector Cost ($MM)" value={injectorCost} onChange={setInjectorCost} min={1} max={50} step={0.5} />
                                    <InputWithSlider label="Processing Cap (bopd)" value={procCap} onChange={setProcCap} min={5000} max={300000} step={1000} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Facility Type</label>
                                        <select value={facilityType} onChange={e => setFacilityType(e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono">
                                            <option value="onshore_cpf">Onshore CPF</option>
                                            <option value="offshore_platform">Offshore Platform</option>
                                            <option value="fpso">FPSO</option>
                                            <option value="subsea_tieback">Subsea Tieback</option>
                                            <option value="tlp">TLP</option>
                                            <option value="spar">SPAR</option>
                                            <option value="semi_submersible">Semi-Submersible</option>
                                        </select>
                                    </div>
                                    <InputWithSlider label="Water Inj Cap (bwpd)" value={watInjCap} onChange={setWatInjCap} min={0} max={300000} step={5000} />
                                    <InputWithSlider label="Gas Comp (MMscfd)" value={gasCompCap} onChange={setGasCompCap} min={0} max={500} step={5} />
                                    <InputWithSlider label="Pipeline (km)" value={pipeKm} onChange={setPipeKm} min={0} max={500} step={5} />
                                    <InputWithSlider label="Pipe Dia (in)" value={pipeDia} onChange={setPipeDia} min={4} max={48} step={2} />
                                    <InputWithSlider label="Eng. (% of Direct)" value={engPct} onChange={setEngPct} min={5} max={25} step={1} />
                                    <InputWithSlider label="Contingency (%)" value={contPct} onChange={setContPct} min={5} max={40} step={1} />
                                    <InputWithSlider label="Owner Costs (%)" value={ownerPct} onChange={setOwnerPct} min={1} max={15} step={1} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <MetricCard label="Total CAPEX" value={formatMM(capexResult.totalCAPEXMM)} accent="amber" size="large" />
                                <MetricCard label="Drilling & Completions" value={formatMM(capexResult.drillingCompletionsMM)} accent="cyan" />
                                <MetricCard label="Facilities" value={formatMM(capexResult.facilitiesMM)} accent="emerald" />
                                <MetricCard label="Pipelines & Export" value={formatMM(capexResult.pipelinesExportMM + capexResult.subseaUmbilicalsMM)} accent="violet" />
                                <MetricCard label="$/Peak bbl" value={`$${capexResult.capexPerPeakBarrel.toFixed(0)}`} accent="slate" />
                                <div className="text-[10px] text-slate-500 font-mono text-center">
                                    Eng: {formatMM(capexResult.engineeringMM)} | Cont: {formatMM(capexResult.contingencyMM)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== CASH FLOW ==================== */}
                {activeTab === 'cashflow' && (
                    <motion.div key="cashflow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <MetricCard label="NPV @ 10%" value={formatMM(cashFlow.npvAt10)} accent={cashFlow.npvAt10 >= 0 ? 'emerald' : 'rose'} />
                            <MetricCard label="NPV @ 15%" value={formatMM(cashFlow.npvAt15)} accent="cyan" />
                            <MetricCard label="IRR" value={formatPct(cashFlow.irr)} accent="amber" />
                            <MetricCard label="Payback" value={cashFlow.paybackYears > 0 ? `${cashFlow.paybackYears} yrs` : 'N/A'} accent="violet" />
                            <MetricCard label="P.I." value={cashFlow.profitabilityIndex.toFixed(2)} accent="slate" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-4 lg:col-span-2">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Cash Flow (Years 1-25)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <ComposedChart data={cashFlowChart}>
                                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                                        <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
                                        <Legend />
                                        <Bar dataKey="revenue" fill="#22c55e" opacity={0.3} radius={[4, 4, 0, 0]} name="Revenue ($MM)" stackId="a" />
                                        <Bar dataKey="opex" fill="#ef4444" opacity={0.4} radius={[0, 0, 0, 0]} name="OPEX ($MM)" stackId="b" />
                                        <Bar dataKey="capex" fill="#8b5cf6" opacity={0.5} radius={[0, 0, 0, 0]} name="CAPEX ($MM)" stackId="b" />
                                        <Line type="monotone" dataKey="fcf" stroke="#f59e0b" strokeWidth={2} name="Free Cash Flow ($MM)" dot={false} />
                                        <Line type="monotone" dataKey="cum" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" name="Cumulative ($MM)" dot={false} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-3">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Fiscal Settings</h3>
                                <InputWithSlider label="Oil Price ($/bbl)" value={oilPrice} onChange={setOilPrice} min={20} max={150} step={0.5} />
                                <InputWithSlider label="Gas Price ($/Mscf)" value={gasPrice} onChange={setGasPrice} min={1} max={15} step={0.1} />
                                <InputWithSlider label="Royalty Rate" value={royaltyRate} onChange={setRoyaltyRate} min={0} max={0.30} step={0.005} />
                                <InputWithSlider label="Income Tax Rate" value={incomeTaxRate} onChange={setIncomeTaxRate} min={0} max={0.50} step={0.01} />
                                <InputWithSlider label="Cost Recovery Ceiling" value={costRecoveryCeil} onChange={setCostRecoveryCeil} min={0.3} max={0.80} step={0.01} />
                                <InputWithSlider label="Govt Profit Oil Split" value={profitOilSplit} onChange={setProfitOilSplit} min={0.3} max={0.80} step={0.01} />
                                <InputWithSlider label="GOR (scf/stb)" value={gor} onChange={setGor} min={100} max={10000} step={100} />
                                <InputWithSlider label="Base Water Cut" value={baseWC} onChange={setBaseWC} min={0} max={0.5} step={0.01} />
                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" checked={isConcession} onChange={e => setIsConcession(e.target.checked)}
                                        className="rounded border-white/20 bg-black/40" />
                                    <span className="text-[10px] text-slate-400 font-mono uppercase">Concession (not PSC)</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== MONTE CARLO ==================== */}
                {activeTab === 'montecarlo' && (
                    <motion.div key="montecarlo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <MetricCard label="NPV Mean" value={formatMM(mcResult.npvMean)} accent="cyan" />
                            <MetricCard label="NPV P10" value={formatMM(mcResult.npvP10)} accent="rose" />
                            <MetricCard label="NPV P50" value={formatMM(mcResult.npvP50)} accent="emerald" />
                            <MetricCard label="NPV P90" value={formatMM(mcResult.npvP90)} accent="amber" />
                            <MetricCard label="P(NPV>0)" value={`${mcResult.probabilityNpvPositive.toFixed(1)}%`} accent={mcResult.probabilityNpvPositive > 50 ? 'emerald' : 'rose'} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02]">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">NPV Histogram ({mcIterations} iterations)</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={mcHistogram}>
                                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                                        <XAxis dataKey="binStart" tick={{ fill: '#64748b', fontSize: 9 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
                                        <Bar dataKey="count" fill="#06b6d4" opacity={0.7} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02]">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">Monte Carlo Settings</h3>
                                <InputWithSlider label="Iterations" value={mcIterations} onChange={setMcIterations} min={100} max={5000} step={100} />
                                <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Input Distributions</p>
                                    {[
                                        { name: 'Oil Price', dist: 'Lognormal', param: `μ=${oilPrice}, σ=${(oilPrice * 0.3).toFixed(1)}` },
                                        { name: 'CAPEX', dist: 'Triangular', param: 'min=0.8x, mode=1.0x, max=1.4x' },
                                        { name: 'OPEX', dist: 'Triangular', param: 'min=0.85x, mode=1.0x, max=1.25x' },
                                        { name: 'Reserves', dist: 'Normal', param: 'μ=1.0x, σ=0.15x' },
                                        { name: 'Production Rate', dist: 'Normal', param: 'μ=1.0x, σ=0.10x' },
                                    ].map(d => (
                                        <div key={d.name} className="flex justify-between text-[10px] font-mono">
                                            <span className="text-slate-300">{d.name}</span>
                                            <span className="text-cyan-400">{d.dist}</span>
                                            <span className="text-slate-500">{d.param}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== TORNADO ==================== */}
                {activeTab === 'tornado' && (
                    <motion.div key="tornado" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02]">
                            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <ArrowUpDown size={16} className="text-amber-400" /> Tornado Chart — Sensitivity to NPV @ 10%
                            </h3>
                            <p className="text-[10px] text-slate-500 mb-6">Base NPV: {formatMM(cashFlow.npvAt10)}. Parameters sorted by impact on NPV.</p>
                            <div className="space-y-2">
                                {tornadoChart.map((t, i) => {
                                    const baseNpv = cashFlow.npvAt10;
                                    const minVal = Math.min(t.low, t.high, baseNpv);
                                    const maxVal = Math.max(t.low, t.high, baseNpv);
                                    const range = maxVal - minVal || 1;
                                    const pctLow = ((t.low - minVal) / range) * 100;
                                    const pctHigh = ((t.high - minVal) / range) * 100;
                                    return (
                                        <div key={t.parameter} className="flex items-center gap-4">
                                            <span className="text-[10px] text-slate-400 font-mono uppercase w-24 text-right">{t.parameter}</span>
                                            <span className="text-[10px] text-rose-400 font-mono w-20 text-right">{formatMM(t.low)}</span>
                                            <div className="flex-1 h-5 relative bg-white/[0.03] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pctHigh - pctLow}%`, left: `${pctLow}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                                    className="absolute h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[10px] text-white font-black mix-blend-difference">Δ{formatMM(Math.abs(t.range))}</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-emerald-400 font-mono w-20 text-left">{formatMM(t.high)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== FID DECISION ==================== */}
                {activeTab === 'decision' && (
                    <motion.div key="decision" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        {/* FID Recommendation Banner */}
                        <div className={cn(
                            "glass-card rounded-3xl p-8 border-2 bg-white/[0.02] text-center",
                            fidRecommendation.color === 'emerald' ? 'border-emerald-500/30' : fidRecommendation.color === 'amber' ? 'border-amber-500/30' : 'border-rose-500/30'
                        )}>
                            <fidRecommendation.icon size={48} className={cn(
                                "mx-auto mb-4",
                                fidRecommendation.color === 'emerald' ? 'text-emerald-400' : fidRecommendation.color === 'amber' ? 'text-amber-400' : 'text-rose-400'
                            )} />
                            <h2 className={cn(
                                "text-3xl font-black uppercase tracking-widest",
                                fidRecommendation.color === 'emerald' ? 'text-emerald-400' : fidRecommendation.color === 'amber' ? 'text-amber-400' : 'text-rose-400'
                            )}>{fidRecommendation.decision}</h2>
                            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">{fidRecommendation.desc}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Decision Criteria Summary */}
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-4">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Decision Gate Checklist</h3>
                                {[
                                    { label: 'NPV @ 10% > 0', value: cashFlow.npvAt10 > 0, metric: formatMM(cashFlow.npvAt10) },
                                    { label: 'IRR > 12% Hurdle', value: cashFlow.irr > 12, metric: formatPct(cashFlow.irr) },
                                    { label: 'Payback < 8 Years', value: cashFlow.paybackYears > 0 && cashFlow.paybackYears < 8, metric: cashFlow.paybackYears > 0 ? `${cashFlow.paybackYears} yrs` : 'N/A' },
                                    { label: 'P(NPV>0) > 70%', value: mcResult.probabilityNpvPositive > 70, metric: `${mcResult.probabilityNpvPositive.toFixed(1)}%` },
                                    { label: 'Profitability Index > 1.0', value: cashFlow.profitabilityIndex > 1.0, metric: cashFlow.profitabilityIndex.toFixed(2) },
                                    { label: 'Max Exposure < 2x NPV', value: cashFlow.maximumExposureMM < Math.abs(cashFlow.npvAt10) * 2, metric: formatMM(cashFlow.maximumExposureMM) },
                                ].map((c, i) => (
                                    <div key={c.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <span className="text-[11px] text-slate-400 font-mono">{c.label}</span>
                                        <span className="text-[11px] text-slate-500 font-mono mr-3">{c.metric}</span>
                                        {c.value
                                            ? <CheckCircle2 size={18} className="text-emerald-400" />
                                            : <XCircle size={18} className="text-rose-400" />}
                                    </div>
                                ))}
                            </div>

                            {/* Development Concept Summary */}
                            <div className="glass-card rounded-3xl p-6 border-white/5 bg-white/[0.02] space-y-4">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Development Concept Summary</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <MetricCard label="Facility" value={facilityType.replace(/_/g, ' ').toUpperCase()} accent="cyan" />
                                    <MetricCard label="Wells" value={wellCounts.totalWells.toString()} accent="amber" />
                                    <MetricCard label="Peak Rate" value={`${Math.round(plateauBopd).toLocaleString()} bopd`} accent="emerald" />
                                    <MetricCard label="Field Life" value={`${prodProfile.fieldLifeYears} yrs`} accent="violet" />
                                    <MetricCard label="CAPEX" value={formatMM(capexResult.totalCAPEXMM)} accent="rose" />
                                    <MetricCard label="OPEX/bbl" value={`$${8}/bbl`} accent="slate" />
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 mt-4">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Next Steps</p>
                                    <ul className="text-[10px] text-slate-500 space-y-1 font-mono">
                                        <li>1. Submit Field Development Plan (FDP) to regulatory authority</li>
                                        <li>2. Front-End Engineering Design (FEED) — detailed engineering</li>
                                        <li>3. Long-lead equipment procurement</li>
                                        <li>4. Final investment decision (FID) milestone</li>
                                        <li>5. Drilling campaign mobilization</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}