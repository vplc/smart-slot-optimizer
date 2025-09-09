// OverbookIQ Core Optimization Engine
// Expected utility calculation for appointment slots

export interface SlotParams {
  capacity: number; // s - number of service providers
  revenue: number; // r - revenue per appointment
  overtimeCost: number; // c - cost of overtime/wait
  idleCost: number; // l - cost of idle capacity
  showProbability: number; // p - probability of client showing up
  maxWaitTime: number; // W* - SLA wait time constraint
}

export interface OptimizationResult {
  optimalBookings: number;
  expectedUtility: number;
  expectedRevenue: number;
  expectedWaitTime: number;
  riskMetrics: {
    overbookProbability: number;
    idleProbability: number;
    slaViolationRisk: number;
  };
}

export function factorial(n: number): number {
  if (n < 2) return 1;
  return Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
}

export function combination(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

export function expectedUtility(
  n: number,
  params: SlotParams
): number {
  const { capacity: s, revenue: r, overtimeCost: c, idleCost: l, showProbability: p } = params;
  
  let utility = 0;
  
  for (let k = 0; k <= n; k++) {
    const prob = combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    const gain = r * Math.min(k, s) - c * Math.max(0, k - s) - l * Math.max(0, s - k);
    utility += prob * gain;
  }
  
  return utility;
}

export function estimateWaitTime(bookings: number, capacity: number): number {
  // Simplified queueing approximation (M/G/s)
  // In reality, this would use Allen-Cunneen approximation
  if (bookings <= capacity) return 0;
  
  const rho = bookings / capacity;
  const utilization = Math.min(0.95, rho); // Cap at 95% utilization
  
  // Simplified wait time estimation
  return (15 * utilization * (bookings - capacity)) / capacity;
}

export function optimizeSlot(params: SlotParams): OptimizationResult {
  let bestBookings = 1;
  let bestUtility = -Infinity;
  let bestMetrics: OptimizationResult['riskMetrics'] = {
    overbookProbability: 0,
    idleProbability: 0,
    slaViolationRisk: 0,
  };
  
  // Test booking levels from 1 to 4 (conservative approach)
  for (let n = 1; n <= 4; n++) {
    const utility = expectedUtility(n, params);
    const waitTime = estimateWaitTime(n, params.capacity);
    
    // Check SLA constraint
    if (waitTime <= params.maxWaitTime && utility > bestUtility) {
      bestBookings = n;
      bestUtility = utility;
      
      // Calculate risk metrics
      const overbookProb = 1 - binomialCDF(params.capacity, n, params.showProbability);
      const idleProb = binomialPDF(0, n, params.showProbability);
      const slaViolationRisk = waitTime / params.maxWaitTime;
      
      bestMetrics = {
        overbookProbability: overbookProb,
        idleProbability: idleProb,
        slaViolationRisk: slaViolationRisk,
      };
    }
  }
  
  return {
    optimalBookings: bestBookings,
    expectedUtility: bestUtility,
    expectedRevenue: calculateExpectedRevenue(bestBookings, params),
    expectedWaitTime: estimateWaitTime(bestBookings, params.capacity),
    riskMetrics: bestMetrics,
  };
}

function binomialPDF(k: number, n: number, p: number): number {
  return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function binomialCDF(k: number, n: number, p: number): number {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binomialPDF(i, n, p);
  }
  return sum;
}

function calculateExpectedRevenue(bookings: number, params: SlotParams): number {
  let expectedRevenue = 0;
  
  for (let k = 0; k <= bookings; k++) {
    const prob = binomialPDF(k, bookings, params.showProbability);
    const served = Math.min(k, params.capacity);
    expectedRevenue += prob * served * params.revenue;
  }
  
  return expectedRevenue;
}

// Sample optimization scenarios for demo
export const sampleScenarios = {
  barber: {
    capacity: 1,
    revenue: 80,
    overtimeCost: 40,
    idleCost: 10,
    showProbability: 0.8,
    maxWaitTime: 5,
  },
  salon: {
    capacity: 2,
    revenue: 120,
    overtimeCost: 60,
    idleCost: 15,
    showProbability: 0.85,
    maxWaitTime: 10,
  },
  therapist: {
    capacity: 1,
    revenue: 150,
    overtimeCost: 75,
    idleCost: 20,
    showProbability: 0.9,
    maxWaitTime: 3,
  },
};