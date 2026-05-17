/**
 * Fix 9 — SampleDataLoader Component
 * "Load Sample Data" button that appears in stage headers.
 * Each stage gets its own sample dataset loadable with one click.
 */
import React from 'react';
import { Database } from 'lucide-react';

export interface SampleDataLoaderProps {
    label?: string;
    stageName: string;
    loadSample: () => void;
    hasData?: boolean; // if true, shows "Reload" variant
}

const SampleDataLoader: React.FC<SampleDataLoaderProps> = ({
    label,
    stageName,
    loadSample,
    hasData = false,
}) => {
    return (
        <button
            onClick={loadSample}
            title={`Load sample ${stageName} dataset`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 10,
                background: hasData ? '#f8fafc' : '#eff6ff',
                border: hasData ? '1px solid #d1d5db' : '1px solid #bfdbfe',
                color: hasData ? '#475569' : '#2563eb',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = hasData ? '#f1f5f9' : '#dbeafe';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = hasData ? '#f8fafc' : '#eff6ff';
            }}
        >
            <Database size={14} />
            {hasData ? 'Reload Sample' : label || 'Load Sample Data'}
        </button>
    );
};

export default SampleDataLoader;