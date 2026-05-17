import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Factory, Droplets, Wind, Waves, Zap, Shield, Flame, Gauge, Thermometer, Wrench } from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import {
    designSlugCatcher, designHorizontalSeparator, designHeaterTreater, designDesalter,
    designCrudeStabilizer, optimizeMultiStageSeparation, designGasCompression,
    designAmineTreater, designGlycolDehydrator, designNGLRecovery, designSulfurRecovery,
    designWaterTreatment, designWaterInjection, designPowerSystem, designFlareSystem,
    designSIL, designESDSystem, designFandGSystem,
    SlugCatcherDesign, SeparatorDesign, HeaterTreaterDesign, ElectrostaticDesalterDesign,
    StabilizerDesign, AmineTreaterDesign, GlycolDehydratorDesign, NGLRecoveryDesign,
    SulfurRecoveryDesign, WaterTreatmentDesign, WaterInjectionDesign,
    PowerSystemDesign, FlareSystemDesign, SILDesign, ESDSystemDesign, FandGDesign,
    ManifoldParams, SeparatorFeed
} from '../../lib/surface-processing';

const subSteps = [
    { id: '4_4' as const, label: '4.4 Manifold & Slug Catcher', icon: Factory, desc: 'Production manifold header sizing, slug catcher volume & finger design' },
    { id: '4_5' as const, label: '4.5 Primary Separation', icon: Waves, desc: '3-Phase horizontal separator Souders-Brown + Stokes Law design' },
    { id: '4_6' as const, label: '4.6 Crude Oil Treatment', icon: Droplets, desc: 'Heater treater, electrostatic desalter, crude stabilizer column' },
    { id: '4_7' as const, label: '4.7 Gas Processing', icon: Wind, desc: 'Compression stages, amine sweetening, TEG dehydration, NGL recovery, Claus SRU' },
    { id: '4_8' as const, label: '4.8 Produced Water', icon: Waves, desc: 'Hydrocyclone, IGF, filtration, injection pump & well design' },
    { id: '4_9' as const, label: '4.9 Utilities & Power', icon: Zap, desc: 'Power generation, flare system API 521 thermal radiation' },
    { id: '4_10' as const, label: '4.10 Safety & Control', icon: Shield, desc: 'SIL IEC 61511, ESD levels, Fire & Gas detection, firewater' },
] as const;

type SubStep = typeof subSteps[number]['id'];

export function SurfaceProcessingModule() {
    const [step, setStep] = useState<SubStep>('4_4');

    // ===== 4.4 State =====
    const [wellCount, setWellCount] = useState(12);
    const [totalOil, setTotalOil] = useState(50000);
    const [totalGas, setTotalGas] = useState(45);
    const [totalWater, setTotalWater] = useState(35000);
    const [headerP, setHeaderP] = useState(150);
    const [headerT, setHeaderT] = useState(140);
    const [pipeDia, setPipeDia] = useState(24);
    const [pipeLen, setPipeLen] = useState(4200);
    const [slugFactor, setSlugFactor] = useState(2.2);
    const [pigVol, setPigVol] = useState(180);
    const [rampFrac, setRampFrac] = useState(0.65);

    // ===== 4.5 State =====
    const [sepOilRate, setSepOilRate] = useState(50000);
    const [sepGasRate, setSepGasRate] = useState(45);
    const [sepWaterRate, setSepWaterRate] = useState(35000);
    const [sepAPI, setSepAPI] = useState(35);
    const [sepGasSG, setSepGasSG] = useState(0.67);
    const [sepWaterSG, setSepWaterSG] = useState(1.03);
    const [sepTemp, setSepTemp] = useState(120);
    const [sepOpPres, setSepOpPres] = useState(150);
    const [sepZ, setSepZ] = useState(0.92);
    const [sepOilVis, setSepOilVis] = useState(3.5);
    const [sepDropSize, setSepDropSize] = useState(500);
    const [sepK, setSepK] = useState(0.45);
    const [sepRetTime, setSepRetTime] = useState(5);
    const [sepLD, setSepLD] = useState(4);

    // ===== 4.6 State =====
    const [crudeOilRate, setCrudeOilRate] = useState(45000);
    const [crudeWaterRate, setCrudeWaterRate] = useState(8000);
    const [crudeInletTemp, setCrudeInletTemp] = useState(90);
    const [crudeTargetTemp, setCrudeTargetTemp] = useState(160);
    const [crudeAPI, setCrudeAPI] = useState(35);
    const [emulsionStab, setEmulsionStab] = useState<'loose' | 'medium' | 'tight'>('medium');
    const [saltInlet, setSaltInlet] = useState(200);
    const [saltTarget, setSaltTarget] = useState(10);
    const [desalterTemp, setDesalterTemp] = useState(180);
    const [gridType, setGridType] = useState<'composite' | 'AC' | 'AC/DC'>('composite');
    const [rvpIn, setRvpIn] = useState(28);
    const [rvpOut, setRvpOut] = useState(10);
    const [stabAPI, setStabAPI] = useState(35);

    // ===== 4.7 State =====
    const [compSucP, setCompSucP] = useState(50);
    const [compDischP, setCompDischP] = useState(1200);
    const [compGasRate, setCompGasRate] = useState(30);
    const [compGasSG, setCompGasSG] = useState(0.65);
    const [compSucTemp, setCompSucTemp] = useState(120);
    const [compK, setCompK] = useState(1.3);
    const [amineGasRate, setAmineGasRate] = useState(25);
    const [h2sIn, setH2sIn] = useState(3.5);
    const [co2In, setCo2In] = useState(2.0);
    const [aminePres, setAminePres] = useState(800);
    const [amineType, setAmineType] = useState<'MDEA' | 'MEA' | 'DEA' | 'formulatedMDEA'>('MDEA');
    const [glycolGasRate, setGlycolGasRate] = useState(20);
    const [waterContentIn, setWaterContentIn] = useState(35);
    const [glycolPres, setGlycolPres] = useState(600);
    const [glycolTemp, setGlycolTemp] = useState(110);
    const [nglGasRate, setNglGasRate] = useState(15);
    const [c2Content, setC2Content] = useState(8);
    const [c3Content, setC3Content] = useState(4);
    const [c4Content, setC4Content] = useState(2);
    const [c5PlusContent, setC5PlusContent] = useState(1);
    const [nglMethod, setNglMethod] = useState<'cryogenic' | 'refrigeration' | 'leanOil'>('cryogenic');
    const [c2RecoveryTarget, setC2RecoveryTarget] = useState(92);
    const [h2sToSRU, setH2sToSRU] = useState(8);
    const [clausStages, setClausStages] = useState<2 | 3>(2);
    const [withTGTU, setWithTGTU] = useState(true);

    // ===== 4.8 State =====
    const [waterRate, setWaterRate] = useState(25000);
    const [oiwIn, setOiwIn] = useState(500);
    const [oiwTarget, setOiwTarget] = useState(25);
    const [pwDest, setPwDest] = useState<'overboard' | 'injection' | 'disposal'>('overboard');
    const [injRate, setInjRate] = useState(20000);
    const [resPres, setResPres] = useState(3500);
    const [injIndex, setInjIndex] = useState(5);
    const [injDepth, setInjDepth] = useState(8500);
    const [fricGrad, setFricGrad] = useState(5);

    // ===== 4.9 State =====
    const [connectedLoad, setConnectedLoad] = useState(25000);
    const [heatingDemand, setHeatingDemand] = useState(40);
    const [hasGasSupply, setHasGasSupply] = useState(true);
    const [gasSupplyRate, setGasSupplyRate] = useState(5);
    const [gridAvailable, setGridAvailable] = useState(false);
    const [reliability, setReliability] = useState<'N' | 'N+1' | '2N'>('N+1');
    const [flareRate, setFlareRate] = useState(60);
    const [gasMW, setGasMW] = useState(18);
    const [flareTemp, setFlareTemp] = useState(150);
    const [radLimit, setRadLimit] = useState(1600);
    const [flareHHV, setFlareHHV] = useState(1000);

    // ===== 4.10 State =====
    const [processRisk, setProcessRisk] = useState<'high' | 'low' | 'medium' | 'extreme'>('high');
    const [proofTestInterval, setProofTestInterval] = useState(12);
    const [sensorArch, setSensorArch] = useState<'2oo3' | '1oo1' | '1oo2' | '1oo3'>('2oo3');
    const [finalArch, setFinalArch] = useState<'2oo3' | '1oo1' | '1oo2'>('1oo2');
    const [processUnitCount, setProcessUnitCount] = useState(4);
    const [vesselCount, setVesselCount] = useState(15);
    const [gasInventory, setGasInventory] = useState(75);
    const [metalTemp, setMetalTemp] = useState(-20);
    const [plotArea, setPlotArea] = useState(250000);
    const [processFrac, setProcessFrac] = useState(0.45);
    const [h2sPresent, setH2sPresent] = useState(true);
    const [fireproofArea, setFireproofArea] = useState(15000);

    // ============ CALCULATIONS ============
    const slugCatcher = useMemo(() => designSlugCatcher({
        wellCount, totalOilRate: totalOil, totalGasRate: totalGas, totalWaterRate: totalWater,
        headerPressure: headerP, temperature: headerT, pipeDiameter: pipeDia, pipeLength: pipeLen,
        slugFactor, piggingVolume: pigVol, rampUpSlugFraction: rampFrac
    }), [wellCount, totalOil, totalGas, totalWater, headerP, headerT, pipeDia, pipeLen, slugFactor, pigVol, rampFrac]);

    const separator = useMemo(() => designHorizontalSeparator({
        oilRate: sepOilRate, gasRate: sepGasRate, waterRate: sepWaterRate,
        oilDensity: sepAPI, gasSG: sepGasSG, waterSG: sepWaterSG,
        temperature: sepTemp, operatingPressure: sepOpPres, zFactor: sepZ,
        oilViscosity: sepOilVis, waterDropletSize: sepDropSize,
        kFactor: sepK, retentionTimeMinutes: sepRetTime, lD: sepLD
    }), [sepOilRate, sepGasRate, sepWaterRate, sepAPI, sepGasSG, sepWaterSG, sepTemp, sepOpPres, sepZ, sepOilVis, sepDropSize, sepK, sepRetTime, sepLD]);

    const multiStageSep = useMemo(() => optimizeMultiStageSeparation(
        { oilRate: sepOilRate, gasRate: sepGasRate, waterRate: sepWaterRate, oilDensity: sepAPI, gasSG: sepGasSG, waterSG: sepWaterSG, temperature: sepTemp, operatingPressure: sepOpPres, zFactor: sepZ, oilViscosity: sepOilVis, waterDropletSize: sepDropSize }, 3
    ), [sepOilRate, sepGasRate, sepWaterRate, sepAPI, sepGasSG, sepWaterSG, sepTemp, sepOpPres, sepZ]);

    const heaterTreater = useMemo(() => designHeaterTreater({
        oilRate: crudeOilRate, waterRate: crudeWaterRate,
        inletTemp: crudeInletTemp, targetTemp: crudeTargetTemp,
        apiGravity: crudeAPI, emulsionStability: emulsionStab
    }), [crudeOilRate, crudeWaterRate, crudeInletTemp, crudeTargetTemp, crudeAPI, emulsionStab]);

    const desalter = useMemo(() => designDesalter({
        oilRate: crudeOilRate, saltInlet, targetSalt: saltTarget,
        operatingTemp: desalterTemp, gridType
    }), [crudeOilRate, saltInlet, saltTarget, desalterTemp, gridType]);

    const stabilizer = useMemo(() => designCrudeStabilizer({
        oilRate: crudeOilRate, rvpInlet: rvpIn, rvpTarget: rvpOut,
        apiGravity: stabAPI, temperature: crudeTargetTemp
    }), [crudeOilRate, rvpIn, rvpOut, stabAPI, crudeTargetTemp]);

    const compression = useMemo(() => designGasCompression({
        suctionPressure: compSucP, dischargePressure: compDischP,
        gasRate: compGasRate, gasSG: compGasSG, suctionTemp: compSucTemp, k: compK
    }), [compSucP, compDischP, compGasRate, compGasSG, compSucTemp, compK]);

    const amine = useMemo(() => designAmineTreater({
        gasRate: amineGasRate, h2sInlet: h2sIn, co2Inlet: co2In,
        operatingPressure: aminePres, amineType, targetH2S: 4, targetCO2: 1
    }), [amineGasRate, h2sIn, co2In, aminePres, amineType]);

    const glycol = useMemo(() => designGlycolDehydrator({
        gasRate: glycolGasRate, waterContentInlet: waterContentIn,
        operatingPressure: glycolPres, temperature: glycolTemp, targetWaterContent: 7
    }), [glycolGasRate, waterContentIn, glycolPres, glycolTemp]);

    const ngl = useMemo(() => designNGLRecovery({
        gasRate: nglGasRate, c2Content, c3Content, c4Content, c5PlusContent,
        method: nglMethod, ethaneRecoveryTarget: c2RecoveryTarget
    }), [nglGasRate, c2Content, c3Content, c4Content, c5PlusContent, nglMethod, c2RecoveryTarget]);

    const claus = useMemo(() => designSulfurRecovery({
        h2sRate: h2sToSRU, clausStages, withTGTU
    }), [h2sToSRU, clausStages, withTGTU]);

    const waterTreat = useMemo(() => designWaterTreatment({
        waterRate, oilInWaterInlet: oiwIn, targetOIW: oiwTarget, destination: pwDest
    }), [waterRate, oiwIn, oiwTarget, pwDest]);

    const waterInj = useMemo(() => designWaterInjection({
        injectionRate: injRate, reservoirPressure: resPres, injectivityIndex: injIndex,
        wellheadElevation: 0, depth: injDepth, frictionGradient: fricGrad
    }), [injRate, resPres, injIndex, injDepth, fricGrad]);

    const powerSystem = useMemo(() => designPowerSystem({
        totalConnectedLoad: connectedLoad, processHeatingDemand: heatingDemand,
        hasGasSupply, gasSupplyRate, gridAvailable, reliability
    }), [connectedLoad, heatingDemand, hasGasSupply, gasSupplyRate, gridAvailable, reliability]);

    const flare = useMemo(() => designFlareSystem({
        emergencyReliefRate: flareRate, gasMW, gasTemperature: flareTemp,
        windSpeed: 20, radiationLimit: radLimit, flareGasHHV: flareHHV
    }), [flareRate, gasMW, flareTemp, radLimit, flareHHV]);

    const sil = useMemo(() => designSIL({
        processRisk, testIntervalMonths: proofTestInterval,
        sensorArchitecture: sensorArch, finalElementArchitecture: finalArch
    }), [processRisk, proofTestInterval, sensorArch, finalArch]);

    const esd = useMemo(() => designESDSystem({
        processUnitCount, vesselCount, totalGasInventory: gasInventory,
        minDesignMetalTemp: metalTemp,
        gasComposition: { methane: 85, ethane: 8, propane: 4 }
    }), [processUnitCount, vesselCount, gasInventory, metalTemp]);

    const fandg = useMemo(() => designFandGSystem({
        plotArea, processAreaFraction: processFrac, h2sPresent, passiveFireproofingArea: fireproofArea
    }), [plotArea, processFrac, h2sPresent, fireproofArea]);

    const ActiveIcon = subSteps.find(s => s.id === step)?.icon || Factory;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                    <Factory className="text-emerald-500" size={32} />
                    Phase 4: Surface Processing <span className="text-emerald-500/50">Industrial-Grade Design</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Facilities Engineering — Sub-Steps 4.4–4.10</p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 flex-wrap gap-1">
                {subSteps.map(s => (
                    <button key={s.id} onClick={() => setStep(s.id)}
                        className={cn("px-4 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[11px] font-black uppercase tracking-widest",
                            step === s.id ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-white")}>
                        <s.icon size={12} />{s.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* === LEFT: Controls === */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-5">
                                <h3 className="text-xl font-black text-white italic flex items-center gap-2">
                                    <ActiveIcon size={20} className="text-emerald-400" />
                                    Design Parameters
                                </h3>

                                {/* ===== 4.4 Controls ===== */}
                                {step === '4_4' && <>
                                    <InputWithSlider label="Well Count" value={wellCount} min={1} max={50} step={1} onChange={setWellCount} />
                                    <InputWithSlider label="Total Oil Rate (STB/D)" value={totalOil} min={1000} max={200000} step={1000} unit="STB/D" onChange={setTotalOil} />
                                    <InputWithSlider label="Total Gas Rate (MMscf/D)" value={totalGas} min={1} max={200} step={1} unit="MMscf/D" onChange={setTotalGas} />
                                    <InputWithSlider label="Total Water Rate (BWPD)" value={totalWater} min={0} max={200000} step={1000} unit="BWPD" onChange={setTotalWater} />
                                    <InputWithSlider label="Header Pressure (psig)" value={headerP} min={25} max={1500} step={10} unit="psig" onChange={setHeaderP} />
                                    <InputWithSlider label="Temperature (°F)" value={headerT} min={50} max={300} step={5} unit="°F" onChange={setHeaderT} />
                                    <InputWithSlider label="Pipe Diameter (in)" value={pipeDia} min={4} max={48} step={1} unit="in" onChange={setPipeDia} />
                                    <InputWithSlider label="Pipe Length (ft)" value={pipeLen} min={500} max={20000} step={100} unit="ft" onChange={setPipeLen} />
                                    <InputWithSlider label="Slug Factor" value={slugFactor} min={1.0} max={3.5} step={0.1} onChange={setSlugFactor} />
                                    <InputWithSlider label="Pigging Volume (bbl)" value={pigVol} min={50} max={500} step={10} unit="bbl" onChange={setPigVol} />
                                    <InputWithSlider label="Ramp-Up Slug Fraction" value={rampFrac} min={0.3} max={0.9} step={0.05} onChange={setRampFrac} />
                                </>}

                                {/* ===== 4.5 Controls ===== */}
                                {step === '4_5' && <>
                                    <InputWithSlider label="Oil Rate (STB/D)" value={sepOilRate} min={1000} max={200000} step={1000} unit="STB/D" onChange={setSepOilRate} />
                                    <InputWithSlider label="Gas Rate (MMscf/D)" value={sepGasRate} min={1} max={200} step={1} unit="MMscf/D" onChange={setSepGasRate} />
                                    <InputWithSlider label="Water Rate (BWPD)" value={sepWaterRate} min={0} max={200000} step={1000} unit="BWPD" onChange={setSepWaterRate} />
                                    <InputWithSlider label="°API Gravity" value={sepAPI} min={10} max={60} step={1} unit="°API" onChange={setSepAPI} />
                                    <InputWithSlider label="Gas SG" value={sepGasSG} min={0.55} max={1.0} step={0.01} onChange={setSepGasSG} />
                                    <InputWithSlider label="Water SG" value={sepWaterSG} min={1.0} max={1.2} step={0.01} onChange={setSepWaterSG} />
                                    <InputWithSlider label="Temp (°F)" value={sepTemp} min={60} max={300} step={5} unit="°F" onChange={setSepTemp} />
                                    <InputWithSlider label="Operating Pres (psig)" value={sepOpPres} min={25} max={1500} step={10} unit="psig" onChange={setSepOpPres} />
                                    <InputWithSlider label="Oil Viscosity (cP)" value={sepOilVis} min={0.5} max={50} step={0.5} unit="cP" onChange={setSepOilVis} />
                                    <InputWithSlider label="Drop Size (μm)" value={sepDropSize} min={50} max={1000} step={50} unit="μm" onChange={setSepDropSize} />
                                    <InputWithSlider label="K Factor" value={sepK} min={0.15} max={0.55} step={0.05} onChange={setSepK} />
                                    <InputWithSlider label="Retention Time (min)" value={sepRetTime} min={1} max={15} step={0.5} unit="min" onChange={setSepRetTime} />
                                </>}

                                {/* ===== 4.6 Controls ===== */}
                                {step === '4_6' && <>
                                    <InputWithSlider label="Oil Rate (STB/D)" value={crudeOilRate} min={1000} max={200000} step={1000} unit="STB/D" onChange={setCrudeOilRate} />
                                    <InputWithSlider label="Water Rate (BWPD)" value={crudeWaterRate} min={0} max={100000} step={500} unit="BWPD" onChange={setCrudeWaterRate} />
                                    <InputWithSlider label="Inlet Temp (°F)" value={crudeInletTemp} min={60} max={200} step={5} unit="°F" onChange={setCrudeInletTemp} />
                                    <InputWithSlider label="Target Temp (°F)" value={crudeTargetTemp} min={100} max={300} step={5} unit="°F" onChange={setCrudeTargetTemp} />
                                    <InputWithSlider label="°API Gravity" value={crudeAPI} min={10} max={60} step={1} onChange={setCrudeAPI} />
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Emulsion Stability</label>
                                        <div className="flex gap-1">
                                            {(['loose', 'medium', 'tight'] as const).map(e => (
                                                <button key={e} onClick={() => setEmulsionStab(e)}
                                                    className={cn("px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all",
                                                        emulsionStab === e ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-500")}>{e}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <InputWithSlider label="Salt Inlet (PTB)" value={saltInlet} min={10} max={500} step={10} unit="PTB" onChange={setSaltInlet} />
                                    <InputWithSlider label="Target Salt (PTB)" value={saltTarget} min={1} max={50} step={1} unit="PTB" onChange={setSaltTarget} />
                                    <InputWithSlider label="Desalter Temp (°F)" value={desalterTemp} min={120} max={300} step={5} unit="°F" onChange={setDesalterTemp} />
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Desalter Grid Type</label>
                                        <div className="flex gap-1">
                                            {(['AC', 'AC/DC', 'composite'] as const).map(g => (
                                                <button key={g} onClick={() => setGridType(g)}
                                                    className={cn("px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all",
                                                        gridType === g ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-500")}>{g}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <InputWithSlider label="RVP Inlet (psi)" value={rvpIn} min={5} max={40} step={1} unit="psi" onChange={setRvpIn} />
                                    <InputWithSlider label="RVP Target (psi)" value={rvpOut} min={2} max={15} step={1} unit="psi" onChange={setRvpOut} />
                                </>}

                                {/* ===== 4.7 Controls ===== */}
                                {step === '4_7' && <>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2">Compression</p>
                                        <div className="space-y-3">
                                            <InputWithSlider label="Suction (psig)" value={compSucP} min={5} max={400} step={5} unit="psig" onChange={setCompSucP} />
                                            <InputWithSlider label="Discharge (psig)" value={compDischP} min={100} max={3000} step={50} unit="psig" onChange={setCompDischP} />
                                            <InputWithSlider label="Gas Rate (MMscf/D)" value={compGasRate} min={1} max={200} step={1} unit="MMscf/D" onChange={setCompGasRate} />
                                            <InputWithSlider label="Cp/Cv" value={compK} min={1.1} max={1.5} step={0.05} onChange={setCompK} />
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2">Amine Sweetening</p>
                                        <InputWithSlider label="Gas Rate (MMscf/D)" value={amineGasRate} min={1} max={200} step={1} onChange={setAmineGasRate} />
                                        <InputWithSlider label="H₂S Inlet (mol%)" value={h2sIn} min={0.1} max={15} step={0.5} unit="mol%" onChange={setH2sIn} />
                                        <InputWithSlider label="Pressure (psig)" value={aminePres} min={100} max={1500} step={50} unit="psig" onChange={setAminePres} />
                                        <select value={amineType} onChange={e => setAmineType(e.target.value as any)}
                                            className="w-full mt-2 bg-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 border border-white/10">{['MDEA', 'MEA', 'DEA', 'formulatedMDEA'].map(a => <option key={a} value={a}>{a}</option>)}</select>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2">Glycol Dehydration</p>
                                        <InputWithSlider label="Gas Rate (MMscf/D)" value={glycolGasRate} min={1} max={200} step={1} onChange={setGlycolGasRate} />
                                        <InputWithSlider label="H₂O Content (lb/MMscf)" value={waterContentIn} min={5} max={100} step={1} unit="lb/MMscf" onChange={setWaterContentIn} />
                                        <InputWithSlider label="Pressure (psig)" value={glycolPres} min={100} max={1500} step={50} unit="psig" onChange={setGlycolPres} />
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2">NGL Recovery</p>
                                        <InputWithSlider label="Gas Rate (MMscf/D)" value={nglGasRate} min={1} max={200} step={1} onChange={setNglGasRate} />
                                        <div className="flex gap-1 mt-1">
                                            {(['cryogenic', 'refrigeration', 'leanOil'] as const).map(m => (
                                                <button key={m} onClick={() => setNglMethod(m)}
                                                    className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase", nglMethod === m ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-500")}>{m}</button>
                                            ))}
                                        </div>
                                        <InputWithSlider label="C2 Recovery Target (%)" value={c2RecoveryTarget} min={60} max={98} step={1} unit="%" onChange={setC2RecoveryTarget} />
                                        <div className="grid grid-cols-4 gap-1 mt-2">
                                            {[
                                                { label: 'C2%', v: c2Content, set: setC2Content },
                                                { label: 'C3%', v: c3Content, set: setC3Content },
                                                { label: 'C4%', v: c4Content, set: setC4Content },
                                                { label: 'C5+%', v: c5PlusContent, set: setC5PlusContent }
                                            ].map(({ label, v, set }) => (
                                                <div key={label} className="text-center">
                                                    <input type="number" value={v} onChange={e => set(Number(e.target.value))}
                                                        className="w-full bg-white/5 rounded-lg text-center px-1 py-1 text-[11px] text-emerald-400 border border-white/10" />
                                                    <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest mb-2">Claus SRU</p>
                                        <InputWithSlider label="H₂S to SRU (lbmol/hr)" value={h2sToSRU} min={1} max={50} step={1} onChange={setH2sToSRU} />
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => setClausStages(2)} className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase", clausStages === 2 ? "bg-orange-500 text-black" : "bg-white/5 text-slate-500")}>2-Stage</button>
                                            <button onClick={() => setClausStages(3)} className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase", clausStages === 3 ? "bg-orange-500 text-black" : "bg-white/5 text-slate-500")}>3-Stage</button>
                                            <button onClick={() => setWithTGTU(!withTGTU)} className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase", withTGTU ? "bg-orange-500 text-black" : "bg-white/5 text-slate-500")}>TGTU: {withTGTU ? 'ON' : 'OFF'}</button>
                                        </div>
                                    </div>
                                </>}

                                {/* ===== 4.8 Controls ===== */}
                                {step === '4_8' && <>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2">Water Treatment</p>
                                        <InputWithSlider label="Water Rate (BWPD)" value={waterRate} min={1000} max={200000} step={1000} unit="BWPD" onChange={setWaterRate} />
                                        <InputWithSlider label="OIW Inlet (mg/L)" value={oiwIn} min={10} max={2000} step={10} unit="mg/L" onChange={setOiwIn} />
                                        <InputWithSlider label="Target OIW (mg/L)" value={oiwTarget} min={5} max={50} step={5} unit="mg/L" onChange={setOiwTarget} />
                                        <div className="flex gap-1 mt-1">
                                            {(['overboard', 'injection', 'disposal'] as const).map(d => (
                                                <button key={d} onClick={() => setPwDest(d)}
                                                    className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase", pwDest === d ? "bg-blue-500 text-black" : "bg-white/5 text-slate-500")}>{d}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2">Water Injection</p>
                                        <InputWithSlider label="Injection Rate (BWPD)" value={injRate} min={500} max={100000} step={500} unit="BWPD" onChange={setInjRate} />
                                        <InputWithSlider label="Reservoir Pres (psig)" value={resPres} min={500} max={8000} step={100} unit="psig" onChange={setResPres} />
                                        <InputWithSlider label="Injectivity (BWPD/psi)" value={injIndex} min={1} max={50} step={1} onChange={setInjIndex} />
                                        <InputWithSlider label="Depth (ft TVD)" value={injDepth} min={1000} max={15000} step={100} unit="ft" onChange={setInjDepth} />
                                    </div>
                                </>}

                                {/* ===== 4.9 Controls ===== */}
                                {step === '4_9' && <>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-2">Power Generation</p>
                                        <InputWithSlider label="Connected Load (kW)" value={connectedLoad} min={500} max={100000} step={500} unit="kW" onChange={setConnectedLoad} />
                                        <InputWithSlider label="Heating Demand (MMBtu/hr)" value={heatingDemand} min={0} max={200} step={5} unit="MMBtu" onChange={setHeatingDemand} />
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => setHasGasSupply(!hasGasSupply)} className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase", hasGasSupply ? "bg-amber-500 text-black" : "bg-white/5 text-slate-500")}>Gas: {hasGasSupply ? 'ON' : 'OFF'}</button>
                                            <button onClick={() => setGridAvailable(!gridAvailable)} className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase", gridAvailable ? "bg-amber-500 text-black" : "bg-white/5 text-slate-500")}>Grid: {gridAvailable ? 'ON' : 'OFF'}</button>
                                        </div>
                                        <div className="flex gap-1 mt-1">
                                            {(['N', 'N+1', '2N'] as const).map(r => (
                                                <button key={r} onClick={() => setReliability(r)}
                                                    className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase", reliability === r ? "bg-amber-500 text-black" : "bg-white/5 text-slate-500")}>{r}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-2">Flare System (API 521)</p>
                                        <InputWithSlider label="Emergency Rate (MMscf/D)" value={flareRate} min={5} max={200} step={5} onChange={setFlareRate} />
                                        <InputWithSlider label="Gas MW" value={gasMW} min={16} max={44} step={1} onChange={setGasMW} />
                                        <InputWithSlider label="Flare Temp (°F)" value={flareTemp} min={100} max={500} step={10} onChange={setFlareTemp} />
                                        <InputWithSlider label="Radiation Limit (BTU/hr·ft²)" value={radLimit} min={500} max={3000} step={100} onChange={setRadLimit} />
                                    </div>
                                </>}

                                {/* ===== 4.10 Controls ===== */}
                                {step === '4_10' && <>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2">SIL Assessment</p>
                                        <select value={processRisk} onChange={e => setProcessRisk(e.target.value as any)}
                                            className="w-full bg-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 border border-white/10 mb-2">
                                            {['low', 'medium', 'high', 'extreme'].map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                        </select>
                                        <InputWithSlider label="Test Interval (months)" value={proofTestInterval} min={3} max={36} step={3} unit="mo" onChange={setProofTestInterval} />
                                        <div className="flex gap-1 mt-1">
                                            {(['1oo1', '1oo2', '2oo3', '1oo3'] as const).map(a => (
                                                <button key={a} onClick={() => setSensorArch(a)}
                                                    className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase", sensorArch === a ? "bg-rose-500 text-black" : "bg-white/5 text-slate-500")}>{a}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2">ESD System</p>
                                        <InputWithSlider label="Process Units" value={processUnitCount} min={1} max={10} step={1} onChange={setProcessUnitCount} />
                                        <InputWithSlider label="Vessels" value={vesselCount} min={2} max={50} step={1} onChange={setVesselCount} />
                                        <InputWithSlider label="Gas Inventory (MMscf)" value={gasInventory} min={5} max={200} step={5} onChange={setGasInventory} />
                                        <InputWithSlider label="Min Design Metal Temp (°F)" value={metalTemp} min={-50} max={50} step={5} unit="°F" onChange={setMetalTemp} />
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2">Fire & Gas</p>
                                        <InputWithSlider label="Plot Area (ft²)" value={plotArea} min={10000} max={1000000} step={5000} unit="ft²" onChange={setPlotArea} />
                                        <InputWithSlider label="Process Fraction" value={processFrac} min={0.1} max={0.9} step={0.05} onChange={setProcessFrac} />
                                        <button onClick={() => setH2sPresent(!h2sPresent)} className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase mt-1", h2sPresent ? "bg-rose-500 text-black" : "bg-white/5 text-slate-500")}>H₂S: {h2sPresent ? 'PRESENT' : 'NONE'}</button>
                                    </div>
                                </>}
                            </div>
                        </div>

                        {/* === RIGHT: Results === */}
                        <div className="lg:col-span-7 space-y-6">
                            {step === '4_4' && <SlugCatcherResults data={slugCatcher} />}
                            {step === '4_5' && <SeparatorResults data={separator} multiStage={multiStageSep} />}
                            {step === '4_6' && <CrudeOilResults ht={heaterTreater} des={desalter} stab={stabilizer} />}
                            {step === '4_7' && <GasProcessingResults comp={compression} amine={amine} glycol={glycol} ngl={ngl} claus={claus} />}
                            {step === '4_8' && <WaterResults wt={waterTreat} wi={waterInj} />}
                            {step === '4_9' && <UtilitiesResults power={powerSystem} flare={flare} />}
                            {step === '4_10' && <SafetyResults sil={sil} esd={esd} fandg={fandg} />}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ============ RESULT PANELS ============

function ResultCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: any }) {
    return (
        <div className="glass-card rounded-[24px] p-6 border-white/5 bg-[#05070a]">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                {Icon && <Icon size={14} className="text-emerald-400" />}
                {title}
            </h4>
            {children}
        </div>
    );
}

function MetricRow({ label, value, unit = '', highlight = false }: { label: string; value: string | number; unit?: string; highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</span>
            <span className={cn("text-xs font-black", highlight ? "text-emerald-400 text-lg" : "text-slate-300")}>{value}<span className="text-[10px] text-slate-600 ml-0.5">{unit}</span></span>
        </div>
    );
}

function SlugCatcherResults({ data }: { data: SlugCatcherDesign }) {
    return (
        <div className="space-y-4">
            <ResultCard title="Slug Catcher Design" icon={Droplets}>
                <MetricRow label="Type" value={data.vesselType.toUpperCase()} highlight />
                <MetricRow label="Required Volume" value={data.requiredVolume} unit="bbl" />
                <MetricRow label="Maximum Slug Size" value={data.liquidSurgeVolume} unit="bbl" highlight />
                <MetricRow label="Fingers" value={`${data.fingerCount} × ${data.fingerDiameter}" × ${data.fingerLength}'`} />
                <MetricRow label="Gas Capacity" value={data.gasCapacity} unit="MMscf/D" />
                <MetricRow label="Slug Frequency" value={`~${data.slugFrequency} per day`} />
                <MetricRow label="Liquid Drain Rate" value={data.liquidDrainRate} unit="bbl/hr" />
            </ResultCard>
            <div className="p-4 rounded-[20px] bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-2">Separator Feed Summary</p>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                        <p className="text-[10px] text-slate-600 uppercase">Total Liquid</p>
                        <p className="text-lg font-black text-emerald-400">{(data.liquidDrainRate * 24).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-600">BFPD</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-600 uppercase">Line Fill</p>
                        <p className="text-lg font-black text-emerald-400">{Math.round(data.liquidSurgeVolume * 0.6 * 10) / 10}</p>
                        <p className="text-[10px] text-slate-600">bbl fill</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-600 uppercase">Safety Margin</p>
                        <p className="text-lg font-black text-emerald-400">{Math.round((data.requiredVolume / data.liquidSurgeVolume - 1) * 100)}%</p>
                        <p className="text-[10px] text-slate-600">above slug</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SeparatorResults({ data, multiStage }: { data: SeparatorDesign; multiStage: any }) {
    return (
        <div className="space-y-4">
            <ResultCard title="3-Phase Horizontal Separator" icon={Waves}>
                <MetricRow label="Diameter" value={data.diameter} unit="in" highlight />
                <MetricRow label="S/S Length" value={data.seamToSeamLength} unit="ft" />
                <MetricRow label="Vessel Volume" value={data.vesselVolume} unit="bbl" />
                <MetricRow label="Gas Velocity" value={data.gasVelocity} unit="ft/s" />
                <MetricRow label="Critical Velocity (S-B)" value={data.criticalVelocity} unit="ft/s" highlight />
                <MetricRow label="Wall Thickness" value={data.wallThickness} unit="in ASME VIII" />
                <MetricRow label="Vessel Weight" value={data.vesselWeight} unit="tons" />
                <MetricRow label="Oil Pad Height" value={data.oilPadHeight} unit="in" />
                <MetricRow label="Water Pad Height" value={data.waterPadHeight} unit="in" />
                <MetricRow label="Gas Retention" value={data.gasRetentionTime} unit="sec" />
                <MetricRow label="Oil-in-Water Out" value={data.oilInWaterOut} unit="ppm" />
                <MetricRow label="BS&W Out" value={data.waterInOilOut} unit="%" />
                <div className="mt-2 p-2 rounded-xl bg-white/5">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Nozzle Schedule</p>
                    <div className="grid grid-cols-4 gap-1 text-center">
                        {Object.entries(data.nozzleSizes).map(([k, v]) => (
                            <div key={k}><p className="text-[10px] text-slate-600">{k}</p><p className="text-xs font-black text-emerald-400">{v}"</p></div>
                        ))}
                    </div>
                </div>
            </ResultCard>
            <ResultCard title="Multi-Stage Separation" icon={Wind}>
                {multiStage.stages.map((s: any, i: number) => (
                    <div key={i} className={cn("p-2 rounded-lg mb-1", i === 0 ? "bg-rose-500/10" : i === 1 ? "bg-amber-500/10" : "bg-emerald-500/10")}>
                        <div className="flex justify-between text-[10px] uppercase">
                            <span className="font-black text-slate-300">{i === 0 ? 'HP' : i === 1 ? 'IP' : 'LP'} Stage</span>
                            <span className="text-slate-500">{s.pressure} psig</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                            <span>{s.gasMMscfd} MMscf/D gas</span>
                            <span>GOR: {s.gor}</span>
                        </div>
                    </div>
                ))}
                <div className="flex justify-between text-[11px] mt-2">
                    <span className="text-slate-600">Stock Tank Oil: <span className="text-emerald-400 font-black">{multiStage.stockTankOil.toLocaleString()} STB/D</span></span>
                    <span className="text-slate-600">Shrinkage: <span className="text-amber-400 font-black">{multiStage.totalShrinkage}%</span></span>
                </div>
            </ResultCard>
        </div>
    );
}

function CrudeOilResults({ ht, des, stab }: { ht: HeaterTreaterDesign; des: ElectrostaticDesalterDesign; stab: StabilizerDesign }) {
    return (
        <div className="space-y-4">
            <ResultCard title="Heater Treater" icon={Thermometer}>
                <MetricRow label="Heat Duty" value={ht.heatDuty} unit="MMBtu/hr" highlight />
                <MetricRow label="Fire Tube Area" value={ht.fireTubeArea} unit="ft²" />
                <MetricRow label="Fuel Gas Rate" value={ht.fuelGasRate} unit="Mscf/D" />
                <MetricRow label="Outlet Temp" value={ht.outletTemperature} unit="°F" />
                <MetricRow label="Retention Time" value={ht.oilRetentionTime} unit="min" />
                <MetricRow label="BS&W Outlet" value={ht.bsAndWOutlet} unit="%" highlight />
                <MetricRow label="Vessel" value={`${ht.vesselDiameter}" × ${ht.vesselLength}'`} />
            </ResultCard>
            <ResultCard title="Electrostatic Desalter" icon={Zap}>
                <MetricRow label="Grid Voltage" value={des.gridVoltage.toLocaleString()} unit="V" />
                <MetricRow label="Grid Type" value={des.gridType.toUpperCase()} highlight />
                <MetricRow label="Wash Water" value={des.washWaterRate} unit="BWPD" />
                <MetricRow label="Salt In → Out" value={`${des.saltInlet} → ${des.saltOutlet}`} unit="PTB" highlight />
                <MetricRow label="Stages" value={des.stages} />
                <MetricRow label="Power" value={des.powerConsumption} unit="kW" />
                <MetricRow label="Vessel" value={`${des.vesselDiameter}" × ${des.vesselLength}'`} />
            </ResultCard>
            <ResultCard title="Crude Stabilizer" icon={Wind}>
                <MetricRow label="Column" value={`${stab.columnDiameter}" × ${stab.columnHeight}'`} />
                <MetricRow label="Trays" value={stab.trays} />
                <MetricRow label="Operating Pressure" value={stab.operatingPressure} unit="psig" />
                <MetricRow label="Reboiler Duty" value={stab.reboilerDuty} unit="MMBtu/hr" />
                <MetricRow label="RVP In → Out" value={`${stab.rvpInlet} → ${stab.rvpOutlet}`} unit="psi RVP" highlight />
                <MetricRow label="Overhead (C₁-C₄)" value={stab.overheadRate} unit="MMscf/D" />
                <MetricRow label="Bottoms (Stabilized)" value={stab.bottomRate} unit="STB/D" highlight />
            </ResultCard>
        </div>
    );
}

function GasProcessingResults({ comp, amine, glycol, ngl, claus }: {
    comp: any; amine: AmineTreaterDesign; glycol: GlycolDehydratorDesign; ngl: NGLRecoveryDesign; claus: SulfurRecoveryDesign;
}) {
    return (
        <div className="space-y-4">
            <ResultCard title="Multi-Stage Compression" icon={Wind}>
                <MetricRow label="Total Power" value={comp.totalPower.toLocaleString()} unit="HP" highlight />
                <MetricRow label="Total Stages" value={comp.totalStages} />
                <MetricRow label="Intercooler Duty" value={comp.totalCoolingDuty} unit="MMBtu/hr" />
                <MetricRow label="Driver" value={comp.driverType} />
                <MetricRow label="Fuel Gas" value={comp.fuelGasRate > 0 ? comp.fuelGasRate : 'N/A'} unit={comp.fuelGasRate > 0 ? 'Mscf/D' : ''} />
                <div className="space-y-1 mt-2">
                    {comp.stages.map((s: any) => (
                        <div key={s.stageNumber} className="p-2 rounded-lg bg-white/5 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400">Stage {s.stageNumber}</span>
                            <span className="text-[10px] text-slate-500">{s.suctionPressure} → {s.dischargePressure} psig</span>
                            <span className="text-[10px] text-slate-500">Ratio {s.ratio}</span>
                            <span className="text-[10px] text-amber-400">{s.dischargeTemp}°F</span>
                            <span className="text-[10px] text-emerald-400">{s.gasHP} HP</span>
                        </div>
                    ))}
                </div>
            </ResultCard>
            <div className="grid grid-cols-2 gap-4">
                <ResultCard title="Amine Treater" icon={Droplets}>
                    <MetricRow label="Type" value={amine.amineType} />
                    <MetricRow label="Circ. Rate" value={amine.circulationRate} unit="gpm" highlight />
                    <MetricRow label="Absorber" value={`${amine.absorberDiameter}" × ${amine.absorberHeight}'`} />
                    <MetricRow label="Trays" value={amine.trays} />
                    <MetricRow label="Reboiler Duty" value={amine.reboilerDuty} unit="MMBtu/hr" />
                    <MetricRow label="H₂S Outlet" value={amine.h2sOutlet} unit="ppm" highlight />
                </ResultCard>
                <ResultCard title="Glycol Dehydrator" icon={Thermometer}>
                    <MetricRow label="Glycol Type" value={glycol.glycolType} />
                    <MetricRow label="Circ. Rate" value={glycol.circulationRate} unit="gpm" />
                    <MetricRow label="Contactor" value={`${glycol.contactorDiameter}" × ${glycol.contactorHeight}'`} />
                    <MetricRow label="Dew Point" value={glycol.waterDewPoint} unit="°F" highlight />
                    <MetricRow label="H₂O Outlet" value={glycol.waterContentOutlet} unit="lb/MMscf" />
                    <MetricRow label="BTEX Emissions" value={glycol.btexEmissions} unit="tpy" />
                </ResultCard>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <ResultCard title="NGL Recovery" icon={Wind}>
                    <MetricRow label="Method" value={ngl.method.toUpperCase()} highlight />
                    <MetricRow label="C₂ Recovery" value={ngl.ethaneRecovery} unit="%" highlight />
                    <MetricRow label="C₃ Recovery" value={ngl.propaneRecovery} unit="%" />
                    <MetricRow label="Residue Gas" value={ngl.residueGasRate} unit="MMscf/D" />
                    <div className="mt-2">
                        <p className="text-[10px] font-black text-slate-600 uppercase mb-1">NGL Production (BPD)</p>
                        <div className="grid grid-cols-4 gap-1">
                            {Object.entries(ngl.nglProduction).map(([k, v]) => (
                                <div key={k} className="text-center"><p className="text-[10px] text-slate-600">{k}</p><p className="text-xs font-black text-emerald-400">{v}</p></div>
                            ))}
                        </div>
                    </div>
                    <MetricRow label="Compression" value={ngl.compressionHP} unit="HP" />
                    <MetricRow label="Refrigeration" value={ngl.refrigerationHP} unit="HP" />
                </ResultCard>
                <ResultCard title="Claus Sulfur Recovery" icon={Flame}>
                    <MetricRow label="Stages" value={`${claus.clausStages}-Stage`} />
                    <MetricRow label="TGTU" value={claus.withTGTU ? 'YES' : 'NO'} />
                    <MetricRow label="Recovery" value={`${claus.overallRecovery}%`} highlight />
                    <MetricRow label="Sulfur" value={claus.sulfurProduction} unit="LT/D" highlight />
                    <MetricRow label="Furnace Temp" value={claus.reactionFurnaceTemp} unit="°F" />
                    <MetricRow label="WHB Duty" value={claus.wasteHeatBoilerDuty} unit="MMBtu/hr" />
                </ResultCard>
            </div>
        </div>
    );
}

function WaterResults({ wt, wi }: { wt: WaterTreatmentDesign; wi: WaterInjectionDesign }) {
    return (
        <div className="space-y-4">
            <ResultCard title="Produced Water Treatment" icon={Waves}>
                <MetricRow label="OIW Inlet" value={wt.oilInWaterInlet} unit="mg/L" />
                <MetricRow label="OIW Outlet" value={wt.oilInWaterOutlet} unit="mg/L" highlight />
                <div className="space-y-1 mt-2">
                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Treatment Train</p>
                    {wt.treatmentStages.map((s, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white/5 flex justify-between">
                            <span className="text-[10px] font-black text-slate-400">{s.name}</span>
                            <span className="text-[10px] text-emerald-400">{s.efficiency}% removal → {s.outletOIW} mg/L</span>
                        </div>
                    ))}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                    <div><p className="text-[10px] text-slate-600">Hydrocyclones</p><p className="text-lg font-black text-blue-400">{wt.deoilingHydrocycloneCount}</p></div>
                    <div><p className="text-[10px] text-slate-600">IGF Cells</p><p className="text-lg font-black text-blue-400">{wt.igfCells}</p></div>
                    <div><p className="text-[10px] text-slate-600">Filters</p><p className="text-lg font-black text-blue-400">{wt.filterVessels}</p></div>
                </div>
                <div className="mt-2 p-2 rounded-lg bg-white/5">
                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Chemical Consumption (gal/day)</p>
                    {Object.entries(wt.chemicalConsumption).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[10px]">
                            <span className="text-slate-600 capitalize">{k}</span>
                            <span className="text-slate-400">{v}</span>
                        </div>
                    ))}
                </div>
            </ResultCard>
            <ResultCard title="Water Injection System" icon={Gauge}>
                <MetricRow label="Injection Rate" value={wi.injectionRate} unit="BWPD" highlight />
                <MetricRow label="Surface Pressure" value={wi.injectionPressure} unit="psig" highlight />
                <MetricRow label="Pump Type" value={wi.pumpType} />
                <MetricRow label="Pump Stages" value={wi.pumpStages} />
                <MetricRow label="Pump Power" value={wi.pumpPower} unit="HP" />
                <MetricRow label="Tubing Size" value={`${wi.tubingSize}"`} />
                <MetricRow label="Line Diameter" value={`${wi.surfaceLineDiameter}"`} />
                <MetricRow label="Filtration" value={`${wi.filtrationLevel} µm absolute`} />
            </ResultCard>
        </div>
    );
}

function UtilitiesResults({ power, flare }: { power: PowerSystemDesign; flare: FlareSystemDesign }) {
    return (
        <div className="space-y-4">
            <ResultCard title="Power Generation" icon={Zap}>
                <MetricRow label="Total Demand" value={power.totalPowerDemand.toLocaleString()} unit="kW" highlight />
                <div className="space-y-1 mt-2">
                    {power.generation.map((g, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white/5">
                            <div className="flex justify-between text-[11px]">
                                <span className="font-black text-slate-400">{g.type}</span>
                                <span className="text-amber-400">{g.quantity}×{g.capacity}kW = {g.quantity * g.capacity}kW</span>
                            </div>
                            {g.fuelConsumption > 0 && <p className="text-[10px] text-slate-600 mt-0.5">Fuel: {g.fuelConsumption} {g.type.includes('Diesel') ? 'gal/D' : 'Mscf/D'}</p>}
                        </div>
                    ))}
                </div>
                <MetricRow label="Waste Heat Recovery" value={power.wasteHeatRecovery} unit="MMBtu/hr" />
                <MetricRow label="Grid Import" value={power.powerImport} unit="kW" />
                <MetricRow label="Emergency Backup" value={power.emergencyBackup} unit="kW" />
                <div className="mt-2">
                    <p className="text-[10px] font-black text-rose-500 uppercase mb-1">Emissions</p>
                    <MetricRow label="CO₂" value={power.emissions.co2} unit="tons/day" />
                    <MetricRow label="NOx" value={power.emissions.nox} unit="tons/day" />
                </div>
            </ResultCard>
            <ResultCard title="Flare System (API 521)" icon={Flame}>
                <MetricRow label="Flare Type" value={flare.flareType} />
                <MetricRow label="Tip Diameter" value={flare.tipDiameter} unit="in" />
                <MetricRow label="Stack Height" value={flare.stackHeight} unit="ft" highlight />
                <MetricRow label="Flame Length" value={flare.flameLength} unit="ft" />
                <MetricRow label="Safe Distance" value={flare.safeDistance} unit="ft from grade" highlight />
                <MetricRow label="Radiation Limit" value={flare.thermalRadiationLimit} unit="BTU/hr·ft²" />
                <MetricRow label="KO Drum" value={flare.knockoutDrumVolume} unit="bbl" />
                <MetricRow label="Emergency Rate" value={flare.emergencyRate} unit="MMscf/D" />
                <MetricRow label="Pilot Gas" value={flare.pilotGasRate} unit="Mscf/D" />
                <MetricRow label="Steam Assist" value={flare.steamAssistRate.toLocaleString()} unit="lb/hr" />
            </ResultCard>
        </div>
    );
}

function SafetyResults({ sil, esd, fandg }: { sil: SILDesign[]; esd: ESDSystemDesign; fandg: FandGDesign }) {
    return (
        <div className="space-y-4">
            <ResultCard title="SIL Assessment (IEC 61511)" icon={Shield}>
                {sil.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 mb-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-slate-300">{s.safetyFunction}</span>
                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded",
                                s.requiredSIL >= 3 ? "bg-rose-500/30 text-rose-400" : s.requiredSIL >= 2 ? "bg-amber-500/30 text-amber-400" : "bg-emerald-500/30 text-emerald-400")}
                            >SIL {s.requiredSIL}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                            <MetricRow label="PFDavg" value={s.pfdavg.toExponential(1)} />
                            <MetricRow label="RRF" value={s.rrf} />
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1">Test Interval: {s.testInterval} months · Trips: ~{s.spuriousTripRate}/yr</p>
                    </div>
                ))}
            </ResultCard>
            <ResultCard title="ESD System Design" icon={Shield}>
                <MetricRow label="SDVs" value={esd.totalShutdownValves} />
                <MetricRow label="BDVs" value={esd.blowdownValves} />
                <MetricRow label="Blowdown Time" value={`${esd.blowdownTime} min to 50%`} highlight />
                <MetricRow label="MDMT" value={`${esd.minDesignMetalTemp}°F`} />
                <MetricRow label="Auto-Refrig Temp" value={`${esd.autoRefrigerationTemp}°F`} highlight />
                <div className="space-y-1 mt-2">
                    {esd.esdLevels.map(l => (
                        <div key={l.level} className="flex justify-between p-1.5 rounded bg-white/5">
                            <span className="text-[10px] font-black text-rose-400">ESD-{l.level}</span>
                            <span className="text-[10px] text-slate-500">{l.description}</span>
                            <span className="text-[10px] text-slate-600">{l.responseTime}s</span>
                        </div>
                    ))}
                </div>
            </ResultCard>
            <ResultCard title="Fire & Gas Detection" icon={Flame}>
                <p className="text-[10px] font-black text-orange-500 uppercase mb-2">Gas Detectors</p>
                {fandg.gasDetectors.map((d, i) => (
                    <div key={i} className="flex justify-between p-1 rounded">
                        <span className="text-[10px] text-slate-400">{d.type}</span>
                        <span className="text-[10px] text-slate-500">{d.quantity} units ({d.coverage}% coverage)</span>
                    </div>
                ))}
                <p className="text-[10px] font-black text-orange-500 uppercase mt-2 mb-1">Flame Detectors</p>
                {fandg.flameDetectors.map((d, i) => (
                    <div key={i} className="flex justify-between p-1 rounded">
                        <span className="text-[10px] text-slate-400">{d.type}</span>
                        <span className="text-[10px] text-slate-500">{d.quantity} units</span>
                    </div>
                ))}
                {fandg.h2sDetectors > 0 && <MetricRow label="H₂S Detectors" value={fandg.h2sDetectors} />}
                <div className="mt-3 p-3 rounded-xl bg-orange-500/10">
                    <p className="text-[10px] font-black text-orange-500 uppercase mb-2">Firewater System</p>
                    <MetricRow label="Main Pump" value={`${fandg.firewaterPumps.main.capacity} gpm (${fandg.firewaterPumps.main.driver})`} />
                    <MetricRow label="Jockey Pump" value={`${fandg.firewaterPumps.jockey.capacity} gpm`} />
                    <MetricRow label="Backup Pump" value={`${fandg.firewaterPumps.backup.capacity} gpm`} />
                    <MetricRow label="Tank Capacity" value={fandg.firewaterTank} unit="bbl (6 hr)" highlight />
                    <MetricRow label="Deluge Systems" value={fandg.delugeSystems} />
                    <MetricRow label="Foam Systems" value={fandg.foamSystems} />
                </div>
            </ResultCard>
        </div>
    );
}