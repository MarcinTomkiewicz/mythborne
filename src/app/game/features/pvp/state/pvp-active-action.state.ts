import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PVP_ACTIVE_ACTION_COPY } from '../../../../core/configs/pvp-active-action-ui.config';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import {
  pvpActiveActionErrorMessage,
  pvpActiveActionFactRows,
  pvpActiveActionHelperText,
  pvpActiveActionPendingHelperText,
  pvpActiveActionRefreshAt,
  pvpActiveActionTiming,
  shouldShowActivePvpOffer,
} from '../../../../core/domain/pvp/pvp-active-action-display.mapper';
import {
  ActivePvpActionOffer,
  PvpActionStartResult,
} from '../../../../core/domain/pvp/pvp.model';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import type {
  ExpectedPvpActiveActionOffer,
  PvpActiveActionStateCopy,
} from '../../../../core/types/pvp-active-action-ui.types';
import {
  pendingTimerDisplay,
  pendingTimerHasElapsed,
} from '../../../../core/utils/pending-timer';
import { RequestToken } from '../../../../core/utils/request-token';
import { PvpSpyReportState } from './pvp-spy-report.state';

const ELAPSED_REFRESH_INTERVAL_MS = 5000;

@Injectable()
export class PvpActiveActionState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly spyReport = inject(PvpSpyReportState);
  private readonly requests = new RequestToken();
  private readonly nowMs = signal(Date.now());
  private readonly errorLabel = signal('');
  private readonly copy = signal<PvpActiveActionStateCopy>(PVP_ACTIVE_ACTION_COPY.state);
  private elapsedRefreshKey: string | null = null;
  private lastElapsedRefreshMs = 0;
  private activeContextKey: string | null = null;

  readonly isLoading = signal(false);
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
  readonly factRows = computed(() => {
    const offer = this.visibleOffer();

    return offer ? pvpActiveActionFactRows(offer) : [];
  });
  readonly helperText = computed(() => {
    const offer = this.visibleOffer();

    return offer ? pvpActiveActionHelperText(offer) : '';
  });
  readonly pendingHelperText = computed(() => {
    const offer = this.visibleOffer();

    return offer ? pvpActiveActionPendingHelperText(offer) : '';
  });

  constructor() {
    const intervalId = setInterval(() => this.nowMs.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));

    effect(() => {
      const offer = this.visibleOffer();
      const nowMs = this.nowMs();
      const refreshAt = offer ? pvpActiveActionRefreshAt(offer) : null;

      if (
        !offer
        || !refreshAt
        || !pendingTimerHasElapsed({ resolvesAt: refreshAt, nowMs })
        || this.isLoading()
      ) {
        return;
      }

      const refreshKey = `${offer.pvpActionId}:${offer.phase}:${refreshAt}`;

      if (
        this.elapsedRefreshKey === refreshKey &&
        nowMs - this.lastElapsedRefreshMs < ELAPSED_REFRESH_INTERVAL_MS
      ) {
        return;
      }

      this.elapsedRefreshKey = refreshKey;
      this.lastElapsedRefreshMs = nowMs;
      queueMicrotask(() => {
        if (offer.actionKind === 'spy') {
          this.spyReport.prepare(offer);
          return;
        }

        this.load();
      });
    });
  }

  setCopy(copy: PvpActiveActionStateCopy): void {
    this.copy.set(copy);
    this.spyReport.setCopy(copy);
  }

  setGenericErrorLabel(label: string | null): void {
    this.errorLabel.set(label ?? '');
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
      this.error.set(this.copy().missingActiveHeroError);
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
            this.error.set(this.copy().startedSpyOfferMissingError);
            this.isLoading.set(false);
            return;
          }

          if (offer?.actionKind === 'spy' && offer.phase === 'returning') {
            this.setOffer(null);
            this.error.set(this.copy().spyReturningPhaseError);
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
}
