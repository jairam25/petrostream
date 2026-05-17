export const WELL_CONTROL_REFERENCE = {
  kickIndicators: [
    { label: "Pit Gain", category: "Primary", description: "Increase in mud volume in surface pits." },
    { label: "Drilling Break", category: "Primary", description: "Sudden increase in Rate of Penetration (ROP)." },
    { label: "Decrease in Pump Pressure", category: "Secondary", description: "Could indicate lighter fluid entering the wellbore (U-tubing)." },
    { label: "Increase in Return Flow", category: "Primary", description: "Flow rate out is greater than pump rate in." },
    { label: "Gas Cut Mud", category: "Secondary", description: "Surface mud density decreases due to entrained gas." }
  ],
  killMethods: [
    { 
      name: "Driller's Method", 
      logic: "Two Circulations", 
      pros: "Simplest; can start immediately.", 
      cons: "Duration; higher pressures on casing/wellhead." 
    },
    { 
      name: "Wait and Weight", 
      logic: "One Circulation", 
      pros: "Lower casing pressures; more efficient.", 
      cons: "Requires wait time to weight up mud before pumping." 
    },
    { 
      name: "Concurrent Method", 
      logic: "Variable Density", 
      pros: "Starts immediately.", 
      cons: "Complex calculation; highest risk of error." 
    },
    { 
      name: "Volumetric Method", 
      logic: "Static Control", 
      pros: "Used when circulation is impossible.", 
      cons: "Extremely technical; relies on gas migration physics." 
    }
  ],
  procedures: [
    { phase: "Detection", action: "Shut-in immediately using Hard Shut-in protocol." },
    { phase: "Stabilization", action: "Wait 10-15 minutes for SIDPP and SICP to stabilize." },
    { phase: "Logging", action: "Record total pit gain volume and final pressures." }
  ]
};

export const H2S_SAFETY_LIMITS = [
  { ppm: "10 ppm", level: "8-Hour TWA", effect: "OSHA Permissible Exposure Limit (PEL)." },
  { ppm: "15 ppm", level: "15-Min STEL", effect: "Short-term exposure limit; evacuate if reached." },
  { ppm: "20 ppm", level: "Ceiling Limit", effect: "OSHA maximum direct exposure limit." },
  { ppm: "50 ppm", level: "NIOSH IDLH", effect: "Immediately Dangerous to Life and Health (current)." },
  { ppm: "100 ppm", level: "Old IDLH", effect: "Loss of sense of smell in minutes (Safe olfactory fatigue)." },
  { ppm: "300 ppm", level: "Fatal Exposure", effect: "Can cause death within 30 minutes of exposure." },
  { ppm: "700 ppm", level: "Instant Death", effect: "Rapid unconsciousness, respiratory failure, and death." }
];

export const ENVIRONMENTAL_COMPLIANCE = {
  emissions: [
    { category: "Flaring", limit: "Zero Routine Flaring", timeline: "Post-2030 Target in most regions." },
    { category: "CO2 Intensity", limit: "Scope 1 & 2 Reduction", notes: "Varies by ESG framework." }
  ],
  water: [
    { jurisdiction: "Gulf of Mexico", limit: "29 mg/L", type: "Oil in Water (Monthly Avg)" },
    { jurisdiction: "North Sea", limit: "30 mg/L", type: "Oil in Water (Limit)" },
    { jurisdiction: "Onshore US", limit: "Zero Discharge", type: "Produced Water must be injected or treated." }
  ],
  reporting: [
    { type: "Spill (Federal)", threshold: "1 bbl", action: "Immediate Coast Guard notification." },
    { type: "Noise (Onshore)", threshold: "55 - 65 dBA", action: "Night-time limit near residential zones." }
  ]
};
