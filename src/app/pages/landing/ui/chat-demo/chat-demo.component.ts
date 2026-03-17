import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CodeSampleCard } from '../code-sample-card/code-sample-card.component';

type ChatMode = 'manual' | 'vibes';

@Component({
  selector: 'app-chat-demo',
  imports: [NgOptimizedImage, CodeSampleCard],
  templateUrl: './chat-demo.component.html',
  styleUrl: './chat-demo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  }
})
export class ChatDemo {
  protected readonly mode = signal<ChatMode>('manual');

  protected readonly placeholder = computed(() => {
    return this.mode() === 'manual'
      ? 'Create a SLURM .job script for an MPI program in C ...'
      : 'Describe your goal and I’ll handle the SLURM details...';
  });

  protected setMode(mode: ChatMode) {
    this.mode.set(mode);
  }
}

