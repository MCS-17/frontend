import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  LucideAngularModule, 
  Cpu, Zap, Activity, HardDrive, 
  ArrowRight, Coins, TrendingDown, AlertTriangle 
} from 'lucide-angular';
import { NgxApexchartsModule } from 'ngx-apexcharts';

import { CreditsService } from '../../services/credits.service';
import { mockJobs, mockResourceUsage } from '../../data/hpc-mock-data';
import { fmtCredits } from '../../utils/credit-calculator';
import { JobStatusBadge } from '../../components/job-status-badge/job-status-badge';

const MONASH_BLUE = "#006DAE";
const FONT = "'Instrument Sans', sans-serif";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    LucideAngularModule, 
    NgxApexchartsModule, 
    JobStatusBadge
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  readonly LucideIcons = { Cpu, Zap, Activity, HardDrive, ArrowRight, Coins, TrendingDown, AlertTriangle };

  readonly creditsService = inject(CreditsService);

  readonly mockJobs = mockJobs;
  readonly mockResourceUsage = mockResourceUsage;
  readonly fmtCredits = fmtCredits;

  readonly runningJobs = computed(() => mockJobs.filter(j => j.status === 'running'));
  readonly pendingJobs = computed(() => mockJobs.filter(j => j.status === 'pending'));

  readonly balance = this.creditsService.balance;
  readonly transactions = this.creditsService.transactions;

  readonly cpuUsagePercent = Math.round((mockResourceUsage.usedCPUs / mockResourceUsage.totalCPUs) * 100);
  readonly gpuUsagePercent = Math.round((mockResourceUsage.usedGPUs / mockResourceUsage.totalGPUs) * 100);
  readonly memoryUsagePercent = Math.round((mockResourceUsage.usedMemory / mockResourceUsage.totalMemory) * 100);
  readonly storageUsagePercent = Math.round((mockResourceUsage.usedStorage / mockResourceUsage.totalStorage) * 100);

  readonly totalSpent = computed(() => 
    this.transactions().reduce((acc, tx) => acc + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0)
  );

  readonly balanceColor = computed(() => this.balance() < 500 ? "#EF4444" : this.balance() < 1500 ? "#F59E0B" : "#22C55E");
  readonly balanceBg = computed(() => this.balance() < 500 ? "#FEF2F2" : this.balance() < 1500 ? "#FFFBEB" : "#F0FDF4");
  readonly balanceBorder = computed(() => this.balance() < 500 ? "#FECACA" : this.balance() < 1500 ? "#FDE68A" : "#BBF7D0");

  readonly jobActivityData = Array.from({ length: 13 }, (_, i) => {
    const now = new Date();
    const h = new Date(now);
    h.setHours(now.getHours() - (12 - i), 0, 0, 0);
    const label = h.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const base = [1, 1, 2, 2, 3, 4, 5, 5, 4, 4, 3, 3, 2];
    const gpu  = [0, 0, 1, 1, 2, 2, 2, 3, 2, 2, 1, 1, 1];
    const mpi  = [1, 1, 1, 1, 1, 2, 3, 2, 2, 2, 2, 2, 1];
    return {
      time: i === 12 ? "Now" : label,
      Running: base[i],
      GPU: gpu[i],
      MPI: mpi[i],
    };
  });

  readonly currentRunning = this.jobActivityData[this.jobActivityData.length - 1].Running;

  readonly abs = Math.abs;

  readonly chartOptions = {
    series: [
      { name: "Running", data: this.jobActivityData.map(d => d.Running) },
      { name: "GPU", data: this.jobActivityData.map(d => d.GPU) },
      { name: "MPI", data: this.jobActivityData.map(d => d.MPI) }
    ],
    chart: {
      type: "area" as const,
      height: 200,
      toolbar: { show: false },
      fontFamily: FONT,
      sparkline: { enabled: false }
    },
    colors: [MONASH_BLUE, "#8B5CF6", "#06B6D4"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    xaxis: {
      categories: this.jobActivityData.map(d => d.time),
      labels: { style: { colors: "#94A3B8", fontSize: "10px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: 6
    },
    yaxis: {
      labels: { style: { colors: "#94A3B8", fontSize: "10px" } },
    },
    grid: {
      borderColor: "#EEF2F8",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    legend: {
      position: 'bottom' as const,
      horizontalAlign: 'center' as const
    },
    tooltip: {
      theme: 'light' as const,
      y: { formatter: (val: number) => val.toString() }
    }
  };

  getBarColor(percent: number) {
    return percent >= 85 ? "#EF4444" : percent >= 65 ? "#F59E0B" : "#006DAE";
  }
}
