/**
 * Change #8: LAS File Importer
 * Parses LAS (Log ASCII Standard) files to populate the petrophysics / appraisal
 * stage with real well log data. Handles both LAS 2.0 and 3.0 formats.
 *
 * Features:
 * - Parse ~VERSION, ~WELL, ~CURVE, ~PARAMETER, ~ASCII sections
 * - Auto-detect common curve mnemonics (GR, ILD, RHOB, NPHI, DT, etc.)
 * - Handle wrapped lines, missing values, variable whitespace
 * - Handle different mnemonic naming conventions
 * - Return structured data ready for the petrophysics engine
 */

// ─── Types ───────────────────────────────────────────────────

export interface LASWellHeader {
    wellName: string;
    field: string;
    location: string;
    company: string;
    serviceCompany: string;
    date: string;
    kbElevation?: number;
    td?: number;
    startDepth?: number;
    stopDepth?: number;
    step?: number;
    nullValue?: number;
    uwi?: string;
    coordinates?: string;
}

export interface LASCurveInfo {
    mnemonic: string;
    unit: string;
    description: string;
}

export interface LASParameter {
    mnemonic: string;
    value: string;
    description: string;
}

export interface ParsedLAS {
    version: string;
    wrap: boolean;
    well: LASWellHeader;
    curves: LASCurveInfo[];
    parameters: LASParameter[];
    other: string;
    /** Data matrix: rows of values matching curve order */
    data: number[][];
    /** Index of each curve mnemonic in the data columns */
    curveIndex: Map<string, number>;
}

// ─── Mnemonic Recognition Map ───────────────────────────────

const MNEMONIC_MAP: Record<string, string> = {
    // Gamma Ray
    'GR': 'GR', 'GAM': 'GR', 'GAMMA': 'GR', 'GRCAL': 'GR', 'SGR': 'GR', 'CGR': 'GR',
    'ECGR': 'GR', 'HCGR': 'GR', 'GR_R3': 'GR',

    // Deep Resistivity
    'ILD': 'RT', 'RLLD': 'RT', 'RLA5': 'RT', 'RT': 'RT', 'RDEEP': 'RT', 'RT_HRLT': 'RT',
    'RLLS': 'RT', 'ILM': 'RT', 'IDPH': 'RT', 'AF90': 'RT', 'RLA1': 'RT', 'RLA5P': 'RT',
    'M2R9': 'RT', 'AHT90': 'RT',

    // Shallow/Medium Resistivity
    'ILS': 'RS', 'SFLU': 'RS', 'RS': 'RS', 'RMED': 'RS', 'IMPH': 'RS', 'AF60': 'RS',
    'RLA2': 'RS', 'M2R6': 'RS', 'AHT60': 'RS',

    // Micro Resistivity
    'MSFL': 'RXO', 'RXO': 'RXO', 'MLL': 'RXO',

    // Bulk Density
    'RHOB': 'RHOB', 'DEN': 'RHOB', 'DENSITY': 'RHOB', 'RHOZ': 'RHOB', 'ROBB': 'RHOB',
    'ZDEN': 'RHOB', 'RHO8': 'RHOB', 'RHGE': 'RHOB',

    // Neutron Porosity
    'NPHI': 'NPHI', 'NEU': 'NPHI', 'NEUTRON': 'NPHI', 'NPOR': 'NPHI', 'TNPH': 'NPHI',
    'NPSS': 'NPHI', 'NPRL': 'NPHI', 'APLC': 'NPHI',

    // Sonic
    'DT': 'DT', 'AC': 'DT', 'DTCO': 'DT', 'DTC': 'DT', 'DT24': 'DT', 'DTL': 'DT',
    'SONIC': 'DT', 'DTR': 'DT', 'DTSH': 'DT',

    // Shear Sonic
    'DTS': 'DTS', 'DTSM': 'DTS', 'DTSS': 'DTS',

    // Photoelectric Factor
    'PEF': 'PEF', 'PE': 'PEF', 'PEFZ': 'PEF',

    // Caliper
    'CAL': 'CAL', 'CALI': 'CAL', 'CALIPER': 'CAL', 'HCAL': 'CAL', 'C1': 'CAL', 'C2': 'CAL',

    // Spontaneous Potential
    'SP': 'SP', 'SPR': 'SP',

    // Computed curves (may be present in processed LAS)
    'VSH': 'VSH', 'VSHALE': 'VSH', 'VCL': 'VSH', 'VSH_GR': 'VSH',
    'PHIE': 'PHIE', 'PHIT': 'PHIT', 'DPHI': 'PHIT',
    'SW': 'SW', 'SWE': 'SW', 'SWT': 'SW',
    'PERM': 'PERM', 'K': 'PERM', 'KLOGH': 'PERM', 'KINT': 'PERM',
    'PAY': 'PAY', 'NETPAY': 'PAY', 'PAYFLAG': 'PAY',
};

/**
 * Map a raw LAS mnemonic to a standardized PetroStream curve key.
 */
export function normalizeMnemonic(raw: string): string {
    const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    return MNEMONIC_MAP[cleaned] || cleaned;
}

// ─── LAS Parser ─────────────────────────────────────────────

/**
 * Parse a LAS file from its raw text content.
 * Handles LAS 2.0 and 3.0 formats, wrapped lines, and common formatting issues.
 */
export function parseLASFile(fileContent: string): ParsedLAS {
    // Normalize line endings
    const text = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split into logical lines, handling wrapped lines (lines starting with whitespace)
    const rawLines = text.split('\n');
    const lines: string[] = [];
    let currentLine = '';

    for (const raw of rawLines) {
        const trimmed = raw.trim();
        if (trimmed === '') {
            if (currentLine) lines.push(currentLine);
            currentLine = '';
            continue;
        }
        // If line starts with whitespace (indented), it's a continuation
        if (raw.length > 0 && raw[0] === ' ' && currentLine) {
            currentLine += ' ' + trimmed;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = trimmed;
        }
    }
    if (currentLine) lines.push(currentLine);

    // Parse sections
    const result: ParsedLAS = {
        version: '2.0',
        wrap: false,
        well: {
            wellName: '',
            field: '',
            location: '',
            company: '',
            serviceCompany: '',
            date: '',
        },
        curves: [],
        parameters: [],
        other: '',
        data: [],
        curveIndex: new Map(),
    };

    let section: 'VERSION' | 'WELL' | 'CURVE' | 'PARAMETER' | 'OTHER' | 'ASCII' | null = null;
    let dataStarted = false;
    const dataLines: string[] = [];

    for (const line of lines) {
        const upperLine = line.toUpperCase().trim();

        // Detect section headers
        if (upperLine.startsWith('~V') || upperLine.startsWith('~VERSION')) {
            section = 'VERSION';
            continue;
        }
        if (upperLine.startsWith('~W') || upperLine.startsWith('~WELL')) {
            section = 'WELL';
            continue;
        }
        if (upperLine.startsWith('~C') || upperLine.startsWith('~CURVE')) {
            section = 'CURVE';
            continue;
        }
        if (upperLine.startsWith('~P') || upperLine.startsWith('~PARAMETER') || upperLine.startsWith('~PARAM')) {
            section = 'PARAMETER';
            continue;
        }
        if (upperLine.startsWith('~O') || upperLine.startsWith('~OTHER')) {
            section = 'OTHER';
            continue;
        }
        if (upperLine.startsWith('~A') || upperLine.startsWith('~ASCII')) {
            section = 'ASCII';
            dataStarted = true;
            continue;
        }

        // Skip non-section lines before any section is found
        if (!section) continue;

        // Skip comment lines and empty header lines
        if (line.startsWith('#') && section !== 'ASCII') continue;
        if (line.trim() === '') continue;

        // Process line based on current section
        switch (section) {
            case 'VERSION':
                parseVersionLine(line, result);
                break;
            case 'WELL':
                parseWellLine(line, result.well);
                break;
            case 'CURVE':
                parseCurveLine(line, result.curves);
                break;
            case 'PARAMETER':
                parseParameterLine(line, result.parameters);
                break;
            case 'OTHER':
                result.other += (result.other ? ' ' : '') + line;
                break;
            case 'ASCII':
                if (dataStarted) {
                    dataLines.push(line);
                }
                break;
        }
    }

    // Parse data section
    result.data = parseDataLines(dataLines, result.curves.length, result.well.nullValue || -999.25);

    // Build curve index
    result.curves.forEach((curve, i) => {
        result.curveIndex.set(curve.mnemonic, i);
        result.curveIndex.set(normalizeMnemonic(curve.mnemonic), i);
    });

    return result;
}

// ─── Section Parsers ────────────────────────────────────────

function parseVersionLine(line: string, result: ParsedLAS): void {
    const upper = line.toUpperCase();
    if (upper.includes('VERS')) {
        const match = line.match(/(\d+\.\d+)/);
        if (match) result.version = match[1];
    }
    if (upper.includes('WRAP')) {
        result.wrap = upper.includes('YES');
    }
}

function parseWellLine(line: string, well: LASWellHeader): void {
    // LAS well format: MNEM.UNIT    VALUE    : DESCRIPTION
    const mnemonicMatch = line.match(/^\s*(\w+)\s*\.?\s*(\w*)\s+(.+?)\s*:/);
    if (!mnemonicMatch) return;

    const [, mnemonic, _unit, rawValue] = mnemonicMatch;
    const value = rawValue.trim();
    const upperMnem = mnemonic.toUpperCase();

    switch (upperMnem) {
        case 'STRT':
            well.startDepth = parseFloat(value);
            break;
        case 'STOP':
            well.stopDepth = parseFloat(value);
            break;
        case 'STEP':
            well.step = parseFloat(value);
            break;
        case 'NULL':
            well.nullValue = parseFloat(value);
            break;
        case 'COMP':
            well.company = value;
            break;
        case 'WELL':
            well.wellName = value;
            break;
        case 'FLD':
            well.field = value;
            break;
        case 'LOC':
            well.location = value;
            break;
        case 'SRVC':
            well.serviceCompany = value;
            break;
        case 'DATE':
            well.date = value;
            break;
        case 'UWI':
            well.uwi = value;
            break;
        case 'EKB':
        case 'KB':
            well.kbElevation = parseFloat(value);
            break;
        case 'TD':
            well.td = parseFloat(value);
            break;
        case 'COORD':
            well.coordinates = value;
            break;
    }
}

function parseCurveLine(line: string, curves: LASCurveInfo[]): void {
    // Skip placeholder lines like "MNEM.UNIT  DESCRIPTION"
    if (line.trim().startsWith('----')) return;

    const match = line.match(/^\s*(\w+)\s*\.?\s*(\S*)\s+(.+?)(?:\s*:\s*.*)?$/);
    if (!match) {
        // Try simpler format (some LAS files have different formatting)
        const simpleMatch = line.match(/^\s*(\w+)\s*\.?\s*(\S*)\s+(.+)/);
        if (simpleMatch) {
            curves.push({
                mnemonic: simpleMatch[1].trim(),
                unit: simpleMatch[2].trim(),
                description: simpleMatch[3].trim().replace(/:$/, ''),
            });
        }
        return;
    }

    curves.push({
        mnemonic: match[1].trim(),
        unit: match[2].trim(),
        description: match[3].trim().replace(/:$/, ''),
    });
}

function parseParameterLine(line: string, parameters: LASParameter[]): void {
    if (line.trim().startsWith('----')) return;

    const match = line.match(/^\s*(\w+)\s*\.?\s*(\S*)\s+(.+?)(?:\s*:\s*(.*))?$/);
    if (!match) return;

    parameters.push({
        mnemonic: match[1].trim(),
        value: match[3].trim(),
        description: (match[4] || '').trim(),
    });
}

// ─── Data Parser ─────────────────────────────────────────────

function parseDataLines(
    lines: string[],
    numCurves: number,
    nullValue: number
): number[][] {
    const data: number[][] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('~')) continue;

        // Split by whitespace
        const tokens = trimmed.split(/\s+/);
        const row: number[] = [];

        for (let i = 0; i < numCurves && i < tokens.length; i++) {
            const val = parseFloat(tokens[i]);
            // Treat the LAS null value as NaN
            if (!isNaN(val) && val !== nullValue) {
                row.push(val);
            } else {
                row.push(NaN);
            }
        }

        // Pad with NaN if fewer tokens than curves
        while (row.length < numCurves) {
            row.push(NaN);
        }

        if (row.length > 0 && row.some((v) => !isNaN(v))) {
            data.push(row);
        }
    }

    return data;
}

// ─── High-Level Import Helpers ──────────────────────────────

export interface ImportedCurveData {
    depths: number[];
    gr: number[];
    rt: number[];
    rs: number[];
    rxo: number[];
    rhob: number[];
    nphi: number[];
    dt: number[];
    dts: number[];
    pef: number[];
    cal: number[];
    sp: number[];
    vsh: number[];
    phie: number[];
    phit: number[];
    sw: number[];
    perm: number[];
    pay: number[];
}

/**
 * Extract recognized well log curves from a parsed LAS file.
 * Maps LAS mnemonics to standard PetroStream curve arrays.
 */
export function extractCurves(parsed: ParsedLAS): ImportedCurveData {
    const numRows = parsed.data.length;
    const emptyArr = () => new Array<number>(numRows).fill(NaN);

    const result: ImportedCurveData = {
        depths: emptyArr(),
        gr: emptyArr(),
        rt: emptyArr(),
        rs: emptyArr(),
        rxo: emptyArr(),
        rhob: emptyArr(),
        nphi: emptyArr(),
        dt: emptyArr(),
        dts: emptyArr(),
        pef: emptyArr(),
        cal: emptyArr(),
        sp: emptyArr(),
        vsh: emptyArr(),
        phie: emptyArr(),
        phit: emptyArr(),
        sw: emptyArr(),
        perm: emptyArr(),
        pay: emptyArr(),
    };

    // Find depth column (usually first column, mnemonic DEPT or DEPTH)
    let depthIdx = -1;
    for (let i = 0; i < parsed.curves.length; i++) {
        const mnem = parsed.curves[i].mnemonic.toUpperCase();
        if (mnem === 'DEPT' || mnem === 'DEPTH' || mnem === 'MD') {
            depthIdx = i;
            break;
        }
    }

    // Map each curve to the appropriate output array
    const targetMap: [string, keyof ImportedCurveData][] = [
        ['GR', 'gr'],
        ['RT', 'rt'],
        ['RS', 'rs'],
        ['RXO', 'rxo'],
        ['RHOB', 'rhob'],
        ['NPHI', 'nphi'],
        ['DT', 'dt'],
        ['DTS', 'dts'],
        ['PEF', 'pef'],
        ['CAL', 'cal'],
        ['SP', 'sp'],
        ['VSH', 'vsh'],
        ['PHIE', 'phie'],
        ['PHIT', 'phit'],
        ['SW', 'sw'],
        ['PERM', 'perm'],
        ['PAY', 'pay'],
    ];

    for (const [stdKey, target] of targetMap) {
        for (let i = 0; i < parsed.curves.length; i++) {
            const normalized = normalizeMnemonic(parsed.curves[i].mnemonic);
            if (normalized === stdKey) {
                const arr = result[target] as number[];
                for (let r = 0; r < parsed.data.length; r++) {
                    arr[r] = parsed.data[r][i] ?? NaN;
                }
                break;
            }
        }
    }

    // Extract depths
    if (depthIdx >= 0) {
        for (let r = 0; r < parsed.data.length; r++) {
            result.depths[r] = parsed.data[r][depthIdx] ?? NaN;
        }
    } else {
        // Fallback: use first column as depth
        for (let r = 0; r < parsed.data.length; r++) {
            result.depths[r] = parsed.data[r][0] ?? NaN;
        }
    }

    return result;
}

/**
 * Create a summary of the LAS file contents for UI display.
 */
export interface LASSummary {
    wellName: string;
    field: string;
    date: string;
    totalCurves: number;
    recognizedCurves: string[];
    unrecognizedCurves: string[];
    dataPoints: number;
    depthRange: { min: number; max: number };
    parameters: LASParameter[];
}

export function summarizeLAS(parsed: ParsedLAS): LASSummary {
    const recognized: string[] = [];
    const unrecognized: string[] = [];

    for (const curve of parsed.curves) {
        const normalized = normalizeMnemonic(curve.mnemonic);
        if (normalized !== curve.mnemonic.toUpperCase() && normalized !== curve.mnemonic) {
            recognized.push(`${curve.mnemonic} → ${normalized}`);
        } else if (MNEMONIC_MAP[curve.mnemonic.toUpperCase().replace(/[^A-Z0-9]/g, '')]) {
            recognized.push(curve.mnemonic);
        } else {
            unrecognized.push(curve.mnemonic);
        }
    }

    const validDepths = parsed.data
        .map((row) => row[0])
        .filter((d) => !isNaN(d));

    return {
        wellName: parsed.well.wellName || 'Unknown',
        field: parsed.well.field || 'Unknown',
        date: parsed.well.date || 'Unknown',
        totalCurves: parsed.curves.length,
        recognizedCurves: recognized,
        unrecognizedCurves: unrecognized,
        dataPoints: parsed.data.length,
        depthRange: {
            min: validDepths.length > 0 ? Math.min(...validDepths) : 0,
            max: validDepths.length > 0 ? Math.max(...validDepths) : 0,
        },
        parameters: parsed.parameters,
    };
}

/**
 * Convenience: read a File object and return parsed LAS data.
 */
export async function importLASFile(file: File): Promise<ParsedLAS> {
    const text = await file.text();
    return parseLASFile(text);
}