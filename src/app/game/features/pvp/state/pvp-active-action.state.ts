import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import {
  isPvpAttackArrivalReady,
  pvpActiveActionErrorMessage,
  pvpActiveActionFactRows,
  pvpActiveActionTiming,
  shouldShowActivePvpOffer,
} from '../../../../core/domain/pvp/pvp-active-action-display.mapper';
import {
  ActivePvpActionOffer,
  PvpActionStartResult,
} from '../../../../core/domain/pvp/pvp.model';
import { PvpActionCopy } from '../../../../core/domain/pvp/pvp-action-copy.model';
import { GameCopyService } from '../../../../core/services/game-copy/game-copy.service';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import type {
  ExpectedPvpActiveActionOffer,
} from '../../../../core/types/pvp-active-action-ui.types';
import {
  pendingTimerDisplay,
  pendingTimerHasElapsed,
} from '../../../../core/utils/pending-timer';
import { pvpActionCopyKeyFallback } from '../../../../core/utils/pvp-action-copy-key-fallback';
import { RequestToken } from '../../../../core/utils/request-token';
import { PvpCombatCopyState } from './pvp-combat-copy.state';
import { PvpSpyReportState } from './pvp-spy-report.state';

@Injectable()
export class PvpActiveActionState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameCopy = inject(GameCopyService);
  private readonly combatCopy = inject(PvpCombatCopyState);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly spyReport = inject(PvpSpyReportState);
  private readonly requests = new RequestToken();
  private readonly nowMs = signal(Date.now());
  private readonly errorLabel = signal('');
  private activeContextKey: string | null = null;

  readonly isLoading = signal(false);
  readonly copy = signal<PvpActionCopy | null>(pvpActionCopyKeyFallback());
  readonly combatCommonCopy = this.combatCopy.combatCommonCopy;
  readonly pvpCombatCopy = this.combatCopy.pvpCombatCopy;
  readonly error = signal<string | null>(null);
  readonly offer = signal<ActivePvpActionOffer | null>(null);
  readonly visibleOffer = computed(() => {
    const offer = this.offer();

    return offer && shouldShowActivePvpOffer(offer) ? offer : null;
  });
  readonly hasBlockingAction = computed(
    () => !!this.visibleOffer()?.isBlockingRuntimeActivity,
  );
  readonly timer = computed(() => {
    const offer = this.visibleOffer();
    const timing = offer ? pvpActiveActionTiming(offer) : null;

    return pendingTimerDisplay({
      subjectId: offer?.runtimeActivityId ?? offer?.pvpActionId ?? null,
      startedAt: timing?.startedAt,
      resolvesAt: timing?.resolvesAt,
      nowMs: this.nowMs(),
      isLoading: this.isLoading(),
    });
  });
  readonly isTimerReady = computed(() => {
    const offer = this.visibleOffer();

    return !!offer && pendingTimerHasElapsed({
      resolvesAt: pvpActiveActionTiming(offer).resolvesAt,
      nowMs: this.nowMs(),
    });
  });
  readonly isAttackArrivalReady = computed(() => {
    const offer = this.visibleOffer();

    return !!offer && isPvpAttackArrivalReady(offer, this.nowMs());
  });
  readonly factRows = computed(() => {
    const offer = this.visibleOffer();
    const copy = this.copy();

    return offer && copy ? pvpActiveActionFactRows(offer, copy) : [];
  });
  readonly combatSourcePresentation = computed(() => {
    const copy = this.copy();

    return copy ? this.combatCopy.sourcePresentation(copy) : null;
  });

  constructor() {
    const intervalId = setInterval(() => this.nowMs.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));

    this.loadCopy();
  }

  setGenericErrorLabel(label: string | null): void {
    this.errorLabel.set(label ?? '');
    this.spyReport.setGenericErrorLabel(label);
  }

  load(): void {
    this.loadActiveOffer();
  }

  loadAfterStart(result: PvpActionStartResult): void {
    this.loadActiveOffer(result.actionKind === 'spy'
      ? { actionKind: result.actionKind, pvpActionId: result.pvpActionId }
      : undefined);
  }

  private loadActiveOffer(expected?: ExpectedPvpActiveActionOffer): void {
    const requestId = this.requests.next();
    const requestContextKey = activeHeroContextKey(this.activeHero.state());

    this.isLoading.set(true);
    this.error.set(null);

    if (!requestContextKey) {
      this.activeContextKey = null;
      this.spyReport.clear();
      this.setOffer(null);
      this.error.set(this.errorLabel());
      this.isLoading.set(false);
      return;
    }

    if (this.activeContextKey !== requestContextKey) {
      this.activeContextKey = requestContextKey;
      this.spyReport.clear();
    }

    this.playerPvp.getActivePvpActionOffer()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (offer) => {
          if (
            !this.requests.isCurrent(requestId)
            || requestContextKey !== activeHeroContextKey(this.activeHero.state())
          ) {
            return;
          }

          if (
            expected &&
            (!offer || offer.pvpActionId !== expected.pvpActionId || offer.actionKind !== expected.actionKind)
          ) {
            this.setOffer(offer);
            this.error.set(this.errorLabel());
            this.isLoading.set(false);
            return;
          }

          if (offer?.actionKind === 'spy' && offer.phase === 'returning') {
            this.setOffer(null);
            this.error.set(this.errorLabel());
            this.isLoading.set(false);
            return;
          }

          this.setOffer(offer);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          if (
            !this.requests.isCurrent(requestId)
            || requestContextKey !== activeHeroContextKey(this.activeHero.state())
          ) {
            return;
          }

          this.setOffer(null);
          this.error.set(pvpActiveActionErrorMessage(error, this.errorLabel()));
          this.isLoading.set(false);
        },
      });
  }

  private setOffer(offer: ActivePvpActionOffer | null): void {
    this.spyReport.clearIfActionChanged(offer?.pvpActionId ?? null);
    this.offer.set(offer);
  }

  private loadCopy(): void {
    this.gameCopy.getCopy('player.pvp.action', { locale: 'pl' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (copy) => {
          this.copy.set(copy);
          this.spyReport.setGenericErrorLabel(this.errorLabel());
        },
        error: () => {
          this.copy.set(pvpActionCopyKeyFallback());
          this.spyReport.setGenericErrorLabel(this.errorLabel());
        },
      });
  }
}
