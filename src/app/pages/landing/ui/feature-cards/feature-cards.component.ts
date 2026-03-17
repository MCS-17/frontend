import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatDemo } from '../chat-demo/chat-demo.component';

@Component({
  selector: 'app-feature-cards',
  imports: [NgOptimizedImage, ChatDemo],
  templateUrl: './feature-cards.component.html',
  styleUrl: './feature-cards.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  }
})
export class FeatureCards {}

