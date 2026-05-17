/**
 * Fix 11 — UnitSystemProvider
 * React context providing global unit system state (Field / Metric / Custom)
 * Converts all inputs, outputs, labels, and axis scales across every stage.
 *
 * For Custom mode, users can pick units per category:
 *   depth in meters but pressure in psi — common in some regions.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { UnitSettings, CustomUnits, UnitCategory } from '../../lib/unitSystem';
import { DEFAULT_UNIT_SETTINGS, convertForDisplay, unitLabel, resolveUnit } from '../../lib/unitSystem';

export interface UnitSystemContextValue {
    /** Current unit settings */
    settings: UnitSettings;
    /** Switch to Field units */
    setField: () => void;
    /** Switch to Metric units */
    setMetric: () => void;
    /** Enter custom mode with optional preset custom units */
    setCustom: (custom?: Partial<CustomUnits>) => void;
    /** Update a single category in custom mode */
    setCategoryUnit: (category: UnitCategory, unit: string) => void;
    /** Convert a field-unit value to the current display unit */
    convert: (value: number, category: UnitCategory) => number;
    /** Get the unit label for a category */
    label: (category: UnitCategory) => string;
    /** Format a value with the appropriate unit label */
    format: (value: number, category: UnitCategory, decimals?: number) => string;
}

const UnitSystemContext = createContext<UnitSystemContextValue | null>(null);

export const UnitSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<UnitSettings>({ ...DEFAULT_UNIT_SETTINGS, custom: { ...DEFAULT_UNIT_SETTINGS.custom } });

    const setField = useCallback(() => {
        setSettings((prev) => ({ system: 'field', custom: { ...prev.custom } }));
    }, []);

    const setMetric = useCallback(() => {
        setSettings((prev) => ({ system: 'metric', custom: { ...prev.custom } }));
    }, []);

    const setCustom = useCallback((custom?: Partial<CustomUnits>) => {
        setSettings((prev) => ({
            system: 'custom' as const,
            custom: { ...prev.custom, ...custom },
        }));
    }, []);

    const setCategoryUnit = useCallback((category: UnitCategory, unit: string) => {
        setSettings((prev) => {
            const updated = { ...prev, system: 'custom' as const, custom: { ...prev.custom } };
            (updated.custom as Record<string, string>)[category] = unit;
            return updated;
        });
    }, []);

    const convert = useCallback(
        (value: number, category: UnitCategory): number => {
            return convertForDisplay(value, settings, category);
        },
        [settings]
    );

    const label = useCallback(
        (category: UnitCategory): string => {
            return unitLabel(settings, category);
        },
        [settings]
    );

    const format = useCallback(
        (value: number, category: UnitCategory, decimals?: number): string => {
            const converted = convertForDisplay(value, settings, category);
            const lbl = unitLabel(settings, category);
            const d = decimals ?? 2;
            if (Math.abs(converted) >= 1e6) {
                return `${(converted / 1e6).toFixed(d)} MM ${lbl}`;
            }
            return `${converted.toFixed(d)} ${lbl}`;
        },
        [settings]
    );

    const ctxValue = useMemo<UnitSystemContextValue>(
        () => ({
            settings,
            setField,
            setMetric,
            setCustom,
            setCategoryUnit,
            convert,
            label,
            format,
        }),
        [settings, setField, setMetric, setCustom, setCategoryUnit, convert, label, format]
    );

    return (
        <UnitSystemContext.Provider value={ctxValue}>
            {children}
        </UnitSystemContext.Provider>
    );
};

export function useUnitSystem(): UnitSystemContextValue {
    const ctx = useContext(UnitSystemContext);
    if (!ctx) {
        throw new Error('useUnitSystem must be used within a UnitSystemProvider');
    }
    return ctx;
}

/** Standalone unit toggle button bar — place in global header */
export const UnitSystemToggle: React.FC = () => {
    const { settings, setField, setMetric, setCustom, setCategoryUnit } = useUnitSystem();
    const [showCustom, setShowCustom] = useState(false);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
                onClick={setField}
                style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    border: settings.system === 'field' ? '1px solid #3b82f6' : '1px solid #334155',
                    background: settings.system === 'field' ? '#2563eb' : 'transparent',
                    color: settings.system === 'field' ? '#fff' : '#94a3b8',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}
            >
                Field (ft·psi·°F)
            </button>
            <button
                onClick={setMetric}
                style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    border: settings.system === 'metric' ? '1px solid #3b82f6' : '1px solid #334155',
                    background: settings.system === 'metric' ? '#2563eb' : 'transparent',
                    color: settings.system === 'metric' ? '#fff' : '#94a3b8',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}
            >
                Metric (m·kPa·°C)
            </button>
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => { setCustom(); setShowCustom(!showCustom); }}
                    style={{
                        padding: '4px 12px',
                        borderRadius: 8,
                        border: settings.system === 'custom' ? '1px solid #3b82f6' : '1px solid #334155',
                        background: settings.system === 'custom' ? '#2563eb' : 'transparent',
                        color: settings.system === 'custom' ? '#fff' : '#94a3b8',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    Custom
                </button>
                {showCustom && settings.system === 'custom' && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 8,
                            padding: 16,
                            width: 300,
                            borderRadius: 14,
                            background: '#0f172a',
                            border: '1px solid #334155',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            zIndex: 100,
                        }}
                    >
                        <h4 style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: '0 0 12px 0',
                        }}>
                            Custom Units per Category
                        </h4>
                        {([
                            { cat: 'depth' as UnitCategory, field: 'ft', metric: 'm' },
                            { cat: 'pressure' as UnitCategory, field: 'psi', metric: 'kPa' },
                            { cat: 'temperature' as UnitCategory, field: 'degF', metric: 'degC' },
                            { cat: 'volumetricRate' as UnitCategory, field: 'bbl_d', metric: 'm3_d' },
                            { cat: 'volume' as UnitCategory, field: 'bbl', metric: 'm3' },
                            { cat: 'density' as UnitCategory, field: 'ppg', metric: 'kg_m3' },
                            { cat: 'length' as UnitCategory, field: 'in', metric: 'cm' },
                            { cat: 'area' as UnitCategory, field: 'acres', metric: 'm2' },
                        ]).map(({ cat, field, metric }) => {
                            const currentUnit = resolveUnit(settings, cat);
                            const isField = currentUnit === field;
                            return (
                                <div
                                    key={cat}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '6px 0',
                                        borderBottom: '1px solid #1e293b',
                                    }}
                                >
                                    <span style={{ fontSize: 11, color: '#cbd5e1', textTransform: 'capitalize' }}>
                                        {cat.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <select
                                        value={currentUnit}
                                        onChange={(e) => setCategoryUnit(cat, e.target.value)}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: 6,
                                            border: '1px solid #334155',
                                            background: '#1e293b',
                                            color: '#f8fafc',
                                            fontSize: 10,
                                            fontWeight: 600,
                                        }}
                                    >
                                        <option value={field}>{field}</option>
                                        <option value={metric}>{metric}</option>
                                    </select>
                                </div>
                            );
                        })}
                        <button
                            onClick={() => setShowCustom(false)}
                            style={{
                                marginTop: 10,
                                width: '100%',
                                padding: '6px',
                                borderRadius: 8,
                                border: '1px solid #334155',
                                background: '#1e293b',
                                color: '#f8fafc',
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};