import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  imports: [RouterLink],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class TopNav {}

