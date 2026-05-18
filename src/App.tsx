/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Layers,
  Droplet,
  LineChart,
  Drill,
  BookOpen,
  Search,
  Settings,
  ChevronRight,
  Database,
  Calculator,
  Compass,
  Zap,
  Info,
  Menu,
  X,
  Plus,
  Map,
  Thermometer,
  Flame,
  ArrowRight,
  Waves,
  Radio,
  Box,
  Shield,
  Check,
  PieChart,
  BarChart3,
  Library,
  Filter,
  ExternalLink,
  Droplets,
  ShieldAlert,
  CheckCircle2,
  Clock,
  FlaskConical,
  AlertTriangle,
  Navigation,
  Container,
  Mountain,
  Target,
  ShieldCheck,
  MoveHorizontal,
  BarChart,
  FileText,
  Download,
  TrendingDown,
  TrendingUp,
  Calendar,
  Wallet,
  AlertCircle,
  Globe,
  ClipboardList,
  Ruler,
  CalendarDays,
  Factory,
  Anchor,
  LayoutDashboard,
  Stethoscope,
  Network,
  BrainCircuit,
  Cpu,
  Users,
  ShoppingCart,
  Landmark
} from 'lucide-react';

import { cn, formatNumber } from './lib/utils';
import DataFlowIndicator from './components/shared/DataFlowIndicator';
import { UnitSystemProvider, UnitSystemToggle } from './components/shared/UnitSystemProvider';
import GlossaryReference from './components/shared/GlossaryReference';
import { LifecycleStage, Project } from './types';
import { COMMON_COMPONENTS, calculatePengRobinson } from './lib/pvt';
import {
  LITHOLOGY_DATABASE,
  DEPOSITIONAL_ENVIRONMENTS,
  GRAIN_SIZE_CHART,
  KEROGEN_TYPES,
  MATURITY_WINDOWS,
  BurialEvent,
  classifyKerogen,
  getMaturityInfo
} from './lib/geology';
import {
  calculateAcousticImpedance,
  calculateReflectionCoefficient,
  calculateNMO,
  calculateDixVelocity,
  calculateVerticalResolution,
  calculateFresnelZone,
  generateRickerWavelet,
  calculateFreeAirCorrection,
  calculateBouguerSlabCorrection,
  estimateSourceDepth,
  estimateBasementDepthMagnetic
} from './lib/geophysics';
import {
  calculatePg,
  runVolumetricSimulation,
  getPercentiles,
  RiskFactors,
  VolumetricInputs
} from './lib/prospect';
import { ACADEMIC_LIBRARY, Reference } from './lib/references';
const DrillingPanel = React.lazy(() => import('./components/DrillingPanel').then(m => ({ default: m.DrillingPanel })));
const LoggingTab = React.lazy(() => import('./components/petrophysics/LoggingTab').then(m => ({ default: m.LoggingTab })));
const PorosityTab = React.lazy(() => import('./components/petrophysics/PorosityTab').then(m => ({ default: m.PorosityTab })));
const VshaleTab = React.lazy(() => import('./components/petrophysics/VshaleTab').then(m => ({ default: m.VshaleTab })));
const SaturationTab = React.lazy(() => import('./components/petrophysics/SaturationTab').then(m => ({ default: m.SaturationTab })));
const PermeabilityTab = React.lazy(() => import('./components/petrophysics/PermeabilityTab').then(m => ({ default: m.PermeabilityTab })));
const NetPayTab = React.lazy(() => import('./components/petrophysics/NetPayTab').then(m => ({ default: m.NetPayTab })));
const CoreTab = React.lazy(() => import('./components/petrophysics/CoreTab').then(m => ({ default: m.CoreTab })));
const ContactsTab = React.lazy(() => import('./components/petrophysics/ContactsTab').then(m => ({ default: m.ContactsTab })));
const InterpretationTab = React.lazy(() => import('./components/petrophysics/InterpretationTab').then(m => ({ default: m.InterpretationTab })));
const ReportingTab = React.lazy(() => import('./components/petrophysics/ReportingTab').then(m => ({ default: m.ReportingTab })));
const ReferenceTab = React.lazy(() => import('./components/petrophysics/ReferenceTab').then(m => ({ default: m.ReferenceTab })));
const RockPropertiesTab = React.lazy(() => import('./components/reservoir/RockPropertiesTab').then(m => ({ default: m.RockPropertiesTab })));
const WellTestingTab = React.lazy(() => import('./components/reservoir/WellTestingTab').then(m => ({ default: m.WellTestingTab })));
const NodalAnalysisTab = React.lazy(() => import('./components/reservoir/NodalAnalysisTab').then(m => ({ default: m.NodalAnalysisTab })));
const MaterialBalanceTab = React.lazy(() => import('./components/reservoir/MaterialBalanceTab').then(m => ({ default: m.MaterialBalanceTab })));
const DeclineCurveAnalysisTab = React.lazy(() => import('./components/reservoir/DeclineCurveAnalysisTab').then(m => ({ default: m.DeclineCurveAnalysisTab })));
const DriveMechanismTab = React.lazy(() => import('./components/reservoir/DriveMechanismTab').then(m => ({ default: m.DriveMechanismTab })));
const EORScreeningTab = React.lazy(() => import('./components/reservoir/EORScreeningTab').then(m => ({ default: m.EORScreeningTab })));
const AquiferModelingTab = React.lazy(() => import('./components/reservoir/AquiferModelingTab').then(m => ({ default: m.AquiferModelingTab })));
const ReferencesTab = React.lazy(() => import('./components/reservoir/ReferencesTab').then(m => ({ default: m.ReferencesTab })));
const ReserveClassificationTab = React.lazy(() => import('./components/economics/ReserveClassificationTab').then(m => ({ default: m.ReserveClassificationTab })));
const VolumetricEstimationTab = React.lazy(() => import('./components/economics/VolumetricEstimationTab').then(m => ({ default: m.VolumetricEstimationTab })));
const GasMatBalTab = React.lazy(() => import('./components/economics/GasMatBalTab').then(m => ({ default: m.GasMatBalTab })));
const DeclineReservesTab = React.lazy(() => import('./components/economics/DeclineReservesTab').then(m => ({ default: m.DeclineReservesTab })));
const ProductionForecastingTab = React.lazy(() => import('./components/economics/ProductionForecastingTab').then(m => ({ default: m.ProductionForecastingTab })));
const EconomicAnalysisTab = React.lazy(() => import('./components/economics/EconomicAnalysisTab').then(m => ({ default: m.EconomicAnalysisTab })));
const RiskAnalysisTab = React.lazy(() => import('./components/economics/RiskAnalysisTab').then(m => ({ default: m.RiskAnalysisTab })));
const FiscalRegimeTab = React.lazy(() => import('./components/economics/FiscalRegimeTab').then(m => ({ default: m.FiscalRegimeTab })));
const ReservesReportingTab = React.lazy(() => import('./components/economics/ReservesReportingTab').then(m => ({ default: m.ReservesReportingTab })));
const EconomicsReferencesTab = React.lazy(() => import('./components/economics/EconomicsReferencesTab').then(m => ({ default: m.EconomicsReferencesTab })));
const DevStrategyTab = React.lazy(() => import('./components/fdp/DevStrategyTab').then(m => ({ default: m.DevStrategyTab })));
const WellSpacingTab = React.lazy(() => import('./components/fdp/WellSpacingTab').then(m => ({ default: m.WellSpacingTab })));
const DrillingScheduleTab = React.lazy(() => import('./components/fdp/DrillingScheduleTab').then(m => ({ default: m.DrillingScheduleTab })));
const ArtificialLiftTab = React.lazy(() => import('./components/fdp/ArtificialLiftTab').then(m => ({ default: m.ArtificialLiftTab })));
const SurfaceFacilityTab = React.lazy(() => import('./components/fdp/SurfaceFacilityTab').then(m => ({ default: m.SurfaceFacilityTab })));
const FlowAssuranceTab = React.lazy(() => import('./components/fdp/FlowAssuranceTab').then(m => ({ default: m.FlowAssuranceTab })));
const InjectionDesignTab = React.lazy(() => import('./components/fdp/InjectionDesignTab').then(m => ({ default: m.InjectionDesignTab })));
const OffshoreConceptTab = React.lazy(() => import('./components/fdp/OffshoreConceptTab').then(m => ({ default: m.OffshoreConceptTab })));
const ProjectRiskTab = React.lazy(() => import('./components/fdp/ProjectRiskTab').then(m => ({ default: m.ProjectRiskTab })));
const FDPReportTab = React.lazy(() => import('./components/fdp/FDPReportTab').then(m => ({ default: m.FDPReportTab })));
const ProductionDashboard = React.lazy(() => import('./components/production/ProductionDashboard').then(m => ({ default: m.ProductionDashboard })));
const WellDiagnostics = React.lazy(() => import('./components/production/WellDiagnostics').then(m => ({ default: m.WellDiagnostics })));
const LiftOptimization = React.lazy(() => import('./components/production/LiftOptimization').then(m => ({ default: m.LiftOptimization })));
const InterventionPlanning = React.lazy(() => import('./components/production/InterventionPlanning').then(m => ({ default: m.InterventionPlanning })));
const ChemicalTreatment = React.lazy(() => import('./components/production/ChemicalTreatment').then(m => ({ default: m.ChemicalTreatment })));
const NetworkOptimization = React.lazy(() => import('./components/production/NetworkOptimization').then(m => ({ default: m.NetworkOptimization })));
const HSEIntegrityTab = React.lazy(() => import('./components/production/HSEIntegrityTab').then(m => ({ default: m.HSEIntegrityTab })));
const ProductionReferencesTab = React.lazy(() => import('./components/production/ProductionReferencesTab').then(m => ({ default: m.ProductionReferencesTab })));
const DataCleaningTab = React.lazy(() => import('./components/analytics/DataCleaningTab').then(m => ({ default: m.DataCleaningTab })));
const StatisticsTab = React.lazy(() => import('./components/analytics/StatisticsTab').then(m => ({ default: m.StatisticsTab })));
const AutomatedDCATab = React.lazy(() => import('./components/analytics/AutomatedDCATab').then(m => ({ default: m.AutomatedDCATab })));
const TypeCurveTab = React.lazy(() => import('./components/analytics/TypeCurveTab').then(m => ({ default: m.TypeCurveTab })));
const PredictiveModelsTab = React.lazy(() => import('./components/analytics/PredictiveModelsTab').then(m => ({ default: m.PredictiveModelsTab })));
const RealtimeMonitoringTab = React.lazy(() => import('./components/analytics/RealtimeMonitoringTab').then(m => ({ default: m.RealtimeMonitoringTab })));
const ReservoirAnalyticsTab = React.lazy(() => import('./components/analytics/ReservoirAnalyticsTab').then(m => ({ default: m.ReservoirAnalyticsTab })));
const DigitalTwinTab = React.lazy(() => import('./components/analytics/DigitalTwinTab').then(m => ({ default: m.DigitalTwinTab })));
const AnalyticsReportingTab = React.lazy(() => import('./components/analytics/AnalyticsReportingTab').then(m => ({ default: m.AnalyticsReportingTab })));
const AnalyticsReferencesTab = React.lazy(() => import('./components/analytics/AnalyticsReferencesTab').then(m => ({ default: m.AnalyticsReferencesTab })));

const ExplorationStage = React.lazy(() => import('./components/exploration/ExplorationStage').then(m => ({ default: m.ExplorationStage })));
const AppraisalStage = React.lazy(() => import('./components/appraisal/AppraisalStage').then(m => ({ default: m.AppraisalStage })));
const ReservoirStage = React.lazy(() => import('./components/reservoir/ReservoirStage').then(m => ({ default: m.ReservoirStage })));
const ReservesStage = React.lazy(() => import('./components/reserves/ReservesStage').then(m => ({ default: m.ReservesStage })));
const ProductionStage = React.lazy(() => import('./components/production/ProductionStage').then(m => ({ default: m.default })));
const AnalyticsStage = React.lazy(() => import('./components/analytics/AnalyticsStage').then(m => ({ default: m.AnalyticsStage })));
const DevelopmentStage = React.lazy(() => import('./components/development/DevelopmentStage').then(m => ({ default: m.DevelopmentStage })));
const UnconventionalStage = React.lazy(() => import('./components/unconventional/UnconventionalStage').then(m => ({ default: m.UnconventionalStage })));
const AssetManagementStage = React.lazy(() => import('./components/management/AssetManagementStage').then(m => ({ default: m.AssetManagementStage })));
const SurveyingLeasingStage = React.lazy(() => import('./components/surveying/SurveyingLeasingStage').then(m => ({ default: m.default })));
const RefiningStage = React.lazy(() => import('./components/refining/RefiningStage').then(m => ({ default: m.default })));
const RetailStage = React.lazy(() => import('./components/retail/RetailStage').then(m => ({ default: m.default })));
const MidstreamStage = React.lazy(() => import('./components/midstream/MidstreamStage').then(m => ({ default: m.default })));
const DistributionStage = React.lazy(() => import('./components/distribution/DistributionStage').then(m => ({ default: m.default })));

import { InputWithSlider } from './components/SharedUI';
import {
  calculateMinimumCurvature,
  designJTypeWell,
  calculateSeparationFactor,
  SurveyStation,
  eatonPorePressure,
  eatonFractureGradient,
  calculateDExponent,
  calculateDc,
  CASING_GRADES,
  calculateTensileLoad,
  calculateCollapseSafetyFactor,
  calculateBurstSafetyFactor,
  calculateHydrostaticPressure,
  calculateECD,
  calculateBariteWeightUp,
  calculateKickTolerance,
  calculateStickingForce,
  calculateBitPressureLoss,
  calculateSurfaceLoss,
  calculateFrictionalLoss,
  recommendOptimalNozzles,
  calculateHydraulicOptimization,
  calculateSurgeSwab,
  BIT_DATABASE,
  calculateROP,
  calculateCostPerFoot,
  calculateKillMudWeight,
  calculateInitialCirculatingPressure,
  calculateFinalCirculatingPressure,
  calculateMASP,
  identifyInfluxType,
  calculateGasMigrationRate,
  generateWWSchedule,
  calculateSurvey,
  calculateMotorYield,
  calculatePlannedDogleg,
  correctAzimuth,
  SurveyMethod,
  CEMENT_CLASSES,
  calculateSlurryVolume,
  calculateSacksNeeded,
  calculateDisplacementVolume,
  calculateCementHydrostatic,
  DRILLING_PAPERS
} from './lib/drilling';
import { ACRONYM_DATABASE } from './lib/glossaryAcronyms';
import {
  LOGGING_TOOLS,
  POROSITY_TRANSFORMS,
  PEF_MATRIX_VALUES,
  calculateIGR,
  calculateVshLarionovTertiary,
  calculateVshLarionovOlder,
  calculateVshSteiber,
  calculateVshClavier,
  calculateVshSP,
  calculateVshNeutronDensity,
  calculateVshResistivity,
  calculateDensityPorosity,
  calculateSonicPorosityWyllie,
  calculateSonicPorosityRHG,
  calculateNeutronMatrixCorrection,
  calculateNDCrossplotPorosity,
  calculateEffectivePorosity,
  applyShaleCorrection,
  calculateArchieSw,
  calculateIndonesianSw,
  calculateSimandouxSw,
  calculateDualWaterSw,
  calculateRwFromSalinity,
  calculateRwFromSP,
  calculateRwa,
  calculateTimurPermeability,
  calculateCoatesPermeability,
  calculateWyllieRosePermeability,
  calculateWinlandR35,
  calculateKozenyCarman,
  fitPermeabilityTransform,
  calculateWaxmanSmitsSw,
  calculateTixierPermeability,
  calculateMorrisBiggsPermeability,
  calculateNetPayStats,
  evaluateNetPay,
  calculateOOIP,
  calculateGradientIntersection,
  calculateOWCFromFWL,
  calculateFormationFactor,
  calculateSaturationExponent,
  calculateLeverettJ,
  calculateAmottIndex
} from './lib/petrophysics';
import ReactMarkdown from 'react-markdown';
import {
  LineChart as RechartLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Bar
} from 'recharts';

// --- Mock Data ---
const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Alpha Ridge Field',
    description: 'Deepwater turbidite reservoir in offshore Basin A.',
    currentStage: LifecycleStage.RESERVOIR,
    data: {
      reservoir: {
        porosity: 0.18,
        permeability: 120,
        temp: 85,
        press: 350,
      },
      production: [
        { month: 'Jan', rate: 12000 },
        { month: 'Feb', rate: 11800 },
        { month: 'Mar', rate: 11500 },
        { month: 'Apr', rate: 11200 },
        { month: 'May', rate: 10900 },
        { month: 'Jun', rate: 10600 },
      ]
    }
  }
];

// --- Phase color mapping ---
const PHASE_COLORS: Record<string, string> = {
  EXPLORATION: 'bg-amber-500',
  APPRAISAL: 'bg-emerald-500',
  RESERVES: 'bg-purple-500',
  DRILLING: 'bg-red-500',
  DEVELOPMENT: 'bg-teal-500',
  PRODUCTION: 'bg-green-500',
  MIDSTREAM: 'bg-slate-500',
  REFINING_ADV: 'bg-indigo-500',
  DISTRIBUTION: 'bg-cyan-500',
  RETAIL: 'bg-rose-500',
  UNCONVENTIONAL: 'bg-violet-500',
  ANALYTICS: 'bg-sky-500',
  ASSET_MANAGEMENT: 'bg-blue-500',
};

const PHASE_BORDER_COLORS: Record<string, string> = {
  EXPLORATION: 'border-amber-500',
  APPRAISAL: 'border-emerald-500',
  RESERVES: 'border-purple-500',
  DRILLING: 'border-red-500',
  DEVELOPMENT: 'border-teal-500',
  PRODUCTION: 'border-green-500',
  MIDSTREAM: 'border-slate-500',
  REFINING_ADV: 'border-indigo-500',
  DISTRIBUTION: 'border-cyan-500',
  RETAIL: 'border-rose-500',
  UNCONVENTIONAL: 'border-violet-500',
  ANALYTICS: 'border-sky-500',
  ASSET_MANAGEMENT: 'border-blue-500',
};

const PHASE_TEXT_COLORS: Record<string, string> = {
  EXPLORATION: 'text-amber-500',
  APPRAISAL: 'text-emerald-500',
  RESERVES: 'text-purple-500',
  DRILLING: 'text-red-500',
  DEVELOPMENT: 'text-teal-500',
  PRODUCTION: 'text-green-500',
  MIDSTREAM: 'text-slate-500',
  REFINING_ADV: 'text-indigo-500',
  DISTRIBUTION: 'text-cyan-500',
  RETAIL: 'text-rose-500',
  UNCONVENTIONAL: 'text-violet-500',
  ANALYTICS: 'text-sky-500',
  ASSET_MANAGEMENT: 'text-blue-500',
};

function getPhaseColor(stage: string): string {
  return PHASE_COLORS[stage] || 'bg-emerald-500';
}

function getPhaseBorder(stage: string): string {
  return PHASE_BORDER_COLORS[stage] || 'border-emerald-500';
}

function getPhaseText(stage: string): string {
  return PHASE_TEXT_COLORS[stage] || 'text-emerald-500';
}

// --- Components ---

const SidebarItem = ({
  stage,
  active,
  icon: Icon,
  label,
  onClick
}: {
  stage: LifecycleStage;
  active: boolean;
  icon: any;
  label: string;
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-colors duration-150 group relative",
      active
        ? `text-${getPhaseText(stage).replace('text-', '')}` !== 'text-text-primary'
          ? getPhaseText(stage)
          : "text-brand-primary"
        : "text-text-secondary hover:text-text-primary"
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-150",
      active
        ? `${getPhaseColor(stage).replace('bg-', 'bg-')}/10 ${getPhaseBorder(stage).replace('border-', 'border-')}/30`
        : "bg-panel-bg border border-border-subtle group-hover:border-text-tertiary"
    )}>
      <Icon size={18} />
    </div>
    <span className="text-[11px] font-bold uppercase tracking-tight whitespace-nowrap">{label.split(' ')[0]}</span>
    {active && (
      <div className={cn("absolute -right-3 w-1 h-6 rounded-sm", getPhaseColor(stage))} />
    )}
  </button>
);


export default function App() {
  const [activeStage, setActiveStage] = useState<LifecycleStage>(LifecycleStage.RESERVOIR);
  const [reservoirSubTab, setReservoirSubTab] = useState<'pvt' | 'properties' | 'welltesting' | 'nodal' | 'matbal' | 'dca' | 'drive' | 'eor' | 'aquifer' | 'simulation' | 'references' | 'performance'>('pvt');
  const [reservesSubTab, setReservesSubTab] = useState<'classification' | 'volumetrics' | 'matbal' | 'decline' | 'forecasting' | 'economics' | 'risk' | 'fiscal' | 'reporting' | 'references'>('classification');
  const [fdpSubTab, setFdpSubTab] = useState<'strategy' | 'spacing' | 'drilling' | 'lift' | 'facilities' | 'flow' | 'injection' | 'offshore' | 'risk' | 'report'>('strategy');
  const [productionSubTab, setProductionSubTab] = useState<'surveillance' | 'diagnostics' | 'lift' | 'intervention' | 'chemical' | 'network' | 'hse' | 'references'>('surveillance');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'cleaning' | 'statistics' | 'automated-dca' | 'type-curves' | 'machinelearning' | 'realtime' | 'reservoir-surveillance' | 'digital-twin' | 'reporting' | 'references'>('cleaning');
  const [project, setProject] = useState<Project>(MOCK_PROJECTS[0]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Theme toggle with localStorage persistence
  const [lightTheme, setLightTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('petrostream-theme') === 'light';
    }
    return false;
  });

  useEffect(() => {
    const theme = lightTheme ? 'light' : 'stealth';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('petrostream-theme', theme);
  }, [lightTheme]);

  // AI Agent State
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setAiLoading] = useState(false);

  // PVT Engine State
  const [temp, setTemp] = useState(85);
  const [press, setPress] = useState(300);
  const pvtResults = useMemo(() => calculatePengRobinson(temp, press, COMMON_COMPONENTS), [temp, press]);

  // Exploration Calculators
  const [velocity, setVelocity] = useState(3250);
  const [twt, setTwt] = useState(4.5);
  const [crustDensity, setCrustDensity] = useState(2.67);
  const [elevation, setElevation] = useState(1500);

  // PG Matrix State
  const [pgReservoir, setPgReservoir] = useState(0.8);
  const [pgTrap, setPgTrap] = useState(0.75);
  const [pgSeal, setPgSeal] = useState(0.65);
  const [pgCharge, setPgCharge] = useState(0.9);
  const [pgTiming, setPgTiming] = useState(0.85);

  const totalPg = useMemo(() =>
    pgReservoir * pgTrap * pgSeal * pgCharge * pgTiming,
    [pgReservoir, pgTrap, pgSeal, pgCharge, pgTiming]
  );

  // Geological Picks
  const [picks, setPicks] = useState<{ well: string, depth: number, formation: string }[]>([]);

  // Surface Geology State
  const [dipAngle, setDipAngle] = useState(15);
  const [strikeAngle, setStrikeAngle] = useState(45);
  const [apparentThickness, setApparentThickness] = useState(100);
  const [gpsCoords, setGpsCoords] = useState({ lat: 28.54, lon: -90.41 });
  const [outcrops, setOutcrops] = useState<{ lat: number, lon: number, formation: string, lithology: string }[]>([]);
  const [explorationSubTab, setExplorationSubTab] = useState<'seismic' | 'surface' | 'basin' | 'geophysics' | 'evaluation' | 'reference' | 'visualization' | 'seismicprocessing'>('seismic');

  // Visualization Phase State
  const [structuralData, setStructuralData] = useState<{ strike: number, dip: number }[]>([
    { strike: 45, dip: 30 },
    { strike: 50, dip: 35 },
    { strike: 40, dip: 28 },
    { strike: 135, dip: 60 },
    { strike: 130, dip: 55 },
    { strike: 220, dip: 15 },
  ]);
  const [crossSectionPoints, setCrossSectionPoints] = useState<{ x: number, z: number, horizon: string }[]>([
    { x: 0, z: -1000, horizon: 'Top Miocene' },
    { x: 2000, z: -1100, horizon: 'Top Miocene' },
    { x: 4000, z: -950, horizon: 'Top Miocene' },
    { x: 6000, z: -1050, horizon: 'Top Miocene' },
    { x: 0, z: -1500, horizon: 'Top Cretaceous' },
    { x: 2000, z: -1650, horizon: 'Top Cretaceous' },
    { x: 4000, z: -1400, horizon: 'Top Cretaceous' },
    { x: 6000, z: -1550, horizon: 'Top Cretaceous' },
  ]);

  // Geophysical Tools State
  const [seismicFreq, setSeismicFreq] = useState(30);
  const [seismicOffset, setSeismicOffset] = useState(1000);
  const [vAbove, setVAbove] = useState(2500);
  const [rhoAbove, setRhoAbove] = useState(2.2);
  const [vBelow, setVBelow] = useState(3000);
  const [rhoBelow, setRhoBelow] = useState(2.4);
  const [magIntensity, setMagIntensity] = useState(48000);
  const [magAnomWidth, setMagAnomWidth] = useState(500);
  const [magDiurnal, setMagDiurnal] = useState(25);

  // Dix State
  const [vrms1, setVrms1] = useState(2000);
  const [t1, setT1] = useState(1.0);
  const [vrms2, setVrms2] = useState(2500);
  const [t2, setT2] = useState(1.5);

  // Prospect Evaluation State
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({
    source: 0.8,
    reservoir: 0.7,
    trap: 0.9,
    seal: 0.8,
    migration: 0.85
  });

  const [volInputs, setVolInputs] = useState<VolumetricInputs>({
    area: { min: 500, base: 1200, max: 3000 },
    netPay: { min: 20, base: 45, max: 100 },
    porosity: { min: 0.12, base: 0.18, max: 0.25 },
    sw: { min: 0.2, base: 0.3, max: 0.45 },
    bo: 1.25
  });

  const [simulationResults, setSimulationResults] = useState<{ p90: number, p50: number, p10: number } | null>(null);
  const [refSearchTerm, setRefSearchTerm] = useState('');
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [petrophysicsSubTab, setPetrophysicsSubTab] = useState<'logging' | 'interpretation' | 'porosity' | 'lithology' | 'reference' | 'vshale' | 'saturation' | 'permeability' | 'netpay' | 'contacts' | 'core' | 'multimineral' | 'reporting'>('logging');
  const [multiminInp, setMultiminInp] = useState({
    rhob: 2.45,
    nphi: 0.15,
    pef: 3.2,
    rhoFluid: 1.0,
    hiFluid: 1.0
  });

  const calculateMultimineral = (rhob: number, nphi: number, pef: number) => {
    const sand = { rho: 2.65, nphi: -0.03, u: 4.8 };
    const lime = { rho: 2.71, nphi: 0.00, u: 13.8 };
    const dolo = { rho: 2.87, nphi: 0.04, u: 9.0 };

    const dSand = Math.sqrt(Math.pow(rhob - sand.rho, 2) + Math.pow(nphi - sand.nphi, 2) + Math.pow(pef - 1.81, 2));
    const dLime = Math.sqrt(Math.pow(rhob - lime.rho, 2) + Math.pow(nphi - lime.nphi, 2) + Math.pow(pef - 5.08, 2));
    const dDolo = Math.sqrt(Math.pow(rhob - dolo.rho, 2) + Math.pow(nphi - dolo.nphi, 2) + Math.pow(pef - 3.14, 2));

    const invSand = 1 / Math.max(0.001, dSand);
    const invLime = 1 / Math.max(0.001, dLime);
    const invDolo = 1 / Math.max(0.001, dDolo);

    const totalInv = invSand + invLime + invDolo;

    const bulkMatrixRho = (invSand * sand.rho + invLime * lime.rho + invDolo * dolo.rho) / totalInv;
    const phi = Math.max(0, (bulkMatrixRho - rhob) / (bulkMatrixRho - 1.0));
    const matrixFrac = 1 - phi;

    return {
      sand: (invSand / totalInv) * matrixFrac,
      lime: (invLime / totalInv) * matrixFrac,
      dolo: (invDolo / totalInv) * matrixFrac,
      phi: phi
    };
  };

  const [netPayInp, setNetPayInp] = useState({
    minPhi: 0.08,
    maxVsh: 0.50,
    maxSw: 0.60,
    minK: 1.0,
    area: 1200,
    bo: 1.25
  });
  const [coreInp, setCoreInp] = useState({
    a: 1.0,
    m: 2.0,
    n_guess: 2.0,
    sigma: 72,
    theta: 0,
    phi_core: 0.18,
    k_core: 150,
    pc: 12.5,
    depthShift: 2.5
  });
  const [contactInp, setContactInp] = useState({
    gasGrad: 0.08,
    oilGrad: 0.35,
    waterGrad: 0.45,
    refDepth: 5100,
    gasPAtRef: 2400,
    oilPAtRef: 2400,
    waterPAtRef: 2400,
    fwl: 5200,
    pcEntry: 5.0
  });
  const [permeabilityInp, setPermeabilityInp] = useState({
    phi: 0.18,
    swi: 0.25,
    grainSize: 0.1,
    type: 'oil' as 'oil' | 'gas',
    method: 'timur' as 'timur' | 'coates' | 'wyllie' | 'kozeny' | 'winland' | 'tixier' | 'morrisbiggs',
    coreData: [
      { phi: 0.10, k: 5 },
      { phi: 0.15, k: 45 },
      { phi: 0.18, k: 120 },
      { phi: 0.22, k: 450 },
      { phi: 0.25, k: 1200 }
    ]
  });
  const [saturationInp, setSaturationInp] = useState({
    rw: 0.05,
    rt: 20,
    phi: 0.22,
    a: 1.0,
    m: 2.0,
    n: 2.0,
    vsh: 0.15,
    rsh: 2.0,
    rwb: 0.1,
    nphi_sh: 0.45,
    temp: 150,
    salinity: 50000,
    ssp: -45,
    rmfe: 0.5,
    qv: 0.1,
    b: 3.8,
    method: 'archie' as 'archie' | 'indonesian' | 'simandoux' | 'dualwater' | 'waxmansmits'
  });
  const [vshaleInp, setVshaleInp] = useState({
    gr: 85,
    grClean: 20,
    grShale: 120,
    sp: -20,
    spBase: 0,
    spMax: -45,
    nphi: 0.28,
    dphi: 0.22,
    nphiSh: 0.45,
    dphiSh: 0.05,
    rt: 15,
    rClean: 50,
    rShale: 2
  });
  const [porosityInp, setPorosityInp] = useState({
    rhob: 2.35,
    rhoMatrix: 2.65,
    rhoFluid: 1.0,
    dt: 75,
    dtMatrix: 55.5,
    dtFluid: 189,
    nphi: 0.25,
    nphiShale: 0.35,
    dphiShale: 0.12,
    dtShale: 90,
    lithology: 'sandstone' as 'sandstone' | 'limestone' | 'dolomite',
    vshale: 0.2,
    applyShaleCorrection: true
  });
  const [structuralDeformity, setStructuralDeformity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  // Drilling State
  const [paperSearchTerm, setPaperSearchTerm] = useState('');
  const [paperTopicFilter, setPaperTopicFilter] = useState('All');
  const [selectedLoggingTool, setSelectedLoggingTool] = useState<any>(LOGGING_TOOLS[0]);
  const [drillingSubTab, setDrillingSubTab] = useState<'planning' | 'fluids' | 'casing' | 'mud' | 'hydraulics' | 'bitSelection' | 'bha' | 'wellControl' | 'directional' | 'cementing' | 'papers'>('planning');
  const [cementingInp, setCementingInp] = useState({
    annularVolume: 350,
    shoeTrackVolume: 15,
    excessPercent: 20,
    slurryYield: 1.18,
    cementDensity: 15.8,
    cementHeight: 2000,
    casingID: 8.681,
    totalTVD: 5000,
    selectedClassIndex: 2,
    freeWater: 0.5,
    fluidLoss: 50,
  });
  const [directionalInp, setDirectionalInp] = useState({
    p1: { md: 5000, inc: 15, azi: 45 },
    p2: { md: 5100, inc: 20, azi: 55 },
    surveyMethod: 'min-curvature' as SurveyMethod,
    motorBend: 1.5,
    motorSize: 6.75,
    slidePercent: 30,
    magDeclination: 5.5,
    convergence: 0.5,
    magAzimuth: 125,
  });
  const [wellControlInp, setWellControlInp] = useState({
    sidpp: 500,
    sicp: 800,
    pitsGain: 20,
    scrp: 300,
    pumpRate: 3,
    dsVolume: 120,
    annVolume: 450,
    pumpDisp: 0.1,
    migrationIncrease: 100,
    migrationTime: 30,
  });
  const [bitInp, setBitInp] = useState({
    selectedBitIndex: 0,
    wob: 25,
    rpm: 120,
    toothWear: 1,
    rigRate: 1500,
    tripTime: 8,
    drillingTime: 48,
    nextDepth: 5500,
  });
  const [hydraulicsInp, setHydraulicsInp] = useState({
    pumpRate: 600,
    nozzleSizes: [14, 14, 14],
    dh: 12.25,
    dp: 5.0,
    dpID: 4.276,
    dcOD: 8.0,
    dcID: 2.875,
    dpLength: 4500,
    dcLength: 500,
    vTripping: 1.5,
    surfaceType: 3,
    rheologyModel: 'bingham' as 'bingham' | 'power-law'
  });
  const [casingDepth, setCasingDepth] = useState(5000);
  const [selectedGrade, setSelectedGrade] = useState('N-80');
  const [selectedWeight, setSelectedWeight] = useState(26);
  const [internalPress, setInternalPress] = useState(3000);
  const [externalPress, setExternalPress] = useState(1500);
  const [mudInp, setMudInp] = useState({
    volume: 1200,
    currentMW: 9.5,
    targetMW: 12.0,
    annLoss: 350,
    yp: 14,
    pv: 22,
    shoeFG: 14.2,
    shoeTVD: 4500,
    kickVol: 25
  });
  const [ppInp, setPpInp] = useState({ overburden: 1.0, normalPP: 0.465, dtNormal: 100, dtObs: 120, poisson: 0.25 });
  const [dExpInp, setDExpInp] = useState({ rop: 50, rpm: 120, wob: 30, bitDiam: 12.25, normalMW: 9.0, currentMW: 10.5 });
  const [pressureProfile, setPressureProfile] = useState<{ depth: number, pp: number, fg: number }[]>([]);
  const [surveyS1, setSurveyS1] = useState<SurveyStation>({ md: 1000, inc: 0, azi: 0 });
  const [surveyS2, setSurveyS2] = useState<SurveyStation>({ md: 1100, inc: 5, azi: 45 });
  const [targetParams, setTargetParams] = useState({ targetTVD: 3000, targetMD: 0, targetDeparture: 800, kop: 1200, buildRate: 3 });
  const [plannedTrajectories, setPlannedTrajectories] = useState<{ name: string, type: string }[]>([
    { name: 'W-001 Main', type: 'J-Type' },
    { name: 'W-002 Sidetrack', type: 'S-Type' }
  ]);

  const pg = useMemo(() => calculatePg(riskFactors), [riskFactors]);

  useEffect(() => {
    const results = runVolumetricSimulation(volInputs, 1000);
    setSimulationResults(getPercentiles(results));
  }, [volInputs]);

  // Source Rock Evaluation State
  const [toc, setToc] = useState(2.2);
  const [hydrogenIndex, setHydrogenIndex] = useState(420);
  const [oxygenIndex, setOxygenIndex] = useState(35);
  const [vitriniteReflectance, setVitriniteReflectance] = useState(0.85);
  const [burialEvents, setBurialEvents] = useState<BurialEvent[]>([
    { age: 150, depth: 4000, event: 'Jurassic Entry' },
    { age: 100, depth: 3200, event: 'Cretaceous Deposition' },
    { age: 66, depth: 2500, event: 'KT Boundary' },
    { age: 10, depth: 1000, event: 'Neogene Uplift' },
    { age: 0, depth: 0, event: 'Present' }
  ]);

  const kerogenType = useMemo(() => classifyKerogen(hydrogenIndex, oxygenIndex), [hydrogenIndex, oxygenIndex]);
  const maturityInfo = useMemo(() => getMaturityInfo(vitriniteReflectance), [vitriniteReflectance]);

  const sortedBurialHistory = useMemo(() =>
    [...burialEvents].sort((a, b) => b.age - a.age),
    [burialEvents]);

  const addBurialEvent = () => {
    const lastEvent = burialEvents[0];
    const newEvent: BurialEvent = {
      age: Math.max(0, (lastEvent?.age || 0) + 20),
      depth: (lastEvent?.depth || 0) + 500,
      event: `New Sequence ${burialEvents.length + 1}`
    };
    setBurialEvents([newEvent, ...burialEvents]);
  };

  const removeBurialEvent = (index: number) => {
    if (burialEvents.length <= 2) return;
    setBurialEvents(burialEvents.filter((_, i) => i !== index));
  };

  const calculatedTST = useMemo(() => {
    const rad = (dipAngle * Math.PI) / 180;
    return apparentThickness * Math.cos(rad);
  }, [dipAngle, apparentThickness]);

  const mockLogData = useMemo(() => {
    const data = [];
    for (let d = 5000; d <= 5200; d += 0.5) {
      const isMainReservoir = d > 5050 && d < 5150;
      const noise = (Math.sin(d * 0.5) + Math.cos(d * 0.2)) * 0.5;

      const phi = isMainReservoir
        ? Math.max(0.01, 0.15 + noise * 0.08 + (Math.random() - 0.5) * 0.02)
        : Math.max(0.01, 0.05 + noise * 0.03 + (Math.random() - 0.5) * 0.01);

      const vsh = isMainReservoir
        ? Math.max(0, Math.min(1, 0.25 - noise * 0.15 + (Math.random() - 0.5) * 0.05))
        : Math.max(0.01, Math.min(1, 0.75 - noise * 0.2 + (Math.random() - 0.5) * 0.1));

      const sw = isMainReservoir
        ? Math.max(0.1, Math.min(1, 0.35 + noise * 0.2 + (Math.random() - 0.5) * 0.05))
        : 0.95;

      const k = isMainReservoir
        ? Math.pow(10, 0.5 + phi * 15 - vsh * 2)
        : Math.pow(10, -1 + phi * 5);

      data.push({ depth: d, phi, vsh, sw, k });
    }
    return data;
  }, []);

  const aiAbove = useMemo(() => calculateAcousticImpedance(rhoAbove, vAbove), [rhoAbove, vAbove]);
  const aiBelow = useMemo(() => calculateAcousticImpedance(rhoBelow, vBelow), [rhoBelow, vBelow]);
  const rc = useMemo(() => calculateReflectionCoefficient(aiAbove, aiBelow), [aiAbove, aiBelow]);
  const verticalRes = useMemo(() => calculateVerticalResolution(vAbove, seismicFreq), [vAbove, seismicFreq]);
  const fresnelZone = useMemo(() => calculateFresnelZone(vAbove, twt, seismicFreq), [vAbove, twt, seismicFreq]);
  const nmoCorrection = useMemo(() => calculateNMO(twt, seismicOffset, vAbove), [twt, seismicOffset, vAbove]);
  const rickerWavelet = useMemo(() => generateRickerWavelet(seismicFreq), [seismicFreq]);
  const sourceDepth = useMemo(() => estimateBasementDepthMagnetic(magAnomWidth), [magAnomWidth]);
  const freeAirCorr = useMemo(() => calculateFreeAirCorrection(elevation), [elevation]);
  const bouguerSlabCorr = useMemo(() => calculateBouguerSlabCorrection(crustDensity, elevation), [crustDensity, elevation]);
  const intervalVelocity = useMemo(() => calculateDixVelocity(vrms1, t1, vrms2, t2), [vrms1, t1, vrms2, t2]);

  useEffect(() => {
    if (activeStage === LifecycleStage.EXPLORATION) {
      let baseCharge = 0.5;
      if (toc < 0.5) baseCharge = 0.1;
      else if (toc > 2.0) baseCharge = 0.85;

      if (vitriniteReflectance < 0.55 || vitriniteReflectance > 2.5) {
        baseCharge *= 0.5;
      }

      setPgCharge(Number(baseCharge.toFixed(2)));
    }
  }, [toc, vitriniteReflectance, activeStage]);

  useEffect(() => {
    const profile = [];
    for (let d = 0; d <= 10000; d += 500) {
      const normalPp = 0.433 + (d / 10000) * 0.03;
      let pp = normalPp;
      if (d > 4000 && d < 7000) pp += 0.15;
      if (d >= 7000) pp += 0.05;

      const overburden = 1.0;
      const poisson = 0.25 + (d / 20000);
      const ratio = poisson / (1 - poisson);
      const fg = ratio * (overburden - pp) + pp;

      profile.push({ depth: d, pp: Number((pp * 19.2).toFixed(2)), fg: Number((fg * 19.2).toFixed(2)) });
    }
    setPressureProfile(profile);
  }, []);

  const calculatedDepth = useMemo(() => (velocity * twt) / 2, [velocity, twt]);
  const calculatedBouguer = useMemo(() => 0.04193 * crustDensity * elevation, [crustDensity, elevation]);

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    const q = query.trim().toLowerCase();
    setAiLoading(true);
    setAiResponse('');

    // Local knowledge-base search (always runs first for instant results)
    const localResults: string[] = [];

    // Search academic reference library
    const refMatches = ACADEMIC_LIBRARY.filter(
      r => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)) || r.authors.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q)
    );
    if (refMatches.length > 0) {
      localResults.push(`### 📚 Academic References (${refMatches.length} match${refMatches.length > 1 ? 'es' : ''})\n`);
      refMatches.slice(0, 5).forEach(r => {
        localResults.push(`- **${r.title}** (${r.authors}, ${r.year}) — *${r.topic}*  \n  ${r.summary}\n  \`${r.citation}\``);
      });
      if (refMatches.length > 5) localResults.push(`\n*…and ${refMatches.length - 5} more matches.*`);
    }

    // Search glossary / acronym database
    const acronymMatches = ACRONYM_DATABASE.filter(
      a => a.acronym.toLowerCase().includes(q) || a.fullName.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
    if (acronymMatches.length > 0) {
      localResults.push(`\n### 🔤 Glossary / Acronyms (${acronymMatches.length} match${acronymMatches.length > 1 ? 'es' : ''})\n`);
      acronymMatches.slice(0, 8).forEach(a => {
        localResults.push(`- **${a.acronym}** — ${a.fullName}  \n  ${a.description}  \n  *Category: ${a.category}*`);
      });
      if (acronymMatches.length > 8) localResults.push(`\n*…and ${acronymMatches.length - 8} more matches.*`);
    }

    // Show local results if found; otherwise show no-results message
    if (localResults.length > 0) {
      setAiResponse(localResults.join('\n'));
    } else {
      setAiResponse('*No results found in the technical knowledge base. Try a different query (e.g., "Archie equation", "BHA", "Vogel IPR", "Gardner relation").*');
    }
    setAiLoading(false);
  };

  return (
    <UnitSystemProvider>
      <div className={cn("flex flex-col h-screen bg-app-bg text-text-primary font-sans overflow-hidden", lightTheme && "theme-light")}>
        {/* Top Navigation Bar */}
        <nav className="h-14 border-b border-border-subtle bg-panel-bg flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <Droplet size={18} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-text-primary">AstraCore <span className="text-brand-primary font-light underline decoration-brand-primary/20 underline-offset-4">PetroStream</span></span>
          </div>

          <div className="flex items-center gap-3">
            <UnitSystemToggle />
            <GlossaryReference />

            {/* Theme Toggle */}
            <button
              onClick={() => setLightTheme(!lightTheme)}
              className="ml-4 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border border-border-subtle rounded transition-colors hover:bg-hover-bg"
            >
              {lightTheme ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>

          <div className="hidden lg:flex gap-8 text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
            <button onClick={() => setActiveStage(LifecycleStage.EXPLORATION)} className={cn("hover:text-amber-400 transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.EXPLORATION && "text-amber-400 border-amber-400")}>Exploration</button>
            <button onClick={() => setActiveStage(LifecycleStage.APPRAISAL)} className={cn("hover:text-emerald-400 transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.APPRAISAL && "text-emerald-400 border-emerald-400")}>Appraisal</button>
            <button onClick={() => setActiveStage(LifecycleStage.RESERVOIR)} className={cn("hover:text-text-primary transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.RESERVOIR && "text-brand-primary border-brand-primary")}>Reservoir Eng</button>
            <button onClick={() => setActiveStage(LifecycleStage.DRILLING)} className={cn("hover:text-red-400 transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.DRILLING && "text-red-400 border-red-400")}>Drilling</button>
            <button onClick={() => setActiveStage(LifecycleStage.UNCONVENTIONAL)} className={cn("hover:text-violet-400 transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.UNCONVENTIONAL && "text-violet-400 border-violet-400")}>Unconventional</button>
            <button onClick={() => setActiveStage(LifecycleStage.ASSET_MANAGEMENT)} className={cn("hover:text-blue-400 transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.ASSET_MANAGEMENT && "text-blue-400 border-blue-400")}>Management</button>
            <button onClick={() => setActiveStage(LifecycleStage.LEASING)} className={cn("hover:text-text-primary transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.LEASING && "text-brand-primary border-brand-primary")}>Leasing</button>
            <button onClick={() => setActiveStage(LifecycleStage.PRODUCTION)} className={cn("hover:text-green-400 transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.PRODUCTION && "text-green-400 border-green-400")}>Production</button>
            <button onClick={() => setActiveStage(LifecycleStage.MIDSTREAM)} className={cn("hover:text-slate-400 transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.MIDSTREAM && "text-slate-400 border-slate-400")}>Midstream</button>
            <button onClick={() => setActiveStage(LifecycleStage.DISTRIBUTION)} className={cn("hover:text-cyan-400 transition-colors pb-1 border-b-2 border-transparent", activeStage === LifecycleStage.DISTRIBUTION && "text-cyan-400 border-cyan-400")}>Distribution</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-text-tertiary leading-none uppercase font-mono">Active Project</div>
              <div className="text-xs font-mono text-brand-primary">GULF-BRAVO-14X</div>
            </div>
            <div className="w-8 h-8 rounded-full border border-border-subtle bg-elevated-bg flex items-center justify-center text-[11px] text-text-primary font-bold">JD</div>
          </div>
        </nav>

        <div className="flex grow overflow-hidden">
          {/* Life-cycle Rail */}
          <aside className="w-20 border-r border-border-subtle bg-panel-bg flex flex-col items-center py-8 gap-6 shrink-0 z-20 overflow-y-auto custom-scrollbar">
            <SidebarItem stage={LifecycleStage.EXPLORATION} icon={Compass} label="Expl" active={activeStage === LifecycleStage.EXPLORATION} onClick={() => setActiveStage(LifecycleStage.EXPLORATION)} />
            <SidebarItem stage={LifecycleStage.DRILLING} icon={Drill} label="Dril" active={activeStage === LifecycleStage.DRILLING} onClick={() => setActiveStage(LifecycleStage.DRILLING)} />
            <SidebarItem stage={LifecycleStage.APPRAISAL} icon={Activity} label="Appr" active={activeStage === LifecycleStage.APPRAISAL} onClick={() => setActiveStage(LifecycleStage.APPRAISAL)} />
            <SidebarItem stage={LifecycleStage.RESERVOIR} icon={Layers} label="Resv" active={activeStage === LifecycleStage.RESERVOIR} onClick={() => setActiveStage(LifecycleStage.RESERVOIR)} />
            <SidebarItem stage={LifecycleStage.RESERVES} icon={Database} label="Rese" active={activeStage === LifecycleStage.RESERVES} onClick={() => setActiveStage(LifecycleStage.RESERVES)} />
            <SidebarItem stage={LifecycleStage.DEVELOPMENT} icon={Calculator} label="Dev" active={activeStage === LifecycleStage.DEVELOPMENT} onClick={() => setActiveStage(LifecycleStage.DEVELOPMENT)} />
            <SidebarItem stage={LifecycleStage.PRODUCTION} icon={LayoutDashboard} label="Prod" active={activeStage === LifecycleStage.PRODUCTION} onClick={() => setActiveStage(LifecycleStage.PRODUCTION)} />
            <SidebarItem stage={LifecycleStage.ANALYTICS} icon={Radio} label="Digi" active={activeStage === LifecycleStage.ANALYTICS} onClick={() => setActiveStage(LifecycleStage.ANALYTICS)} />
            <SidebarItem stage={LifecycleStage.UNCONVENTIONAL} icon={Cpu} label="Unco" active={activeStage === LifecycleStage.UNCONVENTIONAL} onClick={() => setActiveStage(LifecycleStage.UNCONVENTIONAL)} />
            <SidebarItem stage={LifecycleStage.ASSET_MANAGEMENT} icon={Users} label="Mgmt" active={activeStage === LifecycleStage.ASSET_MANAGEMENT} onClick={() => setActiveStage(LifecycleStage.ASSET_MANAGEMENT)} />
            <SidebarItem stage={LifecycleStage.REFINING_ADV} icon={Factory} label="Refn" active={activeStage === LifecycleStage.REFINING_ADV} onClick={() => setActiveStage(LifecycleStage.REFINING_ADV)} />
            <SidebarItem stage={LifecycleStage.RETAIL} icon={ShoppingCart} label="Retail" active={activeStage === LifecycleStage.RETAIL} onClick={() => setActiveStage(LifecycleStage.RETAIL)} />
            <SidebarItem stage={LifecycleStage.LEASING} icon={Landmark} label="Lease" active={activeStage === LifecycleStage.LEASING} onClick={() => setActiveStage(LifecycleStage.LEASING)} />
            <SidebarItem stage={LifecycleStage.MIDSTREAM} icon={Anchor} label="Mid" active={activeStage === LifecycleStage.MIDSTREAM} onClick={() => setActiveStage(LifecycleStage.MIDSTREAM)} />
            <SidebarItem stage={LifecycleStage.DISTRIBUTION} icon={Network} label="Dist" active={activeStage === LifecycleStage.DISTRIBUTION} onClick={() => setActiveStage(LifecycleStage.DISTRIBUTION)} />

            <div className="mt-auto flex flex-col items-center gap-6 pb-4">
              <DataFlowIndicator activeStage={activeStage} onNavigateStage={setActiveStage} />
              <button onClick={() => setActiveStage(LifecycleStage.LIBRARY)} className={cn("text-slate-600 hover:text-white transition-colors", activeStage === LifecycleStage.LIBRARY && "text-cyan-400")}>
                <BookOpen size={24} />
              </button>
              <button className="text-slate-600 hover:text-white transition-colors">
                <Settings size={24} />
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="grow overflow-y-auto relative p-8 custom-scrollbar flex flex-col bg-app-bg">
            {/* Action Header / Assistant */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", getPhaseColor(activeStage))}></div>
                <h2 className="text-xs font-semibold tracking-widest uppercase text-text-secondary">Workspace / {activeStage}</h2>
              </div>

              <div className="relative group flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-hover:text-brand-primary transition-colors" size={14} />
                  <input
                    type="text"
                    placeholder="Query Technical Knowledge Base..."
                    className="pl-10 pr-4 py-2 bg-panel-bg border border-border-subtle rounded-xl text-xs font-mono text-text-primary focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 outline-none w-80 lg:w-[400px] transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                  />
                </div>
                <button
                  onClick={handleAiSearch}
                  disabled={isAiLoading || !query.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/30 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {isAiLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Knowledge Base Results Panel */}
            {(isAiLoading || aiResponse) && (
              <div className="mb-8 p-5 bg-panel-bg border border-border-subtle rounded-xl max-h-[360px] overflow-y-auto custom-scrollbar">
                {isAiLoading && (
                  <div className="flex items-center gap-3 text-text-secondary text-xs">
                    <div className="w-4 h-4 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                    <span>Searching knowledge base...</span>
                  </div>
                )}
                {aiResponse && (
                  <div className="prose prose-invert prose-xs max-w-none text-text-secondary text-xs leading-relaxed">
                    <ReactMarkdown>{aiResponse}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
            <React.Suspense fallback={
              <div className="flex-1 flex items-center justify-center bg-panel-bg h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">Loading...</span>
                </div>
              </div>
            }>
              {activeStage === LifecycleStage.APPRAISAL && <AppraisalStage />}
              {activeStage === LifecycleStage.DRILLING && (
                <DrillingPanel
                  drillingSubTab={drillingSubTab}
                  setDrillingSubTab={setDrillingSubTab}
                  wellControlInp={wellControlInp}
                  setWellControlInp={setWellControlInp}
                  mudInp={mudInp}
                  setMudInp={setMudInp}
                  hydraulicsInp={hydraulicsInp}
                  setHydraulicsInp={setHydraulicsInp}
                  targetParams={targetParams}
                  setTargetParams={setTargetParams}
                  surveyS1={surveyS1}
                  setSurveyS1={setSurveyS1}
                  surveyS2={surveyS2}
                  setSurveyS2={setSurveyS2}
                  plannedTrajectories={plannedTrajectories}
                  ppInp={ppInp}
                  setPpInp={setPpInp}
                  dExpInp={dExpInp}
                  setDExpInp={setDExpInp}
                  pressureProfile={pressureProfile}
                  casingDepth={casingDepth}
                  setCasingDepth={setCasingDepth}
                  selectedGrade={selectedGrade}
                  setSelectedGrade={setSelectedGrade}
                  selectedWeight={selectedWeight}
                  setSelectedWeight={setSelectedWeight}
                  internalPress={internalPress}
                  setInternalPress={setInternalPress}
                  externalPress={externalPress}
                  setExternalPress={setExternalPress}
                  bitInp={bitInp}
                  setBitInp={setBitInp}
                  directionalInp={directionalInp}
                  setDirectionalInp={setDirectionalInp}
                  cementingInp={cementingInp}
                  setCementingInp={setCementingInp}
                  paperTopicFilter={paperTopicFilter}
                  setPaperTopicFilter={setPaperTopicFilter}
                  paperSearchTerm={paperSearchTerm}
                  setPaperSearchTerm={setPaperSearchTerm}
                />
              )}
              {activeStage === LifecycleStage.RESERVOIR && <ReservoirStage />}
              {activeStage === LifecycleStage.RESERVES && <ReservesStage />}
              {activeStage === LifecycleStage.PRODUCTION && <ProductionStage />}
              {activeStage === LifecycleStage.ANALYTICS && <AnalyticsStage />}
              {activeStage === LifecycleStage.UNCONVENTIONAL && <UnconventionalStage />}

              {activeStage === LifecycleStage.ASSET_MANAGEMENT && <AssetManagementStage />}
              {activeStage === LifecycleStage.LEASING && <SurveyingLeasingStage />}
              {activeStage === LifecycleStage.DEVELOPMENT && <DevelopmentStage />}
              {activeStage === LifecycleStage.EXPLORATION && <ExplorationStage />}
              {activeStage === LifecycleStage.REFINING_ADV && <RefiningStage />}
              {activeStage === LifecycleStage.RETAIL && <RetailStage />}
              {activeStage === LifecycleStage.MIDSTREAM && <MidstreamStage />}
              {activeStage === LifecycleStage.DISTRIBUTION && <DistributionStage />}
            </React.Suspense>
          </main>
        </div>
      </div>
    </UnitSystemProvider>
  );
}
