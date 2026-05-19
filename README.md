<div align="center">

# 🛢️ PetroStream Simulation Suite

**A high-fidelity, browser-based petroleum engineering simulation platform covering the full oil & gas lifecycle — from seismic exploration to retail distribution.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-blue?style=for-the-badge&logo=github)](https://jairam25.github.io/petrostream/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green?style=for-the-badge)](https://github.com/jairam25/Petrostream/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-99.9%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/jairam25/Petrostream)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://github.com/jairam25/Petrostream)

**138,000+ lines of code · 30+ simulation modules · 12 interconnected data layers · 100% client-side**

[Live Demo](https://jairam25.github.io/petrostream/) · [Report Bug](https://github.com/jairam25/Petrostream/issues) · [Request Feature](https://github.com/jairam25/Petrostream/issues)

</div>

---

## What is PetroStream?

PetroStream is an industry-aligned engineering simulation platform that runs entirely in the browser. It provides interactive, calculation-driven modules across every phase of the petroleum lifecycle — from subsurface exploration through refining and retail. Every module includes real engineering equations, interactive parameter sweeps, and exportable results (PDF, Excel, LAS).

No backend, no API keys, no installation friction. Clone it and run it.

---

## Lifecycle Modules

### Upstream

| Module | Key Capabilities |
|---|---|
| **Exploration & Geophysics** | Basin analysis, seismic processing (NMO, Dix velocity, Fresnel zone), prospect risking (Monte Carlo), geochemistry, source rock maturation windows |
| **Petrophysics** | Log interpretation (GR, SP, Resistivity, Neutron-Density), Vshale calculations, Archie/Dual-Water saturation, net pay cutoffs, core-log calibration, LAS import/export |
| **Drilling Engineering** | Rig selection, BHA design, bit selection (IADC), directional drilling (min curvature, torque & drag), mud engineering (rheology models), hydraulics optimization, well control (kill sheets), casing design, cementing, completions, stimulation (acid/frac) |
| **Reservoir Engineering** | PVT analysis (Peng-Robinson EOS), rock properties (porosity-perm correlations), well testing (drawdown, buildup, Horner), material balance (Havlena-Odeh), decline curve analysis (Arps), drive mechanisms, Buckley-Leverett displacement, aquifer modeling (Fetkovich, Carter-Tracy) |
| **Reserves & Economics** | Volumetric estimation (OOIP/GIIP), reserve classification (SPE-PRMS), production forecasting, NPV/IRR economic analysis, fiscal regime modeling, risk analysis (tornado/spider), reserves reporting |
| **Field Development Planning** | Development strategy, well spacing optimization, drilling schedules, artificial lift selection, surface facility design, flow assurance (hydrates, wax, scale), injection design |
| **Production Operations** | Nodal analysis (IPR/VLP), artificial lift (ESP, rod pump, gas lift, jet pump), well integrity, well stimulation, flow performance |
| **EOR/IOR** | Screening criteria, waterflooding, chemical EOR (polymer, surfactant, ASP), gas injection (WAG, miscible/immiscible), thermal EOR (SAGD, CSS, steamflood), microbial EOR, nanofluid, low-salinity, hybrid EOR, monitoring & surveillance |

### Midstream & Downstream

| Module | Key Capabilities |
|---|---|
| **Midstream Processing** | Gas processing, NGL fractionation, compression, pipeline hydraulics, dehydration |
| **Distribution & Logistics** | Pipeline network design, storage terminals, transportation scheduling, custody transfer |
| **Refining** | Crude assay characterization, desalting, atmospheric & vacuum distillation, conversion complex (FCC, hydrocracking, coking), naphtha/gasoline processing, middle distillate treating, lube oil & specialty products, hydrogen/sulfur/environmental, gasoline blend optimization |
| **Retail & Marketing** | Station economics, pricing strategy, inventory management, loyalty programs, competitive analysis |

### Cross-Cutting

| Module | Key Capabilities |
|---|---|
| **Production Analytics & Digital** | Data cleaning/QC, statistical analysis, type curves, automated DCA, predictive models, real-time monitoring, reservoir analytics, digital twin concepts |
| **Unconventional Resources** | Shale reservoir characterization, hydraulic fracture design, microseismic interpretation, EUR estimation, pad development |
| **CCUS** | Carbon capture, utilization, and storage simulation |
| **Surveying & Land** | Lease management, land surveying, mineral rights |
| **Corrosion & Materials** | Corrosion mechanisms (pitting, MIC, SCC), CO₂/H₂S modeling, CRA material selection, asset integrity (RBI/FFS) |
| **Offshore Engineering** | Fixed/floating structures, subsea production, arctic operations, safety systems (ESD, fire & gas), decommissioning |
| **HSE & Project Management** | Safety case, SIMOPS, environmental compliance, project scheduling & risk |

---

## Architecture

```
src/
├── App.tsx                  # Main app shell & lifecycle navigation
├── components/
│   ├── drilling/            # 20+ drilling sub-modules
│   ├── exploration/         # Geophysics, geochemistry, survey design
│   ├── reservoir/           # PVT, material balance, EOR, geomodeling
│   ├── refining/            # 10 refinery unit operation modules
│   ├── production/          # Nodal analysis, artificial lift, well testing
│   ├── economics/           # Reserves, NPV/IRR, fiscal regimes
│   ├── analytics/           # Digital twin, predictive models, DCA
│   ├── reports/             # Auto-generated PDF/Excel reports
│   ├── shared/              # Reusable UI components, unit system
│   └── ...                  # 15+ additional module directories
├── lib/                     # Engineering calculation engines
│   ├── pvt.ts / pvt_engine.ts
│   ├── drilling.ts          # Torque & drag, hydraulics
│   ├── geophysics.ts        # Seismic processing algorithms
│   ├── reservoir.ts         # Flow equations, material balance
│   ├── refining.ts          # Process simulation correlations
│   ├── petrophysics.ts      # Log analysis equations
│   └── ...                  # 40+ library modules
└── store/                   # Zustand state management
    ├── simulationStore.ts   # 12-layer persistent store
    ├── types.ts             # Full type definitions
    └── hooks.ts             # Typed selector hooks
```

**Key design decisions:**

- **12 interconnected data layers** managed via Zustand with localStorage persistence — data flows from exploration → appraisal → reservoir → development → production and beyond
- **Real engineering math** — Peng-Robinson EOS, Archie's equation, Arps decline models, Buckley-Leverett, torque & drag, and dozens more, all implemented client-side
- **Export everywhere** — PDF reports (jsPDF), Excel spreadsheets (SheetJS), LAS well log files, chart image captures
- **Unit system toggle** — field (oilfield) ↔ SI units throughout the app
- **Glass-morphic UI** — dark-themed interface with translucent panels, smooth animations (Framer Motion), and responsive layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript 5.8 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 (persisted) |
| Charts | Recharts 3 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Export | jsPDF, SheetJS (xlsx) |
| Markdown | react-markdown |
| Deployment | GitHub Pages (CI/CD) |

---

## Getting Started

```bash
# Clone
git clone https://github.com/jairam25/Petrostream.git
cd Petrostream

# Install
npm install

# Run locally
npm run dev
# → http://localhost:3000

# Build for production
npm run build

# Type check
npm run lint
```

---

## Live Demo

👉 **[jairam25.github.io/petrostream](https://jairam25.github.io/petrostream/)**

---

## Contributing

Contributions are welcome! Open an issue first to discuss what you'd like to change, then submit a PR.

---

## License

Distributed under the Apache 2.0 License. See `LICENSE` for details.

---

<div align="center">

**Built for petroleum engineers, by petroleum engineers.**

</div>
