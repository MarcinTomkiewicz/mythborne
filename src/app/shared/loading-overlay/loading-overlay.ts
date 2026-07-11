import { Component, computed, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import type { LoadingOverlayCopyEditTargets } from '../../core/interfaces/loading-overlay.interface';
import { GameCopyEditTrigger } from '../game-copy-edit-trigger/game-copy-edit-trigger';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [GameCopyEditTrigger, ProgressSpinnerModule],
  templateUrl: './loading-overlay.html',
})
export class LoadingOverlay {
  readonly visible = input(false);
  readonly label = input('');
  readonly description = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly copyEditTargets = input<LoadingOverlayCopyEditTargets | null>(null);
  readonly effectiveAriaLabel = computed(() =>
    this.ariaLabel()?.trim()
    || this.label().trim()
    || this.description().trim()
    || 'Loading',
  );
}
