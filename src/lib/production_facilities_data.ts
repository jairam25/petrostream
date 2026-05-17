export const SEPARATOR_SPECS = {
  vesselDiameters: ["16\"", "20\"", "24\"", "30\"", "36\"", "42\"", "48\"", "54\"", "60\"", "72\"", "84\"", "96\""],
  vesselLengths: ["5 ft", "7.5 ft", "10 ft", "12.5 ft", "15 ft", "20 ft", "25 ft", "30 ft"],
  workingPressures: ["125 psi", "250 psi", "500 psi", "1000 psi", "1440 psi", "1500 psi"],
  internals: [
    { name: "Inlet Device", types: ["Diverter Plate", "Cyclonic Inlet", "Half-pipe"] },
    { name: "Mist Extractor", types: ["Wire Mesh Demister (4-6\")", "Vane Pack"] },
    { name: "Separation Aids", types: ["Coalescing Plates", "Weir Plate"] }
  ],
  retentionTimes: [
    { phase: "Gas", time: "3 - 5 min" },
    { phase: "Oil", time: "3 - 10 min" },
    { phase: "Water", time: "5 - 15 min" }
  ],
  kFactors: [
    { type: "Vertical Separator", value: "0.1" },
    { type: "Horizontal Separator", value: "0.4 - 0.5" }
  ]
};

export const PIPELINE_API_5L_DATABASE = [
  { grade: "Grade B", yield: "35,000 psi" },
  { grade: "X42", yield: "42,000 psi" },
  { grade: "X52", yield: "52,000 psi" },
  { grade: "X60", yield: "60,000 psi" },
  { grade: "X65", yield: "65,000 psi" },
  { grade: "X70", yield: "70,000 psi" },
  { grade: "X80", yield: "80,000 psi" }
];

export const LINE_PIPE_DIAMETERS = [
  "2-3/8\"", "2-7/8\"", "3-1/2\"", "4\"", "4-1/2\"", "6-5/8\"", "8-5/8\"", 
  "10-3/4\"", "12-3/4\"", "16\"", "20\"", "24\"", "30\"", "36\"", "42\"", "48\""
];

export const PUMP_SPECIFICATIONS = [
  {
    type: "Triplex (3-Cylinder)",
    usage: "Fracturing, high pressure service",
    specs: "5,000 - 15,000 psi discharge, 2,500 HHP standard"
  },
  {
    type: "Quintuplex (5-Cylinder)",
    usage: "Injection, Cementing",
    specs: "Smoother flow profile than Triplex"
  },
  {
    type: "Horizontal Multistage",
    usage: "Pipeline boosting, Water injection",
    specs: "500 - 50,000 bpd, up to 3,000 psi"
  },
  {
    type: "ESP (Electric Submersible)",
    usage: "Artificial Lift",
    specs: "50 - 50,000 bpd, 1,000 - 20,000 ft head"
  },
  {
    type: "PCP (Progressive Cavity)",
    usage: "Heavy oil, Sand-laden fluids",
    specs: "50 - 5,000 bpd"
  }
];

export const COMPRESSOR_SPECIFICATIONS = [
  {
    type: "Reciprocating (Piston)",
    stages: "1-stage (<4:1), 2-stage (4:1-16:1), 3-stage (>16:1)",
    range: "50 - 5,000 HP, Suction 5 - 1,000 psig",
    efficiencyFactor: "Volumetric Eff. (nv) = 1 - C * ((Pd/Ps)^(1/k) - 1)"
  },
  {
    type: "Screw Compressor",
    usage: "Low-pressure gas gathering",
    range: "15 - 200 psig suction, Compact, Oil-flooded"
  },
  {
    type: "Centrifugal Compressor",
    usage: "High-volume applications (>10 MMscfd)",
    range: "Driven by Gas Turbine (4,000 - 40,000 HP)"
  }
];
