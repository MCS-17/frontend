import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

@Component({
  selector: 'app-chatbot-card',
  imports: [NgOptimizedImage],
  templateUrl: './chatbot-card.component.html',
  styleUrl: './chatbot-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  }
})
export class ChatbotCard {
  protected readonly placeholder = computed(() => 'Describe your goal and I’ll handle the SLURM details...');
}

