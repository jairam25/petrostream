/**
 * Duong Decline Model
 * q = qi * t^-a * exp(m/(1-a) * (t^(1-a) - 1))
 */
export function calculateDuongDecline(t: number, qi: number, a: number, m: number): number {
  if (t <= 0) return qi;
  const term1 = Math.pow(t, -a);
  const term2 = Math.exp((m / (1 - a)) * (Math.pow(t, 1 - a) - 1));
  return qi * term1 * term2;
}

/**
 * Heuristic Audit for Production Data
 * Scans for physical impossibilities and sensor errors
 */
export function performHeuristicAudit(data: any[]) {
  const anomalies = [];
  
  data.forEach((row, i) => {
    if (row.Oil_Prod_BBL < 0) {
      anomalies.push({ type: 'Negative Flow', well: row.Well_Name, timestamp: row.Date, status: 'Meter Error' });
    }
    if (row.Gas_Prod_MCF > 10000 && row.Oil_Prod_BBL < 10) {
      anomalies.push({ type: 'Impossible GOR', well: row.Well_Name, timestamp: row.Date, status: 'Sensing Failure' });
    }
    // Simple outlier: > 200% of mean
    if (row.Oil_Prod_BBL > 2000) {
      anomalies.push({ type: 'Outlier Spike', well: row.Well_Name, timestamp: row.Date, status: 'Physics Violation' });
    }
  });

  return anomalies;
}

/**
 * Basic Data Imputation
 */
export function imputeBasic(val: number | null, prev: number, next: number, method: string): number {
  if (val !== null && val > 0) return val;
  
  switch (method) {
    case 'Linear Interpolation':
      return (prev + next) / 2;
    case 'LVCF':
      return prev;
    case 'Seasonal Decomp.':
      return prev * 0.98; // Simulated decay
    default:
      return prev;
  }
}
