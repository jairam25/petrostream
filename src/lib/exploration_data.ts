export const GLOBAL_BASIN_DATABASE = [
  {
    name: "Permian Basin",
    country: "USA",
    type: "Intracratonic",
    sourceRock: "Wolfcamp, Woodford",
    trapType: "Structural / Stratigraphic",
    lithology: "Siliciclastics / Carbonates",
    depthRange: "5,000 - 15,000 ft",
    apiRange: "35 - 45°",
    temperature: "120 - 200°F",
    history: "Major discovery in 1920s; shale revolution 2010s."
  },
  {
    name: "Gulf of Mexico",
    country: "USA / Mexico",
    type: "Passive Margin",
    sourceRock: "Oxfordian / Tithonian",
    trapType: "Salt Tectonics / Faulted",
    lithology: "Turbidite Sands / Tertiary",
    depthRange: "10,000 - 30,000 ft",
    apiRange: "25 - 40°",
    temperature: "150 - 300°F",
    history: "First offshore well 1947; sub-salt exploration 1990s."
  },
  {
    name: "North Sea",
    country: "UK / Norway",
    type: "Rift",
    sourceRock: "Kimmeridge Clay",
    trapType: "Structural (Tilted Fault Blocks)",
    lithology: "Jurassic Sands / Chalk",
    depthRange: "8,000 - 15,000 ft",
    apiRange: "30 - 45°",
    temperature: "140 - 250°F",
    history: "Groningen discovery 1959; Ekofisk 1969."
  },
  {
    name: "Ghawar (Arabian Basin)",
    country: "Saudi Arabia",
    type: "Intracratonic",
    sourceRock: "Hanifa / Tuwaiq Mountain",
    trapType: "Anticlinal / Structural",
    lithology: "Arab-D Carbonates",
    depthRange: "6,000 - 10,000 ft",
    apiRange: "32 - 34°",
    temperature: "160 - 200°F",
    history: "Discovered 1948; world's largest oil field."
  },
  {
    name: "Vaca Muerta (Neuquén Basin)",
    country: "Argentina",
    type: "Back-arc",
    sourceRock: "Vaca Muerta (Late Jurassic)",
    trapType: "Unconventional Shale",
    lithology: "Bituminous Shales / Marls",
    depthRange: "8,000 - 12,000 ft",
    apiRange: "30 - 45°",
    temperature: "180 - 240°F",
    history: "First tight oil success 2010; major global shale resource."
  }
];

export const PETROLEUM_SYSTEM_CHECKLIST = {
  source: [
    { criterion: "TOC (Marine Type II)", threshold: "> 2%", description: "Minimum organic content for commercial oil generation." },
    { criterion: "TOC (Lacustrine Type I)", threshold: "> 1%", description: "Minimum for high-yield oil generation." },
    { criterion: "Net Source Thickness", threshold: "> 10m", description: "Minimum volume required for expulsion." },
    { criterion: "Oil Window (Ro)", threshold: "0.6 - 1.3%", description: "Primary maturity range for oil generation." },
    { criterion: "Wet Gas Window (Ro)", threshold: "1.3 - 2.0%", description: "Range for condensate and wet gas." },
    { criterion: "S2 (Rock-Eval)", threshold: "> 5 mg/g", description: "Good potential for hydrocarbon generation." }
  ],
  reservoir: [
    { criterion: "Porosity (Sandstone)", threshold: "> 8%", description: "Conventional economic limit." },
    { criterion: "Porosity (Carbonate)", threshold: "> 5%", description: "Typical limit; secondary porosity often dominates." },
    { criterion: "Permeability (Conv.)", threshold: "> 1 mD", description: "Typical commercial flow limit." },
    { criterion: "Permeability (Tight Oil)", threshold: "0.001 - 0.1 mD", description: "Requires hydraulic fracturing." },
    { criterion: "Net Pay Thickness", threshold: "> 3m", description: "Minimum vertical extent for completion." }
  ],
  seal: [
    { criterion: "Capillary Entry Pressure", threshold: "High", description: "Must exceed buoyancy pressure of HC column." },
    { criterion: "Seal Integrity", threshold: "Ductile", description: "Salt/Anhydrite preferred over brittle shale." }
  ],
  trap: [
    { criterion: "Structural Closure", threshold: "Mapped", description: "Confirmed by seismic imaging." },
    { criterion: "Fault Seal (SGR)", threshold: "> 20%", description: "Shale Gouge Ratio for sealing potential." }
  ]
};

export const FLUID_CLASSIFICATION = [
  {
    type: "Black Oil",
    gor: "< 2,000 scf/stb",
    api: "15 - 45°",
    fvf: "< 2.0 rb/stb",
    characteristics: "Low gas content, persistent liquid phase in reservoir."
  },
  {
    type: "Volatile Oil",
    gor: "2,000 - 3,300 scf/stb",
    api: "40 - 50°",
    fvf: "> 2.0 rb/stb",
    characteristics: "High shrinkage, critical point close to reservoir T."
  },
  {
    type: "Retrograde Condensate",
    gor: "3,300 - 50,000 scf/stb",
    api: "> 45°",
    cgr: "50 - 300 stb/MMscf",
    characteristics: "Isothermal pressure drop causes liquid dropout."
  },
  {
    type: "Wet Gas",
    gor: "> 50,000 scf/stb",
    cgr: "< 50 stb/MMscf",
    characteristics: "No liquid dropout in reservoir; surface liquids only."
  },
  {
    type: "Dry Gas",
    gor: "N/A",
    composition: "> 95% Methane",
    characteristics: "Negligible liquid content."
  }
];

export const SEISMIC_ACQUISITION_DESIGN = [
  {
    method: "Land 2D",
    source: "Vibroseis (8-80Hz) or Dynamite (1-5kg)",
    params: {
      receiverSpacing: "25 - 50m",
      sourceSpacing: "50 - 100m",
      fold: "30 - 60",
      recordLength: "5 - 8s"
    },
    cost: "$5,000 - 15,000 per km"
  },
  {
    method: "Land 3D",
    source: "Vibroseis Array / Dynamite",
    params: {
      binSize: "12.5 - 25m",
      aspectRatio: "0.5 - 1.0",
      fold: "40 - 80",
      sampleRate: "2ms"
    },
    cost: "$30,000 - 100,000 per km²"
  },
  {
    method: "Marine 3D",
    source: "Air Gun Array (3k-5k cu in)",
    params: {
      streamerLength: "3,000 - 8,000m",
      streamerSpacing: "50 - 100m",
      shotInterval: "25m (Flip-Flop)",
      fold: "60 - 100"
    },
    cost: "$50,000 - 150,000 per km²"
  }
];

export const VELOCITY_MODEL_REFERENCE = [
  { lithology: "Water (Saline)", velocity: "1,480 - 1,530 m/s" },
  { lithology: "Unconsolidated Sediment", velocity: "1,600 - 2,000 m/s" },
  { lithology: "Sandstone", velocity: "2,000 - 4,500 m/s" },
  { lithology: "Limestone", velocity: "3,000 - 6,500 m/s" },
  { lithology: "Dolomite", velocity: "3,500 - 6,900 m/s" },
  { lithology: "Anhydrite", velocity: "6,000 m/s" },
  { lithology: "Salt", velocity: "4,500 m/s (Constant)" },
  { lithology: "Shale", velocity: "1,800 - 5,000 m/s" },
  { lithology: "Granite / Basement", velocity: "5,500 - 6,500 m/s" }
];
