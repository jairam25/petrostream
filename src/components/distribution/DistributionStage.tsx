import React, { useState, useMemo, useEffect } from 'react';
import { ArrowRight, Ship, Train, Truck, Warehouse, Plane, Scale, BookOpen, Network } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRefining, useDistribution } from '../../store/hooks';
import {
    totalDeliveredCost,
    safetyStock,
    daysOfCover,
    reorderPoint,
    seasonalDemandIndex,
    hubSpokeEfficiency,
    networkUtilization,
    batchSizeRequired,
    transmixVolume,
    interfaceLengthFeet,
    pipelineTransitTimeHours,
    pipelineLinefill,
    batchCycleDays,
    pipelineRevenuePerBbl,
    pipelineUtilization,
    sequenceCompatibility,
    interfaceDetectorDelta,
    voyageTimeDays,
    freightCostPerBbl,
    demurrageCost,
    fleetUtilization,
    trainCycleDays,
    railFleetSize,
    unitTrainCostPerBbl,
    loadsPerDayPerLane,
    deliveryCostPerGallon,
    routeMilesPerTrip,
    truckFleetSize,
    truckUtilizationRate,
    hosComplianceCheck,
    terminalThroughput,
    rackLanesRequired,
    tankInventoryDays,
    gainLossReconciliation,
    turnoverRate,
    tankSwitchFrequency,
    vaporRecoveryEfficiency,
    terminalOPEXPerBbl,
    additiveInjectionRate,
    filtrationEfficiency,
    safBlendRatio,
    staticDissipaterDosage,
    fuelFarmDaysOfSupply,
    intoPlaneFuelingCost,
    jftotDeltaP,
    rackPriceBreakdown,
    totalTaxPerGallon,
    exchangeDifferential,
    disruptionExpectedCost,
    carbonTaxCost,
    rinComplianceCost,
    biofuelBlendMargin,
    totalDeliveredCostPerGallon,
    spotVsContractMargin,
    formulaPrice,
    storageArbitrage,
    productMarginWaterfall,
} from '../../lib/distribution';
import DistributionSVGs from './DistributionSVGs';

type DistributionSubTab = 'supply-chain' | 'pipelines' | 'marine' | 'rail' | 'truck' | 'terminal' | 'aviation' | 'commercial' | 'references';

const subTabs: { id: DistributionSubTab; label: string; icon: React.FC<{ size?: number }> }[] = [
    { id: 'supply-chain', label: 'Supply Chain', icon: Network },
    { id: 'pipelines', label: 'Pipelines', icon: ArrowRight },
    { id: 'marine', label: 'Marine', icon: Ship },
    { id: 'rail', label: 'Rail', icon: Train },
    { id: 'truck', label: 'Truck', icon: Truck },
    { id: 'terminal', label: 'Terminal Ops', icon: Warehouse },
    { id: 'aviation', label: 'Aviation Fuel', icon: Plane },
    { id: 'commercial', label: 'Commercial', icon: Scale },
    { id: 'references', label: 'References', icon: BookOpen },
];

export default function DistributionStage() {
    const [activeSubTab, setActiveSubTab] = useState<DistributionSubTab>('supply-chain');

    // ─── Data flow: read refining products → seed distribution inputs ───
    const { data: refining } = useRefining();
    const { data: distData, update: updateDist } = useDistribution();

    // ─── Supply Chain State ───
    const [scProductCost, setScProductCost] = useState(72);
    const [scPipelineTariff, setScPipelineTariff] = useState(3.5);
    const [scTerminalFee, setScTerminalFee] = useState(1.8);
    const [scTruckFreight, setScTruckFreight] = useState(4.2);
    const [scStorageCost, setScStorageCost] = useState(0.9);
    const [scCarryingCost, setScCarryingCost] = useState(0.6);
    const [scAvgDemand, setScAvgDemand] = useState(250000);
    const [scLeadTime, setScLeadTime] = useState(7);
    const [scDemandStdDev, setScDemandStdDev] = useState(35000);
    const [scServiceZ, setScServiceZ] = useState(1.645);
    const [scTotalInv, setScTotalInv] = useState(2200000);
    const [scMonth, setScMonth] = useState(6);
    const [scSeasonalAmplitude, setScSeasonalAmplitude] = useState(15);
    const [scDirectCost, setScDirectCost] = useState(7.5);
    const [scHubSpokeCost, setScHubSpokeCost] = useState(5.8);
    const [scThroughput, setScThroughput] = useState(380000);
    const [scDesignCap, setScDesignCap] = useState(500000);

    const deliveredCost = useMemo(() => totalDeliveredCost(scProductCost, scPipelineTariff, scTerminalFee, scTruckFreight, scStorageCost, scCarryingCost), [scProductCost, scPipelineTariff, scTerminalFee, scTruckFreight, scStorageCost, scCarryingCost]);
    const safetystock = useMemo(() => safetyStock(scAvgDemand, scLeadTime, scDemandStdDev, scServiceZ), [scAvgDemand, scLeadTime, scDemandStdDev, scServiceZ]);
    const doc = useMemo(() => daysOfCover(scTotalInv, scAvgDemand), [scTotalInv, scAvgDemand]);
    const rop = useMemo(() => reorderPoint(scAvgDemand, scLeadTime, safetystock), [scAvgDemand, scLeadTime, safetystock]);
    const seasonalDemand = useMemo(() => seasonalDemandIndex(scMonth, scAvgDemand, scSeasonalAmplitude), [scMonth, scAvgDemand, scSeasonalAmplitude]);
    const hubEff = useMemo(() => hubSpokeEfficiency(scDirectCost, scHubSpokeCost), [scDirectCost, scHubSpokeCost]);
    const netUtil = useMemo(() => networkUtilization(scThroughput, scDesignCap), [scThroughput, scDesignCap]);

    // ─── Pipeline State ───
    const [plDemandVol, setPlDemandVol] = useState(500000);
    const [plCycleDays, setPlCycleDays] = useState(10);
    const [plSafetyFactor, setPlSafetyFactor] = useState(0.15);
    const [plDiameter, setPlDiameter] = useState(24);
    const [plLength, setPlLength] = useState(350);
    const [plReynolds, setPlReynolds] = useState(250000);
    const [plSchmidt, setPlSchmidt] = useState(800);
    const [plFlowRate, setPlFlowRate] = useState(200000);
    const [plTariff, setPlTariff] = useState(3.5);
    const [plThroughput, setPlThroughput] = useState(200000);
    const [plNameplate, setPlNameplate] = useState(250000);
    const [plProductA, setPlProductA] = useState<'gasoline' | 'diesel' | 'jet' | 'fuelOil' | 'naphtha' | 'ethanol'>('gasoline');
    const [plProductB, setPlProductB] = useState<'gasoline' | 'diesel' | 'jet' | 'fuelOil' | 'naphtha' | 'ethanol'>('diesel');
    const [plApi1, setPlApi1] = useState(58);
    const [plApi2, setPlApi2] = useState(38);

    const batchSize = useMemo(() => batchSizeRequired(plDemandVol, plCycleDays, plSafetyFactor), [plDemandVol, plCycleDays, plSafetyFactor]);
    const transmix = useMemo(() => transmixVolume(plDiameter, plLength, plReynolds), [plDiameter, plLength, plReynolds]);
    const ifLength = useMemo(() => interfaceLengthFeet(plDiameter, plReynolds, plSchmidt), [plDiameter, plReynolds, plSchmidt]);
    const transitTime = useMemo(() => pipelineTransitTimeHours(plLength, plFlowRate, plDiameter), [plLength, plFlowRate, plDiameter]);
    const linefill = useMemo(() => pipelineLinefill(plDiameter, plLength), [plDiameter, plLength]);
    const batchCyc = useMemo(() => batchCycleDays(linefill, plThroughput, 4), [linefill, plThroughput]);
    const plRevenue = useMemo(() => pipelineRevenuePerBbl(plTariff, plThroughput), [plTariff, plThroughput]);
    const plUtil = useMemo(() => pipelineUtilization(plThroughput, plNameplate), [plThroughput, plNameplate]);
    const seqCompat = useMemo(() => sequenceCompatibility(plProductA, plProductB), [plProductA, plProductB]);
    const ifDelta = useMemo(() => interfaceDetectorDelta(plApi1, plApi2), [plApi1, plApi2]);

    // ─── Marine State ───
    const [marDist, setMarDist] = useState(4500);
    const [marSpeed, setMarSpeed] = useState(14.5);
    const [marPortTime, setMarPortTime] = useState(3);
    const [marWSFlat, setMarWSFlat] = useState(18);
    const [marWSPct, setMarWSPct] = useState(75);
    const [marCargoSize, setMarCargoSize] = useState(600000);
    const [marCharterRate, setMarCharterRate] = useState(45000);
    const [marPortCharges, setMarPortCharges] = useState(85000);
    const [marBunkerCost, setMarBunkerCost] = useState(650);
    const [marBunkerConsumption, setMarBunkerConsumption] = useState(55);
    const [marDemurrageRate, setMarDemurrageRate] = useState(32000);
    const [marMonthlyVol, setMarMonthlyVol] = useState(2400000);
    const [marLoadPort, setMarLoadPort] = useState(2);
    const [marDischargePort, setMarDischargePort] = useState(2);
    const [marFreeLaytime, setMarFreeLaytime] = useState(4);
    const [marUsedLaytime, setMarUsedLaytime] = useState(5.5);
    const [marFleetDays, setMarFleetDays] = useState(30);

    const transitDays = useMemo(() => voyageTimeDays(marDist, marSpeed, marPortTime), [marDist, marSpeed, marPortTime]);
    const voyageFreq = useMemo(() => marMonthlyVol / marCargoSize, [marMonthlyVol, marCargoSize]);
    const marFleetCalc = useMemo(() => Math.ceil(transitDays * voyageFreq / 30), [transitDays, voyageFreq]);
    const demDays = useMemo(() => marUsedLaytime - marFreeLaytime, [marUsedLaytime, marFreeLaytime]);
    const demCost = useMemo(() => demurrageCost(marDemurrageRate, demDays), [marDemurrageRate, demDays]);
    const marFreightCost = useMemo(() => freightCostPerBbl(marWSFlat, marWSPct, marCargoSize), [marWSFlat, marWSPct, marCargoSize]);
    const marUtil = useMemo(() => fleetUtilization(marFleetDays, marFleetDays), [marFleetDays]);

    // ─── Rail State ───
    const [rlDist, setRlDist] = useState(1200);
    const [rlSpeed, setRlSpeed] = useState(22);
    const [rlYardTime, setRlYardTime] = useState(2.5);
    const [rlCarCap, setRlCarCap] = useState(700);
    const [rlTrainset, setRlTrainset] = useState(100);
    const [rlLeaseRate, setRlLeaseRate] = useState(850);
    const [rlFuelSurcharge, setRlFuelSurcharge] = useState(0.42);
    const [rlTransloadFee, setRlTransloadFee] = useState(1.25);
    const [rlMonthlyVol2, setRlMonthlyVol2] = useState(600000);
    const [rlDemurrageRate2, setRlDemurrageRate2] = useState(75);
    const [rlDemurrageDays2, setRlDemurrageDays2] = useState(3);
    // Additional rail params needed by trainCycleDays
    const [rlLoadingDays, setRlLoadingDays] = useState(1.0);
    const [rlUnloadingDays, setRlUnloadingDays] = useState(1.0);
    const [rlInspectionDays, setRlInspectionDays] = useState(0.5);

    const railCycle = useMemo(() => trainCycleDays(rlDist / rlSpeed / 24, rlLoadingDays, rlUnloadingDays, rlInspectionDays), [rlDist, rlSpeed, rlLoadingDays, rlUnloadingDays, rlInspectionDays]);
    const railFleet = useMemo(() => railFleetSize(rlMonthlyVol2 / 30, rlCarCap, railCycle, rlTrainset), [rlMonthlyVol2, rlCarCap, railCycle, rlTrainset]);
    const railCost = useMemo(() => unitTrainCostPerBbl(rlLeaseRate, railCycle, rlCarCap, rlFuelSurcharge, rlTrainset, rlMonthlyVol2), [rlLeaseRate, railCycle, rlCarCap, rlFuelSurcharge, rlTrainset, rlMonthlyVol2]);

    // ─── Truck State ───
    const [tkDailyVol, setTkDailyVol] = useState(42000);
    const [tkTruckCap, setTkTruckCap] = useState(9000);
    const [tkTripsPerDay, setTkTripsPerDay] = useState(2);
    const [tkOneWay, setTkOneWay] = useState(45);
    const [tkDetour, setTkDetour] = useState(8);
    const [tkLeaseCost, setTkLeaseCost] = useState(280);
    const [tkDriverCost, setTkDriverCost] = useState(32);
    const [tkFuelPrice, setTkFuelPrice] = useState(3.85);
    const [tkMpg, setTkMpg] = useState(5.5);
    const [tkGallonsPerLoad, setTkGallonsPerLoad] = useState(8500);
    const [tkMilesPerTrip, setTkMilesPerTrip] = useState(90);
    const [tkUtilFactor, setTkUtilFactor] = useState(0.85);
    const [tkOpHours, setTkOpHours] = useState(12);
    const [tkAvailHours, setTkAvailHours] = useState(16);
    const [tkDriveHours, setTkDriveHours] = useState(9);
    const [tkDutyHours, setTkDutyHours] = useState(13);
    const [tkOffHours, setTkOffHours] = useState(8);

    const loadsPerDay = useMemo(() => loadsPerDayPerLane(tkDailyVol, tkTruckCap), [tkDailyVol, tkTruckCap]);
    const delivCost = useMemo(() => deliveryCostPerGallon(tkLeaseCost, tkDriverCost, tkFuelPrice, tkMilesPerTrip, tkMpg, tkGallonsPerLoad), [tkLeaseCost, tkDriverCost, tkFuelPrice, tkMilesPerTrip, tkMpg, tkGallonsPerLoad]);
    const routeMiles = useMemo(() => routeMilesPerTrip(tkOneWay, tkDetour), [tkOneWay, tkDetour]);
    const tkFleetSize = useMemo(() => truckFleetSize(tkDailyVol, tkTruckCap, tkTripsPerDay, tkUtilFactor), [tkDailyVol, tkTruckCap, tkTripsPerDay, tkUtilFactor]);
    const tkUtil = useMemo(() => truckUtilizationRate(tkOpHours, tkAvailHours), [tkOpHours, tkAvailHours]);
    const hosCheck = useMemo(() => hosComplianceCheck(tkDriveHours, tkDutyHours, tkOffHours), [tkDriveHours, tkDutyHours, tkOffHours]);

    // ─── Terminal State ───
    const [tmDailyVol, setTmDailyVol] = useState(250000);
    const [tmLoadRate, setTmLoadRate] = useState(600);
    const [tmOpHoursDay, setTmOpHoursDay] = useState(14);
    const [tmLaneUtil, setTmLaneUtil] = useState(0.8);
    const [tmTankCap, setTmTankCap] = useState(500000);
    const [tmDailyThroughput, setTmDailyThroughput] = useState(250000);
    const [tmHeel, setTmHeel] = useState(15000);
    const [tmRecBbl, setTmRecBbl] = useState(250000);
    const [tmShipBbl, setTmShipBbl] = useState(248000);
    const [tmInvChange, setTmInvChange] = useState(50000);
    const [tmReceipts, setTmReceipts] = useState(250000);
    const [tmShipments, setTmShipments] = useState(248000);
    const [tmOpDaysYear, setTmOpDaysYear] = useState(350);
    const [tmAnnualThroughput, setTmAnnualThroughput] = useState(84000000);
    const [tmTankCap2, setTmTankCap2] = useState(350000);
    const [tmProductDemand, setTmProductDemand] = useState(500000);
    const [tmNumGrades, setTmNumGrades] = useState(3);
    const [tmVaporCollected, setTmVaporCollected] = useState(95);
    const [tmVaporGenerated, setTmVaporGenerated] = useState(100);
    const [tmAnnualOPEX, setTmAnnualOPEX] = useState(4500000);
    const [tmDosagePpm, setTmDosagePpm] = useState(15);
    const [tmProductRate, setTmProductRate] = useState(30000);
    const [tmAdditiveSg, setTmAdditiveSg] = useState(0.85);

    const termThroughput = useMemo(() => terminalThroughput(tmReceipts, tmShipments, tmOpDaysYear), [tmReceipts, tmShipments, tmOpDaysYear]);
    const rackLanes = useMemo(() => rackLanesRequired(tmDailyVol, tmLoadRate, tmOpHoursDay, tmLaneUtil), [tmDailyVol, tmLoadRate, tmOpHoursDay, tmLaneUtil]);
    const tankInvDays = useMemo(() => tankInventoryDays(tmTankCap, tmDailyThroughput, tmHeel), [tmTankCap, tmDailyThroughput, tmHeel]);
    const glRec = useMemo(() => gainLossReconciliation(tmRecBbl, tmShipBbl, tmInvChange), [tmRecBbl, tmShipBbl, tmInvChange]);
    const turnRate = useMemo(() => turnoverRate(tmAnnualThroughput, tmTankCap2), [tmAnnualThroughput, tmTankCap2]);
    const tankSwitch = useMemo(() => tankSwitchFrequency(tmTankCap2, tmProductDemand, tmNumGrades), [tmTankCap2, tmProductDemand, tmNumGrades]);
    const vapRecovery = useMemo(() => vaporRecoveryEfficiency(tmVaporCollected, tmVaporGenerated), [tmVaporCollected, tmVaporGenerated]);
    const termOPEX = useMemo(() => terminalOPEXPerBbl(tmAnnualOPEX, tmAnnualThroughput), [tmAnnualOPEX, tmAnnualThroughput]);
    const additiveRate = useMemo(() => additiveInjectionRate(tmDosagePpm, tmProductRate, tmAdditiveSg), [tmDosagePpm, tmProductRate, tmAdditiveSg]);

    // ─── Aviation State ───
    const [avFiltration, setAvFiltration] = useState(98);
    const [avWaterInlet, setAvWaterInlet] = useState(250);
    const [avWaterOutlet, setAvWaterOutlet] = useState(15);
    const [avSAFBlend, setAvSAFBlend] = useState(12);
    const [avConductivityTarget, setAvConductivityTarget] = useState(250);
    const [avBaseConductivity, setAvBaseConductivity] = useState(50);
    const [avAdditiveStrength, setAvAdditiveStrength] = useState(0.012);
    const [avFuelCostPerBbl, setAvFuelCostPerBbl] = useState(85);
    const [avFuelingCost, setAvFuelingCost] = useState(0.08);
    const [avJftotSulfur, setAvJftotSulfur] = useState(2800);
    const [avJftotNitrogen, setAvJftotNitrogen] = useState(1.2);
    const [avHydrotreatingSeverity, setAvHydrotreatingSeverity] = useState(8.5);

    const filtEff = useMemo(() => filtrationEfficiency(avWaterInlet, avWaterOutlet), [avWaterInlet, avWaterOutlet]);
    const safRatio = useMemo(() => safBlendRatio(avSAFBlend, tmDailyVol), [avSAFBlend, tmDailyVol]);
    const sdDosage = useMemo(() => staticDissipaterDosage(avConductivityTarget, avBaseConductivity, avAdditiveStrength), [avConductivityTarget, avBaseConductivity, avAdditiveStrength]);
    const fuelFarmDS = useMemo(() => fuelFarmDaysOfSupply(tmTankCap, tmDailyThroughput, tmHeel), [tmTankCap, tmDailyThroughput, tmHeel]);
    const planeFuelCost = useMemo(() => intoPlaneFuelingCost(avFuelCostPerBbl, avFuelingCost, tmDailyVol), [avFuelCostPerBbl, avFuelingCost, tmDailyVol]);
    const jftotDeltaPCalc = useMemo(() => jftotDeltaP(avJftotSulfur, avJftotNitrogen, avHydrotreatingSeverity), [avJftotSulfur, avJftotNitrogen, avHydrotreatingSeverity]);

    // ─── Commercial State ───
    const [cmSpotPrice, setCmSpotPrice] = useState(78);
    const [cmTermMargin, setCmTermMargin] = useState(6.5);
    const [cmBrandPremium, setCmBrandPremium] = useState(3.2);
    const [cmAdditiveCost, setCmAdditiveCost] = useState(1.8);
    const [cmFederalTax, setCmFederalTax] = useState(18.4);
    const [cmStateTax, setCmStateTax] = useState(38.7);
    const [cmLocalTax, setCmLocalTax] = useState(4.8);
    const [cmCarbonTaxCpg, setCmCarbonTaxCpg] = useState(12.5);
    const [cmContractPrice, setCmContractPrice] = useState(74);
    const [cmSpotPrice2, setCmSpotPrice2] = useState(78);
    const [cmContractPrice2, setCmContractPrice2] = useState(74);
    const [cmExchangeFee, setCmExchangeFee] = useState(1.5);
    const [cmDisruptionProb, setCmDisruptionProb] = useState(0.08);
    const [cmFinImpact, setCmFinImpact] = useState(2500000);
    const [cmDisruptionDays, setCmDisruptionDays] = useState(14);
    const [cmExRefinery, setCmExRefinery] = useState(82);
    const [cmPipeTariff2, setCmPipeTariff2] = useState(3.5);
    const [cmTermCost, setCmTermCost] = useState(2.2);
    const [cmTruckCost, setCmTruckCost] = useState(4.2);
    const [cmTaxesPerBbl, setCmTaxesPerBbl] = useState(25.2);
    const [cmVolBpd, setCmVolBpd] = useState(45000);
    const [cmBenchmark, setCmBenchmark] = useState(78);
    const [cmDiff, setCmDiff] = useState(-2.5);
    const [cmEscalator, setCmEscalator] = useState(1.05);
    const [cmQualityAdj, setCmQualityAdj] = useState(0.8);
    const [cmStorageCost2, setCmStorageCost2] = useState(0.9);
    const [cmForwardPrice, setCmForwardPrice] = useState(82);
    // Additional commercial params for missing function arguments
    const [cmD4RinPrice, setCmD4RinPrice] = useState(1.8);
    const [cmD5RinPrice, setCmD5RinPrice] = useState(1.2);
    const [cmD6ObligationPct, setCmD6ObligationPct] = useState(10.5);
    const [cmD4ObligationPct, setCmD4ObligationPct] = useState(2.0);
    const [cmD5ObligationPct, setCmD5ObligationPct] = useState(5.0);
    const [cmEthanolPrice, setCmEthanolPrice] = useState(62);
    const [cmEthanolBlendPct, setCmEthanolBlendPct] = useState(10);
    const [cmRinValue, setCmRinValue] = useState(1.5);
    const [cmMonthsHeld, setCmMonthsHeld] = useState(3);
    const [cmFinancingRate, setCmFinancingRate] = useState(7.5);
    const [cmPromptPriceTotal, setCmPromptPriceTotal] = useState(3500000);

    const rackPrice = useMemo(() => rackPriceBreakdown(cmSpotPrice, cmTermMargin, cmBrandPremium, cmAdditiveCost), [cmSpotPrice, cmTermMargin, cmBrandPremium, cmAdditiveCost]);
    const totalTax = useMemo(() => totalTaxPerGallon(cmFederalTax, cmStateTax, cmLocalTax, cmCarbonTaxCpg), [cmFederalTax, cmStateTax, cmLocalTax, cmCarbonTaxCpg]);
    const exchDiff = useMemo(() => exchangeDifferential(cmContractPrice, cmSpotPrice, cmExchangeFee), [cmContractPrice, cmSpotPrice, cmExchangeFee]);
    const disruptionCost = useMemo(() => disruptionExpectedCost(cmDisruptionProb, cmFinImpact, cmDisruptionDays), [cmDisruptionProb, cmFinImpact, cmDisruptionDays]);
    const carbonTaxVal = useMemo(() => carbonTaxCost(0.43, cmCarbonTaxCpg), [cmCarbonTaxCpg]);
    const rinCost = useMemo(() => rinComplianceCost(1.5, cmD4RinPrice, cmD5RinPrice, cmD6ObligationPct, cmD4ObligationPct, cmD5ObligationPct), [cmD4RinPrice, cmD5RinPrice, cmD6ObligationPct, cmD4ObligationPct, cmD5ObligationPct]);
    const bioBlendMargin = useMemo(() => biofuelBlendMargin(cmSpotPrice, cmEthanolPrice, cmEthanolBlendPct, cmRinValue), [cmSpotPrice, cmEthanolPrice, cmEthanolBlendPct, cmRinValue]);
    const deliveredCostGal = useMemo(() => totalDeliveredCostPerGallon(cmExRefinery, cmPipeTariff2, cmTermCost, cmTruckCost, cmTaxesPerBbl), [cmExRefinery, cmPipeTariff2, cmTermCost, cmTruckCost, cmTaxesPerBbl]);
    const spotVsContract = useMemo(() => spotVsContractMargin(cmSpotPrice2, cmContractPrice2, cmVolBpd), [cmSpotPrice2, cmContractPrice2, cmVolBpd]);
    const formulaP = useMemo(() => formulaPrice(cmBenchmark, cmDiff, cmEscalator, cmQualityAdj), [cmBenchmark, cmDiff, cmEscalator, cmQualityAdj]);
    const storArb = useMemo(() => storageArbitrage(cmSpotPrice, cmForwardPrice, cmStorageCost2, cmMonthsHeld, cmFinancingRate, cmPromptPriceTotal), [cmSpotPrice, cmForwardPrice, cmStorageCost2, cmMonthsHeld, cmFinancingRate, cmPromptPriceTotal]);

    // ─── Seed distribution from refining (runs once when refining products become available) ───
    const [seeded, setSeeded] = useState(false);
    useEffect(() => {
        if (seeded) return;
        const products = refining?.products;
        if (!products || products.length === 0) return;

        const totalProductBpd = products.reduce((sum, p) => sum + p.volume, 0);
        if (totalProductBpd > 0) {
            setScThroughput(totalProductBpd);
            setPlThroughput(totalProductBpd);
            setTkDailyVol(totalProductBpd / 42);
            setTmDailyVol(totalProductBpd);
            setTmAnnualThroughput(totalProductBpd * 350);
        }

        // Seed commercial pricing from first product
        const firstProduct = products[0];
        if (firstProduct && firstProduct.price > 0) {
            setCmSpotPrice(firstProduct.price);
            setScProductCost(firstProduct.price);
        }

        setSeeded(true);
    }, [refining?.products, seeded]);

    // ─── Persist distribution data to store ───
    useEffect(() => {
        const products = refining?.products ?? [];
        const terminalProducts = products.map((p, i) => ({
            productId: `prod-${i}-${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            inventory: scTotalInv / Math.max(products.length, 1),
            daysOfCover: doc,
            quality: { ...p.quality },
            rackPrice: p.price + scTerminalFee + scTruckFreight,
        }));

        updateDist({
            terminals: [{
                terminalId: 'T1',
                products: terminalProducts,
                truckLoadsPerDay: loadsPerDay,
            }],
            fleetUtilization: tkUtil,
            lastUpdated: Date.now(),
            version: (distData?.version ?? 0) + 1,
        });
    }, [scTotalInv, doc, scTerminalFee, scTruckFreight, loadsPerDay, tkUtil]);

    return (
        <div className="p-4 space-y-5">
            {/* Sub-Tab Navigation */}
            <div className="flex flex-wrap gap-1.5 bg-gray-100 rounded-lg p-1">
                {subTabs.map(st => {
                    const Icon = st.icon;
                    return (
                        <button
                            key={st.id}
                            onClick={() => setActiveSubTab(st.id)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                                activeSubTab === st.id
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                            )}
                        >
                            <Icon size={14} />
                            {st.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
                {activeSubTab === 'supply-chain' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-xs text-blue-600 font-medium">Delivered Cost</div>
                                <div className="text-xl font-bold text-blue-900">${deliveredCost.toFixed(2)}/bbl</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-xs text-green-600 font-medium">Safety Stock</div>
                                <div className="text-xl font-bold text-green-900">{safetystock.toLocaleString()} bbl</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <div className="text-xs text-amber-600 font-medium">Days of Cover</div>
                                <div className="text-xl font-bold text-amber-900">{doc.toFixed(1)} days</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="text-xs text-purple-600 font-medium">Reorder Point</div>
                                <div className="text-xl font-bold text-purple-900">{rop.toLocaleString()} bbl</div>
                            </div>
                        </div>
                        <DistributionSVGs type="supply-chain" data={{ deliveredCost, safetystock, doc, rop, seasonalDemand, hubEff, netUtil }} />
                    </div>
                )}

                {activeSubTab === 'pipelines' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-xs text-blue-600 font-medium">Batch Size</div>
                                <div className="text-xl font-bold text-blue-900">{batchSize.toLocaleString()} bbl</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-xs text-green-600 font-medium">Transmix Volume</div>
                                <div className="text-xl font-bold text-green-900">{transmix.toLocaleString()} bbl</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <div className="text-xs text-amber-600 font-medium">Revenue</div>
                                <div className="text-xl font-bold text-amber-900">${plRevenue.toFixed(0)}/day</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="text-xs text-purple-600 font-medium">Utilization</div>
                                <div className="text-xl font-bold text-purple-900">{plUtil.toFixed(1)}%</div>
                            </div>
                        </div>
                        <DistributionSVGs type="pipelines" data={{ batchSize, transmix, ifLength, transitTime, linefill, batchCyc, plRevenue, plUtil, seqCompat, ifDelta }} />
                    </div>
                )}

                {activeSubTab === 'marine' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-xs text-blue-600 font-medium">Voyage Time</div>
                                <div className="text-xl font-bold text-blue-900">{transitDays.toFixed(1)} days</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-xs text-green-600 font-medium">Freight Cost</div>
                                <div className="text-xl font-bold text-green-900">${marFreightCost.toFixed(2)}/bbl</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <div className="text-xs text-amber-600 font-medium">Demurrage</div>
                                <div className="text-xl font-bold text-amber-900">${demCost.toLocaleString()}</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="text-xs text-purple-600 font-medium">Fleet Utilization</div>
                                <div className="text-xl font-bold text-purple-900">{marUtil.toFixed(1)}%</div>
                            </div>
                        </div>
                        <DistributionSVGs type="marine" data={{ transitDays, voyageFreq, marFleetCalc, demDays, demCost, marFreightCost, marUtil }} />
                    </div>
                )}

                {activeSubTab === 'rail' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-xs text-blue-600 font-medium">Cycle Days</div>
                                <div className="text-xl font-bold text-blue-900">{railCycle.toFixed(1)} days</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-xs text-green-600 font-medium">Fleet Size</div>
                                <div className="text-xl font-bold text-green-900">{railFleet} cars</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <div className="text-xs text-amber-600 font-medium">Cost per Bbl</div>
                                <div className="text-xl font-bold text-amber-900">${railCost.toFixed(2)}</div>
                            </div>
                        </div>
                        <DistributionSVGs type="rail" data={{ railCycle, railFleet, railCost }} />
                    </div>
                )}

                {activeSubTab === 'truck' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-xs text-blue-600 font-medium">Loads/Day</div>
                                <div className="text-xl font-bold text-blue-900">{loadsPerDay.toFixed(1)}</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-xs text-green-600 font-medium">Delivery Cost</div>
                                <div className="text-xl font-bold text-green-900">${delivCost.toFixed(3)}/gal</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <div className="text-xs text-amber-600 font-medium">Fleet Size</div>
                                <div className="text-xl font-bold text-amber-900">{tkFleetSize} trucks</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="text-xs text-purple-600 font-medium">Utilization</div>
                                <div className="text-xl font-bold text-purple-900">{tkUtil.toFixed(1)}%</div>
                            </div>
                        </div>
                        <DistributionSVGs type="truck" data={{ loadsPerDay, delivCost, routeMiles, tkFleetSize, tkUtil, hosCheck }} />
                    </div>
                )}

                {activeSubTab === 'terminal' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-xs text-blue-600 font-medium">Throughput</div>
                                <div className="text-xl font-bold text-blue-900">{termThroughput.toLocaleString()} bpd</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-xs text-green-600 font-medium">Rack Lanes</div>
                                <div className="text-xl font-bold text-green-900">{rackLanes}</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <div className="text-xs text-amber-600 font-medium">Tank Days</div>
                                <div className="text-xl font-bold text-amber-900">{tankInvDays.toFixed(1)} days</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="text-xs text-purple-600 font-medium">Turnover Rate</div>
                                <div className="text-xl font-bold text-purple-900">{turnRate.toFixed(1)}x/yr</div>
                            </div>
                        </div>
                        <DistributionSVGs type="terminal" data={{ termThroughput, rackLanes, tankInvDays, glRec, turnRate, tankSwitch, vapRecovery, termOPEX, additiveRate }} />
                    </div>
                )}

                {activeSubTab === 'aviation' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-xs text-blue-600 font-medium">Filter Efficiency</div>
                                <div className="text-xl font-bold text-blue-900">{filtEff.toFixed(1)}%</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-xs text-green-600 font-medium">SAF Blend Ratio</div>
                                <div className="text-xl font-bold text-green-900">{safRatio.toFixed(1)}%</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <div className="text-xs text-amber-600 font-medium">SD Dosage</div>
                                <div className="text-xl font-bold text-amber-900">{sdDosage.toFixed(2)} ppm</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="text-xs text-purple-600 font-medium">Fuel Farm DS</div>
                                <div className="text-xl font-bold text-purple-900">{fuelFarmDS.toFixed(1)} days</div>
                            </div>
                        </div>
                        <DistributionSVGs type="aviation" data={{ filtEff, safRatio, sdDosage, fuelFarmDS, planeFuelCost, jftotDeltaPCalc }} />
                    </div>
                )}

                {activeSubTab === 'commercial' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-xs text-blue-600 font-medium">Rack Price</div>
                                <div className="text-xl font-bold text-blue-900">${rackPrice.toFixed(2)}/bbl</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-xs text-green-600 font-medium">Total Tax</div>
                                <div className="text-xl font-bold text-green-900">{totalTax.toFixed(1)} ¢/gal</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <div className="text-xs text-amber-600 font-medium">Exchange Diff</div>
                                <div className="text-xl font-bold text-amber-900">${exchDiff.toFixed(2)}/bbl</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="text-xs text-purple-600 font-medium">Disruption Cost</div>
                                <div className="text-xl font-bold text-purple-900">${disruptionCost.toLocaleString()}</div>
                            </div>
                            <div className="bg-teal-50 rounded-lg p-3">
                                <div className="text-xs text-teal-600 font-medium">RIN Compliance</div>
                                <div className="text-xl font-bold text-teal-900">${rinCost.toFixed(2)}/bbl</div>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-3">
                                <div className="text-xs text-indigo-600 font-medium">Biofuel Margin</div>
                                <div className="text-xl font-bold text-indigo-900">${bioBlendMargin.toFixed(2)}/bbl</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-3">
                                <div className="text-xs text-orange-600 font-medium">Delivered Cost</div>
                                <div className="text-xl font-bold text-orange-900">${deliveredCostGal.toFixed(2)}/gal</div>
                            </div>
                            <div className="bg-pink-50 rounded-lg p-3">
                                <div className="text-xs text-pink-600 font-medium">Storage Arb</div>
                                <div className="text-xl font-bold text-pink-900">${storArb.toFixed(2)}/bbl</div>
                            </div>
                        </div>
                        <DistributionSVGs type="commercial" data={{ rackPrice, totalTax, exchDiff, disruptionCost, carbonTaxVal, rinCost, bioBlendMargin, deliveredCostGal, spotVsContract, formulaP, storArb }} />
                    </div>
                )}

                {activeSubTab === 'references' && (
                    <div className="prose prose-sm max-w-none">
                        <DistributionSVGs type="references" data={{}} />
                    </div>
                )}
            </div>
        </div>
    );
}