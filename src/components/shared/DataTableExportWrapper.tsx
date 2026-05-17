/**
 * Change #8: DataTableExportWrapper
 * Wraps any data table component with export buttons (XLSX, CSV, Copy to Clipboard).
 * Hover over the table to reveal export controls.
 */

import React, { useState, useCallback } from 'react';
import { exportToExcel, exportToCsv, copyToClipboard } from '../../lib/export/excelExporter';
import type { ExcelSheet } from '../../lib/export/excelExporter';

interface ExportColumn {
    key: string;
    label: string;
}

interface DataTableExportWrapperProps {
    children: React.ReactNode;
    /** Table title (used in filename generation) */
    title: string;
    /** Data rows */
    data: Record<string, any>[];
    /** Column definitions */
    columns: ExportColumn[];
    /** Filename prefix */
    filenamePrefix?: string;
    /** Stage accent color for Excel headers */
    accentColor?: string;
    /** Additional sheets to include in XLSX export */
    additionalSheets?: ExcelSheet[];
    /** Additional className for the wrapper */
    className?: string;
}

const XLSX_ICON = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const CSV_ICON = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const CLIPBOARD_ICON = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const CHECK_ICON = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const DataTableExportWrapper: React.FC<DataTableExportWrapperProps> = ({
    children,
    title,
    data,
    columns,
    filenamePrefix,
    accentColor = '#1e40af',
    additionalSheets,
    className = '',
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const baseFilename = filenamePrefix || title.replace(/\s+/g, '_');

    const allSheets: ExcelSheet[] = [
        { name: title, data, columns },
        ...(additionalSheets || []),
    ];

    const handleXlsx = useCallback(() => {
        exportToExcel({
            filename: baseFilename,
            sheets: allSheets,
            accentColor,
        });
        setShowMenu(false);
    }, [baseFilename, allSheets, accentColor]);

    const handleCsv = useCallback(() => {
        exportToCsv(data, columns, baseFilename);
        setShowMenu(false);
    }, [data, columns, baseFilename]);

    const handleCopy = useCallback(async () => {
        await copyToClipboard(data, columns);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [data, columns]);

    return (
        <div
            className={`data-table-export-wrapper ${className}`}
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => {
                setShowMenu(false);
                setCopied(false);
            }}
        >
            {/* The table itself */}
            {children}

            {/* Export buttons (top-right corner of table) */}
            <div
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    opacity: showMenu ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    display: 'flex',
                    gap: 4,
                }}
            >
                {/* XLSX Export */}
                <button
                    onClick={handleXlsx}
                    title="Export to Excel (.xlsx)"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        background: '#ffffff',
                        color: '#374151',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {XLSX_ICON}
                    XLSX
                </button>

                {/* CSV Export */}
                <button
                    onClick={handleCsv}
                    title="Export to CSV"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        background: '#ffffff',
                        color: '#374151',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {CSV_ICON}
                    CSV
                </button>

                {/* Copy to Clipboard */}
                <button
                    onClick={handleCopy}
                    title="Copy to clipboard (tab-separated)"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        background: copied ? '#d1fae5' : '#ffffff',
                        color: copied ? '#065f46' : '#374151',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.2s ease, color 0.2s ease',
                    }}
                >
                    {copied ? CHECK_ICON : CLIPBOARD_ICON}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    );
};

export default DataTableExportWrapper;