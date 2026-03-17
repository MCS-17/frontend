import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeSampleCard } from '../code-sample-card/code-sample-card.component';

@Component({
  selector: 'app-feature-cards',
  imports: [NgOptimizedImage, CodeSampleCard],
  templateUrl: './feature-cards.component.html',
  styleUrl: './feature-cards.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  }
})
export class FeatureCards {}

