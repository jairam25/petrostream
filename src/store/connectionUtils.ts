/**
 * Utility functions for mapping store LayerIds to the LifecycleStage enum
 * used by App.tsx, and vice versa.
 */
import type { ConnectionKey, ConnectionStatus, LayerId } from './types';

export type LifecycleStage =
    | 'EXPLORATION'
    | 'APPRAISAL'
    | 'RESERVOIR'
    | 'RESERVES'
    | 'DEVELOPMENT'
    | 'DRILLING'
    | 'UNCONVENTIONAL'
    | 'ASSET_MANAGEMENT'
    | 'LEASING'
    | 'PRODUCTION'
    | 'MIDSTREAM'
    | 'DISTRIBUTION'
    | 'REFINING_ADV'
    | 'RETAIL'
    | 'ANALYTICS'
    | 'LIBRARY'
    | 'CCUS';

/** Map LifecycleStage names (as used in App.tsx) to store LayerIds */
export const STAGE_TO_LAYER: Partial<Record<string, LayerId>> = {
    EXPLORATION: 'exploration',
    APPRAISAL: 'appraisal',
    RESERVOIR: 'reserves',          // Reservoir characterization feeds reserves
    RESERVES: 'reserves',
    DRILLING: 'drillingCompletion',
    DRILLING_ADV: 'drillingCompletion',
    DRILLING_AI_ADV: 'drillingCompletion',
    DEVELOPMENT: 'reserves',        // Development planning reads reserves
    PRODUCTION: 'production',
    MIDSTREAM: 'midstream',
    REFINING_ADV: 'refining',
    DISTRIBUTION: 'distribution',
    RETAIL: 'retail',
    ANALYTICS: 'analytics',
    UNCONVENTIONAL: 'unconventional',
    UNCONVENTIONAL_ADV: 'unconventional',
    ASSET_MANAGEMENT: 'assetManagement',
    ECONOMICS: 'assetManagement',   // Economics feeds asset management
    ECON_ADV: 'assetManagement',
    LEASING: 'exploration',         // Surveying/leasing is pre-exploration
    SURVEYING: 'exploration',
    CCUS: 'assetManagement',        // CCUS is an asset management concern
};

/** All upstream connections for a given stage */
export function getUpstreamConnections(stage: string): ConnectionKey[] {
    const layer = STAGE_TO_LAYER[stage];
    if (!layer) return [];
    const allKeys: ConnectionKey[] = [
        'exploration→appraisal', 'exploration→reserves', 'exploration→drilling', 'exploration→assetManagement',
        'appraisal→reserves', 'appraisal→production', 'appraisal→development', 'appraisal→drilling',
        'reserves→development', 'reserves→production', 'reserves→assetManagement', 'reserves→refining',
        'drilling→production', 'drilling→reserves', 'drilling→assetManagement',
        'production→midstream', 'production→reserves', 'production→assetManagement', 'production→analytics',
        'midstream→refining', 'midstream→assetManagement',
        'refining→distribution', 'refining→retail', 'refining→assetManagement',
        'distribution→retail', 'distribution→assetManagement',
        'retail→assetManagement',
        'unconventional→production',
        'analytics→assetManagement',
    ];
    return allKeys.filter(k => k.endsWith(`→${layer}`));
}

/** All downstream connections for a given stage */
export function getDownstreamConnections(stage: string): ConnectionKey[] {
    const layer = STAGE_TO_LAYER[stage];
    if (!layer) return [];
    const allKeys: ConnectionKey[] = [
        'exploration→appraisal', 'exploration→reserves', 'exploration→drilling', 'exploration→assetManagement',
        'appraisal→reserves', 'appraisal→production', 'appraisal→development', 'appraisal→drilling',
        'reserves→development', 'reserves→production', 'reserves→assetManagement', 'reserves→refining',
        'drilling→production', 'drilling→reserves', 'drilling→assetManagement',
        'production→midstream', 'production→reserves', 'production→assetManagement', 'production→analytics',
        'midstream→refining', 'midstream→assetManagement',
        'refining→distribution', 'refining→retail', 'refining→assetManagement',
        'distribution→retail', 'distribution→assetManagement',
        'retail→assetManagement',
        'unconventional→production',
        'analytics→assetManagement',
    ];
    return allKeys.filter(k => k.startsWith(`${layer}→`));
}

/** Example display name for a connection key */
export function connectionLabel(key: ConnectionKey): string {
    const [from, to] = key.split('→');
    const names: Record<string, string> = {
        exploration: 'Exploration',
        appraisal: 'Appraisal',
        reserves: 'Reserves',
        drillingCompletion: 'Drilling',
        production: 'Production',
        midstream: 'Midstream',
        refining: 'Refining',
        distribution: 'Distribution',
        retail: 'Retail',
        analytics: 'Analytics',
        unconventional: 'Unconventional',
        assetManagement: 'Management',
    };
    return `${names[from] || from} → ${names[to] || to}`;
}