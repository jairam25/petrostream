/**
 * Typed Zustand selector hooks — one per data layer + composite selectors.
 * Every stage component should import from here instead of managing its own
 * local state for calculations that belong in the simulation data.
 */
import { useSimulationStore } from './simulationStore';
import type {
    ConnectionKey,
    ConnectionStatus,
} from './types';
import { STAGE_TO_LAYER } from './connectionUtils';

// ───────────────────────────────────────────────────────────────
// Per-layer typed accessors (read + write)
// ───────────────────────────────────────────────────────────────

export function useExploration() {
    const data = useSimulationStore(s => s.exploration);
    const update = useSimulationStore(s => s.updateExploration);
    const reset = () => useSimulationStore.getState().resetLayer('exploration');
    return { data, update, reset };
}

export function useAppraisal() {
    const data = useSimulationStore(s => s.appraisal);
    const update = useSimulationStore(s => s.updateAppraisal);
    const reset = () => useSimulationStore.getState().resetLayer('appraisal');
    return { data, update, reset };
}

export function useReserves() {
    const data = useSimulationStore(s => s.reserves);
    const update = useSimulationStore(s => s.updateReserves);
    const reset = () => useSimulationStore.getState().resetLayer('reserves');
    return { data, update, reset };
}

export function useDrilling() {
    const data = useSimulationStore(s => s.drillingCompletion);
    const update = useSimulationStore(s => s.updateDrilling);
    const reset = () => useSimulationStore.getState().resetLayer('drillingCompletion');
    return { data, update, reset };
}

export function useProduction() {
    const data = useSimulationStore(s => s.production);
    const update = useSimulationStore(s => s.updateProduction);
    const reset = () => useSimulationStore.getState().resetLayer('production');
    return { data, update, reset };
}

export function useMidstream() {
    const data = useSimulationStore(s => s.midstream);
    const update = useSimulationStore(s => s.updateMidstream);
    const reset = () => useSimulationStore.getState().resetLayer('midstream');
    return { data, update, reset };
}

export function useRefining() {
    const data = useSimulationStore(s => s.refining);
    const update = useSimulationStore(s => s.updateRefining);
    const reset = () => useSimulationStore.getState().resetLayer('refining');
    return { data, update, reset };
}

export function useDistribution() {
    const data = useSimulationStore(s => s.distribution);
    const update = useSimulationStore(s => s.updateDistribution);
    const reset = () => useSimulationStore.getState().resetLayer('distribution');
    return { data, update, reset };
}

export function useRetail() {
    const data = useSimulationStore(s => s.retail);
    const update = useSimulationStore(s => s.updateRetail);
    const reset = () => useSimulationStore.getState().resetLayer('retail');
    return { data, update, reset };
}

export function useAnalytics() {
    const data = useSimulationStore(s => s.analytics);
    const update = useSimulationStore(s => s.updateAnalytics);
    const reset = () => useSimulationStore.getState().resetLayer('analytics');
    return { data, update, reset };
}

export function useUnconventional() {
    const data = useSimulationStore(s => s.unconventional);
    const update = useSimulationStore(s => s.updateUnconventional);
    const reset = () => useSimulationStore.getState().resetLayer('unconventional');
    return { data, update, reset };
}

export function useAssetManagement() {
    const data = useSimulationStore(s => s.assetManagement);
    const update = useSimulationStore(s => s.updateAssetManagement);
    const reset = () => useSimulationStore.getState().resetLayer('assetManagement');
    return { data, update, reset };
}

// ───────────────────────────────────────────────────────────────
// Connection / staleness selectors
// ───────────────────────────────────────────────────────────────

export function useConnectionStatus() {
    return useSimulationStore(s => s.connectionStatus);
}

export function useConnectionForKey(key: ConnectionKey): ConnectionStatus {
    return useSimulationStore(s => s.connectionStatus[key] || 'red');
}

export function useConnectionsForStage(stage: string): { key: ConnectionKey; status: ConnectionStatus }[] {
    const allStatus = useSimulationStore(s => s.connectionStatus);
    const layer = STAGE_TO_LAYER[stage];
    if (!layer) return [];
    return Object.entries(allStatus)
        .filter(([k]) => k.startsWith(`${layer}→`) || k.endsWith(`→${layer}`))
        .map(([key, status]) => ({ key: key as ConnectionKey, status }));
}

export function useIsStale(stage: string): boolean {
    const connections = useConnectionsForStage(stage);
    return connections.some(c => c.status === 'yellow');
}

// ───────────────────────────────────────────────────────────────
// Store access for bulk operations
// ───────────────────────────────────────────────────────────────

export function useStoreActions() {
    return {
        updateConnection: useSimulationStore(s => s.updateConnection),
        setLayerDirty: useSimulationStore(s => s.setLayerDirty),
        resetAll: useSimulationStore(s => s.resetAll),
    };
}