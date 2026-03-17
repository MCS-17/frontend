import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-code-sample-card',
  imports: [NgOptimizedImage],
  templateUrl: './code-sample-card.component.html',
  styleUrl: './code-sample-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  }
})
export class CodeSampleCard {
  protected readonly lines = Array.from({ length: 14 }, (_, i) => i + 1);
}

