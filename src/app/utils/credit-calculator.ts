// ─── Credit Pricing Model ────────────────────────────────────────────────────
// All costs are in MonHPC Credits.
//
//  Base rates (per hour):
//    CPU core      → 1.0  credit / core-hour
//    GPU (A100)    → 12.0 credits / GPU-hour
//    Memory        → 0.08 credits / GB-hour
//
//  Partition multipliers applied to the total:
//    compute   → 1.0×
//    gpu       → 1.5×
//    highmem   → 1.3×
// ─────────────────────────────────────────────────────────────────────────────

export const CREDIT_RATES = {
  cpuPerCoreHour: 1.0,
  gpuPerHour: 12.0,
  memoryPerGbHour: 0.08,
};

export const PARTITION_MULTIPLIERS: Record<string, number> = {
  compute: 1.0,
  gpu: 1.5,
  highmem: 1.3,
};

export interface JobCostBreakdown {
  cpuCost: number;
  gpuCost: number;
  memoryCost: number;
  subtotal: number;
  partitionMultiplier: number;
  total: number;
  wallHours: number;
}

/** Parse a "HH:MM" or plain hours string → decimal hours */
export function parseWallTime(wallTime: string): number {
  if (!wallTime) return 0;
  if (wallTime.includes(":")) {
    const [h, m] = wallTime.split(":").map(Number);
    return (h || 0) + (m || 0) / 60;
  }
  return parseFloat(wallTime) || 0;
}

/** Format decimal hours back to "HH:MM" */
export function formatWallTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function calculateJobCost(params: {
  nodes: number;
  cpus: number;        // CPUs per node
  gpus: number;        // GPUs per node
  memory: number;      // GB total
  partition: string;
  wallTime: string;    // "HH:MM"
}): JobCostBreakdown {
  const wallHours = parseWallTime(params.wallTime);
  const totalCpus = params.nodes * params.cpus;
  const totalGpus = params.nodes * params.gpus;
  const multiplier = PARTITION_MULTIPLIERS[params.partition] ?? 1.0;

  const cpuCost   = totalCpus  * CREDIT_RATES.cpuPerCoreHour * wallHours;
  const gpuCost   = totalGpus  * CREDIT_RATES.gpuPerHour     * wallHours;
  const memoryCost = params.memory * CREDIT_RATES.memoryPerGbHour * wallHours;

  const subtotal = cpuCost + gpuCost + memoryCost;
  const total = Math.ceil(subtotal * multiplier * 10) / 10; // round up to 1 dp

  return {
    cpuCost: Math.round(cpuCost * 10) / 10,
    gpuCost: Math.round(gpuCost * 10) / 10,
    memoryCost: Math.round(memoryCost * 10) / 10,
    subtotal: Math.round(subtotal * 10) / 10,
    partitionMultiplier: multiplier,
    total,
    wallHours,
  };
}

/** Pretty-print a credit number */
export function fmtCredits(n: number): string {
  return n.toLocaleString("en-AU", { maximumFractionDigits: 1 });
}
