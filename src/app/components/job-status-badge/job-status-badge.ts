import { Component, Input, computed, signal } from '@angular/core';
import { JobStatus } from '../../types/hpc';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-status-badge.html',
  styleUrl: './job-status-badge.css'
})
export class JobStatusBadge {
  @Input({ required: true }) set status(val: JobStatus) {
    this._status.set(val);
  }
  
  private _status = signal<JobStatus>('pending');
  
  statusConfig = computed(() => {
    const config: Record<JobStatus, { label: string; bg: string; text: string; dot: string }> = {
      running: { label: "Running", bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
      pending: { label: "Pending", bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
      completed: { label: "Completed", bg: "#EFF6FF", text: "#1E40AF", dot: "#3B82F6" },
      failed: { label: "Failed", bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
      cancelled: { label: "Cancelled", bg: "#F8FAFC", text: "#475569", dot: "#94A3B8" }
    };
    return config[this._status()];
  });
}
