/**
 * Change #7: Shared State Architecture — Data Layer Type Definitions
 * All 12 data layers + 4 supporting layers, fully typed.
 * Each layer carries lastUpdated (epoch ms) and version for staleness tracking.
 */

// ───────────────────────────────────────────────────────────────
// LAYER 1: EXPLORATION
// ───────────────────────────────────────────────────────────────

export type BasinType = 'rift' | 'foreland' | 'passive_margin' | 'intracratonic';
export type TrapType = 'structural_anticline' | 'structural_fault' | 'structural_salt_dome'
    | 'stratigraphic_pinchout' | 'stratigraphic_unconformity' | 'stratigraphic_reef' | 'combination';
export type WellTrajectoryType = 'vertical' | 'deviated' | 'J_type' | 'S_type' | 'horizontal';

export interface Basin {
    type: BasinType;
    ageRange: string;
}

export interface Prospect {
    name: string;
    location: { lat: number; lon: number; grid?: { x: number; y: number } };
    trapType: TrapType;
    cos: {
        source: number;
        reservoir: number;
        seal: number;
        trap: number;
        migration: number;
        timing: number;
        pg: number; // combined probability
    };
    grv: { p10: number; p50: number; p90: number }; // acre-ft or m³
    stoiip: { p10: number; p50: number; p90: number }; // MMstb
    giip: { p10: number; p50: number; p90: number }; // Bscf
    emv: number; // $MM
    riskedVolume: number; // COS × unrisked volume
}

export interface CasingString {
    shoeDepth: number;
    holeSize: number;
    casingSize: number;
    grade: string;
    weight: number;
}

export interface MudSection {
    type: string;
    weight: number; // ppg
    fromDepth: number;
    toDepth: number;
}

export interface ExplorationWellPlan {
    targetDepth: number; // TVD ft
    trajectory: WellTrajectoryType;
    kop?: number; // kick-off point ft
    buildRate?: number; // °/100ft
    targetCoordinates?: { north: number; east: number };
    casingProgram: CasingString[];
    mudProgram: MudSection[];
    loggingSuite: string[];
    afeCost: number; // $MM
    drillingDays: number;
}

export interface PressureDepthPoint {
    depth: number; // ft
    pressure: number; // psi
    gradient: number; // psi/ft
}

export interface PressureProfile {
    porePressure: PressureDepthPoint[];
    fractureGradient: PressureDepthPoint[];
    overburden: PressureDepthPoint[];
    mudWindow: { minMw: number; maxMw: number }[]; // per depth range
}

export interface ExplorationLayer {
    basin: Basin;
    prospect: Prospect;
    explorationWell: ExplorationWellPlan;
    pressureProfile: PressureProfile;
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 2: APPRAISAL
// ───────────────────────────────────────────────────────────────

export type PorosityMethod = 'density' | 'sonic' | 'nd_crossplot' | 'nmr';
export type SaturationMethod = 'archie' | 'indonesian' | 'simandoux' | 'waxman_smits';
export type PermeabilityMethod = 'timur' | 'coates' | 'core_calibrated';
export type FluidType = 'black_oil' | 'volatile_oil' | 'gas_condensate' | 'dry_gas' | 'heavy_oil';
export type DriveMechanism = 'depletion' | 'water_drive' | 'gas_cap' | 'combination';
export type ContactConfidence = 'high' | 'medium' | 'low';

export interface ArchieParams {
    a: number;
    m: number;
    n: number;
    rw: number; // water resistivity at temperature
}

export interface PetrophysicsZone {
    wellId: string;
    zoneId: string;
    vshale: number; // fraction
    porosity: number; // fraction, effective
    waterSaturation: number; // Sw fraction
    permeability: number; // md
    netPay: number; // ft
    ntg: number; // net-to-gross fraction
    averagePorosity: number;
    averageSw: number;
    porosityMethod: PorosityMethod;
    saturationMethod: SaturationMethod;
    permeabilityMethod: PermeabilityMethod;
    archieParams: ArchieParams;
    vshCutoff: number;
    poroCutoff: number;
    swCutoff: number;
}

export interface RelPermCurve {
    swValues: number[];
    krwValues: number[];
    kroValues: number[];
    coreyNo: number; // Corey oil exponent
    coreyNw: number; // Corey water exponent
    swi: number; // irreducible water
    sor: number; // residual oil
}

export interface CapPressureCurve {
    saturationValues: number[];
    pcValues: number[]; // psi
    method: 'mercury_injection' | 'porous_plate' | 'centrifuge';
}

export interface CoreData {
    wellId: string;
    rcal: { depth: number; porosity: number; permeability: number; grainDensity: number }[];
    scal: {
        relPerm: RelPermCurve;
        capPressure: CapPressureCurve;
        archieParams: ArchieParams;
        wettability: { index: number; method: 'amott_harvey' | 'usbm' };
    };
}

export interface PVTComposition {
    c1: number;
    c2: number;
    c3: number;
    ic4: number;
    nc4: number;
    ic5: number;
    nc5: number;
    c6: number;
    c7plus: number;
    n2: number;
    co2: number;
    h2s: number;
}

export interface PVTData {
    fluidType: FluidType;
    apiGravity: number;
    gasGravity: number; // air=1.0
    bubblePoint: number; // psi at reservoir T
    solutionGOR: { pressure: number[]; rs: number[] }; // Rs vs P
    oilFVF: { pressure: number[]; bo: number[] };
    oilViscosity: { pressure: number[]; muo: number[] };
    gasFVF: { pressure: number[]; bg: number[] };
    gasViscosity: { pressure: number[]; mug: number[] };
    waterSalinity: number; // ppm TDS
    waterResistivity: number; // Rw at reservoir T
    h2sContent: number; // mol%
    co2Content: number; // mol%
    composition: PVTComposition;
    reservoirTemperature: number; // °F
    reservoirPressure: number; // psi
}

export interface FluidContacts {
    owc: number; // ft TVDss
    goc?: number; // ft TVDss (if gas cap)
    fwl: number;
    transitionZoneHeight: number;
    confidence: ContactConfidence;
    basis: string;
}

export interface WellTest {
    wellId: string;
    kh: number; // md-ft
    permeability: number; // md
    skin: number;
    reservoirPressure: number; // psi
    reservoirTemperature: number; // °F
    boundaries: { type: string; distanceFt: number }[];
    driveMechanism: DriveMechanism;
    ipRate: { oil: number; gas: number; water: number }; // bopd / Mscfd / bwpd
    aof?: number; // MMscfd (gas wells)
    productivityIndex: number; // stb/d/psi
}

export interface AppraisalLayer {
    petrophysics: PetrophysicsZone[];
    core: CoreData[];
    pvt: PVTData | null;
    fluidContacts: FluidContacts | null;
    wellTests: WellTest[];
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 3: RESERVES
// ───────────────────────────────────────────────────────────────

export type ReservesClass = 'proved_1p' | 'probable' | 'possible' | 'contingent';
export type ReservesDriveMechanism = 'depletion' | 'water_drive' | 'gas_cap' | 'combination';
export type AquiferModel = 'fetkovich' | 'carter_tracy';

export interface ReservesDeterministic {
    stoiip: number; // MMstb
    giip: number; // Bscf
    recoveryFactor: number; // fraction
    recoverableOil: number; // MMstb (EUR oil)
    recoverableGas: number; // Bscf (EUR gas)
}

export interface InputDistribution {
    variable: string;
    type: 'triangular' | 'normal' | 'lognormal' | 'uniform';
    params: number[]; // [min, mode, max] for triangular; [mean, std] for normal; etc.
}

export interface ReservesProbabilistic {
    p90: number; // MMstb (low / 1P proxy)
    p50: number; // MMstb (best / 2P proxy)
    p10: number; // MMstb (high / 3P proxy)
    mean: number; // expected risk-weighted mean
    inputDistributions: InputDistribution[];
}

export interface MaterialBalance {
    ooip: number; // MMstb from Havlena-Odeh
    ogip?: number; // Bscf
    driveMechanism: ReservesDriveMechanism;
    driveIndices: {
        depletion: number;
        waterDrive: number;
        gasCap: number;
        compaction: number;
    };
    aquiferModel: { type: AquiferModel; params: Record<string, number> };
}

export interface ReservesClassification {
    proved1P: number; // MMstb
    probable: number;
    possible: number;
    contingent: number;
}

export interface ReservesLayer {
    deterministic: ReservesDeterministic | null;
    probabilistic: ReservesProbabilistic | null;
    materialBalance: MaterialBalance | null;
    classification: ReservesClassification | null;
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 4: DRILLING & COMPLETION
// ───────────────────────────────────────────────────────────────

export type CompletionType = 'open_hole' | 'cased_perforated' | 'liner' | 'gravel_pack';
export type ArtificialLiftType = 'gas_lift' | 'esp' | 'srp' | 'pcp' | 'jet_pump' | 'plunger' | 'natural';
export type StimulationType = 'none' | 'matrix_acid' | 'acid_frac' | 'propped_frac';
export type CementBondQuality = 'good' | 'partial' | 'micro_annulus' | 'channel' | 'free_pipe';

export interface SurveyStation {
    md: number; // ft
    inclination: number; // °
    azimuth: number; // °
    tvd: number; // ft
    ns: number; // ft north/south
    ew: number; // ft east/west
}

export interface CasingInstalled {
    shoeDepth: number;
    size: number;
    grade: string;
    weight: number;
    cementTop: number;
}

export interface CementBondEntry {
    section: string;
    quality: CementBondQuality;
}

export interface Perforation {
    topDepth: number;
    bottomDepth: number;
    spf: number; // shots per foot
    phasing: number; // °
    entryHoleDiameter: number; // in
    penetrationDepth: number; // in
    perforationSkin: number;
}

export interface ArtificialLiftDesign {
    type: ArtificialLiftType;
    params: Record<string, number>;
}

export interface Stimulation {
    type: StimulationType;
    fracHalfLength?: number; // ft
    fracConductivity?: number; // md-ft (kf*w)
    proppantVolume?: number; // lbs
    postStimSkin: number;
    stages?: number;
}

export interface WellCost {
    drilling: number; // $
    completion: number; // $
    total: number; // $
    afeVariance: number; // % over/under
    drillingDays: number;
    nptDays: number;
}

export interface DrilledWell {
    wellId: string;
    trajectory: SurveyStation[];
    totalDepth: { md: number; tvd: number };
    casingInstalled: CasingInstalled[];
    cementBondQuality: CementBondEntry[];
    completionType: CompletionType;
    perforations: Perforation[];
    tubingSize: { id: number; od: number };
    tubingMaterial: string;
    packerDepth: number;
    scssvDepth: number;
    artificialLift: ArtificialLiftDesign;
    stimulation: Stimulation;
    cost: WellCost;
}

export interface DrillingCompletionLayer {
    wells: DrilledWell[];
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 5: PRODUCTION
// ───────────────────────────────────────────────────────────────

export type WellStatus = 'producing' | 'shut_in' | 'workover' | 'abandoned';
export type DeclineType = 'exponential' | 'hyperbolic' | 'harmonic';

export interface ProductionRecord {
    date: string; // ISO date
    oilRate: number; // bopd
    gasRate: number; // Mscfd
    waterRate: number; // bwpd
    liquidRate: number; // blpd
    waterCut: number; // fraction
    gor: number; // scf/stb
    glr: number; // scf/stb
    chokeSize: number; // 64ths inch
    fthp: number; // psi
    fchp: number; // psi
    fbhP?: number; // psi (downhole gauge)
    reservoirPressure?: number; // psi (periodic)
    cumulativeOil: number; // Mstb
    cumulativeGas: number; // MMscf
    cumulativeWater: number; // Mstb
    status: WellStatus;
}

export interface ProductionHistory {
    wellId: string;
    records: ProductionRecord[];
}

export interface ProductionFieldAggregate {
    totalOilRate: number;
    totalGasRate: number;
    totalWaterRate: number;
    totalLiquidRate: number;
    fieldWaterCut: number;
    fieldGOR: number;
    cumulativeOil: number; // MMstb
    recoveryFactor: number; // cumulative / STOIIP
}

export interface ProductionForecast {
    plateauRate: number; // bopd
    plateauDuration: number; // months
    declineType: DeclineType;
    declineRate: number; // Di per year
    bFactor?: number; // hyperbolic b-factor
    economicLimit: number; // bopd
    fieldLife: number; // years
    eurOil: number; // MMstb
    eurGas: number; // Bscf
    profile: { date: string; oil: number; gas: number; water: number }[];
}

export interface ChemicalRate {
    chemical: string;
    rate: number; // gal/day or lb/day
    unit: string;
}

export interface SurfaceFacilities {
    separatorPressures: { hp: number; ip: number; lp: number }; // psi
    exportSpec: { bsw: number; salt: number; rvp: number; status: string };
    gasExportRate: number; // MMscfd
    waterInjectionRate: number; // bwpd
    gasLiftRate: number; // MMscfd
    chemicalInjection: ChemicalRate[];
}

export interface ProductionLayer {
    history: ProductionHistory[];
    fieldAggregate: ProductionFieldAggregate | null;
    forecast: ProductionForecast | null;
    facilities: SurfaceFacilities | null;
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 6: MIDSTREAM
// ───────────────────────────────────────────────────────────────

export type TankerClass = 'VLCC' | 'Suezmax' | 'Aframax' | 'Panamax' | 'Handysize' | 'ULCC';

export interface Pipeline {
    diameter: number; // inches
    length: number; // km
    capacity: number; // bpd
    currentThroughput: number; // bpd
    utilizationRate: number; // fraction
    tariff: number; // $/bbl
    pressureDrop: number; // psi over total length
    pumpStations: { location: string; power: number; dischargePressure: number }[];
    integrityStatus: { lastIliDate: string; anomalyCount: number; remainingLife: number };
}

export interface TankData {
    tankId: string;
    product: string;
    capacity: number; // bbl
    currentLevel: number; // bbl
    temperature: number; // °F
}

export interface Storage {
    terminal: {
        tanks: TankData[];
        totalCapacity: number; // bbl
        daysOfSupply: number;
        receiptRate: number; // bpd
        deliveryRate: number; // bpd
    };
}

export interface Marine {
    tankerClass: TankerClass;
    cargoSize: number; // barrels per voyage
    voyageFrequency: number; // cargoes per month
    freightCost: number; // $/bbl
    transitTime: number; // days
}

export interface MidstreamLayer {
    pipeline: Pipeline | null;
    storage: Storage | null;
    marine: Marine | null;
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 7: REFINING
// ───────────────────────────────────────────────────────────────

export interface CrudeSlateEntry {
    name: string;
    volume: number; // bpd
    api: number;
    sulfur: number; // wt%
    tan: number;
    price: number; // $/bbl
}

export interface UnitYield {
    productName: string;
    volume: number; // bpd
    properties: Record<string, number>;
}

export interface RefiningUnit {
    unitId: string;
    feed: number; // bpd
    yields: UnitYield[];
    severity: number;
    catalystAge: number; // days on stream
    remainingLife: number; // days
    hydrogenConsumption?: number; // Mscfd
}

export interface FinishedProduct {
    name: string;
    volume: number; // bpd
    quality: Record<string, number>;
    specCompliance: boolean;
    price: number; // $/bbl
    revenue: number; // $/day
}

export interface RefineryEconomics {
    grossMargin: number; // $/bbl
    opex: number; // $/bbl
    netMargin: number; // $/bbl
    crackSpread: number; // $/bbl
    hydrogenBalance: number; // MMscfd surplus/deficit
    sulfurProduction: number; // tons/day
}

export interface RefiningLayer {
    crudeSlate: CrudeSlateEntry[];
    totalThroughput: number; // bpd
    utilizationRate: number; // fraction
    units: RefiningUnit[];
    products: FinishedProduct[];
    economics: RefineryEconomics | null;
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 8: DISTRIBUTION
// ───────────────────────────────────────────────────────────────

export interface TerminalProduct {
    productId: string;
    inventory: number; // barrels
    daysOfCover: number;
    quality: Record<string, number>;
    rackPrice: number; // $/gal or $/bbl
}

export interface DistributionTerminal {
    terminalId: string;
    products: TerminalProduct[];
    truckLoadsPerDay: number;
}

export interface ProductBatch {
    product: string;
    volume: number;
    position: number; // km from origin
    estimatedArrival: string;
}

export interface ProductPipelineData {
    batches: ProductBatch[];
    transmixVolume: number; // barrels per cycle
}

export interface DeliveryRecord {
    terminalId: string;
    stationId: string;
    product: string;
    volume: number;
    truckId: string;
    date: string;
    bolNumber: string;
}

export interface DistributionLayer {
    terminals: DistributionTerminal[];
    pipeline: ProductPipelineData | null;
    deliveries: DeliveryRecord[];
    fleetUtilization: number; // loads per truck per day
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 9: RETAIL
// ───────────────────────────────────────────────────────────────

export interface StationTank {
    tankId: string;
    product: string;
    capacity: number; // gallons
    currentLevel: number; // gallons
    ullage: number;
    waterBottom: number; // inches
    deliveryNeeded: boolean;
}

export interface StationSales {
    stationId: string;
    dailyVolume: Record<string, number>; // productId → gallons/day
    retailPrice: Record<string, number>; // productId → $/gallon
    rackCost: Record<string, number>; // productId → $/gallon
    fuelMargin: Record<string, number>; // productId → $/gallon
    insideSales: number; // $/day
    totalProfit: number; // $/day
}

export interface RetailStation {
    stationId: string;
    tanks: StationTank[];
}

export interface RetailLayer {
    stations: RetailStation[];
    sales: StationSales[];
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 10: ANALYTICS (Supporting)
// ───────────────────────────────────────────────────────────────

export interface DCAResult {
    wellId: string;
    declineType: DeclineType;
    qi: number; // initial rate bopd
    di: number; // nominal decline rate
    b: number; // b-factor
    eur: number; // Mstb
    r2: number; // fit quality
}

export interface TypeCurveParams {
    name: string;
    peakRate: number;
    declineRate: number;
    bFactor: number;
    eur: number;
    normalizedBy: 'well' | 'per_1000ft' | 'per_stage';
}

export interface MLPrediction {
    model: string;
    features: string[];
    predictedRate: number;
    confidence: number; // 0-1
    forecastHorizon: number; // months
}

export interface AnalyticsLayer {
    dcaResults: DCAResult[];
    typeCurves: TypeCurveParams[];
    mlPredictions: MLPrediction[];
    monitoringAlerts: { wellId: string; alert: string; severity: 'info' | 'warn' | 'critical'; timestamp: string }[];
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 11: UNCONVENTIONAL (Supporting)
// ───────────────────────────────────────────────────────────────

export interface FracDesign {
    wellId: string;
    proppantPerStage: number; // lbs
    fluidPerStage: number; // barrels
    numberOfStages: number;
    clusterSpacing: number; // ft
    injectionRate: number; // bpm
    treatPressure: number; // psi
}

export interface SRVEstimate {
    wellId: string;
    halfLength: number; // ft
    height: number; // ft
    width: number; // ft
    srv: number; // MM ft³
    proppedSRV: number; // MM ft³
}

export interface RTAResult {
    wellId: string;
    permeability: number; // md
    fractureHalfLength: number; // ft
    fractureConductivity: number; // md-ft
    reservoirPressure: number; // psi
    ogip: number; // Bscf per section
}

export interface UnconventionalLayer {
    fracDesigns: FracDesign[];
    srvEstimates: SRVEstimate[];
    rtaResults: RTAResult[];
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// LAYER 12: ASSET MANAGEMENT / ECONOMICS (Supporting)
// ───────────────────────────────────────────────────────────────

export interface NPVResult {
    npv: number; // $MM
    irr: number; // fraction
    paybackPeriod: number; // years
    dcfProfile: { year: number; cashFlow: number; discountedCF: number }[];
}

export interface PortfolioItem {
    assetId: string;
    npv: number;
    reserves: number; // MMstb
    production: number; // bopd
    capex: number; // $MM
    opex: number; // $/bbl
}

export interface HSEMetrics {
    totalRecordableIncidentRate: number;
    co2Intensity: number; // kg CO2/bbl
    waterIntensity: number; // bbl water/bbl oil
    flaringIntensity: number; // scf/bbl
}

export interface AssetManagementLayer {
    npv: NPVResult | null;
    portfolio: PortfolioItem[];
    hse: HSEMetrics | null;
    decommissioningLiability: number; // $MM
    lastUpdated: number;
    version: number;
}

// ───────────────────────────────────────────────────────────────
// AGGREGATE SIMULATION STATE
// ───────────────────────────────────────────────────────────────

export type LayerId = 'exploration' | 'appraisal' | 'reserves' | 'drillingCompletion'
    | 'production' | 'midstream' | 'refining' | 'distribution' | 'retail'
    | 'analytics' | 'unconventional' | 'assetManagement';

export type ConnectionStatus = 'green' | 'yellow' | 'red';

export type ConnectionKey =
    // Upstream → Downstream flow arrows
    | 'exploration→appraisal' | 'exploration→reserves' | 'exploration→drilling' | 'exploration→assetManagement'
    | 'appraisal→reserves' | 'appraisal→production' | 'appraisal→development' | 'appraisal→drilling'
    | 'reserves→development' | 'reserves→production' | 'reserves→assetManagement' | 'reserves→refining'
    | 'drilling→production' | 'drilling→reserves' | 'drilling→assetManagement'
    | 'production→midstream' | 'production→reserves' | 'production→assetManagement' | 'production→analytics'
    | 'midstream→refining' | 'midstream→assetManagement'
    | 'refining→distribution' | 'refining→retail' | 'refining→assetManagement'
    | 'distribution→retail' | 'distribution→assetManagement'
    | 'retail→assetManagement'
    | 'unconventional→production'
    | 'analytics→assetManagement';

export interface SimulationState {
    exploration: ExplorationLayer;
    appraisal: AppraisalLayer;
    reserves: ReservesLayer;
    drillingCompletion: DrillingCompletionLayer;
    production: ProductionLayer;
    midstream: MidstreamLayer;
    refining: RefiningLayer;
    distribution: DistributionLayer;
    retail: RetailLayer;
    analytics: AnalyticsLayer;
    unconventional: UnconventionalLayer;
    assetManagement: AssetManagementLayer;
    connectionStatus: Record<ConnectionKey, ConnectionStatus>;
    simulationId: string;
}