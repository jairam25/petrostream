export const OILFIELD_UNIT_CONVERSIONS = [
  { category: "Pressure", units: [
    { label: "1 psi", value: "6.894757 kPa" },
    { label: "1 atm", value: "14.696 psi / 101.325 kPa" },
    { label: "1 bar", value: "14.504 psi" },
    { label: "1 kg/cm²", value: "14.223 psi" }
  ]},
  { category: "Volume", units: [
    { label: "1 bbl", value: "42 US Gallons / 5.6146 ft³ / 0.1589 m³" },
    { label: "1 ft³", value: "0.17811 bbl" },
    { label: "1 m³", value: "6.2898 bbl" },
    { label: "1 MCF", value: "1,000 ft³" },
    { label: "1 MMCF", value: "1,000,000 ft³" }
  ]},
  { category: "Flow Rate", units: [
    { label: "1 bbl/day", value: "0.0292 gpm" },
    { label: "1 MMscfd", value: "28,316.85 m³/day" }
  ]},
  { category: "Area & Length", units: [
    { label: "1 ft", value: "0.3048 m" },
    { label: "1 chain", value: "66 ft" },
    { label: "1 acre", value: "43,560 ft² / 4046.86 m²" },
    { label: "1 section", value: "640 acres / 1 sq. mile" }
  ]},
  { category: "Mud & Gradient", units: [
    { label: "1 ppg", value: "0.05195 psi/ft / 0.1198 SG" },
    { label: "0.052", value: "ppg to psi/ft conversion factor" },
    { label: "0.433 psi/ft", value: "Fresh water gradient" },
    { label: "0.465 psi/ft", value: "Average salt water gradient" },
    { label: "7758", value: "acre-ft to barrels factor" }
  ]},
  { category: "Energy & Perm", units: [
    { label: "1 BOE", value: "5.8 MMBTU / 6.12 GJ" },
    { label: "1 MCF Gas", value: "~ 1/6 BOE (approx.)" },
    { label: "1 darcy", value: "9.869233 × 10⁻¹³ m²" },
    { label: "1 mD", value: "0.001 darcy" }
  ]}
];

export const REGULATORY_STANDARDS = [
  { 
    standard: "API RP 10B", 
    title: "Testing Well Cements", 
    revision: "2024",
    scope: "Standardized methods for testing cement slurries and hardened cement under HPHT conditions.",
    module: "Drilling (Cementing)" 
  },
  { 
    standard: "API 5CT", 
    title: "Casing and Tubing", 
    revision: "2023",
    scope: "Technical delivery conditions for steel pipes (casing, tubing and pup joints).",
    module: "Drilling (Casing)" 
  },
  { 
    standard: "API 5L", 
    title: "Line Pipe", 
    revision: "2024",
    scope: "Specifications for pipe for use in pipeline transportation systems.",
    module: "Production (Facilities)" 
  },
  { 
    standard: "API 6A", 
    title: "Wellhead Equipment", 
    revision: "2022",
    scope: "Specs for wellheads and Christmas tree equipment for pressure control.",
    module: "Drilling (Wellhead)" 
  },
  { 
    standard: "API 11E", 
    title: "Pumping Units", 
    revision: "2023",
    scope: "Design and rating of beam pumping units.",
    module: "Production (Lift)" 
  },
  { 
    standard: "API 11AX", 
    title: "Subsurface Pumps", 
    revision: "2024",
    scope: "Subsurface sucker rod pumps and fittings.",
    module: "Production (Lift)" 
  },
  { 
    standard: "API 11B", 
    title: "Sucker Rods", 
    revision: "2023",
    scope: "Sucker rods, pony rods, and coupling specifications.",
    module: "Production (Lift)" 
  },
  { 
    standard: "API 12J", 
    title: "Oil and Gas Separators", 
    revision: "2024",
    scope: "Standard requirements for sizing and design of surface separators.",
    module: "Production (Facilities)" 
  },
  { 
    standard: "API 14B", 
    title: "SSSV", 
    revision: "2022",
    scope: "Design, installation, and operation of subsurface safety valves.",
    module: "Production (Integrity)" 
  },
  { 
    standard: "API 14E", 
    title: "Pipeline Design", 
    revision: "2023",
    scope: "Sizing and installation of piping systems on offshore platforms.",
    module: "Production (Facilities)" 
  },
  { 
    standard: "API 17D", 
    title: "Subsea Wellheads & Trees", 
    revision: "2021",
    scope: "Design and operation of subsea production systems.",
    module: "Drilling (Offshore)" 
  },
  { 
    standard: "API 19G", 
    title: "Gas Lift", 
    revision: "2023",
    scope: "Gas lift valves, mandrels, and related equipment.",
    module: "Production (Lift)" 
  },
  { 
    standard: "API 520 / 521", 
    title: "Relief Valves", 
    revision: "2024",
    scope: "Sizing, selection, and installation of pressure-relieving devices.",
    module: "Production (Facilities)" 
  },
  { 
    standard: "API RP 53", 
    title: "BOP Testing", 
    revision: "2022",
    scope: "Blowout prevention equipment systems for drilling wells.",
    module: "Drilling (Well Control)" 
  },
  { 
    standard: "API RP 2A", 
    title: "Offshore Structures", 
    revision: "2023",
    scope: "Planning, designing, and constructing fixed offshore platforms.",
    module: "Drilling (Offshore)" 
  },
  { 
    standard: "NACE MR0175", 
    title: "Sour Service Materials", 
    revision: "2024",
    scope: "Sulfide Stress Cracking resistance standards for H2S environments (ISO 15156).",
    module: "All Modules" 
  },
  { 
    standard: "ASME B31.4", 
    title: "Liquid Pipelines", 
    revision: "2022",
    scope: "Pipeline transportation systems for liquids and slurries.",
    module: "Production (Facilities)" 
  },
  { 
    standard: "ASME B31.8", 
    title: "Gas Pipelines", 
    revision: "2022",
    scope: "Gas transmission and distribution piping systems.",
    module: "Production (Facilities)" 
  },
  { 
    standard: "ASME Section VIII", 
    title: "Pressure Vessels", 
    revision: "2023",
    scope: "Rules for construction of pressure vessels.",
    module: "Production (Facilities)" 
  },
  { 
    standard: "ISO 10426", 
    title: "Cementing Materials", 
    revision: "2024",
    scope: "Cements and materials for well cementing.",
    module: "Drilling (Cementing)" 
  },
  { 
    standard: "ISO 13628", 
    title: "Subsea Systems", 
    revision: "2022",
    scope: "Design and operation of subsea production systems.",
    module: "Drilling (Offshore)" 
  },
  { 
    standard: "ISO 14224", 
    title: "Equipment Reliability", 
    revision: "2023",
    scope: "Collection and exchange of reliability and maintenance data for equipment.",
    module: "Production (Diagnost.)" 
  }
];
