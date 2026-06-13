import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CombatSurfaceDecisionDeadline } from '../../../core/domain/combat/combat-display.model';
import { activeHeroContextKey } from '../../../core/domain/hero/active-hero-context';
import {
  pvpActiveActionErrorMessage,
  pvpActiveActionFactRows,
  pvpActiveActionManualDecisionDeadlineAt,
  pvpActiveActionRefreshAt,
  pvpActiveActionTiming,
  shouldShowActivePvpOffer,
} from '../../../core/domain/pvp/pvp-active-action-display.mapper';
import { PvpActionCopy } from '../../../core/domain/pvp/pvp-action-copy.model';
import { ActivePvpActionOffer } from '../../../core/domain/pvp/pvp.model';
import { GameCopyService } from '../../../core/services/game-copy/game-copy.service';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../core/services/pvp/player-pvp';
import {
  pendingTimerDisplay,
  pendingTimerHasElapsed,
} from '../../../core/utils/pending-timer';
import { RequestToken } from '../../../core/utils/request-token';
import { MinigameSourceRef } from '../../components/minigame-host/minigame-host.model';
import {
  isManualPvpCombatOffer,
  pvpCombatSourceRef,
} from '../../features/pvp/utils/pvp-combat-source-ref';

const ACTIVE_OFFER_REFRESH_INTERVAL_MS = 5000;

@Injectable()
export class PvpCombatActionState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameCopy = inject(GameCopyService);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly requests = new RequestToken();
  private readonly nowMs = signal(Date.now());
  private elapsedRefreshKey: string | null = null;
  private lastElapsedRefreshMs = 0;
  private activeContextKey: string | null = null;

  readonly copy = signal<PvpActionCopy | null>(null);
  readonly offer = signal<ActivePvpActionOffer | null>(null);
  readonly error = signal<string | null>(null);
  readonly hasCopyLoadError = signal(false);
  private readonly isOfferLoading = signal(false);
  private readonly isCopyLoading = signal(false);
  readonly isLoading = computed(() => this.isOfferLoading() || this.isCopyLoading());
  readonly visibleOffer = computed(() => {
    const offer = this.offer();

    return offer && shouldShowActivePvpOffer(offer) ? offer : null;
  });
  readonly combatOffer = computed(() => {
    const offer = this.offer();

    return isManualPvpCombatOffer(offer) ? offer : null;
  });
  readonly combatSourceRef = computed<MinigameSourceRef | null>(() => {
    return pvpCombatSourceRef(this.combatOffer());
  });
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
    const copy = this.copy();

    return offer && copy ? pvpActiveActionFactRows(offer, copy) : [];
  });
  readonly decisionDeadline = computed<CombatSurfaceDecisionDeadline | null>(() => {
    const offer = this.combatOffer();

    if (!offer) {
      return null;
    }

    const resolvesAt = pvpActiveActionManualDecisionDeadlineAt(offer);

    if (!resolvesAt) {
      return null;
    }

    const timer = pendingTimerDisplay({
      subjectId: offer.pvpActionId,
      startedAt: pvpActiveActionTiming(offer).startedAt,
      resolvesAt,
      nowMs: this.nowMs(),
      isLoading: this.isLoading(),
    });

    return {
      label: this.copy()?.common.labels.decisionTime ?? '',
      countdownLabel: timer.countdownLabel,
      progressPercent: timer.isCoherent ? Math.max(0, 100 - timer.progressPercent) : 0,
      isUpdating: this.isLoading() || timer.isReady,
    };
  });

  constructor() {
    const intervalId = setInterval(() => this.nowMs.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));

    effect(() => {
      const offer = this.offer();
      const nowMs = this.nowMs();
      const refreshAt = offer ? pvpActiveActionRefreshAt(offer) : null;

      if (
        !offer ||
        !refreshAt ||
        !pendingTimerHasElapsed({ resolvesAt: refreshAt, nowMs }) ||
        this.isLoading()
      ) {
        return;
      }

      const refreshKey = `${offer.pvpActionId}:${offer.phase}:${refreshAt}`;

      if (
        this.elapsedRefreshKey === refreshKey &&
        nowMs - this.lastElapsedRefreshMs < ACTIVE_OFFER_REFRESH_INTERVAL_MS
      ) {
        return;
      }

      this.elapsedRefreshKey = refreshKey;
      this.lastElapsedRefreshMs = nowMs;
      queueMicrotask(() => this.load());
    });
    effect(() => {
      const contextKey = activeHeroContextKey(this.activeHero.state());

      if (contextKey === this.activeContextKey) {
        return;
      }

      this.activeContextKey = contextKey;
      this.requests.next();
      this.offer.set(null);
      this.error.set(null);
      this.elapsedRefreshKey = null;
      this.lastElapsedRefreshMs = 0;

      if (contextKey) {
        queueMicrotask(() => this.load());
      } else {
        this.isOfferLoading.set(false);
      }
    });
    this.loadCopy();
  }

  refresh(): void {
    this.load();
  }

  private load(): void {
    const requestId = this.requests.next();
    const requestContextKey = activeHeroContextKey(this.activeHero.state());

    this.isOfferLoading.set(true);
    this.error.set(null);

    if (!requestContextKey) {
      this.offer.set(null);
      this.error.set(this.copy()?.common.emptyValues.noData ?? null);
      this.isOfferLoading.set(false);
      return;
    }

    this.playerPvp.getActivePvpActionOffer()
      .pipe(
        finalize(() => {
          if (this.isCurrentRequest(requestId, requestContextKey)) {
            this.isOfferLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (offer) => {
          if (!this.isCurrentRequest(requestId, requestContextKey)) {
            return;
          }

          this.offer.set(offer ?? null);
        },
        error: (error: unknown) => {
          if (!this.isCurrentRequest(requestId, requestContextKey)) {
            return;
          }

          this.offer.set(null);
          this.error.set(pvpActiveActionErrorMessage(
            error,
            this.copy()?.common.emptyValues.noData ?? '',
          ));
        },
      });
  }

  private loadCopy(): void {
    this.hasCopyLoadError.set(false);
    this.isCopyLoading.set(true);
    this.gameCopy.getCopy('player.pvp.action', { locale: 'pl' })
      .pipe(
        finalize(() => this.isCopyLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (copy) => {
          this.copy.set(copy);
          this.hasCopyLoadError.set(false);
        },
        error: () => this.hasCopyLoadError.set(true),
      });
  }

  private isCurrentRequest(
    requestId: number,
    contextKey: string,
  ): boolean {
    return this.requests.isCurrent(requestId) &&
      contextKey === activeHeroContextKey(this.activeHero.state());
  }
}
