import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { ActivePvpActionOffer } from '../../../../core/domain/pvp/pvp.model';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import { RequestToken } from '../../../../core/utils/request-token';
import {
  pendingTimerDisplay,
  pendingTimerHasElapsed,
} from '../../../../core/utils/pending-timer';
import {
  pvpActiveActionErrorMessage,
  pvpActiveActionFactRows,
  pvpActiveActionHelperText,
  pvpActiveActionPendingHelperText,
  pvpActiveActionRefreshAt,
  pvpActiveActionTiming,
  shouldShowActivePvpOffer,
} from '../../../../core/domain/pvp/pvp-active-action-display.mapper';

const ELAPSED_REFRESH_INTERVAL_MS = 5000;

@Injectable()
export class VicinityActivePvpActionState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly requests = new RequestToken();
  private readonly nowMs = signal(Date.now());
  private elapsedRefreshKey: string | null = null;
  private lastElapsedRefreshMs = 0;

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

    if (!offer) {
      return [];
    }

    return pvpActiveActionFactRows(offer);
  });
  readonly helperText = computed(() => {
    const offer = this.visibleOffer();

    if (!offer) {
      return '';
    }

    return pvpActiveActionHelperText(offer);
  });
  readonly pendingHelperText = computed(() => {
    const offer = this.visibleOffer();

    if (!offer) {
      return '';
    }

    return pvpActiveActionPendingHelperText(offer);
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
      queueMicrotask(() => this.load());
    });
  }

  load(): void {
    const requestId = this.requests.next();
    const requestContextKey = activeHeroContextKey(this.activeHero.state());

    this.isLoading.set(true);
    this.error.set(null);

    if (!requestContextKey) {
      this.offer.set(null);
      this.error.set('Brak aktywnego bohatera do wczytania aktywnej akcji PvP.');
      this.isLoading.set(false);
      return;
    }

    this.playerPvp.getActivePvpActionOffer().subscribe({
      next: (offer) => {
        if (
          !this.requests.isCurrent(requestId)
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.offer.set(offer);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (
          !this.requests.isCurrent(requestId)
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.offer.set(null);
        this.error.set(pvpActiveActionErrorMessage(
          error,
          'Nie udało się wczytać aktywnego stanu PvP.',
        ));
        this.isLoading.set(false);
      },
    });
  }
}
