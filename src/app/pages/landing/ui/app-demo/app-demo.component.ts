import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ChatbotCard } from '../chatbot-card/chatbot-card.component';
import { CodeSampleCard } from '../code-sample-card/code-sample-card.component';

type DemoMode = 'manual' | 'vibes';

@Component({
  selector: 'app-demo',
  imports: [CodeSampleCard, ChatbotCard],
  templateUrl: './app-demo.component.html',
  styleUrl: './app-demo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  }
})
export class AppDemo {
  protected readonly mode = signal<DemoMode>('manual');

  protected setMode(mode: DemoMode) {
    this.mode.set(mode);
  }
}

