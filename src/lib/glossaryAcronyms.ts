/**
 * Fix 12 — Petroleum Engineering Glossary & Acronym Reference.
 * Accessible from any stage via the shared GlossaryReference component.
 */

export interface AcronymEntry {
    acronym: string;
    fullName: string;
    description: string;
    category: 'exploration' | 'drilling' | 'production' | 'reservoir' | 'refining' | 'midstream' | 'general';
}

export const ACRONYM_DATABASE: AcronymEntry[] = [
    { acronym: 'COS', fullName: 'Chance of Success', description: 'Probabilistic likelihood that a prospect contains hydrocarbons. Product of individual risk factors (source, reservoir, seal, trap, migration, timing).', category: 'exploration' },
    { acronym: 'GRV', fullName: 'Gross Rock Volume', description: 'Total volume of rock in a structural or stratigraphic closure above the hydrocarbon-water contact, measured in acre-feet or m³.', category: 'exploration' },
    { acronym: 'STOIIP', fullName: 'Stock Tank Oil Initially In Place', description: 'Total volume of oil present in a reservoir at discovery, before any production. Calculated as (7758 × A × h × φ × (1-Sw)) / Bo in field units. Also OOIP.', category: 'exploration' },
    { acronym: 'GIIP', fullName: 'Gas Initially In Place', description: 'Total volume of gas present in a reservoir at discovery. Also OGIP.', category: 'exploration' },
    { acronym: 'EMV', fullName: 'Expected Monetary Value', description: 'Risk-weighted economic value: EMV = COS × NPV(success) - (1-COS) × Cost(failure).', category: 'exploration' },
    { acronym: 'PG', fullName: 'Probability of Geological Success', description: 'Product of all geological risk factors (source, reservoir, seal, trap, migration, timing). Ranges 0-1.', category: 'exploration' },
    { acronym: 'NPV', fullName: 'Net Present Value', description: 'Sum of discounted future cash flows minus initial investment. NPV = Σ(CashFlow_t / (1+r)^t) - Capex.', category: 'exploration' },
    { acronym: 'IRR', fullName: 'Internal Rate of Return', description: 'Discount rate at which NPV equals zero. Projects with IRR > cost of capital are generally accepted.', category: 'exploration' },
    { acronym: 'GR', fullName: 'Gamma Ray', description: 'Well log measuring natural radioactivity. Low GR = clean sand/carbonate. High GR = shale. Units: API.', category: 'reservoir' },
    { acronym: 'Vsh', fullName: 'Shale Volume (Vshale)', description: 'Fraction of shale/clay in a formation. Vsh = (GR_log - GR_clean) / (GR_shale - GR_clean).', category: 'reservoir' },
    { acronym: 'IGR', fullName: 'Gamma Ray Index', description: 'Linear shale volume index: IGR = (GR - GR_clean) / (GR_shale - GR_clean). Corrected via Larionov or Steiber.', category: 'reservoir' },
    { acronym: 'NTG', fullName: 'Net-to-Gross', description: 'Ratio of net reservoir thickness to gross interval thickness. NTG = Σ(Δt_net) / Δt_gross. Typically 0.3-0.9.', category: 'reservoir' },
    { acronym: 'PHI / φ', fullName: 'Porosity', description: 'Fraction of void space in rock. Typically 5-35% in sandstone reservoirs. Denoted φ.', category: 'reservoir' },
    { acronym: 'Sw', fullName: 'Water Saturation', description: 'Fraction of pore space filled with water. Sw = 1 - Shc. Calculated via Archie, Simandoux, or Indonesian equations.', category: 'reservoir' },
    { acronym: 'Rw', fullName: 'Formation Water Resistivity', description: 'Electrical resistivity of formation water, dependent on salinity and temperature. Measured in ohm-m.', category: 'reservoir' },
    { acronym: 'Rt', fullName: 'True Formation Resistivity', description: 'Measured formation resistivity from deep-reading logs. High Rt in hydrocarbon zones. Units: ohm-m.', category: 'reservoir' },
    { acronym: 'Archie', fullName: 'Archie Equation', description: 'Empirical water saturation formula: Swⁿ = (a × Rw) / (φᵐ × Rt), where a=tortuosity, m=cementation, n=saturation exponent.', category: 'reservoir' },
    { acronym: 'SCAL', fullName: 'Special Core Analysis', description: 'Lab measurements on core plugs for relative permeability, capillary pressure, wettability, and electrical properties.', category: 'reservoir' },
    { acronym: 'NMR', fullName: 'Nuclear Magnetic Resonance', description: 'Logging technique measuring hydrogen proton relaxation for porosity, pore size, and bound/free fluid volumes.', category: 'reservoir' },
    { acronym: 'LWD', fullName: 'Logging While Drilling', description: 'Formation evaluation tools in the BHA transmitting real-time log data while drilling. Reduces rig time vs wireline.', category: 'drilling' },
    { acronym: 'OWC', fullName: 'Oil-Water Contact', description: 'Depth boundary between oil and water zones. Used to determine pay thickness and hydrocarbon column height.', category: 'reservoir' },
    { acronym: 'GOC', fullName: 'Gas-Oil Contact', description: 'Depth boundary between gas cap and oil leg. Critical for well placement to avoid gas coning.', category: 'reservoir' },
    { acronym: 'RFT', fullName: 'Repeat Formation Tester', description: 'Wireline tool measuring formation pressure at discrete depths for fluid gradients and contacts.', category: 'reservoir' },
    { acronym: 'BHA', fullName: 'Bottom Hole Assembly', description: 'Lower drill string: bit, mud motor, stabilizers, MWD/LWD, drill collars. Provides weight and directional control.', category: 'drilling' },
    { acronym: 'MWD', fullName: 'Measurement While Drilling', description: 'Downhole tool measuring inclination, azimuth, and toolface. Transmits via mud pulse telemetry.', category: 'drilling' },
    { acronym: 'PDC', fullName: 'Polycrystalline Diamond Compact', description: 'Bit type with synthetic diamond cutters. Faster ROP than roller cone in homogeneous sections.', category: 'drilling' },
    { acronym: 'ROP', fullName: 'Rate of Penetration', description: 'Drilling speed in feet per hour or m/h. ROP = drilled footage / rotating time.', category: 'drilling' },
    { acronym: 'WOB', fullName: 'Weight on Bit', description: 'Downward force applied to the bit, measured in klb. Typical PDC WOB 10-40 klb.', category: 'drilling' },
    { acronym: 'WBM', fullName: 'Water-Based Mud', description: 'Drilling fluid with water as continuous phase. Lower cost and environmental impact than OBM.', category: 'drilling' },
    { acronym: 'OBM', fullName: 'Oil-Based Mud (Synthetic)', description: 'Drilling fluid with synthetic oil. Superior shale inhibition and lubricity. Higher cost.', category: 'drilling' },
    { acronym: 'ECD', fullName: 'Equivalent Circulating Density', description: 'Effective mud density: ECD = Mud Weight + Annular ΔP / (0.052 × TVD). Must stay within mud window.', category: 'drilling' },
    { acronym: 'KOP', fullName: 'Kick-Off Point', description: 'Depth where directional drilling begins. Build section starts at KOP.', category: 'drilling' },
    { acronym: 'TVD', fullName: 'True Vertical Depth', description: 'Vertical distance from rig KB to subsurface point. Different from MD in deviated wells.', category: 'drilling' },
    { acronym: 'MD', fullName: 'Measured Depth', description: 'Length of wellbore from surface. Always ≥ TVD in deviated wells.', category: 'drilling' },
    { acronym: 'LOT', fullName: 'Leak-Off Test', description: 'Formation integrity test below casing shoe to determine fracture gradient and maximum allowable mud weight.', category: 'drilling' },
    { acronym: 'FIT', fullName: 'Formation Integrity Test', description: 'Simplified LOT confirming casing shoe integrity without fracturing the formation.', category: 'drilling' },
    { acronym: 'TD', fullName: 'Total Depth', description: 'Final depth of the wellbore. Distinguished as TD (MD) and TD (TVD) in deviated wells.', category: 'drilling' },
    { acronym: 'IPR', fullName: 'Inflow Performance Relationship', description: 'Relationship between flowing BHP (Pwf) and flow rate (q). Vogel, Darcy, and Fetkovich models.', category: 'production' },
    { acronym: 'AOF', fullName: 'Absolute Open Flow', description: 'Theoretical maximum flow rate against zero backpressure (Pwf = 0). Well potential assessment.', category: 'production' },
    { acronym: 'VLP', fullName: 'Vertical Lift Performance', description: 'Pressure drop vs flow rate in tubing. Matched with IPR for nodal analysis.', category: 'production' },
    { acronym: 'Pwf', fullName: 'Flowing Bottomhole Pressure', description: 'Pressure at producing formation face during production. Pr - Pwf = drawdown.', category: 'production' },
    { acronym: 'PI', fullName: 'Productivity Index', description: 'Well deliverability: PI = q / (Pr - Pwf) in STB/D/psi. Declines with depletion.', category: 'production' },
    { acronym: 'BHP', fullName: 'Bottomhole Pressure', description: 'Pressure at bottom of well. Distinguish static BHP (shut-in) vs flowing BHP (production).', category: 'production' },
    { acronym: 'GOR', fullName: 'Gas-Oil Ratio', description: 'Produced gas volume to oil volume, scf/STB. Increasing GOR may indicate gas cap breakthrough.', category: 'production' },
    { acronym: 'WOR', fullName: 'Water-Oil Ratio', description: 'Produced water to oil, bbl/bbl. Economic limit when WOR renders production uneconomic.', category: 'production' },
    { acronym: 'ESP', fullName: 'Electrical Submersible Pump', description: 'Downhole centrifugal pump. Handles 1000-50000 BPD. 2-5 year run life.', category: 'production' },
    { acronym: 'GL', fullName: 'Gas Lift', description: 'Artificial lift injecting high-pressure gas into tubing to reduce fluid density. Good for high GOR wells.', category: 'production' },
    { acronym: 'BPD', fullName: 'Barrels Per Day', description: 'Oil production rate. 1 bbl = 42 US gallons ≈ 0.159 m³. Also bopd, bwpd, bfpd.', category: 'production' },
    { acronym: 'FTHP', fullName: 'Flowing Tubing Head Pressure', description: 'Pressure at wellhead in tubing during production. Monitors well performance.', category: 'production' },
    { acronym: 'HSE', fullName: 'Health, Safety, Environment', description: 'Framework governing operational safety, environmental protection, and occupational health.', category: 'production' },
    { acronym: 'PLT', fullName: 'Production Logging Tool', description: 'Downhole sensors measuring flow rate, density, holdup, and temperature across perforations.', category: 'production' },
    { acronym: 'EOR', fullName: 'Enhanced Oil Recovery', description: 'Tertiary methods: thermal (steam, SAGD), chemical, miscible gas (CO₂), microbial. After primary/secondary.', category: 'reservoir' },
    { acronym: 'SAGD', fullName: 'Steam-Assisted Gravity Drainage', description: 'Thermal EOR: upper injector creates steam chamber, heated oil drains to lower producer. Canadian oil sands.', category: 'reservoir' },
    { acronym: 'WAG', fullName: 'Water-Alternating-Gas', description: 'EOR cycling water and gas (typically CO₂) to improve sweep efficiency and contact bypassed oil.', category: 'reservoir' },
    { acronym: 'RF', fullName: 'Recovery Factor', description: 'Fraction of OOIP economically producible. Primary 5-20%, secondary +15-25%, tertiary +5-20%.', category: 'reservoir' },
    { acronym: 'PVT', fullName: 'Pressure-Volume-Temperature', description: 'Fluid property analysis: Bo, Rs, Bg, μo, μg vs P,T. Critical for reservoir simulation.', category: 'reservoir' },
    { acronym: 'Bo', fullName: 'Oil Formation Volume Factor', description: 'Ratio of reservoir oil volume to stock tank volume. Bo > 1. Typically 1.05-2.0.', category: 'reservoir' },
    { acronym: 'Rs', fullName: 'Solution Gas-Oil Ratio', description: 'Gas dissolved in oil at reservoir conditions per STB oil. scf/STB. Driving dissolved gas drive.', category: 'reservoir' },
    { acronym: 'DCA', fullName: 'Decline Curve Analysis', description: 'Arps equations: exponential (b=0), hyperbolic (0<b<1), harmonic (b=1). Reserves estimation.', category: 'reservoir' },
    { acronym: 'MBAL', fullName: 'Material Balance', description: 'Equates production to fluid/rock expansion + aquifer influx. Estimates OOIP and drive mechanism.', category: 'reservoir' },
    { acronym: 'B-L', fullName: 'Buckley-Leverett', description: 'Immiscible displacement theory for water-oil front movement. Predicts fractional flow and breakthrough.', category: 'reservoir' },
    { acronym: 'CDU', fullName: 'Crude Distillation Unit', description: 'Primary refining unit separating crude into fractions by boiling point at atmospheric pressure.', category: 'refining' },
    { acronym: 'VDU', fullName: 'Vacuum Distillation Unit', description: 'Distillation under vacuum (30-100 mmHg) for heavy fractions. Prevents thermal cracking. Produces VGO.', category: 'refining' },
    { acronym: 'FCC', fullName: 'Fluid Catalytic Cracking', description: 'Conversion unit cracking heavy gas oil to gasoline/LPG using zeolite catalyst in fluidized bed riser.', category: 'refining' },
    { acronym: 'HCU', fullName: 'Hydrocracker Unit', description: 'High-pressure unit using H₂ and catalyst to crack heavy feeds to diesel/jet fuel. Low-sulfur products.', category: 'refining' },
    { acronym: 'API', fullName: 'API Gravity', description: 'API gravity: °API = (141.5 / SG) - 131.5. Light > 31.1°, Medium 22.3-31.1°, Heavy < 22.3°.', category: 'refining' },
    { acronym: 'TBP', fullName: 'True Boiling Point', description: 'Distillation curve of crude oil. Cumulative yield vs temperature. Refinery process design.', category: 'refining' },
    { acronym: 'TAN', fullName: 'Total Acid Number', description: 'Acidity measure, mg KOH/g oil. TAN > 0.5 moderate, > 1.0 high (corrosive naphthenic acids).', category: 'refining' },
    { acronym: 'HDS', fullName: 'Hydrodesulfurization', description: 'Catalytic process removing sulfur from petroleum fractions via reaction with H₂. Creates H₂S.', category: 'refining' },
    { acronym: 'ULSD', fullName: 'Ultra-Low Sulfur Diesel', description: 'Diesel ≤ 15 ppm sulfur (US EPA). Achieved via deep hydrodesulfurization. On-road standard since 2006.', category: 'refining' },
    { acronym: 'RON', fullName: 'Research Octane Number', description: 'Gasoline knock resistance at low speed. Regular = 87, Premium = 91-93 RON.', category: 'refining' },
    { acronym: 'MON', fullName: 'Motor Octane Number', description: 'Gasoline knock resistance at high speed. Pump octane = (RON + MON)/2. MON ~8-10 lower than RON.', category: 'refining' },
    { acronym: 'NCI', fullName: 'Nelson Complexity Index', description: 'Refinery complexity vs CDU. Higher NCI = more conversion, heavier/sourer crudes. Modern refineries 10-15.', category: 'refining' },
    { acronym: 'SRU', fullName: 'Sulfur Recovery Unit', description: 'Claus process: 2H₂S + SO₂ → 3S + 2H₂O. 95-99.9% sulfur recovery from amine/sour water H₂S.', category: 'refining' },
    { acronym: 'VGO', fullName: 'Vacuum Gas Oil', description: 'Distillate from VDU (650-1050°F TBP). Feedstock for FCC or HCU. 25-35% of crude yield.', category: 'refining' },
    { acronym: 'LPG', fullName: 'Liquefied Petroleum Gas', description: 'C₃-C₄ (propane/butanes). From gas processing and refining. Heating, cooking, petrochemical feedstock.', category: 'refining' },
    { acronym: 'NPS', fullName: 'Nominal Pipe Size', description: 'Pipe diameter standard. NPS 12 = 12.75" OD. Wall thickness by schedule (SCH 40, 80, 160).', category: 'midstream' },
    { acronym: 'MAOP', fullName: 'Maximum Allowable Operating Pressure', description: 'Max pipeline/vessel operating pressure per ASME B31.4/B31.8. From design pressure and safety factors.', category: 'midstream' },
    { acronym: 'SCADA', fullName: 'Supervisory Control and Data Acquisition', description: 'Industrial control system monitoring pipelines, tank farms, terminals. RTUs, PLCs, HMI interfaces.', category: 'midstream' },
    { acronym: 'UST', fullName: 'Underground Storage Tank', description: 'Buried fuel tank at retail stations. EPA 40 CFR 280. FRP or protected steel. Double-wall with leak detection.', category: 'general' },
    { acronym: 'FRP', fullName: 'Fiberglass-Reinforced Plastic', description: 'Composite material for USTs and piping. Corrosion-resistant, lightweight.', category: 'general' },
    { acronym: 'GPM', fullName: 'Gallons Per Minute', description: 'Fuel dispensing rate. Gasoline: 8-12 GPM. Diesel: 6-8 GPM. Truck high-flow: 30-40 GPM.', category: 'general' },
    { acronym: 'PTA', fullName: 'Pressure Transient Analysis', description: 'Well test interpretation: permeability, skin, boundaries from pressure response to rate changes.', category: 'production' },
    { acronym: 'SAL', fullName: 'Salinity', description: 'Dissolved salts in formation water, ppm or mg/L. Seawater ~35,000 ppm. Brines > 300,000 ppm.', category: 'reservoir' },
    { acronym: 'ppm', fullName: 'Parts Per Million', description: 'Concentration unit. 1 ppm = 1 mg/L. For sulfur, salinity, contaminants. 1% = 10,000 ppm.', category: 'general' },
    { acronym: 'Mscf', fullName: 'Thousand Standard Cubic Feet', description: 'Gas volume at 60°F, 14.7 psia. MMscf=million, Bscf=billion, Tscf=trillion. 1 Mscf ≈ 28.3 m³.', category: 'general' },
    { acronym: 'bbl', fullName: 'Barrel', description: 'Oil volume unit. 1 bbl = 42 US gallons ≈ 159 liters.', category: 'general' },
    { acronym: 'STB', fullName: 'Stock Tank Barrel', description: 'Oil at surface conditions (60°F, 14.7 psia). RB = STB × Bo.', category: 'general' },
    { acronym: 'MMbbl', fullName: 'Million Barrels', description: 'Unit for oil reserves. 1 MMbbl = 1,000,000 bbl. World production ~100 MMbpd.', category: 'general' },
    { acronym: 'psia', fullName: 'Pounds per Square Inch Absolute', description: 'Pressure scale zeroed at absolute vacuum. psia = psig + 14.7. Used for PVT and simulation.', category: 'general' },
    { acronym: 'psig', fullName: 'Pounds per Square Inch Gauge', description: 'Pressure relative to atmosphere. psig = psia - 14.7. Used for surface equipment pressures.', category: 'general' },
];

export function searchAcronyms(query: string): AcronymEntry[] {
    const q = query.toLowerCase().trim();
    if (!q) return ACRONYM_DATABASE;
    return ACRONYM_DATABASE.filter(
        e => e.acronym.toLowerCase().includes(q) ||
            e.fullName.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
    );
}

export function lookupAcronym(acronym: string): AcronymEntry | undefined {
    const a = acronym.toUpperCase().trim();
    return ACRONYM_DATABASE.find(e => e.acronym.toUpperCase() === a);
}