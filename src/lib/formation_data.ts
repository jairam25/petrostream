export interface FormationProperty {
  formation: string;
  region: string;
  depthRange: string;
  lithology: string;
  porosity: string;
  permeability: string;
  swRange: string;
  pressureGradient: string;
  temperature: string;
  apiGravity: string;
  gor: string;
  driveMechanism: string;
  recoveryFactor: string;
}

export const FORMATION_DATABASE: FormationProperty[] = [
  {
    formation: "Wolfcamp",
    region: "Permian (Delaware/Midland)",
    depthRange: "7,000 - 12,000 ft",
    lithology: "Organic-rich Shale / Siltstone",
    porosity: "6 - 12%",
    permeability: "100 - 1,000 nD",
    swRange: "25 - 45%",
    pressureGradient: "0.55 - 0.75 psi/ft (Overpressured)",
    temperature: "140 - 210 °F",
    apiGravity: "38 - 45 °API",
    gor: "800 - 3,000 scf/bbl",
    driveMechanism: "Solution Gas Drive",
    recoveryFactor: "8 - 15%"
  },
  {
    formation: "Bakken",
    region: "Williston Basin",
    depthRange: "8,000 - 11,000 ft",
    lithology: "Siltstone / Sandstone / Shale",
    porosity: "4 - 10%",
    permeability: "0.01 - 0.1 mD",
    swRange: "30 - 50%",
    pressureGradient: "0.60 - 0.70 psi/ft",
    temperature: "160 - 240 °F",
    apiGravity: "40 - 43 °API",
    gor: "400 - 1,500 scf/bbl",
    driveMechanism: "Solution Gas Drive",
    recoveryFactor: "5 - 12%"
  },
  {
    formation: "Eagle Ford",
    region: "South Texas",
    depthRange: "4,000 - 14,000 ft",
    lithology: "Calcareous Shale (Marl)",
    porosity: "8 - 14%",
    permeability: "200 - 800 nD",
    swRange: "20 - 40%",
    pressureGradient: "0.50 - 0.85 psi/ft",
    temperature: "150 - 320 °F",
    apiGravity: "30 (oil) - 60 (condensate)",
    gor: "500 - 20,000+ scf/bbl",
    driveMechanism: "Solution Gas / Gas Expansion",
    recoveryFactor: "5 - 25%"
  },
  {
    formation: "Marcellus",
    region: "Appalachian Basin",
    depthRange: "4,000 - 8,500 ft",
    lithology: "Black Shale",
    porosity: "6 - 12%",
    permeability: "50 - 500 nD",
    swRange: "15 - 35%",
    pressureGradient: "0.45 - 0.60 psi/ft",
    temperature: "100 - 180 °F",
    apiGravity: "N/A (Dry Gas)",
    gor: "Infinite",
    driveMechanism: "Gas Expansion",
    recoveryFactor: "15 - 40%"
  },
  {
    formation: "Arab D",
    region: "Ghawar (Saudi Arabia)",
    depthRange: "6,000 - 7,000 ft",
    lithology: "Limestone / Dolomite",
    porosity: "15 - 30%",
    permeability: "10 - 1,000+ mD",
    swRange: "5 - 15%",
    pressureGradient: "0.433 - 0.45 psi/ft",
    temperature: "170 - 210 °F",
    apiGravity: "32 - 34 °API",
    gor: "400 - 600 scf/bbl",
    driveMechanism: "Water Drive",
    recoveryFactor: "50 - 60%"
  },
  {
    formation: "Brent Group",
    region: "North Sea (UK/Norway)",
    depthRange: "8,000 - 12,000 ft",
    lithology: "Sandstone",
    porosity: "15 - 25%",
    permeability: "50 - 2,000 mD",
    swRange: "10 - 25%",
    pressureGradient: "0.44 - 0.48 psi/ft",
    temperature: "180 - 250 °F",
    apiGravity: "36 - 40 °API",
    gor: "600 - 1,500 scf/bbl",
    driveMechanism: "Water / Gas Injection",
    recoveryFactor: "40 - 55%"
  },
  {
    formation: "Bone Spring",
    region: "Delaware Basin",
    depthRange: "6,000 - 10,000 ft",
    lithology: "Sandstone / Siltstone / Carbonate",
    porosity: "8 - 15%",
    permeability: "0.001 - 0.1 mD",
    swRange: "20 - 45%",
    pressureGradient: "0.55 - 0.70 psi/ft",
    temperature: "135 - 190 °F",
    apiGravity: "38 - 44 °API",
    gor: "600 - 2,000 scf/bbl",
    driveMechanism: "Solution Gas Drive",
    recoveryFactor: "10 - 18%"
  },
  {
    formation: "Haynesville",
    region: "North Louisiana / East Texas",
    depthRange: "10,500 - 13,500 ft",
    lithology: "Organic-rich Mudstone",
    porosity: "8 - 12%",
    permeability: "50 - 500 nD",
    swRange: "15 - 30%",
    pressureGradient: "0.85 - 0.95 psi/ft (HPHT)",
    temperature: "280 - 350 °F",
    apiGravity: "N/A (Dry Gas)",
    gor: "Infinite",
    driveMechanism: "Gas Expansion",
    recoveryFactor: "15 - 30%"
  },
  {
    formation: "Vaca Muerta",
    region: "Neuquén Basin, Argentina",
    depthRange: "8,000 - 11,000 ft",
    lithology: "Bituminous Shale / Marl",
    porosity: "8 - 14%",
    permeability: "0.0001 - 0.001 mD",
    swRange: "20 - 40%",
    pressureGradient: "0.65 - 0.9 psi/ft",
    temperature: "170 - 230 °F",
    apiGravity: "35 - 45 °API",
    gor: "600 - 2,500 scf/bbl",
    driveMechanism: "Solution Gas",
    recoveryFactor: "10 - 15%"
  },
  {
    formation: "Burgan",
    region: "Greater Burgan, Kuwait",
    depthRange: "3,500 - 5,000 ft",
    lithology: "Unconsolidated Sandstone",
    porosity: "25 - 35%",
    permeability: "500 - 4,000 mD",
    swRange: "10 - 20%",
    pressureGradient: "0.44 psi/ft",
    temperature: "140 - 160 °F",
    apiGravity: "28 - 32 °API",
    gor: "300 - 500 scf/bbl",
    driveMechanism: "Strong Water Drive",
    recoveryFactor: "55 - 70%"
  }
];
