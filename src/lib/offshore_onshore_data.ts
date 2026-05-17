export const WELL_DESIGN_COMPARISON = [
  {
    category: "Conductor / Structural",
    onshore: "Typically driven (not drilled/cemented). Depth 100-500 ft.",
    offshore: "Jetted or drilled/cemented. 36\" structural casing in deepwater."
  },
  {
    category: "Surface Casing",
    onshore: "500-2,000 ft. Protects aquifers. Simpler BOP stack.",
    offshore: "Riser required for all strings below mudline. Subsea BOP stack."
  },
  {
    category: "Wellhead & BOP",
    onshore: "Surface wellhead / Christmas tree. Cameron/Hydril 5-15k psi.",
    offshore: "Subsea wellhead. 18-3/4\" subsea BOP (10-20k psi). ROV backup."
  },
  {
    category: "Drilling Method",
    onshore: "Air/Underbalanced possible. Standard hydrostatic control.",
    offshore: "Dual gradient drilling in deepwater. Riser margin critical."
  }
];

export const RIG_CLASSIFICATIONS = {
  onshore: [
    { type: "Small Workover", power: "150-300 HP", capacity: "Shallow (<5k ft)", dayRate: "$15k - 25k" },
    { type: "Medium Depth", power: "500-1000 HP", capacity: "5,000 - 12,000 ft", dayRate: "$25k - 45k" },
    { type: "Deep / Ultra-Deep", power: "1500-3000 HP", capacity: "15,000 - 25,000+ ft", dayRate: "$50k - 80k" }
  ],
  offshore: [
    { type: "Jackup", depth: "Up to 400 ft", mobility: "Towed/Self-Propelled", dayRate: "$80k - 200k" },
    { type: "Semi-Submersible", depth: "200 - 10,000 ft", mobility: "Moored / DP", dayRate: "$150k - 500k" },
    { type: "Drillship", depth: "3,000 - 12,000 ft", mobility: "Always DP / Mobile", dayRate: "$200k - 600k" },
    { type: "Platform Rig", depth: "Fixed Depth", mobility: "Permanent Install", dayRate: "Varies" }
  ]
};

export const FACILITIES_DIFFERENCES = [
  {
    component: "Wellhead / Tree",
    onshore: "Located on surface. Manual/Hydraulic valves.",
    offshore: "Subsea Tree (TechnipFMC, OneSubsea). Acoustic/Umbilical control."
  },
  {
    component: "Flowline / Gathering",
    onshore: "2-4\" diameter pipelines. 2-10 mile typical range.",
    offshore: "6-12\" insulated/heated lines. Up to 30km subsea tiebacks."
  },
  {
    component: "Processing",
    onshore: "Central processing facility (CPF) / Tank batteries.",
    offshore: "Topsides on Fixed Platform or FPSO (Floating Storage)."
  },
  {
    component: "Export",
    onshore: "Gas plant / Pipeline connection / Oil trucked or piped.",
    offshore: "Shuttle tankers (Offloading) / Export pipeline to shore."
  }
];

export const WELL_COST_REFERENCES = [
  { type: "Onshore Vertical (Conv.)", cost: "$1M - 5M", driver: "Depth / Location" },
  { type: "Onshore Horizontal (Unconv.)", cost: "$5M - 12M", driver: "Lateral Length / Frac Intensity" },
  { type: "Offshore Jackup (Shallow)", cost: "$15M - 40M", driver: "Rig Market / Water Depth" },
  { type: "Offshore Deepwater (Semi/DS)", cost: "$80M - 200M", driver: "Logistics / Spread Rate" },
  { type: "Ultra-Deep Subsea Completion", cost: "$150M - 400M", driver: "Subsea Hardware / Complexity" }
];
