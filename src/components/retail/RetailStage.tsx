/**
 * Phase 8: RETAIL & FUEL DISPENSING — Main Stage Container
 * 10 Sub-Step Tabs with live calculation cascades
 * 
 * All calculations reference src/lib/retail.ts for industrial-scale math.
 * Inputs are fully editable. Results update reactively via useMemo.
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
    calculateSiteSelection, analyzeUSTSystem, analyzeDispenserSystem,
    analyzePOSSystem, optimizePricingStrategy, analyzeStationOperations,
    analyzeCStore, analyzeAncillaryServices, evaluateRetailHSE,
    projectEnergyTransition, calculateEvChargerEconomics, calculateHydrogenStation,
    type SiteSelectionInputs, type SiteSelectionResult,
    type USTConfigInputs, type USTResult,
    type DispenserInputs, type DispenserResult,
    type POSInputs, type POSResult,
    type PricingInputs, type PricingResult,
    type OperationsInputs, type OperationsResult,
    type CStoreInputs, type CStoreResult,
    type CarWashInputs, type CarWashResult,
    type RetailHSEInputs, type RetailHSEResult,
    type EnergyTransitionInputs, type EnergyTransitionResult,
    type EvChargerInputs, type EvChargerResult,
    type HydrogenStationInputs, type HydrogenStationResult
} from '../../lib/retail';
import { useRetail, useDistribution } from '../../store/hooks';
import type { StationTank, RetailStation, StationSales } from '../../store/types';

// ─── Default Inputs ───
const defaultSite: SiteSelectionInputs = {
    adtVehiclesPerDay: 25000, trafficGrowthRatePct: 2, captureRatePct: 3.5,
    avgGallonsPerFill: 12, populationRadius5Mi: 35000, medianHouseholdIncome: 72000,
    avgCommuteMinutes: 28, competingStations: 4, landAcres: 1.5, landCostPerAcre: 800000,
    constructionCostMM: 2.5, equipmentCostMM: 0.8, fuelMarginPerGal: 0.18,
    discountRatePct: 10, projectLifeYears: 15, businessModel: 'coco' as const,
};

const defaultUST: USTConfigInputs = {
    totalCapacityGallons: 44000, numTanks: 4, numCompartments: 8,
    tankDiameterFt: 8.5, tankLengthFt: 27, tankWallThicknessIn: 0.25,
    tankMaterialDensityLbPerFt3: 490, groundwaterDepthFt: 15, soilDensityLbPerFt3: 120,
    monthlyThroughputGal: 180000, leakDetectionThresholdGph: 0.1,
    interstitialMonitoring: true, sirConfidenceLevelPct: 95,
    cpCurrentDensityMaPerFt2: 1.5, steelSurfaceAreaFt2: 3500,
    remediationCostPerFt3: 250, cleanupCostPerGallonSpilled: 500,
    financialAssuranceMM: 2.0, tankAgeYears: 8, expectedTankLifeYears: 30,
};

const defaultDispenser: DispenserInputs = {
    numDispensers: 8, numHosesPerDispenser: 2, designFlowRateGpm: 10,
    hoseDiameterIn: 0.75, hoseLengthFt: 14, meterTolerancePct: 0.3,
    monthlyVolumeGal: 180000, ambientTempF: 75, productApiGravity: 60,
    dispenserCapexPerUnit: 22000, stpCapex: 35000, annualMaintenancePerDispenser: 1800,
    electricityCostPerKWh: 0.12, stpMotorHP: 5,
};

const defaultPOS: POSInputs = {
    monthlyVolumeGal: 180000, retailPricePerGal: 3.50, cashPct: 25,
    creditPct: 55, fleetCardPct: 12, mobilePayPct: 8,
    creditProcessingFeePct: 2.5, fleetProcessingFeePct: 1.8,
    avgTransactionGal: 12, emvUpgradeCost: 35000,
    emvChargebackReductionPct: 75, preEMVChargebackCostPerYear: 12000,
    pciComplianceCostPerYear: 8000, holdAuthorizationAmount: 175,
    holdReconciliationLossPct: 0.3, loyaltyAppCostPerYear: 15000,
    loyaltyAppAdoptionPct: 22, loyaltyDiscountPerGal: 0.05,
};

const defaultPricing: PricingInputs = {
    crudeCostPerBbl: 75, rackWholesalePerGal: 2.85, federalTaxPerGal: 0.184,
    stateTaxPerGal: 0.35, deliveryCostPerGal: 0.06, targetMarginPerGal: 0.18,
    competitorPricePerGal: 3.45, priceGapToCompetitor: 0.05,
    priceElasticity: 350, baseVolumePerMonth: 180000,
    premiumPriceGap: 0.65, midGradePriceGap: 0.15,
    regularSharePct: 72, midGradeSharePct: 8, premiumSharePct: 20,
    brandedPremiumPct: 5, hypermarketDisruptionPct: 8,
};

const defaultOps: OperationsInputs = {
    monthlyGallonsSold: 180000, avgTransactionGal: 12,
    employeesPerShift: 3, shiftsPerDay: 3, hourlyWage: 16,
    monthlyFixedCosts: 45000, deliveriesPerMonth: 6, avgDeliveryGal: 8500,
    atgReconciliationVariancePct: 0.15, dispenserAgeYears: 5, dispenserLifeYears: 15,
    ustAgeYears: 8, ustLifeYears: 30, stpAgeYears: 5, stpLifeYears: 15,
    canopyAgeYears: 5, canopyLifeYears: 25, workOrderBacklog: 12, criticalWO: 2, hseWO: 4,
};

const defaultCStore: CStoreInputs = {
    monthlyFuelGal: 180000, fuelCustomersPerMonth: 15000,
    insideConversionPct: 40, avgInsideBasketSize: 7.50, insideGrossMarginPct: 38,
    cstoreSqFt: 3200, packagedBeverageSales: 38000, snacksSales: 22000,
    tobaccoSales: 28000, beerSales: 18000, candySales: 8000,
    foodServiceSales: 35000, generalMdseSales: 12000,
    bevMarginPct: 42, snackMarginPct: 48, tobaccoMarginPct: 20,
    beerMarginPct: 32, candyMarginPct: 50, foodServiceMarginPct: 60,
    generalMarginPct: 45, loyaltyDiscountPerGal: 0.05,
    loyaltyInsideLiftPct: 8, loyaltyMemberCount: 3500,
};

const defaultCarWash: CarWashInputs = {
    washType: 'iba', carsPerHour: 12, operatingHoursPerDay: 14, daysPerMonth: 30,
    averageTicketPrice: 10, variableCostPerWash: 2.50, fixedCostPerMonth: 8500,
    membershipPricePerMonth: 29, memberCount: 600, avgMemberWashesPerMonth: 4,
    numEVChargers: 4, chargerCapexPerStall: 150000, chargerUtilizationPct: 15,
    chargingPricePerKWh: 0.45, demandChargePerMonth: 1200, avgKwhPerSession: 45,
    waterReclaimSystemEfficiency: 0.75, waterCostPer1kGal: 4.50,
    gallonsPerWash: 28, propaneExchangesPerMonth: 180,
    propaneRevenuePerExchange: 22, propaneCostPerExchange: 14,
};

const defaultHSE: RetailHSEInputs = {
    monthlyVolumeGal: 180000, numDispensers: 8, ustAgeYears: 8,
    ustComplianceScore: 88, cashHandlingVolume: 45000, hoursOfDarknessPerDay: 10,
    neighborhoodCrimeIndex: 35, totalEmployees: 12, annualWorkHours: 24960,
    recordableIncidents: 2, lostTimeIncidents: 1, spillEventsPerYear: 2,
    stormwaterFlowRateGpm: 45, stageIIVaporRecovery: false,
    fireSuppressionTested: true, emergencyShutoffDistanceFt: 65,
};

const defaultTransition: EnergyTransitionInputs = {
    currentYear: 2026,
    regionEVAdoptionRate: 12,
    currentFuelVolumeGalPerYear: 180000 * 12,
    fleetTurnoverYears: 12,
    iceToEVTransitionRate: 0.05,
    totalStationsInMarket: 50,
    stationRankByProfit: 15,
    hydrogenStationCapexMM: 3.5,
    hydrogenUtilizationPct: 25,
    hydrogenPricePerKg: 16,
    hydrogenDemandKgPerDay: 200,
    solarCanopyKW: 150,
    batteryStorageKWH: 500,
    solarIrradianceKwhPerM2PerDay: 4.8,
    peakShavingSavingsPct: 20,
    demandChargeSavingsPerMonth: 1200,
    multiEnergyModel: true,
    autonomousVehiclePct: 15,
    autonomousRefuelingEfficiencyPct: 85,
};

const defaultEvCharger: EvChargerInputs = {
    dcfcChargerCount: 4,
    dcfcChargerPowerKW: 150,
    dcfcChargerCapexPerUnit: 80000,
    installCostPerCharger: 30000,
    electricalInfraCapex: 120000,
    demandChargePerKwPerMonth: 12,
    utilizationRatePct: 12,
    avgSessionDurationMin: 35,
    pricePerKwh: 0.35,
    electricityCostPerKwh: 0.10,
    networkFeePct: 10,
    annualMaintenancePerCharger: 1500,
    projectLifeYears: 10,
    discountRatePct: 8,
};

const defaultHydrogen: HydrogenStationInputs = {
    stationCapexMM: 3.5,
    dailyCapacityKgH2: 500,
    utilizationPct: 40,
    pricePerKg: 14.00,
    electricityCostPerKwh: 0.08,
    compressionKwhPerKg: 4.5,
    storageCascadeCount: 3,
    cascadePressureBar: 700,
    annualOpexPctOfCapex: 8,
    fleetFuelCellVehiclesPerDay: 30,
    kgPerVehiclePerFill: 5.5,
    gasolineEquivalentPricePerGal: 3.50,
};

// ─── DataRow helper ───
const DataRow: React.FC<{ label: string; value: string | number; unit?: string; precision?: number; className?: string }> =
    ({ label, value, unit, precision = 2, className = '' }) => {
        const display = typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision }) : value;
        return (
            <div className={`flex items-center justify-between py-1.5 px-3 hover:bg-slate-50 rounded ${className}`}>
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs font-semibold text-slate-800 data-mono">
                    {display}<span className="text-[10px] text-slate-400 ml-1">{unit ?? ''}</span>
                </span>
            </div>
        );
    };

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
);

// ─── 8.1 Site Selection Tab ───
const SiteSelectionTab: React.FC<{ inp: SiteSelectionInputs; setInp: (v: SiteSelectionInputs) => void; res: SiteSelectionResult }> =
    ({ inp, setInp, res }) => {
        const update = (k: keyof SiteSelectionInputs, v: string) => { const n = parseFloat(v); if (!isNaN(n)) setInp({ ...inp, [k]: n }); };
        return (
            <div className="space-y-4">
                <SectionHeader title="8.1 Site Selection & Development" subtitle="Traffic, demographics, competition, and feasibility analysis" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Traffic Analysis</h4>
                        <div className="space-y-1.5">
                            {(['adtVehiclesPerDay', 'trafficGrowthRatePct', 'captureRatePct', 'avgGallonsPerFill'] as const).map(k => (
                                <div key={k} className="flex items-center justify-between py-1">
                                    <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                                    <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                        className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={k.includes('Pct') || k.includes('Rate') ? 0.1 : 1000} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Demographics</h4>
                        <div className="space-y-1.5">
                            {(['populationRadius5Mi', 'medianHouseholdIncome', 'avgCommuteMinutes', 'competingStations'] as const).map(k => (
                                <div key={k} className="flex items-center justify-between py-1">
                                    <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                                    <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                        className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={1} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Site Economics</h4>
                        <div className="space-y-1.5">
                            {(['landAcres', 'landCostPerAcre', 'constructionCostMM', 'equipmentCostMM', 'fuelMarginPerGal', 'discountRatePct', 'projectLifeYears'] as const).map(k => (
                                <div key={k} className="flex items-center justify-between py-1">
                                    <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                                    <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                        className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={k.includes('Cost') && k.includes('MM') ? 0.1 : 0.01} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">Est. Gal/Month</div><div className="text-xl font-bold text-indigo-700">{res.estimatedGallonsPerMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><div className="text-[10px] text-emerald-500 uppercase">NPV (10yr)</div><div className="text-xl font-bold text-emerald-700">${(res.npv10yr / 1e6).toFixed(2)}M</div></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">IRR Approx</div><div className="text-xl font-bold text-amber-700">{res.irrApprox.toFixed(1)}%</div></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">Site Score</div><div className="text-xl font-bold text-rose-700">{res.siteScoreOutOf100.toFixed(0)}/100</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Total CAPEX" value={`$${(res.totalCapex / 1e6).toFixed(2)}M`} />
                        <DataRow label="Monthly Fixed Cost" value={res.monthlyFixedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} unit="$" precision={0} />
                        <DataRow label="Break-even Gal/Month" value={res.breakEvenGallonsPerMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })} precision={0} />
                        <DataRow label="Break-even Capture Rate" value={res.breakEvenCaptureRatePct.toFixed(2)} unit="%" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Market HHI" value={res.marketConcentrationHHI.toFixed(0)} precision={0} />
                        <DataRow label="Trade Area Spending Power" value={((res.tradeAreaSpendingPower) / 1e9).toFixed(2)} unit="$B" />
                        <DataRow label="COCO NPV" value={`$${(res.cocoVsCodoNPV.coco / 1e6).toFixed(2)}M`} />
                        <DataRow label="CODO NPV" value={`$${(res.cocoVsCodoNPV.codo / 1e6).toFixed(2)}M`} />
                        <DataRow label="DODO NPV" value={`$${(res.cocoVsCodoNPV.dodo / 1e6).toFixed(2)}M`} />
                    </div>
                </div>
            </div>
        );
    };

// ─── 8.2 UST Systems Tab ───
const USTSystemTab: React.FC<{ inp: USTConfigInputs; setInp: (v: USTConfigInputs) => void; res: USTResult }> =
    ({ inp, setInp, res }) => {
        const update = (k: keyof USTConfigInputs, v: string) => { const n = parseFloat(v); if (!isNaN(n)) setInp({ ...inp, [k]: n }); };
        return (
            <div className="space-y-4">
                <SectionHeader title="8.2 Underground Storage Tank (UST) Systems" subtitle="EPA 40 CFR 280 compliance, leak detection, and remediation" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {(['tankConfig', 'environmental', 'financial'] as const).map((section, si) => {
                        const keys: (keyof USTConfigInputs)[] = si === 0
                            ? ['totalCapacityGallons', 'numTanks', 'numCompartments', 'tankDiameterFt', 'tankLengthFt', 'tankWallThicknessIn', 'tankMaterialDensityLbPerFt3', 'tankAgeYears', 'expectedTankLifeYears']
                            : si === 1
                                ? ['groundwaterDepthFt', 'soilDensityLbPerFt3', 'monthlyThroughputGal', 'leakDetectionThresholdGph', 'interstitialMonitoring', 'sirConfidenceLevelPct', 'cpCurrentDensityMaPerFt2', 'steelSurfaceAreaFt2']
                                : ['remediationCostPerFt3', 'cleanupCostPerGallonSpilled', 'financialAssuranceMM'];
                        return (
                            <div key={si} className="bg-white border border-slate-200 rounded-lg p-4">
                                <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">{['Tank Configuration', 'Environmental & Leak Detection', 'Financial & Remediation'][si]}</h4>
                                <div className="space-y-1.5">
                                    {keys.map(k => (
                                        <div key={k} className="flex items-center justify-between py-1">
                                            <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                                            {typeof inp[k] === 'boolean' ? (
                                                <input type="checkbox" checked={inp[k] as boolean} onChange={e => setInp({ ...inp, [k]: (e.target as HTMLInputElement).checked })} className="w-4 h-4" />
                                            ) : (
                                                <input type="number" value={inp[k] as number} onChange={e => update(k, e.target.value)}
                                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">Compliance Score</div><div className="text-xl font-bold text-indigo-700">{res.complianceScorePct.toFixed(0)}%</div></div>
                    <div className={res.flotationSafe ? "bg-emerald-50 border border-emerald-200 rounded-lg p-3" : "bg-rose-50 border border-rose-200 rounded-lg p-3"}><div className="text-[10px] text-emerald-500 uppercase">Flotation Safe</div><div className={`text-xl font-bold ${res.flotationSafe ? 'text-emerald-700' : 'text-rose-700'}`}>{res.flotationSafe ? 'YES' : 'NO'}</div></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">Leak Detect Prob</div><div className="text-xl font-bold text-amber-700">{res.leakProbDetectionPct.toFixed(1)}%</div></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">Env Risk Score</div><div className="text-xl font-bold text-rose-700">{res.environmentalRiskScore.toFixed(0)}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Single Tank Volume" value={res.tankVolumeGallons.toFixed(0)} unit="GAL" precision={0} />
                        <DataRow label="Buoyancy Force" value={res.buoyancyForceLb.toFixed(0)} unit="LB" precision={0} />
                        <DataRow label="Deadman Weight Req'd" value={res.deadmanWeightRequiredLb.toFixed(0)} unit="LB" precision={0} />
                        <DataRow label="CP Current Required" value={res.cpCurrentRequiredAmps.toFixed(2)} unit="A" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Annual Leak Prob" value={(res.leakProbabilityAnnual * 100).toFixed(4)} unit="%" />
                        <DataRow label="SIR Min Detect Loss" value={res.sirMinimumDetectableLossGal.toFixed(1)} unit="GAL/MO" />
                        <DataRow label="Remediation Est" value={`$${(res.remediationCostEstimate / 1e6).toFixed(2)}M`} />
                        <DataRow label="Financial Assurance" value={res.financialAssuranceAdequate ? 'ADEQUATE' : 'INADEQUATE'} />
                        <DataRow label="Replace Year" value={res.tankReplacementYear} />
                    </div>
                </div>
            </div>
        );
    };

// ─── 8.3 Dispensing Systems Tab ───
const DispensingSystemsTab: React.FC<{ inp: DispenserInputs; setInp: (v: DispenserInputs) => void; res: DispenserResult }> =
    ({ inp, setInp, res }) => {
        const update = (k: keyof DispenserInputs, v: string) => { const n = parseFloat(v); if (!isNaN(n)) setInp({ ...inp, [k]: n }); };
        return (
            <div className="space-y-4">
                <SectionHeader title="8.3 Fuel Dispensing Systems" subtitle="Dispenser hydraulics, metering (NIST H44), STP sizing, and lifecycle cost" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Dispenser Configuration</h4>
                        {(['numDispensers', 'numHosesPerDispenser', 'designFlowRateGpm', 'hoseDiameterIn', 'hoseLengthFt', 'meterTolerancePct', 'monthlyVolumeGal'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Fluid & Operating Conditions</h4>
                        {(['ambientTempF', 'productApiGravity', 'electricityCostPerKWh', 'stpMotorHP'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">CAPEX / Maintenance</h4>
                        {(['dispenserCapexPerUnit', 'stpCapex', 'annualMaintenancePerDispenser'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={100} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">Simul. Flow</div><div className="text-xl font-bold text-indigo-700">{res.simultaneousFlowRateGpm.toFixed(0)} GPM</div></div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><div className="text-[10px] text-emerald-500 uppercase">Hose ΔP</div><div className="text-xl font-bold text-emerald-700">{res.hosePressureLossPsi.toFixed(2)} PSI</div></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">STP HP</div><div className="text-xl font-bold text-amber-700">{res.stpSizingHP.toFixed(2)} HP</div></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">¢/Gal Dispensed</div><div className="text-xl font-bold text-rose-700">{(res.costPerDispensedGallon * 100).toFixed(2)}¢</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Meter Error/1k GAL" value={res.meterMaxErrorGalPer1kGal.toFixed(3)} unit="GAL" />
                        <DataRow label="Revenue Loss/Yr (Meter)" value={`$${res.meterRevenueLossPerYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} precision={0} />
                        <DataRow label="ATC Correction Factor" value={res.atcTempCorrectionFactor.toFixed(4)} />
                        <DataRow label="ATC Volume Delta/Mo" value={res.atcVolumeDeltaGal.toFixed(0)} unit="GAL" precision={0} />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Breakaway Force" value={res.breakawayForceLb.toFixed(0)} unit="LB" precision={0} />
                        <DataRow label="Lifecycle Cost (15yr)" value={`$${(res.dispenserLifecycleCost / 1e6).toFixed(2)}M`} />
                        <DataRow label="Utilization Rate" value={res.utilizationRatePct.toFixed(1)} unit="%" />
                        <DataRow label="Max/Hose" value={res.maxThroughputPerHoseGpm.toFixed(0)} unit="GPM" precision={0} />
                    </div>
                </div>
            </div>
        );
    };

// ─── 8.4 POS & Payment Tab ───
const POSTab: React.FC<{ inp: POSInputs; setInp: (v: POSInputs) => void; res: POSResult }> =
    ({ inp, setInp, res }) => {
        const update = (k: keyof POSInputs, v: string) => { const n = parseFloat(v); if (!isNaN(n)) setInp({ ...inp, [k]: n }); };
        return (
            <div className="space-y-4">
                <SectionHeader title="8.4 POS & Payment Systems" subtitle="Card processing, EMV compliance, PCI DSS, loyalty programs" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Payment Mix</h4>
                        {(['cashPct', 'creditPct', 'fleetCardPct', 'mobilePayPct', 'avgTransactionGal', 'retailPricePerGal', 'monthlyVolumeGal'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.1} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Processing Fees</h4>
                        {(['creditProcessingFeePct', 'fleetProcessingFeePct', 'emvUpgradeCost', 'emvChargebackReductionPct', 'preEMVChargebackCostPerYear', 'pciComplianceCostPerYear'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Loyalty & Authorization</h4>
                        {(['holdAuthorizationAmount', 'holdReconciliationLossPct', 'loyaltyAppCostPerYear', 'loyaltyAppAdoptionPct', 'loyaltyDiscountPerGal'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">Mo. Processing Fees</div><div className="text-xl font-bold text-indigo-700">${res.monthlyProcessingFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><div className="text-[10px] text-emerald-500 uppercase">Fee Effective</div><div className="text-xl font-bold text-emerald-700">{res.processingFeeEffective.toFixed(2)}%</div></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">EMV Payback</div><div className="text-xl font-bold text-amber-700">{res.emvROIPaybackMonths.toFixed(1)} MO</div></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">Hold Loss/Yr</div><div className="text-xl font-bold text-rose-700">${res.holdReconciliationAnnualLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Transactions/Month" value={res.transactionCountMonthly.toFixed(0)} precision={0} />
                        <DataRow label="Cash Revenue" value={`$${res.paymentMethodRevenue.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} precision={0} />
                        <DataRow label="Credit Revenue" value={`$${res.paymentMethodRevenue.credit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} precision={0} />
                        <DataRow label="Fleet Revenue" value={`$${res.paymentMethodRevenue.fleet.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} precision={0} />
                        <DataRow label="Mobile Revenue" value={`$${res.paymentMethodRevenue.mobile.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} precision={0} />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Cash vs Credit Margin Δ" value={`$${res.cashVsCreditMarginDelta.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} precision={0} />
                        <DataRow label="EMV 5yr NPV" value={`$${res.emv5yrNPV.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} precision={0} />
                        <DataRow label="PCI Adequate" value={res.pciComplianceAdequate ? 'YES' : 'NO'} />
                        <DataRow label="Loyalty Net Benefit" value={`$${res.loyaltyProgramNetBenefit.toFixed(0)}/mo`} precision={0} />
                        <DataRow label="Processing ¢/Gal" value={(res.processingCostPerGal * 100).toFixed(2)} unit="¢" />
                    </div>
                </div>
            </div>
        );
    };

// ─── 8.5 Pricing Strategy Tab ───
const PricingStrategyTab: React.FC<{ inp: PricingInputs; setInp: (v: PricingInputs) => void; res: PricingResult }> =
    ({ inp, setInp, res }) => {
        const update = (k: keyof PricingInputs, v: string) => { const n = parseFloat(v); if (!isNaN(n)) setInp({ ...inp, [k]: n }); };
        return (
            <div className="space-y-4">
                <SectionHeader title="8.5 Retail Pricing Strategy" subtitle="Price buildup, elasticity optimization, rockets-and-feathers, competitive positioning" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Cost Structure</h4>
                        {(['crudeCostPerBbl', 'rackWholesalePerGal', 'federalTaxPerGal', 'stateTaxPerGal', 'deliveryCostPerGal', 'targetMarginPerGal'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Market & Competition</h4>
                        {(['competitorPricePerGal', 'priceGapToCompetitor', 'priceElasticity', 'baseVolumePerMonth', 'brandedPremiumPct', 'hypermarketDisruptionPct'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Grade Mix</h4>
                        {(['regularSharePct', 'midGradeSharePct', 'premiumSharePct', 'premiumPriceGap', 'midGradePriceGap'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.1} />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Price Buildup */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Price Buildup ($/GAL)</h4>
                    <div className="flex items-center gap-2 text-xs">
                        {(['crude', 'rack', 'taxes', 'delivery', 'margin', 'retail'] as const).map((part, i) => (
                            <React.Fragment key={part}>
                                <div className="flex flex-col items-center bg-slate-50 rounded px-3 py-2 flex-1">
                                    <span className="text-[10px] text-slate-400 uppercase">{part}</span>
                                    <span className="font-bold text-slate-700 data-mono">${res.priceBuildup[part].toFixed(3)}</span>
                                </div>
                                {i < 5 && <span className="text-slate-300">+</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">Pump Price</div><div className="text-xl font-bold text-indigo-700">${res.pumpPricePerGal.toFixed(3)}</div></div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><div className="text-[10px] text-emerald-500 uppercase">Optimal Price</div><div className="text-xl font-bold text-emerald-700">${res.optimalPricePerGal.toFixed(3)}</div></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">Optimal Margin/Mo</div><div className="text-xl font-bold text-amber-700">${(res.optimalMarginPerMonth / 1000).toFixed(1)}K</div></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">Blended Price</div><div className="text-xl font-bold text-rose-700">${res.blendedPumpPrice.toFixed(3)}</div></div>
                </div>
            </div>
        );
    };

// ─── 8.6 Station Operations Tab ───
const StationOperationsTab: React.FC<{ inp: OperationsInputs; setInp: (v: OperationsInputs) => void; res: OperationsResult }> =
    ({ inp, setInp, res }) => {
        const update = (k: keyof OperationsInputs, v: string) => { const n = parseFloat(v); if (!isNaN(n)) setInp({ ...inp, [k]: n }); };
        return (
            <div className="space-y-4">
                <SectionHeader title="8.6 Station Operations & Management" subtitle="Staffing, delivery, maintenance, ATG reconciliation" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Staffing & Labor</h4>
                        {(['employeesPerShift', 'shiftsPerDay', 'hourlyWage', 'monthlyFixedCosts', 'monthlyGallonsSold', 'avgTransactionGal'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Delivery & Inventory</h4>
                        {(['deliveriesPerMonth', 'avgDeliveryGal', 'atgReconciliationVariancePct'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Equipment & Maintenance</h4>
                        {(['dispenserAgeYears', 'dispenserLifeYears', 'ustAgeYears', 'ustLifeYears', 'stpAgeYears', 'stpLifeYears', 'canopyAgeYears', 'canopyLifeYears', 'workOrderBacklog', 'criticalWO', 'hseWO'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={1} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">Tx/Labor Hr</div><div className="text-xl font-bold text-indigo-700">{res.transactionsPerLaborHour.toFixed(1)}</div></div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><div className="text-[10px] text-emerald-500 uppercase">Labor ¢/Gal</div><div className="text-xl font-bold text-emerald-700">{(res.laborCostPerGal * 100).toFixed(1)}¢</div></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">OPEX/Gal</div><div className="text-xl font-bold text-amber-700">{(res.opexPerGal * 100).toFixed(1)}¢</div></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">Next Major Repl.</div><div className="text-xl font-bold text-rose-700">{res.nextMajorReplacementYear}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Delivery Freq (days)" value={res.deliveryFrequencyDays.toFixed(1)} precision={1} />
                        <DataRow label="Inventory Turnover (days)" value={res.inventoryTurnoverDays.toFixed(1)} precision={1} />
                        <DataRow label="ATG Variance Gal/Mo" value={res.atgVarianceGal.toFixed(0)} unit="GAL" precision={0} />
                        <DataRow label="ATG Variance $/Mo" value={`$${res.atgVarianceDollars.toFixed(0)}`} precision={0} />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Optimal Staffing" value={res.optimalStaffing} precision={0} />
                        <DataRow label="Labor Utilization" value={res.laborUtilizationPct.toFixed(1)} unit="%" />
                        <DataRow label="Maint Backlog Score" value={res.maintenanceBacklogScore.toFixed(0)} precision={0} />
                        <DataRow label="Cash vs Card Trend" value={res.cashVsCardTrendPct.toFixed(1)} unit="%" />
                    </div>
                </div>
            </div>
        );
    };

// ─── 8.7 C-Store Tab ───
const CStoreTab: React.FC<{ inp: CStoreInputs; setInp: (v: CStoreInputs) => void; res: CStoreResult }> =
    ({ inp, setInp, res }) => {
        const update = (k: keyof CStoreInputs, v: string) => { const n = parseFloat(v); if (!isNaN(n)) setInp({ ...inp, [k]: n }); };
        return (
            <div className="space-y-4">
                <SectionHeader title="8.7 Convenience Store & Non-Fuel Revenue" subtitle="Category-level margin analysis, conversion, loyalty ROI" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Store Config</h4>
                        {(['cstoreSqFt', 'insideConversionPct', 'avgInsideBasketSize', 'insideGrossMarginPct', 'fuelCustomersPerMonth', 'monthlyFuelGal'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Category Sales ($/Mo)</h4>
                        {(['packagedBeverageSales', 'snacksSales', 'tobaccoSales', 'beerSales', 'candySales', 'foodServiceSales', 'generalMdseSales'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1').replace('Sales', '')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={100} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Category Margins & Loyalty</h4>
                        {(['bevMarginPct', 'snackMarginPct', 'tobaccoMarginPct', 'beerMarginPct', 'candyMarginPct', 'foodServiceMarginPct', 'generalMarginPct', 'loyaltyDiscountPerGal', 'loyaltyInsideLiftPct', 'loyaltyMemberCount'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.1} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">Inside Sales/Mo</div><div className="text-xl font-bold text-indigo-700">${(res.insideSalesPerMonth / 1000).toFixed(1)}K</div></div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><div className="text-[10px] text-emerald-500 uppercase">Inside Margin/Mo</div><div className="text-xl font-bold text-emerald-700">${(res.insideMarginPerMonth / 1000).toFixed(1)}K</div></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">Sales/SqFt/Yr</div><div className="text-xl font-bold text-amber-700">${(res.salesPerSqFt * 12).toFixed(0)}</div></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">Loyalty Net ROI</div><div className="text-xl font-bold text-rose-700">{res.loyaltyNetROI.toFixed(0)}%</div></div>
                </div>
                {/* Category breakdown */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Category Breakdown</h4>
                    <div className="space-y-1">
                        {res.categoryBreakdown.map(c => (
                            <div key={c.name} className="flex items-center justify-between py-1.5 px-3 hover:bg-slate-50 rounded">
                                <span className="text-xs text-slate-600">{c.name}</span>
                                <div className="flex gap-4">
                                    <span className="text-xs text-slate-500">${(c.sales / 1000).toFixed(1)}K sales</span>
                                    <span className="text-xs text-slate-500">${(c.margin / 1000).toFixed(1)}K margin</span>
                                    <span className={cn("text-xs font-semibold", c.marginPct > 40 ? 'text-emerald-600' : c.marginPct > 25 ? 'text-amber-600' : 'text-slate-500')}>{c.marginPct.toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

// ─── 8.8 Ancillary Services Tab ───
const AncillaryServicesTab: React.FC<{ inp: CarWashInputs; setInp: (v: CarWashInputs) => void; res: CarWashResult }> =
    ({ inp, setInp, res }) => {
        const update = (k: keyof CarWashInputs, v: string) => { const n = parseFloat(v); if (!isNaN(n)) setInp({ ...inp, [k]: n }); };
        const updateWashType = (v: 'iba' | 'conveyor' | 'self-serve') => setInp({ ...inp, washType: v });
        return (
            <div className="space-y-4">
                <SectionHeader title="8.8 Car Wash & Ancillary Services" subtitle="Car wash membership model, EV charging, water reclaim, propane" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Car Wash Configuration</h4>
                        <div className="flex items-center justify-between py-1 mb-2">
                            <span className="text-[11px] text-slate-500">Wash Type</span>
                            <select value={inp.washType} onChange={e => updateWashType(e.target.value as 'iba' | 'conveyor' | 'self-serve')}
                                className="text-xs border border-slate-300 rounded px-2 py-1">
                                <option value="iba">In-Bay Auto</option>
                                <option value="conveyor">Conveyor/Tunnel</option>
                                <option value="self-serve">Self-Serve</option>
                            </select>
                        </div>
                        {(['carsPerHour', 'operatingHoursPerDay', 'daysPerMonth', 'averageTicketPrice', 'variableCostPerWash', 'fixedCostPerMonth'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Membership & EV Charging</h4>
                        {(['membershipPricePerMonth', 'memberCount', 'avgMemberWashesPerMonth', 'numEVChargers', 'chargerCapexPerStall', 'chargerUtilizationPct', 'chargingPricePerKWh', 'demandChargePerMonth', 'avgKwhPerSession'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Water, Propane, & Other</h4>
                        {(['waterReclaimSystemEfficiency', 'waterCostPer1kGal', 'gallonsPerWash', 'propaneExchangesPerMonth', 'propaneRevenuePerExchange', 'propaneCostPerExchange'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">Wash Revenue/Mo</div><div className="text-xl font-bold text-indigo-700">${(res.washRevenuePerMonth / 1000).toFixed(1)}K</div></div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><div className="text-[10px] text-emerald-500 uppercase">Wash Margin/Mo</div><div className="text-xl font-bold text-emerald-700">${(res.washMarginPerMonth / 1000).toFixed(1)}K</div></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">Membership MRR</div><div className="text-xl font-bold text-amber-700">${res.membershipMRR.toFixed(0)}</div></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">EV Payback</div><div className="text-xl font-bold text-rose-700">{isFinite(res.evROIPaybackMonths) ? res.evROIPaybackMonths.toFixed(0) + 'MO' : 'N/A'}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Wash Throughput/Mo" value={res.washThroughputPerMonth.toFixed(0)} precision={0} />
                        <DataRow label="MEM Break-even Count" value={res.membershipBreakEvenCount.toFixed(0)} precision={0} />
                        <DataRow label="MEM Profit/Mo" value={`$${res.membershipProfitPerMonth.toFixed(0)}`} precision={0} />
                        <DataRow label="EV Revenue/Mo" value={`$${res.evRevenuePerMonth.toFixed(0)}`} precision={0} />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Water Cost/Mo" value={`$${res.waterCostPerMonth.toFixed(0)}`} precision={0} />
                        <DataRow label="Water Savings (Reclaim)" value={`$${res.waterSavingsFromReclaim.toFixed(0)}`} precision={0} />
                        <DataRow label="Propane Margin/Mo" value={`$${res.propaneMarginPerMonth.toFixed(0)}`} precision={0} />
                        <DataRow label="Total Ancillary Rev" value={`$${(res.totalAncillaryRevenue / 1000).toFixed(1)}K`} />
                        <DataRow label="Total Ancillary Margin" value={`$${(res.totalAncillaryMargin / 1000).toFixed(1)}K`} />
                    </div>
                </div>
            </div>
        );
    };

// ─── 8.9 HSE Tab ───
const HSETab: React.FC<{ inp: RetailHSEInputs; setInp: (v: RetailHSEInputs) => void; res: RetailHSEResult }> =
    ({ inp, setInp, res }) => {
        const update = (k: keyof RetailHSEInputs, v: string) => {
            const n = parseFloat(v);
            if (!isNaN(n)) setInp({ ...inp, [k]: n });
        };
        const toggleBool = (k: keyof RetailHSEInputs) => setInp({ ...inp, [k]: !(inp[k] as boolean) });
        return (
            <div className="space-y-4">
                <SectionHeader title="8.9 Retail HSE" subtitle="NFPA 30A fire safety, OSHA recordkeeping, environmental compliance" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Operations</h4>
                        {(['monthlyVolumeGal', 'numDispensers', 'ustAgeYears', 'ustComplianceScore', 'cashHandlingVolume', 'hoursOfDarknessPerDay', 'neighborhoodCrimeIndex'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Safety Metrics</h4>
                        {(['totalEmployees', 'annualWorkHours', 'recordableIncidents', 'lostTimeIncidents', 'spillEventsPerYear', 'stormwaterFlowRateGpm'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={1} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Compliance Status</h4>
                        {(['stageIIVaporRecovery', 'fireSuppressionTested'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="checkbox" checked={inp[k] as boolean} onChange={() => toggleBool(k)} className="w-4 h-4" />
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-slate-500">Emergency Shutoff Dist</span>
                            <input type="number" value={inp.emergencyShutoffDistanceFt} onChange={e => update('emergencyShutoffDistanceFt', e.target.value)}
                                className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={1} />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">NFPA 30A Score</div><div className="text-xl font-bold text-indigo-700">{res.nfpa30aComplianceScore.toFixed(0)}%</div></div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><div className="text-[10px] text-emerald-500 uppercase">TRIR</div><div className="text-xl font-bold text-emerald-700">{res.trir.toFixed(2)}</div></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">DART</div><div className="text-xl font-bold text-amber-700">{res.dart.toFixed(2)}</div></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">Overall HSE Score</div><div className="text-xl font-bold text-rose-700">{res.overallHSEScore.toFixed(0)}%</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="ESO Coverage" value={res.emergencyShutoffCoveragePct.toFixed(0)} unit="%" precision={0} />
                        <DataRow label="Robbery Risk Index" value={res.robberyRiskIndex.toFixed(0)} precision={0} />
                        <DataRow label="Robbery Risk Category" value={res.robberyRiskCategory} />
                        <DataRow label="Release Probability" value={(res.releaseProbability * 100).toFixed(3)} unit="%/yr" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Release Cost Estimate" value={`$${(res.releaseCostEstimate / 1000).toFixed(0)}K`} precision={0} />
                        <DataRow label="O/W Separator Size" value={res.oilWaterSeparatorSizeGal.toFixed(0)} unit="GAL" precision={0} />
                        <DataRow label="Vapor Recovered" value={res.vaporRecoveredTonsPerYear.toFixed(2)} unit="TON/YR" />
                        <DataRow label="Safety Training" value={res.safetyTrainingCompliancePct.toFixed(0)} unit="%" precision={0} />
                    </div>
                </div>
            </div>
        );
    };

// ─── 8.10 Energy Transition Tab ───
const EnergyTransitionTab: React.FC<{
    inp: EnergyTransitionInputs; setInp: (v: EnergyTransitionInputs) => void; res: EnergyTransitionResult;
    evInp: EvChargerInputs; setEvInp: (v: EvChargerInputs) => void; evRes: EvChargerResult;
    h2Inp: HydrogenStationInputs; setH2Inp: (v: HydrogenStationInputs) => void; h2Res: HydrogenStationResult;
}> = ({ inp, setInp, res, evInp, setEvInp, evRes, h2Inp, setH2Inp, h2Res }) => {
    const update = (k: keyof EnergyTransitionInputs, v: string) => { const n = parseFloat(v); if (!isNaN(n)) setInp({ ...inp, [k]: n }); };
    const toggleME = () => setInp({ ...inp, multiEnergyModel: !inp.multiEnergyModel });
    return (
        <div className="space-y-4">
            <SectionHeader title="8.10 Energy Transition & Future of Fuel Retail" subtitle="Bass diffusion EV adoption, fuel demand decline, hydrogen, solar+battery, AV fueling" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Market & EV Adoption</h4>
                    {(['currentYear', 'regionEVAdoptionRate', 'currentFuelVolumeGalPerYear', 'fleetTurnoverYears', 'iceToEVTransitionRate', 'totalStationsInMarket', 'stationRankByProfit'] as const).map(k => (
                        <div key={k} className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                            <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={k === 'currentYear' || k === 'totalStationsInMarket' || k === 'stationRankByProfit' || k === 'fleetTurnoverYears' ? 1 : 0.01} />
                        </div>
                    ))}
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Hydrogen & Multi-Energy</h4>
                    {(['hydrogenStationCapexMM', 'hydrogenUtilizationPct', 'hydrogenPricePerKg', 'hydrogenDemandKgPerDay'] as const).map(k => (
                        <div key={k} className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                            <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.1} />
                        </div>
                    ))}
                    <div className="flex items-center justify-between py-1 mt-1">
                        <span className="text-[11px] text-slate-500">Multi-Energy Model</span>
                        <input type="checkbox" checked={inp.multiEnergyModel} onChange={toggleME} className="w-4 h-4" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Solar, Battery & AV</h4>
                    {(['solarCanopyKW', 'batteryStorageKWH', 'solarIrradianceKwhPerM2PerDay', 'peakShavingSavingsPct', 'demandChargeSavingsPerMonth', 'autonomousVehiclePct', 'autonomousRefuelingEfficiencyPct'] as const).map(k => (
                        <div key={k} className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                            <input type="number" value={inp[k]} onChange={e => update(k, e.target.value)}
                                className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-400" step={0.01} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">EV Adoption Curve (% EV)</h4>
                    <div className="flex gap-1 overflow-x-auto">
                        {[0, 5, 10, 15, 20, 25].map(i => {
                            const pt = res.evAdoptionCurve[i];
                            return (
                                <div key={i} className="text-center p-2 rounded-lg border bg-slate-50 border-slate-200 flex-shrink-0 w-16">
                                    <div className="text-[11px] text-slate-400">{pt?.year ?? inp.currentYear + i}</div>
                                    <div className="text-xs font-bold text-slate-700">{pt?.evPct.toFixed(0) ?? 0}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Fuel Demand Decline (GAL/YR)</h4>
                    <div className="flex gap-1 overflow-x-auto">
                        {[0, 5, 10, 15, 20, 25].map(i => {
                            const pt = res.fuelDemandDecline[i];
                            return (
                                <div key={i} className="text-center p-2 rounded-lg border bg-slate-50 border-slate-200 flex-shrink-0 w-16">
                                    <div className="text-[11px] text-slate-400">{pt?.year ?? inp.currentYear + i}</div>
                                    <div className="text-[10px] font-bold text-slate-700">{(pt?.gallons ?? 0) > 1e6 ? `${((pt?.gallons ?? 0) / 1e6).toFixed(1)}M` : `${((pt?.gallons ?? 0) / 1000).toFixed(0)}K`}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"><div className="text-[10px] text-indigo-500 uppercase">Demand Halves (Yr)</div><div className="text-xl font-bold text-indigo-700">{res.yearFuelDemandHalves}</div></div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><div className="text-[10px] text-emerald-500 uppercase">H₂ Ann. Revenue</div><div className="text-xl font-bold text-emerald-700">${(res.hydrogenAnnualRevenue / 1e6).toFixed(2)}M</div></div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-[10px] text-amber-500 uppercase">H₂ BE Utilization</div><div className="text-xl font-bold text-amber-700">{res.hydrogenBreakevenUtilization.toFixed(0)}%</div></div>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3"><div className="text-[10px] text-rose-500 uppercase">Transition Risk</div><div className="text-xl font-bold text-rose-700">{res.transitionRiskScore.toFixed(0)}/100</div></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Station Count Projection (Market)</h4>
                <div className="flex gap-1 overflow-x-auto">
                    {[0, 5, 10, 15, 20, 25].map(i => {
                        const pt = res.stationCountProjection[i];
                        return (
                            <div key={i} className={`text-center p-2 rounded-lg border flex-shrink-0 w-16 ${pt && pt.count < inp.totalStationsInMarket * 0.5 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="text-[11px] text-slate-400">{pt?.year ?? inp.currentYear + i}</div>
                                <div className="text-xs font-bold text-slate-700">{pt?.count ?? 0}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <DataRow label="Solar NPV" value={`$${res.solarNPV.toFixed(0)}`} precision={0} />
                    <DataRow label="Battery Payback" value={res.batteryPaybackYears.toFixed(1)} unit="YRS" />
                    <DataRow label="AV Fuelling Vol" value={(res.avFuellingScenario / 1000).toFixed(0)} unit="GAL/YR" precision={0} />
                    <DataRow label="Biz Model Transition" value={res.businessModelTransitionIndex.toFixed(0)} unit="/100" precision={0} />
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <DataRow label="Multi-Energy: Fuel %" value={res.multiEnergyRevenueMix.fuel.toFixed(1)} unit="%" />
                    <DataRow label="Multi-Energy: EV %" value={res.multiEnergyRevenueMix.ev.toFixed(1)} unit="%" />
                    <DataRow label="Multi-Energy: H₂ %" value={res.multiEnergyRevenueMix.hydrogen.toFixed(1)} unit="%" />
                    <DataRow label="Multi-Energy: C-Store %" value={res.multiEnergyRevenueMix.cstore.toFixed(1)} unit="%" />
                </div>
            </div>

            {/* ─── 8.10B — EV Charger Economics Calculator ─── */}
            <div className="border-t border-slate-200 pt-4 mt-4">
                <SectionHeader title="8.10B EV Charger Economics" subtitle="DCFC CAPEX, demand charges, utilization break-even, per-kWh pricing" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-cyan-600 uppercase mb-3">Charger Configuration</h4>
                        {(['dcfcChargerCount', 'dcfcChargerPowerKW', 'dcfcChargerCapexPerUnit', 'installCostPerCharger', 'electricalInfraCapex'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={evInp[k]} onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) setEvInp({ ...evInp, [k]: n }); }}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-cyan-400" step={1} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-cyan-600 uppercase mb-3">Revenue & Operating</h4>
                        {(['utilizationRatePct', 'avgSessionDurationMin', 'pricePerKwh', 'electricityCostPerKwh', 'demandChargePerKwPerMonth', 'networkFeePct', 'annualMaintenancePerCharger'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={evInp[k]} onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) setEvInp({ ...evInp, [k]: n }); }}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-cyan-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-cyan-600 uppercase mb-3">Financial Parameters</h4>
                        {(['projectLifeYears', 'discountRatePct'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={evInp[k]} onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) setEvInp({ ...evInp, [k]: n }); }}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-cyan-400" step={1} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3"><div className="text-[10px] text-cyan-500 uppercase">Annual Revenue</div><div className="text-lg font-bold text-cyan-700">${(evRes.annualRevenue / 1000).toFixed(1)}K</div></div>
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3"><div className="text-[10px] text-cyan-500 uppercase">Annual Profit</div><div className="text-lg font-bold text-cyan-700">${(evRes.annualNetProfit / 1000).toFixed(1)}K</div></div>
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3"><div className="text-[10px] text-cyan-500 uppercase">Payback</div><div className="text-lg font-bold text-cyan-700">{evRes.simplePaybackYears < 999 ? `${evRes.simplePaybackYears.toFixed(1)} YRS` : 'N/A'}</div></div>
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3"><div className="text-[10px] text-cyan-500 uppercase">BE Utilization</div><div className="text-lg font-bold text-cyan-700">{evRes.breakEvenUtilizationPct.toFixed(1)}%</div></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Sessions/Day" value={evRes.sessionsPerDay.toFixed(1)} precision={1} />
                        <DataRow label="KWh/Day" value={evRes.kwhPerDay.toFixed(0)} unit="KWH" precision={0} />
                        <DataRow label="KWh/Year" value={(evRes.kwhPerYear / 1000).toFixed(0)} unit="MWH" precision={0} />
                        <DataRow label="Revenue/Session" value={`$${evRes.revenuePerSession.toFixed(2)}`} precision={2} />
                        <DataRow label="Margin/Session" value={`$${evRes.marginPerSession.toFixed(2)}`} precision={2} />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Elect. Cost/Yr" value={`$${(evRes.annualElectricityCost / 1000).toFixed(0)}K`} precision={0} />
                        <DataRow label="Demand Charges" value={`$${(evRes.annualDemandCharges / 1000).toFixed(0)}K`} precision={0} />
                        <DataRow label="Network Fees" value={`$${(evRes.annualNetworkFees / 1000).toFixed(0)}K`} precision={0} />
                        <DataRow label="Total CAPEX" value={`$${(evRes.totalCapex / 1000).toFixed(0)}K`} precision={0} />
                        <DataRow label="Levelized ¢/KWh" value={(evRes.levelizedCostPerKwh * 100).toFixed(1)} unit="¢" precision={1} />
                    </div>
                </div>
            </div>

            {/* ─── 8.10C — Hydrogen Fueling Station ─── */}
            <div className="border-t border-slate-200 pt-4 mt-4">
                <SectionHeader title="8.10C Hydrogen Fueling Station" subtitle="700 bar cascade, compression energy, $/kg vs gasoline equivalent, SAE J2601" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-violet-600 uppercase mb-3">Station Configuration</h4>
                        {(['stationCapexMM', 'dailyCapacityKgH2', 'utilizationPct', 'pricePerKg', 'electricityCostPerKwh'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={h2Inp[k]} onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) setH2Inp({ ...h2Inp, [k]: n }); }}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-violet-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-violet-600 uppercase mb-3">Cascade & Compression</h4>
                        {(['compressionKwhPerKg', 'storageCascadeCount', 'cascadePressureBar', 'annualOpexPctOfCapex'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={h2Inp[k]} onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) setH2Inp({ ...h2Inp, [k]: n }); }}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-violet-400" step={k === 'storageCascadeCount' ? 1 : 5} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-violet-600 uppercase mb-3">Fleet & Comparison</h4>
                        {(['fleetFuelCellVehiclesPerDay', 'kgPerVehiclePerFill', 'gasolineEquivalentPricePerGal'] as const).map(k => (
                            <div key={k} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <input type="number" value={h2Inp[k]} onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) setH2Inp({ ...h2Inp, [k]: n }); }}
                                    className="w-24 text-right text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-violet-400" step={0.01} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3"><div className="text-[10px] text-violet-500 uppercase">Kg H₂ / Year</div><div className="text-lg font-bold text-violet-700">{(h2Res.annualKgDelivered / 1000).toFixed(1)}K</div></div>
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3"><div className="text-[10px] text-violet-500 uppercase">Annual Revenue</div><div className="text-lg font-bold text-violet-700">${(h2Res.annualRevenue / 1e6).toFixed(2)}M</div></div>
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3"><div className="text-[10px] text-violet-500 uppercase">Cost / Kg H₂</div><div className="text-lg font-bold text-violet-700">${h2Res.costPerKgDelivered.toFixed(2)}</div></div>
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3"><div className="text-[10px] text-violet-500 uppercase">Cost / GGE</div><div className="text-lg font-bold text-violet-700">${h2Res.costPerGge.toFixed(2)}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Daily Kg Delivered" value={h2Res.stationThroughputKgPerDay.toFixed(0)} unit="KG" precision={0} />
                        <DataRow label="Vehicles Served/Day" value={h2Res.dailyVehiclesServed.toFixed(1)} precision={1} />
                        <DataRow label="Capacity Utilization" value={h2Res.capacityUtilizationPct.toFixed(1)} unit="%" precision={1} />
                        <DataRow label="Compression Energy" value={h2Res.compressionEnergyCostPerKg.toFixed(2)} unit="$/KG" precision={2} />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <DataRow label="Annual Opex" value={`$${(h2Res.annualOpex / 1000).toFixed(0)}K`} precision={0} />
                        <DataRow label="Electricity Cost" value={`$${(h2Res.annualElectricityCost / 1000).toFixed(0)}K`} precision={0} />
                        <DataRow label="Net Profit" value={`$${(h2Res.annualNetProfit / 1000).toFixed(0)}K`} precision={0} />
                        <DataRow label="Payback" value={h2Res.simplePaybackYears < 999 ? `${h2Res.simplePaybackYears.toFixed(1)} YRS` : 'N/A'} precision={1} />
                        <DataRow label="H₂ vs Gasoline" value={h2Res.costPerGge < (h2Inp.gasolineEquivalentPricePerGal * 1.1) ? 'COMPETITIVE' : 'PREMIUM'} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Utility: cn ───
function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

// ══════════════════════════════════════════════════════════════
// MAIN RETAIL STAGE CONTAINER
// ══════════════════════════════════════════════════════════════
const tabs = [
    { key: '8.1', label: '8.1 Site Selection' },
    { key: '8.2', label: '8.2 UST Systems' },
    { key: '8.3', label: '8.3 Dispensing Systems' },
    { key: '8.4', label: '8.4 POS & Payments' },
    { key: '8.5', label: '8.5 Pricing Strategy' },
    { key: '8.6', label: '8.6 Station Operations' },
    { key: '8.7', label: '8.7 C-Store & Non-Fuel' },
    { key: '8.8', label: '8.8 Car Wash & Ancillary' },
    { key: '8.9', label: '8.9 Retail HSE' },
    { key: '8.10', label: '8.10 Energy Transition' },
];

export default function RetailStage() {
    const [activeTab, setActiveTab] = useState('8.1');

    // ─── Shared Store Wiring ───
    const retailLayer = useRetail();
    const distributionData = useDistribution().data;

    // ─── All input states (seeded from store or distribution when available) ───
    const [site, setSite] = useState<SiteSelectionInputs>(defaultSite);
    const [ust, setUst] = useState<USTConfigInputs>(defaultUST);
    const [dispenser, setDispenser] = useState<DispenserInputs>(defaultDispenser);
    const [pos, setPos] = useState<POSInputs>(defaultPOS);
    const [pricing, setPricing] = useState<PricingInputs>(() => {
        // Seed pricing from distribution rack prices if available
        const terminals = distributionData?.terminals;
        if (terminals && terminals.length > 0) {
            const firstTerminal = terminals[0];
            // DistributionTerminal has products[] with rackPrice per product
            const rackProducts = firstTerminal.products;
            const regularProduct = rackProducts?.find((p: { productId: string; rackPrice?: number }) => p.productId === 'regular');
            const rackRegular = regularProduct?.rackPrice ?? 2.85;
            return { ...defaultPricing, rackWholesalePerGal: rackRegular };
        }
        return defaultPricing;
    });
    const [ops, setOps] = useState<OperationsInputs>(defaultOps);
    const [cstore, setCstore] = useState<CStoreInputs>(defaultCStore);
    const [carwash, setCarwash] = useState<CarWashInputs>(defaultCarWash);
    const [hse, setHse] = useState<RetailHSEInputs>(defaultHSE);
    const [transition, setTransition] = useState<EnergyTransitionInputs>(defaultTransition);
    const [evCharger, setEvCharger] = useState<EvChargerInputs>(defaultEvCharger);
    const [hydrogen, setHydrogen] = useState<HydrogenStationInputs>(defaultHydrogen);

    // Track whether data has been synced from upstream
    const [upstreamAvailable, setUpstreamAvailable] = useState(false);

    // ─── Cascading calculations ───
    const siteRes = useMemo(() => calculateSiteSelection(site), [site]);
    const ustRes = useMemo(() => analyzeUSTSystem(ust), [ust]);
    const dispenserRes = useMemo(() => analyzeDispenserSystem(dispenser), [dispenser]);
    const posRes = useMemo(() => analyzePOSSystem(pos), [pos]);
    const pricingRes = useMemo(() => optimizePricingStrategy(pricing), [pricing]);
    const opsRes = useMemo(() => analyzeStationOperations(ops), [ops]);
    const cstoreRes = useMemo(() => analyzeCStore(cstore), [cstore]);
    const carwashRes = useMemo(() => analyzeAncillaryServices(carwash), [carwash]);
    const hseRes = useMemo(() => evaluateRetailHSE(hse), [hse]);
    const transitionRes = useMemo(() => projectEnergyTransition(transition), [transition]);
    const evChargerRes = useMemo(() => calculateEvChargerEconomics(evCharger), [evCharger]);
    const hydrogenRes = useMemo(() => calculateHydrogenStation(hydrogen), [hydrogen]);

    // Summary metrics
    const totalStationRevenue = siteRes.estimatedGallonsPerMonth * 3.50 + cstoreRes.insideSalesPerMonth;
    const totalMargin = (siteRes.estimatedGallonsPerMonth * site.fuelMarginPerGal) + cstoreRes.insideMarginPerMonth + carwashRes.totalAncillaryMargin - opsRes.monthlyOpex;

    // ─── Seed pricing from distribution layer when it changes ───
    useEffect(() => {
        const terminals = distributionData?.terminals;
        if (terminals && terminals.length > 0) {
            const firstTerminal = terminals[0];
            const rackProducts = firstTerminal.products;
            const regularProduct = rackProducts?.find((p: { productId: string; rackPrice?: number }) => p.productId === 'regular');
            const premiumProduct = rackProducts?.find((p: { productId: string; rackPrice?: number }) => p.productId === 'premium');
            const rackRegular = regularProduct?.rackPrice ?? pricing.rackWholesalePerGal;
            const rackPremium = premiumProduct?.rackPrice ?? rackRegular + 0.30;
            if (rackRegular !== pricing.rackWholesalePerGal) {
                setPricing(prev => ({
                    ...prev,
                    rackWholesalePerGal: rackRegular,
                    premiumPriceGap: rackPremium - rackRegular,
                }));
            }
            setUpstreamAvailable(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [distributionData?.terminals?.[0]?.products]);

    // ─── Sync key calculation results back to the Retail store layer ───
    useEffect(() => {
        if (!siteRes || !pricingRes) return;

        // Build station tanks from UST results
        const stationTanks: StationTank[] = [{
            tankId: 'T1',
            product: 'regular',
            capacity: ustRes.tankVolumeGallons,
            currentLevel: ustRes.tankVolumeGallons * 0.55,
            ullage: ustRes.tankVolumeGallons * 0.45,
            waterBottom: 0.5,
            deliveryNeeded: ustRes.tankVolumeGallons * 0.55 < ustRes.tankVolumeGallons * 0.3,
        }, {
            tankId: 'T2',
            product: 'premium',
            capacity: ustRes.tankVolumeGallons,
            currentLevel: ustRes.tankVolumeGallons * 0.6,
            ullage: ustRes.tankVolumeGallons * 0.4,
            waterBottom: 0.25,
            deliveryNeeded: false,
        }, {
            tankId: 'T3',
            product: 'diesel',
            capacity: ustRes.tankVolumeGallons,
            currentLevel: ustRes.tankVolumeGallons * 0.45,
            ullage: ustRes.tankVolumeGallons * 0.55,
            waterBottom: 0.75,
            deliveryNeeded: true,
        }];

        const retailStation: RetailStation = {
            stationId: 'S1',
            tanks: stationTanks,
        };

        // Build station sales from pricing + c-store + ops results
        const stationSales: StationSales = {
            stationId: 'S1',
            dailyVolume: {
                regular: Math.round((pricingRes.blendedPumpPrice > 0 ? ops.monthlyGallonsSold * pricing.regularSharePct / 100 / 30 : siteRes.estimatedGallonsPerMonth * pricing.regularSharePct / 100 / 30)),
                premium: Math.round((pricingRes.blendedPumpPrice > 0 ? ops.monthlyGallonsSold * pricing.premiumSharePct / 100 / 30 : siteRes.estimatedGallonsPerMonth * pricing.premiumSharePct / 100 / 30)),
                midgrade: Math.round((pricingRes.blendedPumpPrice > 0 ? ops.monthlyGallonsSold * pricing.midGradeSharePct / 100 / 30 : siteRes.estimatedGallonsPerMonth * pricing.midGradeSharePct / 100 / 30)),
            },
            retailPrice: {
                regular: pricingRes.pumpPricePerGal,
                premium: pricingRes.pumpPricePerGal + pricing.premiumPriceGap,
                midgrade: pricingRes.blendedPumpPrice,
                diesel: pricingRes.pumpPricePerGal + 0.05,
            },
            rackCost: {
                regular: pricing.rackWholesalePerGal,
                premium: pricing.rackWholesalePerGal + pricing.premiumPriceGap,
                midgrade: pricing.rackWholesalePerGal + pricing.midGradePriceGap,
                diesel: pricing.rackWholesalePerGal + 0.05,
            },
            fuelMargin: {
                regular: pricingRes.pumpPricePerGal - pricing.rackWholesalePerGal - pricing.federalTaxPerGal - pricing.stateTaxPerGal - pricing.deliveryCostPerGal,
                premium: (pricingRes.pumpPricePerGal + pricing.premiumPriceGap) - (pricing.rackWholesalePerGal + pricing.premiumPriceGap) - pricing.federalTaxPerGal - pricing.stateTaxPerGal - pricing.deliveryCostPerGal,
                midgrade: pricingRes.blendedPumpPrice - (pricing.rackWholesalePerGal + pricing.midGradePriceGap) - pricing.federalTaxPerGal - pricing.stateTaxPerGal - pricing.deliveryCostPerGal,
                diesel: (pricingRes.pumpPricePerGal + 0.05) - (pricing.rackWholesalePerGal + 0.05) - pricing.federalTaxPerGal - pricing.stateTaxPerGal - pricing.deliveryCostPerGal,
            },
            insideSales: cstoreRes.insideSalesPerMonth / 30,
            totalProfit: totalMargin / 30,
        };

        retailLayer.update({
            stations: [retailStation],
            sales: [stationSales],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteRes, ustRes, dispenserRes, posRes, pricingRes, opsRes, cstoreRes, carwashRes, hseRes, transitionRes]);

    const renderTab = () => {
        switch (activeTab) {
            case '8.1': return <SiteSelectionTab inp={site} setInp={setSite} res={siteRes} />;
            case '8.2': return <USTSystemTab inp={ust} setInp={setUst} res={ustRes} />;
            case '8.3': return <DispensingSystemsTab inp={dispenser} setInp={setDispenser} res={dispenserRes} />;
            case '8.4': return <POSTab inp={pos} setInp={setPos} res={posRes} />;
            case '8.5': return <PricingStrategyTab inp={pricing} setInp={setPricing} res={pricingRes} />;
            case '8.6': return <StationOperationsTab inp={ops} setInp={setOps} res={opsRes} />;
            case '8.7': return <CStoreTab inp={cstore} setInp={setCstore} res={cstoreRes} />;
            case '8.8': return <AncillaryServicesTab inp={carwash} setInp={setCarwash} res={carwashRes} />;
            case '8.9': return <HSETab inp={hse} setInp={setHse} res={hseRes} />;
            case '8.10': return <EnergyTransitionTab inp={transition} setInp={setTransition} res={transitionRes} evInp={evCharger} setEvInp={setEvCharger} evRes={evChargerRes} h2Inp={hydrogen} setH2Inp={setHydrogen} h2Res={hydrogenRes} />;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-app-bg text-text-primary">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-elevated-bg shrink-0">
                <div>
                    <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Phase 8: Retail & Fuel Dispensing (Downstream)</h2>
                    <p className="text-[10px] text-text-secondary uppercase">
                        Site selection • UST • Dispensing • POS • Pricing • Operations • C-Store • Ancillary • HSE • Energy Transition
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-text-secondary uppercase block">Est. Monthly Volume | Total Revenue</span>
                    <span className="text-lg font-bold text-brand-primary data-mono">
                        {(siteRes.estimatedGallonsPerMonth / 1000).toFixed(0)}K GAL
                    </span>
                    <span className="text-sm font-bold text-emerald-400 data-mono block">
                        ${(totalStationRevenue / 1000).toFixed(0)}K/mo | Margin: ${(totalMargin / 1000).toFixed(0)}K/mo
                    </span>
                </div>
            </div>
            <div className="flex px-1 pt-1 bg-elevated-bg border-b border-border-subtle shrink-0 overflow-x-auto gap-0.5">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`whitespace-nowrap px-2.5 py-1.5 text-[10px] font-medium uppercase rounded-t transition-colors ${activeTab === t.key
                            ? 'bg-app-bg text-brand-primary border-t border-x border-border-subtle'
                            : 'text-text-secondary hover:text-text-primary hover:bg-app-bg/50'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-auto p-4">
                {renderTab()}
            </div>
        </div>
    );
}