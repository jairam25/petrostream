/**
 * Fix 11 — Unit System Toggle
 * Global unit system supporting Field (US), Metric (international), and Custom modes.
 * All inputs, outputs, labels, and axis scales convert through this module.
 */

// ───── Unit categories ─────
export type UnitCategory =
    | 'depth'
    | 'pressure'
    | 'volumetricRate'
    | 'temperature'
    | 'permeability'
    | 'area'
    | 'volume'
    | 'viscosity'
    | 'density'
    | 'length'
    | 'stress'
    | 'mass'
    | 'speed';

export type UnitSystem = 'field' | 'metric';

export interface CustomUnits {
    depth: 'ft' | 'm';
    pressure: 'psi' | 'kPa' | 'bar';
    volumetricRate: 'bbl_d' | 'm3_d' | 'scf_d' | 'm3_d_gas';
    temperature: 'degF' | 'degC';
    permeability: 'md';
    area: 'acres' | 'm2';
    volume: 'bbl' | 'm3';
    viscosity: 'cp';
    density: 'lb_gal' | 'ppg' | 'kg_m3' | 'sg';
    length: 'in' | 'ft' | 'cm' | 'm';
    stress: 'psi' | 'kPa';
    mass: 'lb' | 'kg';
    speed: 'fph' | 'mph';
}

// ───── Unit label maps ─────
const FIELD_LABELS: Record<string, string> = {
    depth_ft: 'ft',
    depth_m: 'm',
    pressure_psi: 'psi',
    pressure_kPa: 'kPa',
    pressure_bar: 'bar',
    rate_bbl: 'bbl/d',
    rate_bopd: 'bopd',
    rate_m3d: 'm³/d',
    rate_scf: 'Mscf/d',
    temp_degF: '°F',
    temp_degC: '°C',
    perm_md: 'mD',
    area_acres: 'acres',
    area_m2: 'm²',
    vol_bbl: 'bbl',
    vol_m3: 'm³',
    visc_cp: 'cP',
    density_ppg: 'ppg',
    density_kgm3: 'kg/m³',
    density_sg: 'SG',
    len_in: 'in',
    len_ft: 'ft',
    len_cm: 'cm',
    len_m: 'm',
    stress_psi: 'psi',
    stress_kPa: 'kPa',
    mass_lb: 'lb',
    mass_kg: 'kg',
    speed_fph: 'ft/hr',
    speed_kmh: 'km/h',
    percent: '%',
    fraction: 'fraction',
    dimensionless: '-',
    api: '°API',
    scf_bbl: 'scf/bbl',
    bbl_bbl: 'bbl/bbl',
    ppm: 'ppm',
    wpct: 'wt%',
    usd: 'USD',
    usd_mm: 'MM USD',
};

// ───── Conversion factors (field → metric) ─────
const CONV: Record<string, number> = {
    'ft_to_m': 0.3048,
    'psi_to_kPa': 6.894757,
    'psi_to_bar': 0.0689476,
    'bbl_to_m3': 0.1589873,
    'bbl_d_to_m3_d': 0.1589873,
    'degF_to_degC_offset': 32,
    'degF_to_degC_factor': 5 / 9,
    'acres_to_m2': 4046.856,  // NOT ha; m²
    'in_to_cm': 2.54,
    'in_to_m': 0.0254,
    'lb_to_kg': 0.453592,
    'ppg_to_kgm3': 119.826,
    'fph_to_mh': 0.3048,
    'gal_to_m3': 0.00378541,
    'gal_to_l': 3.78541,
    'scf_to_m3': 0.0283168,
    'Mscf_d_to_m3_d': 28.3168,
    'lb_gal_to_kg_m3': 119.826,
};

// ───── System type ─────
export interface UnitSettings {
    system: UnitSystem | 'custom';
    custom: CustomUnits;
}

const DEFAULT_CUSTOM: CustomUnits = {
    depth: 'ft',
    pressure: 'psi',
    volumetricRate: 'bbl_d',
    temperature: 'degF',
    permeability: 'md',
    area: 'acres',
    volume: 'bbl',
    viscosity: 'cp',
    density: 'ppg',
    length: 'in',
    stress: 'psi',
    mass: 'lb',
    speed: 'fph',
};

export const DEFAULT_UNIT_SETTINGS: UnitSettings = {
    system: 'field',
    custom: { ...DEFAULT_CUSTOM },
};

// ───── Active unit resolution ─────
export function resolveUnit(settings: UnitSettings, category: UnitCategory): string {
    if (settings.system === 'field') {
        return resolveFieldUnit(category);
    }
    if (settings.system === 'metric') {
        return resolveMetricUnit(category);
    }
    // Custom
    switch (category) {
        case 'depth': return settings.custom.depth;
        case 'pressure': {
            const u = settings.custom.pressure;
            return u === 'bar' ? 'bar' : u;
        }
        case 'volumetricRate': return settings.custom.volumetricRate;
        case 'temperature': return settings.custom.temperature;
        case 'permeability': return 'md'; // same in both
        case 'area': return settings.custom.area;
        case 'volume': return settings.custom.volume;
        case 'viscosity': return 'cp';
        case 'density': return settings.custom.density;
        case 'length': return settings.custom.length;
        case 'stress': return settings.custom.stress;
        case 'mass': return settings.custom.mass;
        case 'speed': return settings.custom.speed;
        default: return '';
    }
}

function resolveFieldUnit(category: UnitCategory): string {
    switch (category) {
        case 'depth': return 'ft';
        case 'pressure': return 'psi';
        case 'volumetricRate': return 'bbl_d';
        case 'temperature': return 'degF';
        case 'permeability': return 'md';
        case 'area': return 'acres';
        case 'volume': return 'bbl';
        case 'viscosity': return 'cp';
        case 'density': return 'ppg';
        case 'length': return 'in';
        case 'stress': return 'psi';
        case 'mass': return 'lb';
        case 'speed': return 'fph';
        default: return '';
    }
}

function resolveMetricUnit(category: UnitCategory): string {
    switch (category) {
        case 'depth': return 'm';
        case 'pressure': return 'kPa';
        case 'volumetricRate': return 'm3_d';
        case 'temperature': return 'degC';
        case 'permeability': return 'md';
        case 'area': return 'm2';
        case 'volume': return 'm3';
        case 'viscosity': return 'cp';
        case 'density': return 'kg_m3';
        case 'length': return 'cm';
        case 'stress': return 'kPa';
        case 'mass': return 'kg';
        case 'speed': return 'kmh';
        default: return '';
    }
}

// ───── Unit labels for display ─────
export function unitLabel(settings: UnitSettings, category: UnitCategory): string {
    const unit = resolveUnit(settings, category);
    const key = `${category}_${unit}`;
    const direct = FIELD_LABELS[key];
    if (direct) return direct;
    // Fallback
    const fallbacks: Record<string, string> = {
        depth_ft: 'ft', depth_m: 'm',
        pressure_psi: 'psi', pressure_kPa: 'kPa', pressure_bar: 'bar',
        volumetricRate_bbl_d: 'bbl/d', volumetricRate_m3_d: 'm³/d', volumetricRate_scf_d: 'Mscf/d',
        temperature_degF: '°F', temperature_degC: '°C',
        area_acres: 'acres', area_m2: 'm²',
        volume_bbl: 'bbl', volume_m3: 'm³',
        density_ppg: 'ppg', density_kg_m3: 'kg/m³', density_sg: 'SG',
        length_in: 'in', length_cm: 'cm',
        stress_psi: 'psi', stress_kPa: 'kPa',
        mass_lb: 'lb', mass_kg: 'kg',
        speed_fph: 'ft/hr', speed_kmh: 'km/h',
    };
    return fallbacks[key] || unit;
}

/** Human-readable label for the given unit: e.g., "ft", "m" */
export function unitSymbol(settings: UnitSettings, category: UnitCategory): string {
    return unitLabel(settings, category);
}

// ───── Conversion: field value → target unit value ─────
export function convertFieldValue(value: number, category: UnitCategory, toUnit: string): number {
    switch (category) {
        case 'depth':
            if (toUnit === 'm') return value * CONV['ft_to_m'];
            return value;
        case 'pressure':
            if (toUnit === 'kPa') return value * CONV['psi_to_kPa'];
            if (toUnit === 'bar') return value * CONV['psi_to_bar'];
            return value;
        case 'temperature':
            if (toUnit === 'degC') return (value - CONV['degF_to_degC_offset']) * CONV['degF_to_degC_factor'];
            return value;
        case 'area':
            if (toUnit === 'm2') return value * CONV['acres_to_m2'];
            return value;
        case 'volume':
            if (toUnit === 'm3') return value * CONV['bbl_to_m3'];
            return value;
        case 'volumetricRate':
            if (toUnit === 'm3_d') return value * CONV['bbl_d_to_m3_d'];
            if (toUnit === 'm3_d_gas') return value * CONV['Mscf_d_to_m3_d'];
            if (toUnit === 'scf_d') return value;
            return value;
        case 'length':
            if (toUnit === 'cm') return value * CONV['in_to_cm'];
            if (toUnit === 'm') return value * CONV['in_to_m'];
            if (toUnit === 'ft') return value / 12;
            return value;
        case 'mass':
            if (toUnit === 'kg') return value * CONV['lb_to_kg'];
            return value;
        case 'density':
            if (toUnit === 'kg_m3') return value * CONV['ppg_to_kgm3'];
            if (toUnit === 'kg/m3') return value * CONV['ppg_to_kgm3'];
            return value;
        case 'stress':
            if (toUnit === 'kPa') return value * CONV['psi_to_kPa'];
            return value;
        case 'speed':
            if (toUnit === 'kmh' || toUnit === 'm_h') return value * CONV['fph_to_mh'];
            return value;
        default:
            return value;
    }
}

// ───── Generic: convert a value in the current unit to display target ─────
export function convertForDisplay(value: number, settings: UnitSettings, category: UnitCategory): number {
    const target = resolveUnit(settings, category);
    // Determine what unit the source value is in (normally field unit)
    // The stored values are always in field units internally
    return convertFieldValue(value, category, target);
}

/**
 * Pretty-print a value with appropriate unit suffix.
 */
export function formatWithUnit(value: number, settings: UnitSettings, category: UnitCategory, decimals: number = 2): string {
    const converted = convertForDisplay(value, settings, category);
    const label = unitLabel(settings, category);
    // Handle special formatting
    if (category === 'temperature') {
        return `${converted.toFixed(decimals)} ${label}`;
    }
    // For large numbers use appropriate scaling
    if (Math.abs(converted) >= 1e6) {
        return `${(converted / 1e6).toFixed(decimals)} MM ${label}`;
    }
    if (Math.abs(converted) >= 1e4 && category === 'volume') {
        return `${(converted / 1e3).toFixed(decimals)} M ${label}`;
    }
    return `${converted.toFixed(decimals)} ${label}`;
}

/**
 * Format a value in the currently active unit system for a category.
 */
export function formatValue(value: number, settings: UnitSettings, category: UnitCategory, decimals: number = 2): string {
    const converted = convertForDisplay(value, settings, category);
    const label = unitLabel(settings, category);
    if (Math.abs(converted) >= 1e6 && category !== 'area') {
        return `${(converted / 1e6).toFixed(decimals)}M ${label}`;
    }
    if (Math.abs(converted) >= 1e3 && (category === 'volume' || category === 'area')) {
        return `${(converted / 1e3).toFixed(decimals)}k ${label}`;
    }
    return `${converted.toFixed(decimals)} ${label}`;
}