export const API_PRESSURE_RATINGS = [
  { rating: "2,000 psi (2K)", applications: "Shallow, low pressure conventional wells" },
  { rating: "3,000 psi (3K)", applications: "Standard conventional oil production" },
  { rating: "5,000 psi (5K)", applications: "Common intermediate pressure wells" },
  { rating: "10,000 psi (10K)", applications: "HPHT wells, deep offshore production" },
  { rating: "15,000 psi (15K)", applications: "Extreme HPHT environments" },
  { rating: "20,000 psi (20K)", applications: "Ultra-HPHT frontier wells" }
];

export const BORE_SIZES_API = [
  { size: "1-13/16\"", usage: "Small diameter completions / instrumentation" },
  { size: "2-1/16\"", usage: "Standard small-bore completions" },
  { size: "2-9/16\"", usage: "Typical conventional oil/gas production" },
  { size: "3-1/16\"", usage: "High flow rate gas wells" },
  { size: "4-1/16\"", usage: "Large bore gas / high volume oil" },
  { size: "7-1/16\"", usage: "BOP bore size / large wellheads" }
];

export const MATERIAL_CLASSES_API = [
  { class: "AA", description: "General Service", materials: "Carbon Steel (Non-sour)" },
  { class: "BB", description: "General Service", materials: "Carbon Steel (Sour - NACE)" },
  { class: "CC", description: "Corrosive Service", materials: "Stainless Steel (Moderate CO2)" },
  { class: "DD", description: "Severe Corrosive", materials: "Duplex Stainless (High CO2/H2S)" },
  { class: "EE", description: "HPHT / Corrosive", materials: "Nickel Alloy (Inconel 625/718)" },
  { class: "FF", description: "Extreme Service", materials: "CRA Overlay / Solid Exotic Alloys" }
];

export const RING_GASKET_SPECS = [
  { type: "R", description: "Oval or Octagonal", pressure: "Up to 5,000 psi", seal: "Interference fit" },
  { type: "RX", description: "Pressure Energized", pressure: "Up to 5,000 psi", seal: "Face-to-face" },
  { type: "BX", description: "Pressure Energized", pressure: "10,000 - 20,000 psi", seal: "High pressure metal-to-metal" }
];

export const VALVE_TRIM_MATERIALS = [
  { material: "316SS", condition: "Standard corrosive service" },
  { material: "Inconel 625/718", condition: "Severe HPHT / Corrosive environments" },
  { material: "Tungsten Carbide", condition: "Erosive service (High Sand/Solids)" }
];

export const ACTUATOR_TYPES = [
  { type: "Manual", control: "Handwheel operated", failsafe: "None" },
  { type: "Hydraulic", control: "Remote control system", failsafe: "Fail-Safe Close (Spring)" },
  { type: "Pneumatic", control: "Air supply system", failsafe: "Usually Fail-Close" }
];
