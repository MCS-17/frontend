import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

interface CreditTransaction {
  id: string;
  jobName: string;
  amount: number;
}

@Component({
  selector: 'app-dashboard-credits-card',
  templateUrl: './dashboard-credits-card.component.html',
  styleUrls: ['./dashboard-credits-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, DecimalPipe],
})
export class DashboardCreditsCardComponent {
  @Input() balance: number = 0;
  @Input() totalSpent: number = 0;
  @Input() transactions: CreditTransaction[] = [];
}
