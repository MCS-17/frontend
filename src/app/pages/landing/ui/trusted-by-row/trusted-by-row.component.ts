import { ChangeDetectionStrategy, Component } from '@angular/core';

type TrustedItem = { code: string; label: string };

@Component({
  selector: 'app-trusted-by-row',
  templateUrl: './trusted-by-row.component.html',
  styleUrl: './trusted-by-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  }
})
export class TrustedByRow {
  protected readonly items: TrustedItem[] = [
    { code: 'FIT3143', label: 'Parallel Computing' },
    { code: 'FIT3181', label: 'Deep Learning' },
    { code: 'FIT3161 & FIT3163', label: 'Computer Science Project 1 & 2' },
    { code: 'FIT3162 & FIT3164', label: 'Data Science Project 1 & 2' }
  ];
}

