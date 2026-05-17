/**
 * Change #8: LAS File Exporter
 * Exports computed well log data in LAS 2.0 format (Log ASCII Standard).
 * This is the universal file format for well log data in the petroleum industry,
 * compatible with Petrel, Techlog, IP, and every other petrophysics platform.
 *
 * Also supports LAS 3.0 export option with enhanced metadata.
 */

// ─── Types ───────────────────────────────────────────────────

export interface LASWellInfo {
    wellName: string;
    field: string;
    location: string;
    company: string;
    serviceCompany: string;
    date: string;
    kbElevation: number;
    td: number;
    coordinates?: string;
}

export interface LASCurveDefinition {
    mnemonic: string;
    unit: string;
    description: string;
}

export interface LASParameters {
    [key: string]: {
        value: string | number;
        description: string;
    };
}

export interface LASData {
    /** Well header information */
    well: LASWellInfo;
    /** Curve definitions in the order they appear as columns */
    curves: LASCurveDefinition[];
    /** Parameters used in calculations */
    parameters: LASParameters;
    /** Other notes / methodology */
    other: string;
    /** Data matrix: each inner array is one depth row, values correspond to curves order */
    data: (number | null)[][];
    /** LAS version */
    version?: '2.0' | '3.0';
}

// ─── Constants ───────────────────────────────────────────────

const NULL_VALUE = -999.25; // LAS standard null value
const COLUMN_WIDTH = 12; // Minimum characters per column

// ─── LAS 2.0 Export ─────────────────────────────────────────

/**
 * Formats a single data value for LAS output.
 * Uses the LAS standard null value for null/undefined entries.
 */
function formatLASValue(value: number | null): string {
    if (value === null || value === undefined || isNaN(value)) {
        return NULL_VALUE.toFixed(2);
    }
    // Format with reasonable precision
    if (Math.abs(value) < 0.001 && value !== 0) {
        return value.toExponential(4);
    }
    if (Number.isInteger(value)) {
        return value.toString();
    }
    return value.toFixed(4);
}

/**
 * Right-pads a string to the specified width.
 */
function padRight(str: string, width: number): string {
    return str.padEnd(width, ' ');
}

/**
 * Builds the ~VERSION section.
 */
function buildVersionSection(version: string): string {
    return `~VERSION INFORMATION\n VERS.                           ${version} :   CWLS LOG ASCII STANDARD - VERSION ${version}\n WRAP.                           NO  :   ONE LINE PER DEPTH STEP\n`;
}

/**
 * Builds the ~WELL section.
 */
function buildWellSection(well: LASWellInfo): string {
    const lines: string[] = ['~WELL INFORMATION'];
    const fields: [string, string, string | number][] = [
        ['STRT', 'FT', `${well.td}`], // Start depth (TD for export, typically deepest)
        ['STOP', 'FT', '0.0'],
        ['STEP', 'FT', '0.0'], // Will be computed from data
        ['NULL', '', NULL_VALUE.toString()],
        ['COMP', '', well.company],
        ['WELL', '', well.wellName],
        ['FLD', '', well.field],
        ['LOC', '', well.location],
        ['SRVC', '', well.serviceCompany],
        ['DATE', '', well.date],
        ['UWI', '', ''],
    ];

    for (const [mnem, unit, value] of fields) {
        const mnemonic = mnem.padEnd(8, ' ');
        const unitStr = unit.padEnd(6, ' ');
        lines.push(` ${mnemonic}.${unitStr} ${value}:`);
    }

    if (well.kbElevation) {
        lines.push(` EKB     .FT     ${well.kbElevation}:   KB Elevation`);
    }
    if (well.td) {
        lines.push(` TD      .FT     ${well.td}:   Total Depth`);
    }
    if (well.coordinates) {
        lines.push(` LOC     .       ${well.coordinates}:   Coordinates`);
    }

    return lines.join('\n') + '\n';
}

/**
 * Builds the ~CURVE section.
 */
function buildCurveSection(curves: LASCurveDefinition[]): string {
    const lines: string[] = ['~CURVE INFORMATION'];

    for (const curve of curves) {
        const mnemonic = curve.mnemonic.padEnd(8, ' ');
        const unit = curve.unit.padEnd(6, ' ');
        lines.push(` ${mnemonic}.${unit} ${curve.description}:`);
    }

    return lines.join('\n') + '\n';
}

/**
 * Builds the ~PARAMETER section.
 */
function buildParameterSection(parameters: LASParameters): string {
    const lines: string[] = ['~PARAMETER INFORMATION'];

    for (const [key, param] of Object.entries(parameters)) {
        const mnemonic = key.padEnd(8, ' ');
        const value = typeof param.value === 'number' ? param.value.toString() : param.value;
        lines.push(` ${mnemonic}.       ${value}:   ${param.description}`);
    }

    return lines.join('\n') + '\n';
}

/**
 * Builds the ~OTHER section.
 */
function buildOtherSection(other: string): string {
    return `~OTHER INFORMATION\n ${other}\n`;
}

/**
 * Builds the ~ASCII data section.
 */
function buildASCIISection(data: (number | null)[][]): string {
    const lines: string[] = ['~ASCII'];

    for (const row of data) {
        const formattedRow = row
            .map((val) => padRight(formatLASValue(val), COLUMN_WIDTH))
            .join(' ');
        lines.push(formattedRow.trimEnd());
    }

    return lines.join('\n') + '\n';
}

/**
 * Generates a complete LAS 2.0 file as a string.
 */
export function generateLAS20(lasData: LASData): string {
    const { well, curves, parameters, other, data } = lasData;

    // Compute depth step from data
    let step = 0;
    if (data.length >= 2) {
        const depth1 = data[0][0];
        const depth2 = data[1][0];
        if (depth1 !== null && depth2 !== null) {
            step = Math.abs(depth2 - depth1);
        }
    }

    // Determine start and stop depths
    const depths = data
        .map((row) => row[0])
        .filter((d): d is number => d !== null && !isNaN(d));
    const startDepth = depths.length > 0 ? Math.max(...depths) : well.td;
    const stopDepth = depths.length > 0 ? Math.min(...depths) : 0;

    // Update well info with computed values
    const updatedWell: LASWellInfo = {
        ...well,
        td: startDepth,
    };

    const parts: string[] = [
        `~VERSION INFORMATION\n VERS.                           2.0 :   CWLS LOG ASCII STANDARD - VERSION 2.0\n WRAP.                           NO  :   ONE LINE PER DEPTH STEP\n`,
        buildWellSection(updatedWell),
        buildCurveSection(curves),
        buildParameterSection(parameters),
        buildOtherSection(other),
        buildASCIISection(data),
    ];

    return parts.join('\n');
}

// ─── LAS 3.0 Export ─────────────────────────────────────────

/**
 * Generates a complete LAS 3.0 file as a string.
 * LAS 3.0 uses XML-style sections and supports enhanced metadata.
 */
export function generateLAS30(lasData: LASData): string {
    const { well, curves, parameters, other, data } = lasData;

    const parts: string[] = [
        `~VERSION INFORMATION\n VERS.                           3.0 :   CWLS LOG ASCII STANDARD - VERSION 3.0\n WRAP.                           NO  :   ONE LINE PER DEPTH STEP\n`,
        `~WELL\n# Well identification section\n`,
        `  MNEM.UNIT              VALUE                       DESCRIPTION\n  ---- -----              -----                       -----------\n`,
        `  WELL                   ${well.wellName}            WELL NAME\n`,
        `  FLD                    ${well.field}             FIELD\n`,
        `  LOC                    ${well.location}           LOCATION\n`,
        `  COMP                   ${well.company}            COMPANY\n`,
        `  SRVC                   ${well.serviceCompany}     SERVICE COMPANY\n`,
        `  DATE                   ${well.date}               DATE\n`,
        `  NULL                   ${NULL_VALUE}              NULL VALUE\n`,
    ];

    if (well.kbElevation) {
        parts.push(`  EKB     .FT             ${well.kbElevation}     KB ELEVATION\n`);
    }
    if (well.td) {
        parts.push(`  TD      .FT             ${well.td}              TOTAL DEPTH\n`);
    }
    if (well.coordinates) {
        parts.push(`  COORD                   ${well.coordinates}       COORDINATES\n`);
    }

    parts.push(`\n~CURVE\n# Curve definitions\n`);
    parts.push(`  MNEM.UNIT              DESCRIPTION\n  ---- -----              -----------\n`);

    for (const curve of curves) {
        parts.push(`  ${curve.mnemonic.padEnd(8, ' ')}${curve.unit.padEnd(6, ' ')} ${curve.description}\n`);
    }

    parts.push(`\n~PARAMETER\n# Calculation parameters\n`);
    parts.push(`  MNEM.UNIT              VALUE                       DESCRIPTION\n  ---- -----              -----                       -----------\n`);

    for (const [key, param] of Object.entries(parameters)) {
        const value = typeof param.value === 'number' ? param.value.toString() : param.value;
        parts.push(`  ${key.padEnd(8, ' ')}        ${value.padEnd(28, ' ')} ${param.description}\n`);
    }

    parts.push(`\n~OTHER\n${other}\n`);
    parts.push(`\n~ASCII\n`);

    // Data section
    for (const row of data) {
        const formattedRow = row
            .map((val) => padRight(formatLASValue(val), COLUMN_WIDTH))
            .join(' ');
        parts.push(formattedRow.trimEnd() + '\n');
    }

    return parts.join('');
}

// ─── Download Helpers ────────────────────────────────────────

/**
 * Triggers a download of the LAS file content as a .las file.
 */
export function downloadLASFile(
    lasData: LASData,
    filename?: string,
    version: '2.0' | '3.0' = '2.0'
): void {
    const content = version === '2.0' ? generateLAS20(lasData) : generateLAS30(lasData);
    const name = filename || `${lasData.well.wellName}_PetroStream_Results.las`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Returns LAS content as a Blob for server upload.
 */
export function lasToBlob(lasData: LASData, version: '2.0' | '3.0' = '2.0'): Blob {
    const content = version === '2.0' ? generateLAS20(lasData) : generateLAS30(lasData);
    return new Blob([content], { type: 'text/plain;charset=utf-8' });
}

/**
 * Converts computed petrophysics results into LAS format.
 * This is the main entry point for the petrophysics module.
 */
export interface PetrophysicsExportData {
    wellInfo: LASWellInfo;
    depths: number[];
    gr?: number[];
    rt?: number[];
    rhob?: number[];
    nphi?: number[];
    dt?: number[];
    vsh?: number[];
    phie?: number[];
    sw?: number[];
    perm?: number[];
    pay?: number[];
    hpt?: number[];
    parameters: LASParameters;
}

export function petrophysicsToLAS(data: PetrophysicsExportData, version: '2.0' | '3.0' = '2.0'): string {
    const curves: LASCurveDefinition[] = [];

    // Always include DEPT first
    const isFeet = true; // Default to feet
    curves.push({
        mnemonic: 'DEPT',
        unit: isFeet ? 'FT' : 'M',
        description: 'DEPTH',
    });

    // Add curves in standard petrophysics order
    const curveMap: [string, string, string, number[] | undefined][] = [
        ['GR', 'GAPI', 'GAMMA RAY', data.gr],
        ['RT', 'OHMM', 'DEEP RESISTIVITY', data.rt],
        ['RHOB', 'G/CC', 'BULK DENSITY', data.rhob],
        ['NPHI', 'V/V', 'NEUTRON POROSITY', data.nphi],
        ['DT', 'US/FT', 'SONIC TRANSIT TIME', data.dt],
        ['VSH', 'V/V', 'SHALE VOLUME', data.vsh],
        ['PHIE', 'V/V', 'EFFECTIVE POROSITY', data.phie],
        ['SW', 'V/V', 'WATER SATURATION', data.sw],
        ['PERM', 'MD', 'PERMEABILITY', data.perm],
        ['PAY', '', 'NET PAY FLAG', data.pay],
        ['HPT', 'FT', 'HYDROCARBON PORE THICKNESS', data.hpt],
    ];

    for (const [mnemonic, unit, description, arr] of curveMap) {
        if (arr && arr.length === data.depths.length) {
            curves.push({ mnemonic, unit, description });
        }
    }

    // Build data matrix
    const rows: (number | null)[][] = [];
    for (let i = 0; i < data.depths.length; i++) {
        const row: (number | null)[] = [data.depths[i]];
        for (let j = 1; j < curves.length; j++) {
            const arr = curveMap[j - 1][3];
            row.push(arr ? arr[i] : null);
        }
        rows.push(row);
    }

    const lasData: LASData = {
        well: data.wellInfo,
        curves,
        parameters: data.parameters,
        other: `Generated by PetroStream Simulation Platform | Petrophysics Export | ${new Date().toISOString()}`,
        data: rows,
        version,
    };

    return version === '2.0' ? generateLAS20(lasData) : generateLAS30(lasData);
}