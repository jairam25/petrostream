export const COMMODITY_PRICES = {
  oil: [
    { label: "WTI Cushing", price: "$72.40", unit: "/bbl", diff: "Base" },
    { label: "Brent Crude", price: "$77.10", unit: "/bbl", diff: "+$4.70" },
    { label: "WCS (Canada)", price: "$56.20", unit: "/bbl", diff: "-$16.20" },
    { label: "Midland WTI", price: "$73.15", unit: "/bbl", diff: "+$0.75" },
    { label: "LLS (Louisiana)", price: "$75.80", unit: "/bbl", diff: "+$3.40" }
  ],
  gas: [
    { label: "Henry Hub", price: "$2.45", unit: "/MMBTU", diff: "Base" },
    { label: "AECO (Alberta)", price: "$1.85", unit: "/MMBTU", diff: "-$0.60" },
    { label: "TTF (Europe)", price: "$12.40", unit: "/MMBTU", diff: "+$9.95" },
    { label: "JKM (Asia LNG)", price: "$13.10", unit: "/MMBTU", diff: "+$10.65" },
    { label: "Waha (Permian)", price: "$1.10", unit: "/MMBTU", diff: "-$1.35" }
  ],
  ngl: [
    { label: "Ethane", price: "$0.18", unit: "/gal" },
    { label: "Propane", price: "$0.72", unit: "/gal" },
    { label: "Normal Butane", price: "$0.85", unit: "/gal" },
    { label: "Natural Gasoline", price: "$1.42", unit: "/gal" }
  ]
};

export const OPERATING_COSTS = [
  { region: "Permian Basin", lifting: "$6 - 12", water: "$3 - 5", gathering: "$0.50 - 2.00", currency: "USD" },
  { region: "Eagle Ford", lifting: "$8 - 14", water: "$2 - 4", gathering: "$0.40 - 1.50", currency: "USD" },
  { region: "Bakken", lifting: "$10 - 16", water: "$4 - 8", gathering: "$0.60 - 2.50", currency: "USD" },
  { region: "GOM Deepwater", lifting: "$15 - 30", water: "N/A", gathering: "N/A", currency: "USD" },
  { region: "North Sea", lifting: "$15 - 35", water: "N/A", gathering: "N/A", currency: "USD" },
  { region: "Middle East Onshore", lifting: "$2 - 8", water: "$0.50 - 1.50", gathering: "Low", currency: "USD" }
];

export const FISCAL_TERMS_REF = [
  { 
    country: "USA (Texas)", 
    royalty: "12.5 - 25%", 
    tax: "4.6% (Oil) / 7.5% (Gas)", 
    notes: "Severance tax varies by state. Federal income tax 21%." 
  },
  { 
    country: "Norway", 
    royalty: "0%", 
    tax: "78% (Special Tax)", 
    notes: "22% Corporate + 56% Special Petroleum Tax. High uplift/deductions." 
  },
  { 
    country: "UK", 
    royalty: "0%", 
    tax: "40 - 75%", 
    notes: "Includes Energy Profits Levy. Ring-fenced corporation tax." 
  },
  { 
    country: "Saudi Arabia", 
    royalty: "20%", 
    tax: "50 - 85%", 
    notes: "Income tax on incremental production. High government take." 
  },
  { 
    country: "Brazil", 
    royalty: "15%", 
    tax: "34% + Profit Share", 
    notes: "PSC terms for Pre-Salt. Local content requirements apply." 
  }
];
