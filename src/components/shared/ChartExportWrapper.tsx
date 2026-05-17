/**
 * Change #8: Chart Export Wrapper
 * Wraps any chart element (typically a Recharts container div) and adds
 * a compact export icon overlay (top-right corner) with:
 *   - PNG: high-resolution chart capture (via html2canvas)
 *   - SVG: capture if available or PNG fallback
 *   - CSV: raw data behind the chart (user-provided callback)
 */

import React, { useCallback, useRef, useState } from 'react';
import { Download, FileImage, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { downloadElementAsPNG, downloadSVG } from '../../lib/export/chartCapture';

export interface ChartExportWrapperProps {
    /** Children: the chart element (typically a div containing Recharts) */
    children: React.ReactNode;
    /** Chart title used in the downloaded filename */
    title: string;
    /** Optional custom filename prefix (e.g. 'PetroStream_Porosity_Log') */
    filename?: string;
    /** Callback for CSV export — receives the exported CSV string */
    onExportCSV?: () => string;
    /** Optional additional CSS class for the wrapper */
    className?: string;
    /** Size of the export icon button in pixels */
    iconSize?: number;
    /** Whether to show the export overlay (default true) */
    showExport?: boolean;
    /** Tooltip text for the export menu */
    tooltipText?: string;
    /** Optional SVG content override (if charts provide their own SVG string) */
    svgContent?: string;
}

const iconButtonStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.75)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    color: '#cbd5e1',
    transition: 'all 0.15s ease',
    backdropFilter: 'blur(4px)',
};

const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: 38,
    right: 0,
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: 4,
    zIndex: 50,
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
};

const menuItemStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#cbd5e1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 12,
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
    transition: 'background 0.1s',
};

const ChartExportWrapper: React.FC<ChartExportWrapperProps> = ({
    children,
    title,
    filename,
    onExportCSV,
    className,
    iconSize = 32,
    showExport = true,
    tooltipText,
    svgContent,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [exporting, setExporting] = useState<'png' | 'svg' | 'csv' | null>(null);

    const safeFilename = (filename || title).replace(/[^a-zA-Z0-9_-]/g, '_');

    const handlePNG = useCallback(async () => {
        if (!containerRef.current) return;
        setExporting('png');
        try {
            // Find the actual chart container (first SVG or canvas container within)
            const chartEl = (containerRef.current.querySelector('.recharts-wrapper') as HTMLElement) ||
                (containerRef.current.querySelector('svg')?.closest('div') as HTMLElement) ||
                (containerRef.current.firstElementChild as HTMLElement);
            await downloadElementAsPNG(chartEl || containerRef.current, safeFilename, {
                scale: 2,
                backgroundColor: '#ffffff',
            });
        } catch (err) {
            console.warn('PNG export failed:', err);
        } finally {
            setExporting(null);
            setMenuOpen(false);
        }
    }, [safeFilename]);

    const handleSVG = useCallback(async () => {
        setExporting('svg');
        try {
            if (svgContent) {
                // Use provided SVG string directly
                const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${safeFilename}.svg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else if (containerRef.current) {
                // Delegate to chartCapture's downloadSVG which handles DOM extraction
                downloadSVG(containerRef.current, safeFilename);
            } else {
                // Fallback to PNG if no element available
                await handlePNG();
            }
        } catch (err) {
            console.warn('SVG export failed:', err);
        } finally {
            setExporting(null);
            setMenuOpen(false);
        }
    }, [safeFilename, svgContent, handlePNG]);

    const handleCSV = useCallback(() => {
        if (!onExportCSV) return;
        setExporting('csv');
        try {
            const csv = onExportCSV();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeFilename}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.warn('CSV export failed:', err);
        } finally {
            setExporting(null);
            setMenuOpen(false);
        }
    }, [onExportCSV, safeFilename]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ position: 'relative', display: 'inline-block', width: '100%' }}
        >
            {children}

            {showExport && (
                <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 30 }}>
                    <button
                        type="button"
                        style={iconButtonStyle}
                        title={tooltipText || `Export chart: ${title}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
                    >
                        <Download size={iconSize * 0.5} />
                    </button>

                    {menuOpen && (
                        <div style={menuStyle}>
                            <button
                                type="button"
                                style={menuItemStyle}
                                onClick={handlePNG}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                {exporting === 'png' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <FileImage size={14} />
                                )}
                                PNG Image
                            </button>
                            <button
                                type="button"
                                style={menuItemStyle}
                                onClick={handleSVG}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                {exporting === 'svg' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <FileText size={14} />
                                )}
                                SVG Vector
                            </button>
                            {onExportCSV && (
                                <button
                                    type="button"
                                    style={menuItemStyle}
                                    onClick={handleCSV}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#334155')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    {exporting === 'csv' ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <FileSpreadsheet size={14} />
                                    )}
                                    CSV Data
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChartExportWrapper;