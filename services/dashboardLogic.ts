// src/services/dashboardLogic.ts

export const aggregateDashboardData = (history: any[]) => {
  if (!history || history.length === 0) return null;

  const latestScan = history[0];
  const previousScan = history[1] || latestScan;

  // 1. Calculate Severity Distribution for the Pie/Bar Chart
  const distribution = [
    { name: 'Critical', count: 0, color: '#ef4444' }, // Red-500
    { name: 'High', count: 0, color: '#f97316' },     // Orange-500
    { name: 'Medium', count: 0, color: '#eab308' },   // Yellow-500
    { name: 'Low', count: 0, color: '#22c55e' },      // Green-500
  ];

  latestScan.vulnerabilities.forEach((v: any) => {
    // Normalize casing (CRITICAL vs Critical)
    const severityName = v.severity.charAt(0).toUpperCase() + v.severity.slice(1).toLowerCase();
    const group = distribution.find(d => d.name === severityName);
    if (group) group.count++;
  });

  // 2. Calculate Risk Trend for the Area Chart
  // We take the last 5 scans and reverse them so they appear chronologically (Old -> New)
  const trendData = history.slice(0, 5).reverse().map((scan, index) => ({
    name: `Scan ${index + 1}`,
    risk: scan.overallRiskScore,
    date: new Date(scan.timestamp).toLocaleDateString()
  }));

  // 3. Calculate KPI Cards
  const totalVulns = latestScan.vulnerabilities.length;
  const riskDiff = previousScan.overallRiskScore - latestScan.overallRiskScore;
  let riskLabel = "Stable";
  if (riskDiff > 0) riskLabel = `Improved by ${riskDiff} pts`;
  if (riskDiff < 0) riskLabel = `Worsened by ${Math.abs(riskDiff)} pts`;

  return {
    latestScore: latestScan.overallRiskScore,
    totalVulns,
    riskLabel,
    distribution,
    trendData,
    recentScans: history.slice(0, 5) // Show top 5 recent scans in table
  };
};