import { Component, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [ProgressSpinnerModule],
  templateUrl: './loading-overlay.html',
})
export class LoadingOverlay {
  readonly visible = input(false);
  readonly label = input('Loading...');
  readonly description = input('');
}
