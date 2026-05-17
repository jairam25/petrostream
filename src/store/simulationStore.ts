/**
 * Change #7: Central Zustand simulation store with 12 data layers,
 * typed actions per layer, persistence via localStorage, and connection status tracking.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    SimulationState,
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
    ConnectionKey,
    ConnectionStatus,
} from './types';
import {
    createDefaultExplorationLayer,
    createDefaultAppraisalLayer,
    createDefaultReservesLayer,
    createDefaultDrillingLayer,
    createDefaultProductionLayer,
    createDefaultMidstreamLayer,
    createDefaultRefiningLayer,
    createDefaultDistributionLayer,
    createDefaultRetailLayer,
    createDefaultAnalyticsLayer,
    createDefaultUnconventionalLayer,
    createDefaultAssetManagementLayer,
} from './defaultData';

// ───────────────────────────────────────────────────────────────
// Staleness / connection logic
// ───────────────────────────────────────────────────────────────

interface Dependencies {
    downstream: LayerId;
    upstream: LayerId;
}

const LAYER_DEPENDENCIES: Dependencies[] = [
    { upstream: 'exploration', downstream: 'appraisal' },
    { upstream: 'exploration', downstream: 'reserves' },
    { upstream: 'exploration', downstream: 'drillingCompletion' },
    { upstream: 'exploration', downstream: 'assetManagement' },
    { upstream: 'appraisal', downstream: 'reserves' },
    { upstream: 'appraisal', downstream: 'production' },
    { upstream: 'appraisal', downstream: 'drillingCompletion' },
    { upstream: 'reserves', downstream: 'production' },
    { upstream: 'reserves', downstream: 'assetManagement' },
    { upstream: 'reserves', downstream: 'refining' },
    { upstream: 'drillingCompletion', downstream: 'production' },
    { upstream: 'drillingCompletion', downstream: 'assetManagement' },
    { upstream: 'production', downstream: 'midstream' },
    { upstream: 'production', downstream: 'reserves' },
    { upstream: 'production', downstream: 'assetManagement' },
    { upstream: 'production', downstream: 'analytics' },
    { upstream: 'midstream', downstream: 'refining' },
    { upstream: 'midstream', downstream: 'assetManagement' },
    { upstream: 'refining', downstream: 'distribution' },
    { upstream: 'refining', downstream: 'assetManagement' },
    { upstream: 'distribution', downstream: 'retail' },
    { upstream: 'distribution', downstream: 'assetManagement' },
    { upstream: 'retail', downstream: 'assetManagement' },
    { upstream: 'unconventional', downstream: 'production' },
    { upstream: 'analytics', downstream: 'assetManagement' },
];

type LayerId = ExplorationLayer extends { lastUpdated: number } ? keyof SimulationState : never;
// Simpler: just use the union type
type SimpleLayerId = 'exploration' | 'appraisal' | 'reserves' | 'drillingCompletion'
    | 'production' | 'midstream' | 'refining' | 'distribution' | 'retail'
    | 'analytics' | 'unconventional' | 'assetManagement';

function computeConnectionStatus(state: SimulationState): Record<ConnectionKey, ConnectionStatus> {
    const connections: Record<string, ConnectionStatus> = {};
    for (const dep of LAYER_DEPENDENCIES) {
        const key: ConnectionKey = `${dep.upstream}→${dep.downstream}` as ConnectionKey;
        const upLayer = state[dep.upstream as SimpleLayerId] as { lastUpdated: number };
        const downLayer = state[dep.downstream as SimpleLayerId] as { lastUpdated: number };

        const upVersion = (upLayer as any).version ?? 0;
        const downVersion = (downLayer as any).version ?? 0;
        const upTime = upLayer.lastUpdated;
        const downTime = downLayer.lastUpdated;

        if (upVersion === 0 || upTime === 0) {
            // Upstream never touched
            connections[key] = 'red';
        } else if (downVersion === 0 || downTime === 0) {
            // Downstream never touched but upstream has data
            connections[key] = 'yellow';
        } else if (upTime > downTime) {
            // Upstream changed after downstream was last computed
            connections[key] = 'yellow';
        } else {
            connections[key] = 'green';
        }
    }
    return connections as Record<ConnectionKey, ConnectionStatus>;
}

function withConnectionUpdate(state: SimulationState): SimulationState {
    return {
        ...state,
        connectionStatus: computeConnectionStatus(state),
    };
}

// ───────────────────────────────────────────────────────────────
// Store interface
// ───────────────────────────────────────────────────────────────

interface SimulationActions {
    // Reset entire simulation
    resetAll: () => void;
    // Reset individual layer
    resetLayer: (layer: SimpleLayerId) => void;

    // Manual connection management (exposed for DataFlowIndicator)
    updateConnection: (key: ConnectionKey, status: ConnectionStatus) => void;
    // Mark a layer as dirty/stale without updating data (forces yellow connections)
    setLayerDirty: (layer: SimpleLayerId) => void;

    // Exploration actions
    updateExploration: (data: Partial<ExplorationLayer>) => void;

    // Appraisal actions
    updateAppraisal: (data: Partial<AppraisalLayer>) => void;

    // Reserves actions
    updateReserves: (data: Partial<ReservesLayer>) => void;

    // Drilling actions
    updateDrilling: (data: Partial<DrillingCompletionLayer>) => void;

    // Production actions
    updateProduction: (data: Partial<ProductionLayer>) => void;

    // Midstream actions
    updateMidstream: (data: Partial<MidstreamLayer>) => void;

    // Refining actions
    updateRefining: (data: Partial<RefiningLayer>) => void;

    // Distribution actions
    updateDistribution: (data: Partial<DistributionLayer>) => void;

    // Retail actions
    updateRetail: (data: Partial<RetailLayer>) => void;

    // Analytics actions
    updateAnalytics: (data: Partial<AnalyticsLayer>) => void;

    // Unconventional actions
    updateUnconventional: (data: Partial<UnconventionalLayer>) => void;

    // Asset management actions
    updateAssetManagement: (data: Partial<AssetManagementLayer>) => void;
}

type SimulationStore = SimulationState & SimulationActions;

// ───────────────────────────────────────────────────────────────
// Default state
// ───────────────────────────────────────────────────────────────

function createDefaultState(): SimulationState {
    const state: SimulationState = {
        exploration: createDefaultExplorationLayer(),
        appraisal: createDefaultAppraisalLayer(),
        reserves: createDefaultReservesLayer(),
        drillingCompletion: createDefaultDrillingLayer(),
        production: createDefaultProductionLayer(),
        midstream: createDefaultMidstreamLayer(),
        refining: createDefaultRefiningLayer(),
        distribution: createDefaultDistributionLayer(),
        retail: createDefaultRetailLayer(),
        analytics: createDefaultAnalyticsLayer(),
        unconventional: createDefaultUnconventionalLayer(),
        assetManagement: createDefaultAssetManagementLayer(),
        connectionStatus: {} as Record<ConnectionKey, ConnectionStatus>,
        simulationId: crypto.randomUUID ? crypto.randomUUID() : `sim-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    return withConnectionUpdate(state);
}

// ───────────────────────────────────────────────────────────────
// The store
// ───────────────────────────────────────────────────────────────

export const useSimulationStore = create<SimulationStore>()(
    persist(
        (set) => ({
            ...createDefaultState(),

            resetAll: () => set(createDefaultState()),

            resetLayer: (layer: SimpleLayerId) =>
                set((state) => {
                    const defaults: Record<SimpleLayerId, any> = {
                        exploration: createDefaultExplorationLayer(),
                        appraisal: createDefaultAppraisalLayer(),
                        reserves: createDefaultReservesLayer(),
                        drillingCompletion: createDefaultDrillingLayer(),
                        production: createDefaultProductionLayer(),
                        midstream: createDefaultMidstreamLayer(),
                        refining: createDefaultRefiningLayer(),
                        distribution: createDefaultDistributionLayer(),
                        retail: createDefaultRetailLayer(),
                        analytics: createDefaultAnalyticsLayer(),
                        unconventional: createDefaultUnconventionalLayer(),
                        assetManagement: createDefaultAssetManagementLayer(),
                    };
                    const newState = { ...state, [layer]: defaults[layer] };
                    return withConnectionUpdate(newState);
                }),

            // Manual connection override
            updateConnection: (key: ConnectionKey, status: ConnectionStatus) =>
                set((state) => ({
                    ...state,
                    connectionStatus: { ...state.connectionStatus, [key]: status },
                })),

            // Mark a layer as dirty: bumps version without changing data,
            // which forces all downstream connections to yellow
            setLayerDirty: (layer: SimpleLayerId) =>
                set((state) => {
                    const layerData = state[layer] as { version: number; lastUpdated: number };
                    const updatedLayer = {
                        ...layerData,
                        version: (layerData.version ?? 0) + 1,
                        lastUpdated: Date.now(),
                    };
                    const newState = { ...state, [layer]: updatedLayer };
                    return withConnectionUpdate(newState);
                }),

            updateExploration: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        exploration: { ...state.exploration, ...data, lastUpdated: Date.now(), version: state.exploration.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateAppraisal: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        appraisal: { ...state.appraisal, ...data, lastUpdated: Date.now(), version: state.appraisal.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateReserves: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        reserves: { ...state.reserves, ...data, lastUpdated: Date.now(), version: state.reserves.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateDrilling: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        drillingCompletion: { ...state.drillingCompletion, ...data, lastUpdated: Date.now(), version: state.drillingCompletion.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateProduction: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        production: { ...state.production, ...data, lastUpdated: Date.now(), version: state.production.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateMidstream: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        midstream: { ...state.midstream, ...data, lastUpdated: Date.now(), version: state.midstream.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateRefining: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        refining: { ...state.refining, ...data, lastUpdated: Date.now(), version: state.refining.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateDistribution: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        distribution: { ...state.distribution, ...data, lastUpdated: Date.now(), version: state.distribution.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateRetail: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        retail: { ...state.retail, ...data, lastUpdated: Date.now(), version: state.retail.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateAnalytics: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        analytics: { ...state.analytics, ...data, lastUpdated: Date.now(), version: state.analytics.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateUnconventional: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        unconventional: { ...state.unconventional, ...data, lastUpdated: Date.now(), version: state.unconventional.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),

            updateAssetManagement: (data) =>
                set((state) => {
                    const updated: SimulationState = {
                        ...state,
                        assetManagement: { ...state.assetManagement, ...data, lastUpdated: Date.now(), version: state.assetManagement.version + 1 },
                    };
                    return withConnectionUpdate(updated);
                }),
        }),
        {
            name: 'petrostream-simulation',
            partialize: (state) => {
                const { resetAll, resetLayer, updateConnection, setLayerDirty, updateExploration, updateAppraisal, updateReserves, updateDrilling, updateProduction, updateMidstream, updateRefining, updateDistribution, updateRetail, updateAnalytics, updateUnconventional, updateAssetManagement, ...rest } = state;
                return rest;
            },
        }
    )
);