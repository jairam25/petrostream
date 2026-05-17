/**
 * DataFlowIndicator — renders a visual row of inter-stage connection badges
 * showing the data flow status between simulation layers.
 *
 * Green  = data linked (both sides computed, upstream ≤ downstream time)
 * Yellow = stale (upstream changed since downstream last computed)
 * Red    = no data (upstream stage not yet completed)
 */
import React, { useMemo } from 'react';
import { ArrowRight, Circle } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { connectionLabel, getDownstreamConnections, STAGE_TO_LAYER } from '../../store/connectionUtils';
import type { ConnectionKey, ConnectionStatus } from '../../store/types';

interface Props {
    /** The active stage name as used in App.tsx (e.g. 'EXPLORATION') */
    activeStage: string;
    /** Compact mode for sidebar badge display */
    compact?: boolean;
}

const STATUS_COLORS: Record<ConnectionStatus, { dot: string; text: string; bg: string }> = {
    green: { dot: '#22c55e', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    yellow: { dot: '#eab308', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    red: { dot: '#ef4444', text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

export default function DataFlowIndicator({ activeStage, compact = false }: Props) {
    const connectionStatus = useSimulationStore(s => s.connectionStatus);
    // activeStage comes from the LifecycleStage enum (lowercase), but STAGE_TO_LAYER uses
    // UPPER_CASE keys. Convert to uppercase for the lookup.
    const stageKey = activeStage.toUpperCase();
    const layer = STAGE_TO_LAYER[stageKey];

    const downstream = useMemo(() => {
        if (!layer) return [];
        return Object.entries(connectionStatus)
            .filter(([k]) => k.startsWith(`${layer}→`))
            .map(([key, status]) => ({ key: key as ConnectionKey, status }));
    }, [connectionStatus, layer]);

    const upstream = useMemo(() => {
        if (!layer) return [];
        return Object.entries(connectionStatus)
            .filter(([k]) => k.endsWith(`→${layer}`))
            .map(([key, status]) => ({ key: key as ConnectionKey, status }));
    }, [connectionStatus, layer]);

    if (!layer && upstream.length === 0 && downstream.length === 0) {
        if (compact) return null;
        return (
            <div className="text-xs text-slate-500 italic px-2 py-1">
                No data connections for this stage.
            </div>
        );
    }

    const ConnectionBadge: React.FC<{ keyName: ConnectionKey; status: ConnectionStatus; dir: 'in' | 'out' }> = ({ keyName, status, dir }) => {
        const c = STATUS_COLORS[status];
        const label = connectionLabel(keyName);
        const [from, to] = label.split(' → ');

        return (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] leading-tight ${c.bg}`}>
                <Circle className="w-2 h-2 fill-current" style={{ color: c.dot }} />
                {dir === 'in' ? (
                    <>
                        <span className="text-slate-300">{from}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className={c.text}>You</span>
                    </>
                ) : (
                    <>
                        <span className={c.text}>You</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-300">{to}</span>
                    </>
                )}
            </div>
        );
    };

    if (compact) {
        // Sidebar mode: show summary
        const greenCount = [...upstream, ...downstream].filter(c => c.status === 'green').length;
        const yellowCount = [...upstream, ...downstream].filter(c => c.status === 'yellow').length;
        const redCount = [...upstream, ...downstream].filter(c => c.status === 'red').length;
        const total = greenCount + yellowCount + redCount;
        if (total === 0) return null;

        return (
            <div className="flex items-center gap-1.5 text-[10px]">
                {greenCount > 0 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                        <Circle className="w-1.5 h-1.5 fill-current" />{greenCount}
                    </span>
                )}
                {yellowCount > 0 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        <Circle className="w-1.5 h-1.5 fill-current" />{yellowCount}
                    </span>
                )}
                {redCount > 0 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        <Circle className="w-1.5 h-1.5 fill-current" />{redCount}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-slate-800/50 border-b border-slate-700">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1 font-semibold">Data Flow</span>
            {upstream.length > 0 && (
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 mr-0.5">← In:</span>
                    {upstream.map(c => (
                        <ConnectionBadge key={c.key} keyName={c.key} status={c.status} dir="in" />
                    ))}
                </div>
            )}
            {downstream.length > 0 && (
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 mr-0.5">→ Out:</span>
                    {downstream.map(c => (
                        <ConnectionBadge key={c.key} keyName={c.key} status={c.status} dir="out" />
                    ))}
                </div>
            )}
            {upstream.length === 0 && downstream.length === 0 && (
                <span className="text-[10px] text-slate-500 italic">No connections — run Exploration first</span>
            )}
            {/* Legend */}
            <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Circle className="w-1.5 h-1.5 fill-green-500 text-green-500" />Linked</span>
                <span className="flex items-center gap-1"><Circle className="w-1.5 h-1.5 fill-yellow-500 text-yellow-500" />Stale</span>
                <span className="flex items-center gap-1"><Circle className="w-1.5 h-1.5 fill-red-500 text-red-500" />No data</span>
            </div>
        </div>
    );
}