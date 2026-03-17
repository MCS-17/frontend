import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TopNav } from './ui/top-nav/top-nav.component';
import { TrustedByRow } from './ui/trusted-by-row/trusted-by-row.component';
import { FeatureCards } from './ui/feature-cards/feature-cards.component';
import { Footer } from './ui/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  imports: [TopNav, TrustedByRow, FeatureCards, Footer],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class LandingPage {}

