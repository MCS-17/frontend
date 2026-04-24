import { Injectable, signal, computed } from '@angular/core';

export interface CreditTransaction {
  id: string;
  jobName: string;
  jobId: string;
  amount: number;       // negative = deducted, positive = topped up
  balance: number;      // balance after transaction
  timestamp: Date;
  breakdown: {
    cpuCost: number;
    gpuCost: number;
    memoryCost: number;
    partitionMultiplier: number;
    wallHours: number;
  };
}

const STARTING_BALANCE = 5_000;

const SEED_TRANSACTIONS: CreditTransaction[] = [
  {
    id: "tx-001",
    jobName: "protein_folding_sim",
    jobId: "12345",
    amount: -864,
    balance: 5000,
    timestamp: new Date("2026-03-17T10:30:00"),
    breakdown: { cpuCost: 128, gpuCost: 672, memoryCost: 25.6, partitionMultiplier: 1.5, wallHours: 4 },
  },
  {
    id: "tx-002",
    jobName: "parallel_matrix_mul",
    jobId: "12346",
    amount: -307.2,
    balance: 5000 - 864,
    timestamp: new Date("2026-03-17T09:15:00"),
    breakdown: { cpuCost: 256, gpuCost: 0, memoryCost: 51.2, partitionMultiplier: 1.0, wallHours: 8 },
  },
  {
    id: "tx-003",
    jobName: "neural_network_training",
    jobId: "12347",
    amount: -540,
    balance: 5000 - 864 - 307.2,
    timestamp: new Date("2026-03-16T14:00:00"),
    breakdown: { cpuCost: 48, gpuCost: 432, memoryCost: 12.8, partitionMultiplier: 1.5, wallHours: 3 },
  },
];

const CURRENT_BALANCE = Math.round(
  (STARTING_BALANCE + SEED_TRANSACTIONS.reduce((acc, tx) => acc + tx.amount, 0)) * 10
) / 10;

@Injectable({
  providedIn: 'root'
})
export class CreditsService {
  private _balance = signal(CURRENT_BALANCE);
  private _transactions = signal<CreditTransaction[]>(SEED_TRANSACTIONS);

  readonly balance = this._balance.asReadonly();
  readonly transactions = this._transactions.asReadonly();

  canAfford(amount: number): boolean {
    return this._balance() >= amount;
  }

  deductCredits(params: { jobName: string; amount: number; breakdown: CreditTransaction["breakdown"] }): boolean {
    if (this._balance() < params.amount) return false;
    
    const newBalance = Math.round((this._balance() - params.amount) * 10) / 10;
    const tx: CreditTransaction = {
      id: `tx-${Date.now()}`,
      jobName: params.jobName,
      jobId: `JOB-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: -params.amount,
      balance: newBalance,
      timestamp: new Date(),
      breakdown: params.breakdown,
    };

    this._balance.set(newBalance);
    this._transactions.update(prev => [tx, ...prev]);
    return true;
  }

  topUp(amount: number): void {
    this._balance.update(prev => Math.round((prev + amount) * 10) / 10);
  }
}
