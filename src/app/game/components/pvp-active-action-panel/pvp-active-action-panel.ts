import { Component, effect, input, output, signal } from '@angular/core';
import { CombatSurfaceDecisionDeadline } from '../../../core/domain/combat/combat-display.model';
import { CombatSourcePresentation } from '../../../core/domain/combat/combat-source-presentation.model';
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
import {
  isManualPvpCombatOffer,
  pvpCombatSourceRef,
} from '../../features/pvp/utils/pvp-combat-source-ref';
import { MinigameHost } from '../minigame-host/minigame-host';
import {
  MINIGAME_KEY,
  MinigameCompletionEvent,
  MinigameSourceRef,
} from '../minigame-host/minigame-host.model';
import { ReportDetailPreviewCard } from '../report-detail-preview-card/report-detail-preview-card';

@Component({
  selector: 'app-pvp-active-action-panel',
  standalone: true,
  imports: [GameBar, MinigameHost, PendingTimerOracle, ReportDetailPreviewCard],
  host: { class: 'd-contents' },
  templateUrl: './pvp-active-action-panel.html',
})
export class PvpActiveActionPanel {
  readonly offer = input<ActivePvpActionOffer | null>(null);
  readonly copy = input.required<PvpActionCopy>();
  readonly sourcePresentation = input<CombatSourcePresentation | null>(null);
  readonly timer = input.required<PendingTimerDisplay>();
  readonly factRows = input.required<readonly PvpActiveActionFactRow[]>();
  readonly isLoading = input(false);
  readonly isTimerReady = input(false);
  readonly renderCombatHost = input(false);
  readonly refresh = output<void>();
  readonly combatCompletion = signal<MinigameCompletionEvent | null>(null);
  private readonly completedActionId = signal<string | null>(null);

  readonly minigameKey = MINIGAME_KEY.combat;

  constructor() {
    effect(() => {
      const offerId = this.offer()?.pvpActionId ?? null;
      const completedActionId = this.completedActionId();

      if (offerId && completedActionId && offerId !== completedActionId) {
        this.combatCompletion.set(null);
        this.completedActionId.set(null);
      }
    });
  }

  acceptCombatCompletion(event: MinigameCompletionEvent): void {
    this.combatCompletion.set(event);
    this.completedActionId.set(this.offer()?.pvpActionId ?? null);
    this.refresh.emit();
  }

  combatSourceRef(active: ActivePvpActionOffer): MinigameSourceRef | null {
    return pvpCombatSourceRef(active);
  }

  combatDecisionDeadline(active: ActivePvpActionOffer): CombatSurfaceDecisionDeadline | null {
    if (!this.isManualAttackWindow(active)) {
      return null;
    }

    const timer = this.timer();

    return {
      label: this.copy().common.labels.decisionTime,
      countdownLabel: timer.countdownLabel,
      progressPercent: timer.isCoherent ? Math.max(0, 100 - timer.progressPercent) : 0,
      isUpdating: this.isLoading() || timer.isReady,
    };
  }

  isManualAttackWindow(active: ActivePvpActionOffer): boolean {
    return isManualPvpCombatOffer(active);
  }

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
