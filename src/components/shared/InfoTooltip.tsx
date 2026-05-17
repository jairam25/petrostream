/**
 * Fix 12 — InfoTooltip Component
 * Displays an info icon next to calculated results.
 * On click, shows the equation used, input values substituted, and step-by-step calculation trace.
 */
import React, { useState, useRef, useEffect } from 'react';

export interface EquationStep {
    label: string;
    value: number | string;
    unit?: string;
}

export interface EquationTrace {
    equation: string;              // e.g., "Sw = [(a × Rw) / (φ^m × Rt)]^(1/n)"
    steps: EquationStep[];        // intermediate values
    finalValue: string;           // "0.28"
    description?: string;         // brief explanation
    reference?: string;           // e.g., "Archie (1942)"
}

interface InfoTooltipProps {
    trace: EquationTrace;
    label?: string;
    size?: number;                // icon size in px
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ trace, label, size = 16 }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {label && <span>{label}</span>}
            <button
                onClick={() => setOpen(!open)}
                title="View calculation details"
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    border: '1px solid #3b82f6',
                    background: '#eff6ff',
                    color: '#3b82f6',
                    fontSize: size * 0.65,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    lineHeight: 1,
                    flexShrink: 0,
                }}
            >
                ⓘ
            </button>
            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                        width: 380,
                        background: '#fff',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        padding: 14,
                        fontSize: 13,
                        lineHeight: 1.55,
                    }}
                >
                    <div style={{ fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>
                        {trace.reference ? trace.reference : 'Calculation Trace'}
                    </div>
                    {trace.description && (
                        <div style={{ marginBottom: 8, color: '#475569' }}>{trace.description}</div>
                    )}
                    <div
                        style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 4,
                            padding: '6px 10px',
                            marginBottom: 10,
                            fontFamily: 'monospace',
                            fontSize: 12,
                            color: '#334155',
                        }}
                    >
                        {trace.equation}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '3px 6px', fontSize: 11, color: '#64748b', fontWeight: 600 }}>Parameter</th>
                                <th style={{ padding: '3px 6px', fontSize: 11, color: '#64748b', fontWeight: 600 }}>Value</th>
                                <th style={{ padding: '3px 6px', fontSize: 11, color: '#64748b', fontWeight: 600 }}>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trace.steps.map((step, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '3px 6px', fontSize: 12 }}>{step.label}</td>
                                    <td style={{ padding: '3px 6px', fontSize: 12, fontFamily: 'monospace' }}>{step.value}</td>
                                    <td style={{ padding: '3px 6px', fontSize: 12, color: '#64748b' }}>{step.unit || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div
                        style={{
                            fontWeight: 600,
                            color: '#0f766e',
                            background: '#f0fdfa',
                            border: '1px solid #ccfbf1',
                            borderRadius: 4,
                            padding: '6px 10px',
                            fontSize: 13,
                        }}
                    >
                        Result: {trace.finalValue}
                    </div>
                </div>
            )}
        </span>
    );
};

/**
 * Quick helper to build an Archie Sw trace.
 */
export function buildArchieTrace(
    a: number,
    m: number,
    n: number,
    Rw: number,
    phi: number,
    Rt: number,
): EquationTrace {
    const phiPowM = Math.pow(phi, m);
    const numerator = a * Rw;
    const denominator = phiPowM * Rt;
    const swPowN = numerator / denominator;
    const sw = Math.pow(swPowN, 1 / n);

    return {
        reference: 'Archie Equation (Archie, 1942)',
        equation: `Swⁿ = (a × Rw) / (φᵐ × Rt) → Sw = [(a × Rw) / (φ^m) × Rt)]^(1/n)`,
        description: 'Empirical water saturation from formation resistivity for clean sandstones.',
        steps: [
            { label: 'Tortuosity factor (a)', value: a, unit: '—' },
            { label: 'Cementation exponent (m)', value: m, unit: '—' },
            { label: 'Saturation exponent (n)', value: n, unit: '—' },
            { label: 'Formation water resistivity (Rw)', value: Rw.toFixed(3), unit: 'ohm·m' },
            { label: 'Porosity (φ)', value: phi.toFixed(4), unit: 'v/v' },
            { label: 'φ^m', value: phiPowM.toFixed(5), unit: '—' },
            { label: 'True resistivity (Rt)', value: Rt.toFixed(1), unit: 'ohm·m' },
            { label: 'Numerator: a × Rw', value: numerator.toFixed(4), unit: 'ohm·m' },
            { label: 'Denominator: φ^m × Rt', value: denominator.toFixed(3), unit: 'ohm·m' },
            { label: 'Sw^n = numerator / denominator', value: swPowN.toFixed(5), unit: '—' },
            { label: 'Sw = (Sw^n)^(1/n)', value: sw.toFixed(4), unit: 'v/v' },
        ],
        finalValue: `${(sw * 100).toFixed(1)}%`,
    };
}

/**
 * Build a generic equation trace from labeled steps.
 */
export function buildGenericTrace(
    formula: string,
    result: string,
    reference: string,
    steps: EquationStep[],
    description?: string,
): EquationTrace {
    return { equation: formula, steps, finalValue: result, reference, description };
}

export default InfoTooltip;