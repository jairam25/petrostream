export const ROD_PUMP_UNITS_API = [
  { designation: "C-228D-200-120", geometry: "Conventional", torque: "228,000 in-lb", structure: "D", stroke: "200 in", maxLoad: "12,000 lbs" },
  { designation: "C-57D-76-36", geometry: "Conventional", torque: "57,000 in-lb", structure: "D", stroke: "76 in", maxLoad: "3,600 lbs" },
  { designation: "C-1280D-365-168", geometry: "Conventional", torque: "1,280,000 in-lb", structure: "D", stroke: "365 in", maxLoad: "16,800 lbs" }
];

export const DOWNHOLE_PUMP_SIZES = [
  { type: "Insert Pump", bores: ["1-1/4\"", "1-1/2\"", "1-3/4\"", "2\"", "2-1/4\""] },
  { type: "Tubing Pump", bores: ["2-1/2\"", "3-1/4\""] }
];

export const SUCKER_ROD_GRADES = [
  { grade: "Grade D", tensile: "115,000 psi", usage: "High load, non-corrosive" },
  { grade: "Grade K", tensile: "85,000 psi", usage: "Corrosive environments (CO2)" }
];

export const ROD_DIAMETERS = ["5/8\"", "3/4\"", "7/8\"", "1\"", "1-1/8\""];

export const ESP_HOUSING_SIZES = [
  { size: "3.38\"", casing: "4-1/2\"" },
  { size: "4.00\"", casing: "5-1/2\"" },
  { size: "5.13\"", casing: "7\"" },
  { size: "6.75\"", casing: "9-5/8\"" },
  { size: "8.62\"", casing: "10-3/4\"" }
];

export const ESP_STAGE_TYPES = [
  { type: "Radial Flow", rate: "< 2,000 bpd", head: "High head per stage" },
  { type: "Mixed Flow", rate: "2,000 - 10,000 bpd", head: "Medium head" },
  { type: "Axial Flow", rate: "> 10,000 bpd", head: "Low head per stage" }
];

export const GAS_LIFT_VALVE_SPECS = [
  { type: "IPO (Injection Pressure Operated)", sizes: ["1\" OD", "1-1/2\" OD"], charge: "Up to 3,000 psi", ports: "1/8\" to 1/2\"" },
  { type: "PPO (Production Pressure Operated)", sizes: ["Varies"], charge: "Specialized", ports: "Varies" }
];

export const GAS_LIFT_MANDRELS = [
  { tubing: "2-3/8\"", mandrelOD: "1-1/2\"" },
  { tubing: "1.9\"", mandrelOD: "1\"" }
];
