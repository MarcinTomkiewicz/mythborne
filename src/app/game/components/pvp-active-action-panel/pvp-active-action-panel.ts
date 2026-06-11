import { Component, input, output } from '@angular/core';
import type { PvpActiveActionFactRow } from '../../../core/domain/pvp/pvp-active-action-display.mapper';
import { ActivePvpActionOffer } from '../../../core/domain/pvp/pvp.model';
import type { PvpActiveActionPanelCopy } from '../../../core/types/pvp-active-action-ui.types';
import type { PendingTimerDisplay } from '../../../core/types/pending-timer.types';
import { formatPendingDurationLabel } from '../../../core/utils/pending-timer';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { PendingTimerOracle } from '../../../shared/pending-timer-oracle/pending-timer-oracle';

@Component({
  selector: 'app-pvp-active-action-panel',
  standalone: true,
  imports: [GameBar, PendingTimerOracle],
  host: { class: 'd-contents' },
  templateUrl: './pvp-active-action-panel.html',
})
export class PvpActiveActionPanel {
  readonly offer = input<ActivePvpActionOffer | null>(null);
  readonly copy = input.required<PvpActiveActionPanelCopy>();
  readonly timer = input.required<PendingTimerDisplay>();
  readonly factRows = input.required<readonly PvpActiveActionFactRow[]>();
  readonly helperText = input('');
  readonly pendingHelperText = input('');
  readonly isLoading = input(false);
  readonly isTimerReady = input(false);
  readonly refresh = output<void>();

  spyRemainingLabel(active: ActivePvpActionOffer): string {
    const timer = this.timer();

    if (timer.isCoherent) {
      return timer.countdownLabel;
    }

    return active.remainingSeconds !== null
      ? formatPendingDurationLabel(Math.max(0, active.remainingSeconds))
      : timer.remainingLabel;
  }
}
