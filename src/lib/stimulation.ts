/**
 * Well Stimulation Engineering Calculation Library
 * PKN / KGD fracture geometry, proppant scheduling, acidizing, DFIT analysis
 */

// ── Types ──
export interface FractureGeometryInputs {
    pumpRate: number;         // bbl/min
    totalVolume: number;      // bbl
    fluidViscosity: number;   // cP
    youngsModulus: number;    // psi
    poissonsRatio: number;    // dimensionless
    height: number;           // ft (gross frac height)
    fluidLossCoeff: number;   // ft/sqrt(min)
    model: 'PKN' | 'KGD';    // fracture geometry model
    numberOfPerfs: number;    // count
    perfDiameter: number;     // inches
}

export interface ProppantScheduleInputs {
    fracLength: number;       // ft
    fracHeight: number;       // ft
    fracWidth: number;        // inches
    targetConductivity: number;// md-ft
    maxProppantConc: number;  // ppa
    proppantSize: string;     // e.g. '20/40', '30/50', '40/70'
    proppantSG: number;       // g/cc
    closureStress: number;    // psi
}

export interface DFITInputs {
    isip: number;              // psi (Instantaneous Shut-In Pressure)
    closurePressure: number;   // psi
    porePressure: number;      // psi
    pumpTime: number;          // minutes
    injectionVolume: number;   // bbl
    formationPerm: number;     // mD
    porosity: number;          // fraction
    fluidViscosity: number;    // cP
    netExtensionPressure: number; // psi
}

export interface AcidizingInputs {
    formationType: 'carbonate' | 'sandstone' | 'mixed';
    permeability: number;      // mD
    porosity: number;          // fraction
    damageRadius: number;      // ft
    wellRadius: number;        // ft
    treatmentHeight: number;   // ft
    acidType: string;          // 'HCl (15%)', 'HCl (28%)', 'HF (3%)', 'Mud Acid', etc.
    acidVolume: number;        // gal/ft
    reactionRateConstant: number; // ft/sec
    wormholeEfficiency: number;// fraction
}

export interface ProppantSelectionInputs {
    closureStress: number;     // psi
    formationD50: number;      // microns (sand control consideration)
    desiredConductivity: number;// md-ft
    maxTemp: number;           // °F
    fluidDensity: number;      // ppg
}

// ── Fracture Geometry (PKN / KGD) ──

/** Calculate fracture dimensions using PKN or KGD model */
export function calculateFractureGeometry(inputs: FractureGeometryInputs): {
    fracHalfLength: number;
    fracWidth: number;
    netPressure: number;
    efficiency: number;
    createdArea: number;
    perfFriction: number;
    nearWellboreDP: number;
} {
    const {
        pumpRate, totalVolume, fluidViscosity, youngsModulus,
        poissonsRatio, height, fluidLossCoeff, model, numberOfPerfs, perfDiameter
    } = inputs;

    // Convert units
    const qi = pumpRate * 42 / 60; // bbl/min → gal/min → ft³/min (42 gal/bbl)
    const Qi = qi / 5.6146; // ft³/min
    const tp = totalVolume * 42 / qi; // pump time in minutes
    const Eprime = youngsModulus / (1 - Math.pow(poissonsRatio, 2)); // plane strain modulus

    let fracHalfLength: number;
    let fracWidth: number;
    let netPressure: number;

    if (model === 'PKN') {
        // Perkins-Kern-Nordgren (height-fixed, length grows)
        fracWidth = 0.39 * Math.pow(
            (Qi * fluidViscosity * (fracHalfLength || 500)) / (Eprime * height),
            0.25
        ) * 12; // ft → inches

        // Iterate for length (2-3 iterations sufficient)
        let L = 500; // initial guess ft
        for (let iter = 0; iter < 5; iter++) {
            const w = 0.39 * Math.pow(
                (Qi * fluidViscosity * L * (1 - Math.pow(poissonsRatio, 2))) / (youngsModulus * height),
                0.25
            ) * 12;
            // Material balance: V = 2 * L * h * w/12 + V_loss
            const clArea = 2 * height * L * fluidLossCoeff * Math.sqrt(tp) * 4; // 4 faces
            const vFracCuft = 2 * L * height * (w / 12);
            const vLossCuft = clArea;
            const vTotalCuft = totalVolume * 5.6146;
            L = (vTotalCuft - vLossCuft) / (2 * height * (w / 12));
            fracWidth = w;
            fracHalfLength = Math.max(0, L);
        }
        fracHalfLength = fracHalfLength || 500;

        // Net pressure (PKN)
        netPressure = (Eprime * fracWidth / 12) / (2 * height);

    } else {
        // KGD (Kristianovich-Geertsma-de Klerk, height-confined at wellbore)
        fracHalfLength = 0.48 * Math.pow(
            (youngsModulus * Qi) / ((1 - Math.pow(poissonsRatio, 2)) * fluidViscosity * Math.pow(height, 3)),
            0.1667
        ) * Math.pow(tp, 0.6667);

        fracWidth = 1.32 * Math.pow(
            (Qi * fluidViscosity * Math.pow(fracHalfLength, 2) * (1 - Math.pow(poissonsRatio, 2))) / youngsModulus,
            0.25
        ) * 12;

        // Net pressure (KGD)
        netPressure = (Eprime * fracWidth / 12) / (Math.PI * fracHalfLength);
    }

    // Fluid efficiency
    const createdVolumeCuft = 2 * fracHalfLength * height * (fracWidth / 12);
    const efficiency = Math.min(1, createdVolumeCuft / (totalVolume * 5.6146));

    // Created fracture area
    const createdArea = 2 * fracHalfLength * height; // both wings

    // Perforation friction (Δpperf = 0.2369 * ρ * Q² / (n² * d⁴ * Cd²))
    const fluidDensity = 8.34; // ppg, approximate
    const Cd = 0.6; // discharge coefficient
    const perfFriction = 0.2369 * fluidDensity * Math.pow(pumpRate, 2) /
        (Math.pow(numberOfPerfs, 2) * Math.pow(perfDiameter, 4) * Math.pow(Cd, 2));

    // Near-wellbore pressure drop (tortuosity estimate)
    const nearWellboreDP = 0.5 * perfFriction; // approximate from perf + tortuosity

    return {
        fracHalfLength: Math.round(fracHalfLength),
        fracWidth: Math.round(fracWidth * 100) / 100,
        netPressure: Math.round(netPressure),
        efficiency: Math.round(efficiency * 100) / 100,
        createdArea: Math.round(createdArea),
        perfFriction: Math.round(perfFriction),
        nearWellboreDP: Math.round(nearWellboreDP)
    };
}

// ── Proppant Schedule Design ──

/** Generate staged proppant ramp schedule */
export function generateProppantSchedule(inputs: ProppantScheduleInputs): {
    stages: { stage: number; ppa: number; cleanVolBbl: number; slurryVolBbl: number; durationMin: number; proppantLb: number }[];
    totalProppantLb: number;
    totalSlurryBbl: number;
    averageConductivityMdFt: number;
    finalFracConductivity: number;
} {
    const { fracLength, fracHeight, fracWidth, maxProppantConc, proppantSize, proppantSG, closureStress } = inputs;

    // Proppant ramp schedule (standard 6-stage)
    const ppaRamp = [1, 2, 3, 4, maxProppantConc - 1, maxProppantConc];
    const cleanVols = [50, 45, 40, 35, 30, 25]; // bbl clean per stage

    // Parse proppant size
    const [dMin, dMax] = proppantSize.split('/').map(Number);
    const propD50 = (dMin + dMax) / 2; // microns

    const stages = ppaRamp.map((ppa, i) => {
        const cleanVolBbl = cleanVols[i];
        // Slurry volume = clean vol + (proppant vol)
        // Proppant bulk density ~100 lb/cuft
        const proppantLb = ppa * 42 * cleanVolBbl; // ppa * 42 gal/bbl * clean bbl
        const proppantVolGal = proppantLb / (proppantSG * 8.34); // gal
        const proppantVolBbl = proppantVolGal / 42;
        const slurryVolBbl = cleanVolBbl + proppantVolBbl;
        const durationMin = slurryVolBbl / 40; // assume 40 bbl/min

        return {
            stage: i + 1,
            ppa,
            cleanVolBbl,
            slurryVolBbl: Math.round(slurryVolBbl * 10) / 10,
            durationMin: Math.round(durationMin * 10) / 10,
            proppantLb: Math.round(proppantLb)
        };
    });

    const totalProppantLb = stages.reduce((s, st) => s + st.proppantLb, 0);
    const totalSlurryBbl = stages.reduce((s, st) => s + st.slurryVolBbl, 0);

    // Fracture conductivity (API RP 61)
    // kf*wf ≈ 50,000 md-ft for 20/40 at low closure, decaying with stress
    const baseConductivity = (proppantSize === '20/40') ? 50000 :
        (proppantSize === '30/50') ? 30000 :
            (proppantSize === '40/70') ? 15000 : 20000;

    const stressDegradation = Math.exp(-closureStress / 8000);
    const averageConductivityMdFt = baseConductivity * stressDegradation * Math.min(1, fracWidth / 0.5);
    const finalFracConductivity = averageConductivityMdFt * (totalProppantLb / (fracLength * fracHeight * 0.5));

    return {
        stages,
        totalProppantLb,
        totalSlurryBbl: Math.round(totalSlurryBbl * 10) / 10,
        averageConductivityMdFt: Math.round(averageConductivityMdFt),
        finalFracConductivity: Math.round(finalFracConductivity)
    };
}

// ── DFIT Analysis (G-Function) ──

/** Analyze DFIT data to determine closure stress, pore pressure, permeability */
export function analyzeDFIT(inputs: DFITInputs): {
    fractureGradient: number;
    porePressureGradient: number;
    closureTimeMin: number;
    netPressure: number;
    fracClosureStress: number;
    systemPermeability: number;
    gClosureTime: number;
    afterClosureSlope: number;
    flowRegime: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
} {
    const { isip, closurePressure, porePressure, pumpTime, injectionVolume, formationPerm, porosity, fluidViscosity, netExtensionPressure } = inputs;

    // Fracture gradient
    const fractureGradient = isip / (pumpTime * 0.5 * 10); // approximate depth from ISIP

    // Pore pressure gradient
    const porePressureGradient = porePressure / 10000; // assumed TVD

    // G-function closure time (Nolte G-function)
    // G(ΔtD) ≈ (4/π) * [ (1+ΔtD)^1.5 - (ΔtD)^1.5 - 1 ]
    // Simplified for analysis
    const gClosureTime = 0.75 * pumpTime; // ~G=0 at shut-in, G=1 at closure (typical)

    // Closure time
    const closureTimeMin = gClosureTime * 1.5; // minutes after shut-in

    // After-closure analysis (Nolte)
    // k = μ * φ * c_t * (aft closure slope analysis)
    // Simplified: k ≈ 169.4 * μ * φ / (m * pi)
    const afterClosureSlope = (isip - closurePressure) / Math.sqrt(closureTimeMin);
    const systemPermeability = (formationPerm > 0) ? formationPerm :
        169.4 * fluidViscosity * porosity / (Math.max(0.1, afterClosureSlope) * 3.14159);

    // Flow regime identification
    let flowRegime: string;
    if (afterClosureSlope > 100) {
        flowRegime = 'Linear flow — Low perm, tight formation';
    } else if (afterClosureSlope > 30) {
        flowRegime = 'Bilinear flow — Moderate perm with finite conductivity fracture';
    } else if (afterClosureSlope > 10) {
        flowRegime = 'Radial flow — Higher perm, conventional reservoir';
    } else {
        flowRegime = 'Pseudo-radial — Boundary-dominated or high perm';
    }

    // Quality assessment
    const pressureBuildQuality = (isip - closurePressure) / isip;
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    if (pressureBuildQuality > 0.3 && closureTimeMin < 2 * pumpTime) {
        quality = 'excellent';
    } else if (pressureBuildQuality > 0.15) {
        quality = 'good';
    } else if (pressureBuildQuality > 0.05) {
        quality = 'fair';
    } else {
        quality = 'poor';
    }

    // Fracture closure stress gradient
    const fracClosureStress = closurePressure / (10000); // psi/ft

    return {
        fractureGradient: Math.round(fractureGradient * 1000) / 1000,
        porePressureGradient: Math.round(porePressureGradient * 1000) / 1000,
        closureTimeMin: Math.round(closureTimeMin * 10) / 10,
        netPressure: Math.round(isip - closurePressure),
        fracClosureStress: Math.round(fracClosureStress * 1000) / 1000,
        systemPermeability: Math.round(systemPermeability * 100) / 100,
        gClosureTime: Math.round(gClosureTime * 10) / 10,
        afterClosureSlope: Math.round(afterClosureSlope * 10) / 10,
        flowRegime,
        quality
    };
}

// ── Acidizing Design ──

/** Calculate acidizing treatment parameters including wormhole penetration */
export function designAcidTreatment(inputs: AcidizingInputs): {
    wormholeLength: number;
    skinReduction: number;
    postAcidSkin: number;
    requiredVolumeGal: number;
    injectionRateBpm: number;
    treatmentDurationMin: number;
    wormholeVelocity: number;
    acidPenetration: number;
    recommendation: string;
} {
    const {
        formationType, permeability, porosity, damageRadius,
        wellRadius, treatmentHeight, acidType, acidVolume,
        reactionRateConstant, wormholeEfficiency
    } = inputs;

    // Wormhole velocity (Buijse-Glasbergen or Fredd-Fogler)
    // V_wh = f(efficiency, reaction rate, Darcy velocity)
    // Simplified: V_wh ≈ (q/A) * efficiency / (1-φ)
    const qOpt = 0.5; // bbl/min-ft (optimal injection rate)
    const DarcyVelocity = qOpt * 5.6146 / (60 * 144); // ft/sec
    const wormholeVelocity = DarcyVelocity * wormholeEfficiency / (1 - porosity);

    // Wormhole length
    // L_wh = V_wh * t (dissolves as it goes)
    const wormholeLength = (acidVolume / 42) * 0.5 * wormholeEfficiency; // ft (simplified)

    // Skin reduction (Hawkins formula)
    // s = (k/ks - 1) * ln(rs/rw)
    const ksByK = 0.2; // damaged perm ratio (80% damage)
    const initialSkin = (1 / ksByK - 1) * Math.log(damageRadius / wellRadius);
    const treatedRadius = wellRadius + wormholeLength;
    const postAcidSkin = (wormholeLength > damageRadius)
        ? 0
        : (1 / ksByK - 1) * Math.log(Math.max(wellRadius, damageRadius - wormholeLength) / wellRadius);
    const skinReduction = initialSkin - postAcidSkin;

    // Required volume
    const requiredVolumeGal = treatmentHeight * acidVolume;

    // Injection rate (matrix rate — below frac gradient)
    const matrixRatePerFt = (permeability > 100) ? 0.5 : (permeability > 10) ? 0.25 : 0.1;
    const injectionRateBpm = matrixRatePerFt * treatmentHeight;

    // Treatment duration
    const treatmentDurationMin = requiredVolumeGal / (injectionRateBpm * 42);

    // Acid penetration
    const acidPenetration = wormholeLength * 1.2; // some additional diffusion

    // Recommendation
    let recommendation: string;
    if (formationType === 'carbonate') {
        if (permeability > 100) {
            recommendation = 'HCl (15%) matrix acidizing with diversion. Wormhole-dominated dissolution expected.';
        } else if (permeability > 10) {
            recommendation = 'HCl (28%) with retarded acid system. Viscoelastic surfactant for diversion.';
        } else {
            recommendation = 'Emulsified HCl (28%) for deep penetration. Consider organic acid preflush.';
        }
    } else if (formationType === 'sandstone') {
        recommendation = 'Mud acid (HCl/HF) sequence: HCl preflush → HCl/HF main → NH₄Cl overflush. Clay sensitivity check required.';
    } else {
        recommendation = 'Sequential treatment: organic acid → HCl → mud acid. Core flow testing recommended.';
    }

    return {
        wormholeLength: Math.round(wormholeLength * 10) / 10,
        skinReduction: Math.round(skinReduction * 10) / 10,
        postAcidSkin: Math.round(postAcidSkin * 10) / 10,
        requiredVolumeGal: Math.round(requiredVolumeGal),
        injectionRateBpm: Math.round(injectionRateBpm * 10) / 10,
        treatmentDurationMin: Math.round(treatmentDurationMin * 10) / 10,
        wormholeVelocity: Math.round(wormholeVelocity * 10000) / 10000,
        acidPenetration: Math.round(acidPenetration * 10) / 10,
        recommendation
    };
}

// ── Proppant Selection ──

/** Recommend proppant type/size based on reservoir conditions */
export function selectProppant(inputs: ProppantSelectionInputs): {
    proppantType: string;
    proppantSize: string;
    maxClosureStress: number;
    conductivityEstimate: number;
    meshSize: string;
    costTier: 'premium' | 'standard' | 'economy';
    rationale: string;
} {
    const { closureStress, formationD50, desiredConductivity, maxTemp } = inputs;

    let proppantType: string;
    let proppantSize: string;
    let maxClosureStress: number;
    let conductivityEstimate: number;
    let meshSize: string;
    let costTier: 'premium' | 'standard' | 'economy';
    let rationale: string;

    if (closureStress < 6000 && maxTemp < 200) {
        proppantType = 'Frac Sand (Ottawa / Brady)';
        proppantSize = '20/40';
        maxClosureStress = 6000;
        conductivityEstimate = 45000;
        meshSize = '20/40 Mesh';
        costTier = 'economy';
        rationale = 'Low closure stress allows use of economy frac sand. Standard 20/40 mesh for most applications.';
    } else if (closureStress < 8000 && maxTemp < 250) {
        proppantType = 'Resin-Coated Sand (RCS)';
        proppantSize = '20/40';
        maxClosureStress = 8000;
        conductivityEstimate = 35000;
        meshSize = '20/40 Mesh';
        costTier = 'standard';
        rationale = 'RCS provides crush resistance and flowback control at moderate closure stress.';
    } else if (closureStress < 12000 && maxTemp < 300) {
        proppantType = 'Intermediate Strength Ceramic (ISP)';
        proppantSize = '20/40 or 30/50';
        maxClosureStress = 12000;
        conductivityEstimate = 55000;
        meshSize = '30/50 Mesh';
        costTier = 'standard';
        rationale = 'ISP provides high conductivity at elevated stress. 30/50 mesh for deeper penetration.';
    } else if (closureStress < 15000 && maxTemp < 350) {
        proppantType = 'High Strength Ceramic (HSP — Bauxite)';
        proppantSize = '30/50 or 40/70';
        maxClosureStress = 15000;
        conductivityEstimate = 40000;
        meshSize = '40/70 Mesh';
        costTier = 'premium';
        rationale = 'Sintered bauxite for HPHT wells. Smaller mesh for higher stress uniformity.';
    } else {
        proppantType = 'Ultra-High Strength Ceramic (UHSP)';
        proppantSize = '40/70';
        maxClosureStress = 20000;
        conductivityEstimate = 25000;
        meshSize = '40/70 Mesh';
        costTier = 'premium';
        rationale = 'Maximum crush resistance required. 40/70 reduces embedment in hard rock.';
    }

    // Sand control compatibility check
    if (formationD50 < 100 && proppantSize === '20/40') {
        proppantSize = '40/70';
        meshSize = '40/70 Mesh';
        rationale += ' Sized down for fine formation sand control (Saucier criterion).';
    }

    return {
        proppantType, proppantSize, maxClosureStress, conductivityEstimate, meshSize, costTier, rationale
    };
}

// ── Diversion Design ──

/** Calculate diverter requirement for even stimulation coverage */
export function designDiversion(
    numberOfPerfClusters: number,
    perfClusterLength: number,     // ft
    stressVariation: number,       // psi (max - min stress)
    injectionRate: number          // bbl/min
): {
    diverterType: string;
    diverterStages: number;
    diverterConcentration: number; // lbm/gal
    diversionEfficiency: number;   // fraction
    diverterSchedule: { stage: number; diverterLb: number; carrierBbl: number }[];
} {
    // Diversion needed when stress variation > 500 psi across clusters
    const stressRatio = stressVariation / 500;

    let diverterType: string;
    let diverterStages: number;
    let diverterConcentration: number;

    if (stressVariation < 300) {
        diverterType = 'No diverter required — stress uniformity sufficient';
        diverterStages = 0;
        diverterConcentration = 0;
    } else if (stressVariation < 800) {
        diverterType = 'Biodegradable Particulate (PLA / Benzoic Acid Flakes)';
        diverterStages = 2;
        diverterConcentration = 0.25;
    } else if (stressVariation < 1500) {
        diverterType = 'Perforation Ball Sealers + Particulate';
        diverterStages = 3;
        diverterConcentration = 0.5;
    } else {
        diverterType = 'Composite: Ball Sealers + Fiber + Particulate Diverter';
        diverterStages = 4;
        diverterConcentration = 0.75;
    }

    // Diversion efficiency (estimated)
    const diversionEfficiency = Math.min(1, 0.9 * (1 - stressVariation / 3000));

    // Schedule
    const diverterSchedule: { stage: number; diverterLb: number; carrierBbl: number }[] = [];
    for (let i = 0; i < diverterStages; i++) {
        const carrierBbl = 20 + i * 10; // increasing carrier volumes
        diverterSchedule.push({
            stage: i + 1,
            diverterLb: Math.round(diverterConcentration * 42 * carrierBbl),
            carrierBbl
        });
    }

    return {
        diverterType,
        diverterStages,
        diverterConcentration,
        diversionEfficiency: Math.round(diversionEfficiency * 100) / 100,
        diverterSchedule
    };
}

// ── Flowback Analysis ──

/** Predict flowback profile after stimulation */
export function predictFlowback(
    fracLength: number,           // ft
    fracConductivity: number,     // md-ft
    formationPerm: number,        // mD
    reservoirPressure: number,    // psi
    flowingPressure: number,      // psi
    porosity: number,             // fraction
    fluidVisc: number,            // cP
    totalFluidInjected: number    // bbl
): {
    initialRateBpd: number;
    foldOfIncrease: number;
    fluidRecoveryDays: number;
    recoveryFraction: number;
    optimizationLabel: string;
} {
    // Pre-frac rate (Darcy radial, skin = 5)
    const re = 1000;
    const rw = 0.354;
    const preSkin = 5;
    const preRate = (0.00708 * formationPerm * 100 * (reservoirPressure - flowingPressure)) /
        (fluidVisc * (Math.log(re / rw) + 0));

    // Post-frac rate (Cinco-Ley fractured well)
    // FCD = kf*w / (k * xf)
    const FCD = fracConductivity / (formationPerm * fracLength);

    // Effective wellbore radius for fractured well
    const rwPrime = (FCD > 10)
        ? fracLength / 2   // infinite conductivity
        : fracLength * 0.28; // finite conductivity

    const postRate = (0.00708 * formationPerm * 100 * (reservoirPressure - flowingPressure)) /
        (fluidVisc * Math.log(re / rwPrime));

    const initialRateBpd = postRate;
    const foldOfIncrease = (preRate > 0) ? postRate / preRate : 10;

    // Fluid recovery
    // T_flowback ≈ (V_inj * μ) / (k * h * ΔP)
    const fluidRecoveryDays = (totalFluidInjected * fluidVisc) /
        (formationPerm * 100 * (reservoirPressure - flowingPressure) * 0.001) / 200;

    const recoveryFraction = Math.min(1, 0.7 * Math.exp(-0.1 * fluidRecoveryDays) + 0.3);

    let optimizationLabel: string;
    if (foldOfIncrease > 5) {
        optimizationLabel = 'Excellent stimulation — > 5x PI improvement';
    } else if (foldOfIncrease > 2) {
        optimizationLabel = 'Good stimulation — consider larger treatment or higher conductivity';
    } else if (foldOfIncrease > 1) {
        optimizationLabel = 'Marginal — re-evaluate frac design, possible screenout or poor connection';
    } else {
        optimizationLabel = 'Ineffective — formation damage or fracture not connected to wellbore';
    }

    return {
        initialRateBpd: Math.round(initialRateBpd * 10) / 10,
        foldOfIncrease: Math.round(foldOfIncrease * 10) / 10,
        fluidRecoveryDays: Math.round(fluidRecoveryDays * 10) / 10,
        recoveryFraction: Math.round(recoveryFraction * 100) / 100,
        optimizationLabel
    };
}

// ── Acid Reaction Kinetics ──

/** Calculate acid reaction time and optimal contact time */
export function calculateAcidReaction(
    acidType: string,
    temperature: number,     // °F
    rockType: 'limestone' | 'dolomite' | 'sandstone',
    acidConcentration: number, // wt%
    flowVelocity: number     // ft/sec
): {
    reactionRate: number;
    spendingTimeSec: number;
    optimalContactMin: number;
    spendingDistanceFt: number;
    acidCapacityLbRock: number;
} {
    // Reaction rate constants at 75°F (Arrhenius rate law)
    const baseRate: Record<string, number> = {
        'HCl (15%)': 0.0015,
        'HCl (28%)': 0.0028,
        'Formic Acid (10%)': 0.0003,
        'Acetic Acid (10%)': 0.0002,
        'Mud Acid (3% HF)': 0.0008,
        'HF (3%)': 0.0009
    };

    const k0 = baseRate[acidType] || 0.001;

    // Arrhenius temperature correction
    // k = k0 * exp(-Ea/R * (1/T - 1/T0))
    const EaRock: Record<string, number> = {
        'limestone': 15000,
        'dolomite': 20000,
        'sandstone': 12000
    };
    const Ea = EaRock[rockType] || 15000;
    const R = 1.987; // cal/mol-K
    const T = (temperature - 32) * 5 / 9 + 273.15; // °F → K
    const T0 = (75 - 32) * 5 / 9 + 273.15; // K

    const reactionRate = k0 * Math.exp(-Ea / R * (1 / T - 1 / T0)) *
        Math.pow(acidConcentration / 15, 0.5); // concentration effect

    // Acid spending time
    // Time for acid to spend to 10% of original concentration
    const spendingTimeSec = (2.303 / reactionRate) * Math.log(acidConcentration / (acidConcentration * 0.1));

    // Optimal contact time (70% of spending time for best wormhole formation)
    const optimalContactMin = spendingTimeSec * 0.7 / 60;

    // Spending distance
    const spendingDistanceFt = flowVelocity * spendingTimeSec;

    // Acid dissolving capacity (lb rock / gal acid)
    let acidCapacityLbRock: number;
    if (rockType === 'limestone') {
        acidCapacityLbRock = (acidType.includes('HCl')) ? 0.082 * acidConcentration : 0.04 * acidConcentration;
    } else if (rockType === 'dolomite') {
        acidCapacityLbRock = (acidType.includes('HCl')) ? 0.068 * acidConcentration : 0.035 * acidConcentration;
    } else {
        acidCapacityLbRock = 0.025 * acidConcentration; // sandstone, much lower
    }

    return {
        reactionRate: Math.round(reactionRate * 100000) / 100000,
        spendingTimeSec: Math.round(spendingTimeSec * 10) / 10,
        optimalContactMin: Math.round(optimalContactMin * 100) / 100,
        spendingDistanceFt: Math.round(spendingDistanceFt * 10) / 10,
        acidCapacityLbRock: Math.round(acidCapacityLbRock * 100) / 100
    };
}