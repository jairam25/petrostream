/**
 * DataFlowIndicator — renders a visual row of inter-stage connection badges
 * showing the data flow status between simulation layers.
 *
 * Green  = data linked (both sides computed, upstream ≤ downstream time)
 * Yellow = stale (upstream changed since downstream last computed)
 * Red    = no data (upstream stage not yet completed)
 *
 * Badges are clickable — they navigate to the corresponding stage
 * via the onNavigateStage callback.
 */
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ArrowRight, GitCompareArrows, X } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { connectionLabel, STAGE_TO_LAYER } from '../../store/connectionUtils';
import type { ConnectionKey, ConnectionStatus } from '../../store/types';
import { LifecycleStage } from '../../types';

/** Map display names from connectionLabel → LifecycleStage enum values */
const NAME_TO_STAGE: Record<string, LifecycleStage> = {
    'Exploration': LifecycleStage.EXPLORATION,
    'Appraisal': LifecycleStage.APPRAISAL,
    'Reserves': LifecycleStage.RESERVES,
    'Drilling': LifecycleStage.DRILLING,
    'Production': LifecycleStage.PRODUCTION,
    'Midstream': LifecycleStage.MIDSTREAM,
    'Refining': LifecycleStage.REFINING_ADV,
    'Distribution': LifecycleStage.DISTRIBUTION,
    'Retail': LifecycleStage.RETAIL,
    'Analytics': LifecycleStage.ANALYTICS,
    'Unconventional': LifecycleStage.UNCONVENTIONAL,
    'Management': LifecycleStage.ASSET_MANAGEMENT,
};

interface Props {
    /** The active stage name as used in App.tsx (e.g. 'exploration') */
    activeStage: string;
    /** Compact mode for sidebar badge display */
    compact?: boolean;
    /** Called when a connection badge (target stage) is clicked for navigation */
    onNavigateStage?: (stage: LifecycleStage) => void;
}

const STATUS_COLORS: Record<ConnectionStatus, { dot: string; text: string; bg: string }> = {
    green: { dot: '#22c55e', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    yellow: { dot: '#eab308', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    red: { dot: '#ef4444', text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

export default function DataFlowIndicator({ activeStage, compact = false, onNavigateStage }: Props) {
    const connectionStatus = useSimulationStore(s => s.connectionStatus);
    const stageKey = activeStage.toUpperCase();
    const layer = STAGE_TO_LAYER[stageKey];
    const [popupOpen, setPopupOpen] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    // Close popup on outside click
    useEffect(() => {
        if (!popupOpen) return;
        const handler = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setPopupOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [popupOpen]);

    // Close popup when stage changes
    useEffect(() => {
        setPopupOpen(false);
    }, [activeStage]);

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

    /** Resolve the LifecycleStage of the "other" side of a connection for navigation */
    const resolveNavigateTarget = (keyName: ConnectionKey, dir: 'in' | 'out'): LifecycleStage | null => {
        const label = connectionLabel(keyName);
        const [from, to] = label.split(' → ');
        const name = dir === 'in' ? from : to;
        return NAME_TO_STAGE[name] ?? null;
    };

    const ConnectionBadge: React.FC<{
        keyName: ConnectionKey;
        status: ConnectionStatus;
        dir: 'in' | 'out';
        onNavigate?: (stage: LifecycleStage) => void;
    }> = ({ keyName, status, dir, onNavigate }) => {
        const c = STATUS_COLORS[status];
        const label = connectionLabel(keyName);
        const [from, to] = label.split(' → ');
        const targetStage = resolveNavigateTarget(keyName, dir);
        const clickable = !!onNavigate && !!targetStage;

        const badge = (
            <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] leading-tight select-none
          ${c.bg}
          ${clickable ? 'cursor-pointer hover:brightness-125 hover:border-white/40 active:scale-95 transition-all' : ''}`}
            >
                {/* Colored status dot */}
                <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
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

        if (clickable) {
            return (
                <button
                    type="button"
                    className="p-0 m-0 bg-transparent border-none"
                    onClick={() => {
                        onNavigate!(targetStage!);
                        setPopupOpen(false);
                    }}
                    title={`Navigate to ${targetStage}`}
                >
                    {badge}
                </button>
            );
        }
        return badge;
    };

    // ─── Compact mode: clickable icon that opens a floating popup ───
    if (compact) {
        const greenCount = [...upstream, ...downstream].filter(c => c.status === 'green').length;
        const yellowCount = [...upstream, ...downstream].filter(c => c.status === 'yellow').length;
        const redCount = [...upstream, ...downstream].filter(c => c.status === 'red').length;
        const total = greenCount + yellowCount + redCount;
        const hasConnections = upstream.length > 0 || downstream.length > 0;

        return (
            <div className="relative" ref={popupRef}>
                {/* Clickable icon button */}
                <button
                    type="button"
                    onClick={() => setPopupOpen(!popupOpen)}
                    className="flex flex-col items-center gap-1 group focus:outline-none"
                    title="Data Flow Connections"
                >
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center border transition-all
                        ${popupOpen
                            ? 'bg-cyan-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                            : 'bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/20'
                        }`}
                    >
                        <GitCompareArrows size={18} className="text-cyan-400" />
                    </div>
                    {/* Summary dots below icon */}
                    {total > 0 && (
                        <div className="flex items-center gap-1">
                            {greenCount > 0 && <span className="flex items-center gap-0.5 text-[9px] text-green-400"><span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />{greenCount}</span>}
                            {yellowCount > 0 && <span className="flex items-center gap-0.5 text-[9px] text-yellow-400"><span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />{yellowCount}</span>}
                            {redCount > 0 && <span className="flex items-center gap-0.5 text-[9px] text-red-400"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />{redCount}</span>}
                        </div>
                    )}
                </button>

                {/* Floating popup panel */}
                {popupOpen && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800/80">
                            <div className="flex items-center gap-2">
                                <GitCompareArrows size={14} className="text-cyan-400" />
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Data Flow</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPopupOpen(false)}
                                className="text-slate-500 hover:text-white transition-colors p-0.5"
                            >
                                <X size={12} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {!hasConnections && (
                                <div className="text-[11px] text-slate-400 text-center py-2 italic">
                                    No connections for this stage.
                                    <br />
                                    <span className="text-slate-500">Run simulations to create data links.</span>
                                </div>
                            )}

                            {upstream.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">← Upstream</span>
                                    <div className="flex flex-wrap gap-1">
                                        {upstream.map(c => (
                                            <ConnectionBadge key={c.key} keyName={c.key} status={c.status} dir="in" onNavigate={onNavigateStage} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {downstream.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">→ Downstream</span>
                                    <div className="flex flex-wrap gap-1">
                                        {downstream.map(c => (
                                            <ConnectionBadge key={c.key} keyName={c.key} status={c.status} dir="out" onNavigate={onNavigateStage} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {hasConnections && upstream.length === 0 && downstream.length === 0 && (
                                <div className="text-[11px] text-slate-400 text-center py-2 italic">
                                    No active data links yet.
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-3 px-3 py-1.5 border-t border-slate-700 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />Linked</span>
                            <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />Stale</span>
                            <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />No data</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── Full (non-compact) mode ───
    if (!layer && upstream.length === 0 && downstream.length === 0) {
        return (
            <div className="flex items-center gap-2 text-xs text-cyan-400/70 px-2 py-1">
                <GitCompareArrows size={14} className="text-cyan-400" />
                No data connections for this stage.
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
                        <ConnectionBadge key={c.key} keyName={c.key} status={c.status} dir="in" onNavigate={onNavigateStage} />
                    ))}
                </div>
            )}
            {downstream.length > 0 && (
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 mr-0.5">→ Out:</span>
                    {downstream.map(c => (
                        <ConnectionBadge key={c.key} keyName={c.key} status={c.status} dir="out" onNavigate={onNavigateStage} />
                    ))}
                </div>
            )}
            {upstream.length === 0 && downstream.length === 0 && (
                <span className="text-[10px] text-slate-500 italic">No connections — run Exploration first</span>
            )}
            {/* Legend */}
            <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-green-500" />Linked</span>
                <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-yellow-500" />Stale</span>
                <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-500" />No data</span>
            </div>
        </div>
    );
}