import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppDemo } from '../app-demo/app-demo.component';

@Component({
  selector: 'app-feature-cards',
  imports: [NgOptimizedImage, AppDemo],
  templateUrl: './feature-cards.component.html',
  styleUrl: './feature-cards.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class FeatureCards {}

