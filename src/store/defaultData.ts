/**
 * Change #7: Sensible default values for each of the 12 data layers.
 * These defaults are used when initializing the store and when resetting individual layers.
 */

import type {
    ExplorationLayer,
    AppraisalLayer,
    ReservesLayer,
    DrillingCompletionLayer,
    ProductionLayer,
    MidstreamLayer,
    RefiningLayer,
    DistributionLayer,
    RetailLayer,
    AnalyticsLayer,
    UnconventionalLayer,
    AssetManagementLayer,
} from './types';

const now = Date.now();

export function createDefaultExplorationLayer(): ExplorationLayer {
    return {
        basin: { type: 'rift', ageRange: 'Jurassic-Cretaceous' },
        prospect: {
            name: 'Untitled Prospect',
            location: { lat: 28.54, lon: -90.41 },
            trapType: 'structural_anticline',
            cos: { source: 0.8, reservoir: 0.7, seal: 0.8, trap: 0.9, migration: 0.85, timing: 0.9, pg: 0.34 },
            grv: { p10: 50000, p50: 120000, p90: 250000 },
            stoiip: { p10: 15, p50: 45, p90: 120 },
            giip: { p10: 10, p50: 30, p90: 80 },
            emv: 45,
            riskedVolume: 15.3,
        },
        explorationWell: {
            targetDepth: 12000,
            trajectory: 'deviated',
            kop: 3500,
            buildRate: 2.5,
            targetCoordinates: { north: 0, east: 2500 },
            casingProgram: [
                { shoeDepth: 350, holeSize: 26, casingSize: 20, grade: 'K-55', weight: 94 },
                { shoeDepth: 3500, holeSize: 17.5, casingSize: 13.375, grade: 'N-80', weight: 68 },
                { shoeDepth: 9000, holeSize: 12.25, casingSize: 9.625, grade: 'P-110', weight: 47 },
                { shoeDepth: 12000, holeSize: 8.5, casingSize: 7, grade: 'P-110', weight: 35 },
            ],
            mudProgram: [
                { type: 'Seawater/Gel', weight: 9.0, fromDepth: 0, toDepth: 3500 },
                { type: 'WBM', weight: 10.5, fromDepth: 3500, toDepth: 9000 },
                { type: 'OBM', weight: 12.0, fromDepth: 9000, toDepth: 12000 },
            ],
            loggingSuite: ['Gamma Ray', 'Resistivity', 'Density', 'Neutron', 'Sonic', 'NMR'],
            afeCost: 45,
            drillingDays: 65,
        },
        pressureProfile: {
            porePressure: [],
            fractureGradient: [],
            overburden: [],
            mudWindow: [],
        },
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultAppraisalLayer(): AppraisalLayer {
    return {
        petrophysics: [],
        core: [],
        pvt: null,
        fluidContacts: null,
        wellTests: [],
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultReservesLayer(): ReservesLayer {
    return {
        deterministic: null,
        probabilistic: null,
        materialBalance: null,
        classification: null,
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultDrillingLayer(): DrillingCompletionLayer {
    return {
        wells: [],
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultProductionLayer(): ProductionLayer {
    return {
        history: [],
        fieldAggregate: null,
        forecast: null,
        facilities: null,
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultMidstreamLayer(): MidstreamLayer {
    return {
        pipeline: null,
        storage: null,
        marine: null,
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultRefiningLayer(): RefiningLayer {
    return {
        crudeSlate: [],
        totalThroughput: 0,
        utilizationRate: 0,
        units: [],
        products: [],
        economics: null,
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultDistributionLayer(): DistributionLayer {
    return {
        terminals: [],
        pipeline: null,
        deliveries: [],
        fleetUtilization: 0,
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultRetailLayer(): RetailLayer {
    return {
        stations: [],
        sales: [],
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultAnalyticsLayer(): AnalyticsLayer {
    return {
        dcaResults: [],
        typeCurves: [],
        mlPredictions: [],
        monitoringAlerts: [],
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultUnconventionalLayer(): UnconventionalLayer {
    return {
        fracDesigns: [],
        srvEstimates: [],
        rtaResults: [],
        lastUpdated: now,
        version: 1,
    };
}

export function createDefaultAssetManagementLayer(): AssetManagementLayer {
    return {
        npv: null,
        portfolio: [],
        hse: null,
        decommissioningLiability: 0,
        lastUpdated: now,
        version: 1,
    };
}