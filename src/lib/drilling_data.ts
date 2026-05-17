export const CASING_API_DATABASE = [
  { size: "30", od: 30.0, weight: 310.7, wall: 1.0, id: 28.0, drift: 27.5, type: "Conductor" },
  { size: "20", od: 20.0, weight: 133.0, wall: 0.635, id: 18.73, drift: 18.542, type: "Surface/Conductor" },
  { size: "20", od: 20.0, weight: 94.0, wall: 0.438, id: 19.124, drift: 18.936, type: "Surface" },
  { size: "13 3/8", od: 13.375, weight: 68.0, wall: 0.48, id: 12.415, drift: 12.259, type: "Surface/Intermediate" },
  { size: "13 3/8", od: 13.375, weight: 48.0, wall: 0.33, id: 12.715, drift: 12.559, type: "Surface" },
  { size: "9 5/8", od: 9.625, weight: 47.0, wall: 0.472, id: 8.681, drift: 8.525, type: "Intermediate" },
  { size: "9 5/8", od: 9.625, weight: 36.0, wall: 0.352, id: 8.921, drift: 8.765, type: "Intermediate" },
  { size: "7", od: 7.0, weight: 32.0, wall: 0.453, id: 6.094, drift: 5.969, type: "Production" },
  { size: "7", od: 7.0, weight: 26.0, wall: 0.362, id: 6.276, drift: 6.151, type: "Production" },
  { size: "5 1/2", od: 5.5, weight: 17.0, wall: 0.304, id: 4.892, drift: 4.767, type: "Production/Liner" },
  { size: "4 1/2", od: 4.5, weight: 11.6, wall: 0.25, id: 4.0, drift: 3.875, type: "Liner/Tubing" }
];

export const TUBING_API_DATABASE = [
  { od: 4.5, weight: 12.6, id: 3.958, drift: 3.833 },
  { od: 3.5, weight: 9.3, id: 2.992, drift: 2.867 },
  { od: 2.875, weight: 6.5, id: 2.441, drift: 2.347 },
  { od: 2.375, weight: 4.7, id: 1.995, drift: 1.901 }
];

export const CASING_GRADES_INFO = [
  { grade: "H-40", yield: 40000, color: "#94a3b8" },
  { grade: "J-55", yield: 55000, color: "#10b981" },
  { grade: "K-55", yield: 55000, color: "#059669" },
  { grade: "L-80", yield: 80000, ssc: true, color: "#f59e0b" },
  { grade: "N-80", yield: 80000, color: "#d97706" },
  { grade: "C-90", yield: 90000, ssc: true, color: "#ef4444" },
  { grade: "T-95", yield: 95000, ssc: true, color: "#dc2626" },
  { grade: "P-110", yield: 110000, color: "#7c3aed" },
  { grade: "Q-125", yield: 125000, color: "#4f46e5" }
];

export const DRILL_PIPE_SPECS = [
  { size: "2 3/8", weight: 6.65, grade: "E-75" },
  { size: "3 1/2", weight: 13.30, grade: "G-105" },
  { size: "5", weight: 19.50, grade: "S-135" }
];

export const DRILL_COLLAR_SPECS = [
  { od: 4.75, id: 2.25, weight: 45 },
  { od: 6.25, id: 2.81, weight: 83 },
  { od: 8.0, id: 2.81, weight: 150 },
  { od: 9.5, id: 3.0, weight: 215 }
];

export const HOLE_CASING_MATCHING = [
  { holeSize: "36\"", casingOD: "30\"", type: "Conductor" },
  { holeSize: "26\"", casingOD: "20\"", type: "Surface" },
  { holeSize: "17-1/2\"", casingOD: "13-3/8\"", type: "Intermediate" },
  { holeSize: "12-1/4\"", casingOD: "9-5/8\"", type: "Int/Prod" },
  { holeSize: "8-1/2\"", casingOD: "7\"", type: "Production" },
  { holeSize: "6-1/8\"", casingOD: "5\" / 4-1/2\"", type: "Liner" }
];

export const IADC_BIT_CLASSIFICATION = {
  firstDigit: "Cutter Type & Formation Hardness (1-3 Milled, 4-6 TCI, 7-8 PDC, 9 Diamond)",
  secondDigit: "Formation Sub-classification (1-4 Softest to Hardest)",
  thirdDigit: "Bearing Type & Gauge Protection"
};

export const MUD_SYSTEM_SELECTION = [
  { 
    name: "WBM: Freshwater Gel", 
    usage: "Surface hole, MW to 10 ppg",
    composition: "Bentonite + Water"
  },
  { 
    name: "WBM: Lignosulfonate", 
    usage: "Conventional, MW 9-18 ppg, stable to 300°F",
    composition: "Bentonite, Barite, Lignosulfonate"
  },
  { 
    name: "OBM: Invert Emulsion", 
    usage: "Reactive shale, salt, HPHT, High-angle",
    composition: "Diesel/Mineral Oil, Water (70/30 - 90/10)"
  }
];

export const MUD_TEST_STANDARDS = [
  { test: "Marsh Funnel", unit: "sec/qt", normal: "35 - 50", water: "26" },
  { test: "Plastic Viscosity (PV)", unit: "cP", formula: "theta600 - theta300" },
  { test: "Yield Point (YP)", unit: "lb/100ft2", formula: "theta300 - PV" },
  { test: "Electrical Stability", unit: "V", good: "> 300", excellent: "> 500" }
];

export const API_CEMENT_CLASSES = [
  { class: "G", density: "15.8 ppg", tt: "90-120 min", yield: "1.15 ft3/sk", water: "44% BWOC" },
  { class: "H", density: "16.4 ppg", tt: "Longer than G", yield: "1.06 ft3/sk", water: "38% BWOC" }
];

export const CEMENT_ADDITIVES = [
  { name: "CaCl2", type: "Accelerator", dosage: "2-4% BWOC" },
  { name: "Lignosulfonate", type: "Retarder", dosage: "0.1-1.0% BWOC" },
  { name: "Bentonite", type: "Extender", dosage: "2-8% BWOC" },
  { name: "Hematite", type: "Weighting", dosage: "Varies" }
];
