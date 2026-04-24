
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { DashboardActivityChartComponent } from './dashboard-activity-chart.component';
import { DashboardCreditsCardComponent } from './dashboard-credits-card.component';
import { DecimalPipe } from '@angular/common';

// Mock data and types (normally import from shared files)
type JobStatus = 'running' | 'pending' | 'completed' | 'failed' | 'cancelled';
interface Job {
  id: string;
  name: string;
  type: string;
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
interface ResourceUsage {
  totalCPUs: number;
  usedCPUs: number;
  totalGPUs: number;
  usedGPUs: number;
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
  usedStorage: number;
}

const MONASH_BLUE = '#006DAE';
const FONT = "'Instrument Sans', sans-serif";

// Mock jobs and resource usage (from hpcMockData)
const mockJobs: Job[] = [
  {
    id: '12345',
    name: 'protein_folding_sim',
    type: 'gpu',
    status: 'running',
    user: 'student123',
    nodes: 1,
    cpus: 16,
    gpus: 2,
    memory: '64GB',
    submittedAt: new Date('2026-03-17T10:30:00'),
    startedAt: new Date('2026-03-17T10:32:00'),
    runtime: '02:15:33',
    partition: 'gpu',
    outputFile: 'output_12345.log',
  },
  {
    id: '12346',
    name: 'parallel_matrix_mul',
    type: 'mpi',
    status: 'running',
    user: 'student123',
    nodes: 2,
    cpus: 32,
    gpus: 0,
    memory: '128GB',
    submittedAt: new Date('2026-03-17T09:15:00'),
    startedAt: new Date('2026-03-17T09:16:00'),
    runtime: '03:42:10',
    partition: 'compute',
  },
  {
    id: '12347',
    name: 'neural_network_training',
    type: 'pytorch',
    status: 'pending',
    user: 'student123',
    nodes: 1,
    cpus: 8,
    gpus: 1,
    memory: '32GB',
    submittedAt: new Date('2026-03-17T12:00:00'),
    partition: 'gpu',
  },
];

const mockResourceUsage: ResourceUsage = {
  totalCPUs: 128,
  usedCPUs: 48,
  totalGPUs: 16,
  usedGPUs: 3,
  totalMemory: 1024,
  usedMemory: 224,
  totalStorage: 10000,
  usedStorage: 3240,
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, DashboardActivityChartComponent, DashboardCreditsCardComponent],
})
export class DashboardComponent {
  // Mock credits data
  balance = 1200;
  totalSpent = 1711.2;
  transactions = [
    { id: 'tx-001', jobName: 'protein_folding_sim', amount: 864 },
    { id: 'tx-002', jobName: 'parallel_matrix_mul', amount: 307.2 },
    { id: 'tx-003', jobName: 'neural_network_training', amount: 540 },
  ];
  // Mock job activity data (last 12 hours)
  jobActivityData = [
    { time: '08:00', Running: 1, GPU: 0, MPI: 1 },
    { time: '09:00', Running: 1, GPU: 0, MPI: 1 },
    { time: '10:00', Running: 2, GPU: 1, MPI: 1 },
    { time: '11:00', Running: 2, GPU: 1, MPI: 1 },
    { time: '12:00', Running: 3, GPU: 2, MPI: 1 },
    { time: '13:00', Running: 4, GPU: 2, MPI: 2 },
    { time: '14:00', Running: 5, GPU: 2, MPI: 3 },
    { time: '15:00', Running: 5, GPU: 3, MPI: 2 },
    { time: '16:00', Running: 4, GPU: 2, MPI: 2 },
    { time: '17:00', Running: 4, GPU: 2, MPI: 2 },
    { time: '18:00', Running: 3, GPU: 1, MPI: 2 },
    { time: '19:00', Running: 3, GPU: 1, MPI: 2 },
    { time: 'Now',   Running: 2, GPU: 1, MPI: 1 },
  ];
  font = FONT;
  monashBlue = MONASH_BLUE;

  jobs = signal<Job[]>(mockJobs);
  resourceUsage = signal<ResourceUsage>(mockResourceUsage);

  runningJobs = computed(() => this.jobs().filter(j => j.status === 'running'));
  pendingJobs = computed(() => this.jobs().filter(j => j.status === 'pending'));

  cpuUsagePercent = computed(() => Math.round((this.resourceUsage().usedCPUs / this.resourceUsage().totalCPUs) * 100));
  gpuUsagePercent = computed(() => Math.round((this.resourceUsage().usedGPUs / this.resourceUsage().totalGPUs) * 100));
  memoryUsagePercent = computed(() => Math.round((this.resourceUsage().usedMemory / this.resourceUsage().totalMemory) * 100));
  storageUsagePercent = computed(() => Math.round((this.resourceUsage().usedStorage / this.resourceUsage().totalStorage) * 100));
}
