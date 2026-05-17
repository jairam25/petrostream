/**
 * Change #8: Excel Export Engine
 * Uses SheetJS (xlsx) to generate professional multi-sheet Excel workbooks
 * for every stage in the petroleum value chain.
 */

import * as XLSX from 'xlsx';

/** A single sheet definition for multi-sheet export */
export interface ExcelSheet {
    name: string;
    data: Record<string, any>[];
    columns: { key: string; label: string; format?: string; width?: number }[];
}

export interface ExcelExportOptions {
    filename: string;
    sheets: ExcelSheet[];
    /** Stage accent color for header background (hex, e.g. '#1a56db') */
    accentColor?: string;
    /** Header text color (default white) */
    headerTextColor?: string;
}

/**
 * Core Excel export function.
 * Creates a workbook with one sheet per ExcelSheet, formatted headers,
 * frozen first row, and auto-width columns.
 */
export function exportToExcel(options: ExcelExportOptions): void {
    const { filename, sheets, accentColor = '#1e40af', headerTextColor = 'FFFFFF' } = options;
    const wb = XLSX.utils.book_new();

    for (const sheet of sheets) {
        const { name, data, columns } = sheet;

        // Build header row and data rows
        const headerRow = columns.map((c) => c.label);
        const dataRows = data.map((row) =>
            columns.map((c) => {
                const val = row[c.key];
                if (val === null || val === undefined) return '';
                return val;
            })
        );

        const wsData = [headerRow, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        const colWidths = columns.map((c) => {
            if (c.width) return { wch: c.width };
            // Auto-size based on header length + padding
            return { wch: Math.max(c.label.length + 4, 14) };
        });
        ws['!cols'] = colWidths;

        // Style the header row (bold, colored background, white text)
        // Note: SheetJS community edition has limited styling support.
        // We use the xlsx-style approach via cell objects.
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const addr = XLSX.utils.encode_col(C) + '1'; // Row 1 (header)
            if (!ws[addr]) continue;
            if (typeof ws[addr] === 'object') {
                (ws[addr] as any).s = {
                    font: { bold: true, color: { rgb: headerTextColor } },
                    fill: { fgColor: { rgb: accentColor } },
                    alignment: { horizontal: 'center', vertical: 'center' },
                };
            }
        }

        // Freeze top row
        ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' };

        XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31)); // SheetJS max 31 chars
    }

    XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Simple CSV export for a single data table.
 */
export function exportToCsv(
    data: Record<string, any>[],
    columns: { key: string; label: string }[],
    filename: string
): void {
    const headers = columns.map((c) => c.label).join(',');
    const rows = data.map((row) =>
        columns
            .map((c) => {
                const val = row[c.key];
                if (val === null || val === undefined) return '';
                const str = String(val);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            })
            .join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Copies table data to clipboard as tab-separated values (pastes directly into Excel).
 */
export async function copyToClipboard(
    data: Record<string, any>[],
    columns: { key: string; label: string }[]
): Promise<void> {
    const headers = columns.map((c) => c.label).join('\t');
    const rows = data.map((row) =>
        columns
            .map((c) => {
                const val = row[c.key];
                if (val === null || val === undefined) return '';
                return String(val);
            })
            .join('\t')
    );
    const tsv = [headers, ...rows].join('\n');
    await navigator.clipboard.writeText(tsv);
}

// ═══════════════════════════════════════════════════════════════
// STAGE-SPECIFIC SHEET BUILDERS
// ═══════════════════════════════════════════════════════════════

/** Builds formatted Excel sheets for petrophysics export */
export function buildPetrophysicsSheets(
    logData: { depth: number; gr: number; resistivity: number; density: number; neutron: number; sonic: number }[],
    computedData: { depth: number; vshale: number; porosity: number; sw: number; permeability: number; netPayFlag: number }[],
    zoneSummary: { zone: string; top: number; base: number; gross: number; net: number; ntg: number; avgPhi: number; avgSw: number; avgK: number; hpt: number }[],
    params: Record<string, any>,
    coreData?: { depth: number; corePorosity: number; corePermeability: number; grainDensity: number }[]
): ExcelSheet[] {
    const sheets: ExcelSheet[] = [];

    // Sheet 1: Log Data
    sheets.push({
        name: 'Log Data',
        data: logData,
        columns: [
            { key: 'depth', label: 'Depth (ft)' },
            { key: 'gr', label: 'GR (GAPI)' },
            { key: 'resistivity', label: 'Resistivity (ohm.m)' },
            { key: 'density', label: 'RHOB (g/cc)' },
            { key: 'neutron', label: 'NPHI (v/v)' },
            { key: 'sonic', label: 'DT (us/ft)' },
        ],
    });

    // Sheet 2: Computed Results
    sheets.push({
        name: 'Computed Results',
        data: computedData,
        columns: [
            { key: 'depth', label: 'Depth (ft)' },
            { key: 'vshale', label: 'Vshale (v/v)' },
            { key: 'porosity', label: 'Porosity (v/v)' },
            { key: 'sw', label: 'Sw (v/v)' },
            { key: 'permeability', label: 'Permeability (md)' },
            { key: 'netPayFlag', label: 'Net Pay Flag' },
        ],
    });

    // Sheet 3: Zone Summary
    sheets.push({
        name: 'Zone Summary',
        data: zoneSummary,
        columns: [
            { key: 'zone', label: 'Zone' },
            { key: 'top', label: 'Top (ft)' },
            { key: 'base', label: 'Base (ft)' },
            { key: 'gross', label: 'Gross (ft)' },
            { key: 'net', label: 'Net Pay (ft)' },
            { key: 'ntg', label: 'N/G' },
            { key: 'avgPhi', label: 'Avg Porosity' },
            { key: 'avgSw', label: 'Avg Sw' },
            { key: 'avgK', label: 'Avg K (md)' },
            { key: 'hpt', label: 'HPT (ft)' },
        ],
    });

    // Sheet 4: Parameters
    const paramRows = Object.entries(params).map(([key, value]) => ({ parameter: key, value: String(value) }));
    sheets.push({
        name: 'Parameters',
        data: paramRows,
        columns: [
            { key: 'parameter', label: 'Parameter' },
            { key: 'value', label: 'Value' },
        ],
    });

    // Sheet 5: Core Data (if available)
    if (coreData && coreData.length > 0) {
        sheets.push({
            name: 'Core Data',
            data: coreData,
            columns: [
                { key: 'depth', label: 'Depth (ft)' },
                { key: 'corePorosity', label: 'Core Porosity (v/v)' },
                { key: 'corePermeability', label: 'Core Permeability (md)' },
                { key: 'grainDensity', label: 'Grain Density (g/cc)' },
            ],
        });
    }

    return sheets;
}

/** Builds formatted Excel sheets for well test export */
export function buildWellTestSheets(
    gaugeData: { time: number; pressure: number }[],
    analysisResults: Record<string, any>,
    derivativeData: { dt: number; dp: number; derivative: number }[],
    rateHistory: { time: number; oilRate: number; gasRate: number; waterRate: number; chokeSize: number; cumulative: number }[]
): ExcelSheet[] {
    return [
        {
            name: 'Gauge Data',
            data: gaugeData,
            columns: [
                { key: 'time', label: 'Time (hrs)' },
                { key: 'pressure', label: 'Pressure (psi)' },
            ],
        },
        {
            name: 'Analysis Results',
            data: [analysisResults],
            columns: Object.keys(analysisResults).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Derivative Data',
            data: derivativeData,
            columns: [
                { key: 'dt', label: 'Delta t (hrs)' },
                { key: 'dp', label: 'Delta P (psi)' },
                { key: 'derivative', label: 'Derivative (psi)' },
            ],
        },
        {
            name: 'Rate History',
            data: rateHistory,
            columns: [
                { key: 'time', label: 'Time' },
                { key: 'oilRate', label: 'Oil Rate (bopd)' },
                { key: 'gasRate', label: 'Gas Rate (Mscfd)' },
                { key: 'waterRate', label: 'Water Rate (bwpd)' },
                { key: 'chokeSize', label: 'Choke (1/64")' },
                { key: 'cumulative', label: 'Cumulative Oil (stb)' },
            ],
        },
    ];
}

/** Builds formatted Excel sheets for reserves export */
export function buildReservesSheets(
    volumetricInputs: Record<string, { p10: number; p50: number; p90: number }>,
    results: { stoiip: number; giip: number; recoverableOil: number; recoverableGas: number }[],
    monteCarloRuns?: Record<string, number>[],
    materialBalance?: { pressure: number; np: number; f: number; et: number; we: number }[]
): ExcelSheet[] {
    const sheets: ExcelSheet[] = [];

    // Sheet 1: Volumetric Inputs
    const inputRows = Object.entries(volumetricInputs).map(([param, vals]) => ({
        parameter: param,
        p10: vals.p10,
        p50: vals.p50,
        p90: vals.p90,
    }));
    sheets.push({
        name: 'Volumetric Inputs',
        data: inputRows,
        columns: [
            { key: 'parameter', label: 'Parameter' },
            { key: 'p10', label: 'P10' },
            { key: 'p50', label: 'P50' },
            { key: 'p90', label: 'P90' },
        ],
    });

    // Sheet 2: Results
    sheets.push({
        name: 'Results',
        data: results,
        columns: [
            { key: 'stoiip', label: 'STOIIP (MMstb)' },
            { key: 'giip', label: 'GIIP (Bscf)' },
            { key: 'recoverableOil', label: 'Recoverable Oil (MMstb)' },
            { key: 'recoverableGas', label: 'Recoverable Gas (Bscf)' },
        ],
    });

    // Sheet 3: Monte Carlo Runs
    if (monteCarloRuns && monteCarloRuns.length > 0) {
        sheets.push({
            name: 'Monte Carlo Runs',
            data: monteCarloRuns,
            columns: Object.keys(monteCarloRuns[0]).map((k) => ({ key: k, label: k })),
        });
    }

    // Sheet 4: Material Balance
    if (materialBalance && materialBalance.length > 0) {
        sheets.push({
            name: 'Material Balance',
            data: materialBalance,
            columns: [
                { key: 'pressure', label: 'Pressure (psi)' },
                { key: 'np', label: 'Np (MMstb)' },
                { key: 'f', label: 'F (MMrb)' },
                { key: 'et', label: 'Et (rb/stb)' },
                { key: 'we', label: 'We (MMrb)' },
            ],
        });
    }

    return sheets;
}

/** Builds formatted Excel sheets for production history export */
export function buildProductionSheets(
    history: { date: string; oilRate: number; gasRate: number; waterRate: number; waterCut: number; gor: number; cumulativeOil: number }[],
    dcaResults: { wellId: string; declineType: string; qi: number; di: number; b: number; eur: number; r2: number }[],
    forecast: { date: string; oil: number; gas: number; water: number }[],
    wellStatus: { wellId: string; status: string; oilRate: number; waterCut: number; gor: number; lastTestDate: string }[],
    injection: { date: string; injectionRate: number; cumulativeInjection: number; vrr: number }[]
): ExcelSheet[] {
    return [
        {
            name: 'Production History',
            data: history,
            columns: [
                { key: 'date', label: 'Date' },
                { key: 'oilRate', label: 'Oil Rate (bopd)' },
                { key: 'gasRate', label: 'Gas Rate (Mscfd)' },
                { key: 'waterRate', label: 'Water Rate (bwpd)' },
                { key: 'waterCut', label: 'Water Cut (%)' },
                { key: 'gor', label: 'GOR (scf/stb)' },
                { key: 'cumulativeOil', label: 'Cum. Oil (MMstb)' },
            ],
        },
        {
            name: 'DCA Results',
            data: dcaResults,
            columns: [
                { key: 'wellId', label: 'Well ID' },
                { key: 'declineType', label: 'Decline Type' },
                { key: 'qi', label: 'Qi (bopd)' },
                { key: 'di', label: 'Di (1/yr)' },
                { key: 'b', label: 'b-factor' },
                { key: 'eur', label: 'EUR (Mstb)' },
                { key: 'r2', label: 'R²' },
            ],
        },
        {
            name: 'Forecast',
            data: forecast,
            columns: [
                { key: 'date', label: 'Date' },
                { key: 'oil', label: 'Oil Rate (bopd)' },
                { key: 'gas', label: 'Gas Rate (Mscfd)' },
                { key: 'water', label: 'Water Rate (bwpd)' },
            ],
        },
        {
            name: 'Well Status',
            data: wellStatus,
            columns: [
                { key: 'wellId', label: 'Well ID' },
                { key: 'status', label: 'Status' },
                { key: 'oilRate', label: 'Oil Rate (bopd)' },
                { key: 'waterCut', label: 'Water Cut (%)' },
                { key: 'gor', label: 'GOR (scf/stb)' },
                { key: 'lastTestDate', label: 'Last Test Date' },
            ],
        },
        {
            name: 'Injection Data',
            data: injection,
            columns: [
                { key: 'date', label: 'Date' },
                { key: 'injectionRate', label: 'Injection Rate (bwpd)' },
                { key: 'cumulativeInjection', label: 'Cum. Injection (MMbbl)' },
                { key: 'vrr', label: 'VRR' },
            ],
        },
    ];
}

/** Builds formatted Excel sheets for refinery export */
export function buildRefinerySheets(
    crudeSlate: { name: string; volume: number; api: number; sulfur: number; price: number }[],
    unitPerformance: { unitId: string; feed: number; severity: number; catalystAge: number; remainingLife: number }[],
    productSlate: { name: string; volume: number; price: number; revenue: number }[],
    blendRecipes: { grade: string; components: Record<string, number>; octane: number; rvp: number; sulfur: number }[],
    economics: Record<string, any>,
    hydrogenBalance: { source: string; rate: number; purity: number; cost: number }[],
    emissions: { source: string; co2: number; so2: number; nox: number; voc: number }[]
): ExcelSheet[] {
    return [
        {
            name: 'Crude Slate',
            data: crudeSlate,
            columns: [
                { key: 'name', label: 'Crude' },
                { key: 'volume', label: 'Volume (bpd)' },
                { key: 'api', label: 'API Gravity' },
                { key: 'sulfur', label: 'Sulfur (wt%)' },
                { key: 'price', label: 'Price ($/bbl)' },
            ],
        },
        {
            name: 'Unit Performance',
            data: unitPerformance,
            columns: [
                { key: 'unitId', label: 'Unit' },
                { key: 'feed', label: 'Feed (bpd)' },
                { key: 'severity', label: 'Severity' },
                { key: 'catalystAge', label: 'Catalyst Age (days)' },
                { key: 'remainingLife', label: 'Remaining Life (days)' },
            ],
        },
        {
            name: 'Product Slate',
            data: productSlate,
            columns: [
                { key: 'name', label: 'Product' },
                { key: 'volume', label: 'Volume (bpd)' },
                { key: 'price', label: 'Price ($/bbl)' },
                { key: 'revenue', label: 'Revenue ($/day)' },
            ],
        },
        {
            name: 'Blend Recipes',
            data: blendRecipes,
            columns: [
                { key: 'grade', label: 'Grade' },
                { key: 'octane', label: 'Octane' },
                { key: 'rvp', label: 'RVP (psi)' },
                { key: 'sulfur', label: 'Sulfur (ppm)' },
            ],
        },
        {
            name: 'Economics',
            data: [economics],
            columns: Object.keys(economics).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Hydrogen Balance',
            data: hydrogenBalance,
            columns: [
                { key: 'source', label: 'Source/Consumer' },
                { key: 'rate', label: 'Rate (Mscfd)' },
                { key: 'purity', label: 'Purity (%)' },
                { key: 'cost', label: 'Cost ($/Mscf)' },
            ],
        },
        {
            name: 'Emissions',
            data: emissions,
            columns: [
                { key: 'source', label: 'Source' },
                { key: 'co2', label: 'CO2 (tons/day)' },
                { key: 'so2', label: 'SO2 (tons/day)' },
                { key: 'nox', label: 'NOx (tons/day)' },
                { key: 'voc', label: 'VOC (tons/day)' },
            ],
        },
    ];
}

/**
 * Full value chain summary export: one sheet per phase with key metrics.
 */
export function exportFullValueChain(
    filename: string,
    summaryData: {
        exploration: Record<string, any>;
        appraisal: Record<string, any>;
        reserves: Record<string, any>;
        drilling: Record<string, any>;
        production: Record<string, any>;
        midstream: Record<string, any>;
        refining: Record<string, any>;
        distribution: Record<string, any>;
        retail: Record<string, any>;
    }
): void {
    const sheets: ExcelSheet[] = [
        {
            name: 'Exploration',
            data: [summaryData.exploration],
            columns: Object.keys(summaryData.exploration).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Appraisal',
            data: [summaryData.appraisal],
            columns: Object.keys(summaryData.appraisal).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Reserves',
            data: [summaryData.reserves],
            columns: Object.keys(summaryData.reserves).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Drilling',
            data: [summaryData.drilling],
            columns: Object.keys(summaryData.drilling).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Production',
            data: [summaryData.production],
            columns: Object.keys(summaryData.production).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Midstream',
            data: [summaryData.midstream],
            columns: Object.keys(summaryData.midstream).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Refining',
            data: [summaryData.refining],
            columns: Object.keys(summaryData.refining).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Distribution',
            data: [summaryData.distribution],
            columns: Object.keys(summaryData.distribution).map((k) => ({ key: k, label: k })),
        },
        {
            name: 'Retail',
            data: [summaryData.retail],
            columns: Object.keys(summaryData.retail).map((k) => ({ key: k, label: k })),
        },
    ];

    exportToExcel({
        filename,
        sheets,
        accentColor: '#1e40af',
    });
}