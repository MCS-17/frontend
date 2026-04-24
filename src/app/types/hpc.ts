export type JobStatus = "running" | "pending" | "completed" | "failed" | "cancelled";

export type JobType = "mpi" | "gpu" | "spark" | "pytorch" | "tensorflow";

export interface Job {
  id: string;
  name: string;
  type: JobType;
  status: JobStatus;
  user: string;
  nodes: number;
  cpus: number;
  gpus: number;
  memory: string;
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  runtime?: string;
  partition: string;
  outputFile?: string;
}

export interface ResourceUsage {
  totalCPUs: number;
  usedCPUs: number;
  totalGPUs: number;
  usedGPUs: number;
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
  usedStorage: number;
}

export interface NodeInfo {
  name: string;
  status: "idle" | "allocated" | "mixed" | "down";
  cpus: number;
  cpusUsed: number;
  gpus: number;
  gpusUsed: number;
  memory: number;
  memoryUsed: number;
}
