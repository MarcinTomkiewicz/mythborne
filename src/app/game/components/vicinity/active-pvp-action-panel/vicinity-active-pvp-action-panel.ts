import { Component, input } from '@angular/core';
import { ActivePvpActionOffer } from '../../../../core/domain/pvp/pvp.model';
import type { PendingTimerDisplay } from '../../../../core/types/pending-timer.types';
import { PendingTimerOracle } from '../../../../shared/pending-timer-oracle/pending-timer-oracle';

@Component({
  selector: 'app-vicinity-active-pvp-action-panel',
  standalone: true,
  imports: [PendingTimerOracle],
  host: { class: 'd-contents' },
  templateUrl: './vicinity-active-pvp-action-panel.html',
})
export class VicinityActivePvpActionPanel {
  readonly offer = input<ActivePvpActionOffer | null>(null);
  readonly timer = input.required<PendingTimerDisplay>();
  readonly factRows = input.required<readonly { label: string; value: string }[]>();
  readonly helperText = input('');
  readonly pendingHelperText = input('');
  readonly isLoading = input(false);
}
