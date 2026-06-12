import { Component, input, output } from '@angular/core';
import {
  pvpActiveActionAriaLabel,
  pvpActiveActionKindLabel,
  pvpActiveActionPhaseText,
  pvpActiveActionTitle,
  PvpActiveActionFactRow,
} from '../../../core/domain/pvp/pvp-active-action-display.mapper';
import { PvpActionCopy } from '../../../core/domain/pvp/pvp-action-copy.model';
import { ActivePvpActionOffer } from '../../../core/domain/pvp/pvp.model';
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
  readonly copy = input.required<PvpActionCopy>();
  readonly timer = input.required<PendingTimerDisplay>();
  readonly factRows = input.required<readonly PvpActiveActionFactRow[]>();
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

  title(active: ActivePvpActionOffer): string {
    return pvpActiveActionTitle(active, this.copy());
  }

  ariaLabel(active: ActivePvpActionOffer): string {
    return pvpActiveActionAriaLabel(active, this.copy());
  }

  phaseText(active: ActivePvpActionOffer): string {
    return pvpActiveActionPhaseText(active, this.copy());
  }

  actionKindLabel(active: ActivePvpActionOffer): string {
    return pvpActiveActionKindLabel(active, this.copy());
  }

  timeLabel(active: ActivePvpActionOffer): string {
    const copy = this.copy().activeAction.time;

    if (active.isManualWindow) {
      return copy.decisionWindowLabel;
    }

    if (active.actionKind === 'spy') {
      return copy.spyTravelLabel;
    }

    return active.phase === 'returning'
      ? copy.returnTravelLabel
      : copy.attackTravelLabel;
  }
}
