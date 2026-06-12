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
import { sameSourceRef } from '../../../core/utils/source-ref';
import {
  MINIGAME_SOURCE_ENTITY_TYPE,
  MinigameCompletionEvent,
  MinigameSourceRef,
} from '../../components/minigame-host/minigame-host.model';

const ACTIVE_OFFER_REFRESH_INTERVAL_MS = 5000;
const PVP_ACTION_COPY_CONTRACT_ERROR = 'player.pvp.action copy unavailable';

@Injectable()
export class CombatPvpActionState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameCopy = inject(GameCopyService);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly requests = new RequestToken();
  private readonly sourceRef = signal<MinigameSourceRef | null>(null);
  private readonly completion = signal<MinigameCompletionEvent | null>(null);
  private readonly nowMs = signal(Date.now());
  private elapsedRefreshKey: string | null = null;
  private lastElapsedRefreshMs = 0;

  readonly copy = signal<PvpActionCopy | null>(null);
  readonly offer = signal<ActivePvpActionOffer | null>(null);
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly visibleOffer = computed(() => {
    const offer = this.currentSourceOffer();
    const completion = this.completion();

    return completion &&
      offer &&
      offer.pvpActionId === completion.sourceEntityId &&
      shouldShowActivePvpOffer(offer)
      ? offer
      : null;
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
    const offer = this.currentSourceOffer();

    if (
      !offer ||
      this.completion() ||
      offer.actionKind !== 'attack' ||
      !offer.isManualWindow ||
      offer.isResolved
    ) {
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
      const offer = this.currentSourceOffer();
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

    this.loadCopy();
  }

  setSourceRef(sourceRef: MinigameSourceRef | null): void {
    if (sameSourceRef(this.sourceRef(), sourceRef)) {
      return;
    }

    this.requests.next();
    this.sourceRef.set(sourceRef);
    this.completion.set(null);
    this.offer.set(null);
    this.error.set(null);
    this.elapsedRefreshKey = null;
    this.lastElapsedRefreshMs = 0;

    if (sourceRef?.sourceEntityType === MINIGAME_SOURCE_ENTITY_TYPE.pvpAction) {
      this.load();
    } else {
      this.isLoading.set(false);
    }
  }

  acceptCompletion(event: MinigameCompletionEvent): void {
    this.completion.set(event);
    this.load();
  }

  refresh(): void {
    this.load();
  }

  private load(): void {
    const sourceRef = this.sourceRef();

    if (sourceRef?.sourceEntityType !== MINIGAME_SOURCE_ENTITY_TYPE.pvpAction) {
      this.offer.set(null);
      this.error.set(null);
      this.isLoading.set(false);
      return;
    }

    const requestId = this.requests.next();
    const requestContextKey = activeHeroContextKey(this.activeHero.state());

    this.isLoading.set(true);
    this.error.set(null);

    if (!requestContextKey) {
      this.offer.set(null);
      this.error.set(this.copy()?.common.emptyValues.noData ?? null);
      this.isLoading.set(false);
      return;
    }

    this.playerPvp.getActivePvpActionOffer()
      .pipe(
        finalize(() => {
          if (this.isCurrentRequest(requestId, requestContextKey, sourceRef)) {
            this.isLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (offer) => {
          if (!this.isCurrentRequest(requestId, requestContextKey, sourceRef)) {
            return;
          }

          this.offer.set(offer?.pvpActionId === sourceRef.sourceEntityId ? offer : null);
        },
        error: (error: unknown) => {
          if (!this.isCurrentRequest(requestId, requestContextKey, sourceRef)) {
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
    this.gameCopy.getCopy('player.pvp.action', { locale: 'pl' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (copy) => this.copy.set(copy),
        error: () => this.error.set(this.copy()?.common.emptyValues.noData ?? PVP_ACTION_COPY_CONTRACT_ERROR),
      });
  }

  private currentSourceOffer(): ActivePvpActionOffer | null {
    const sourceRef = this.sourceRef();
    const offer = this.offer();

    return sourceRef &&
      offer &&
      sourceRef.sourceEntityType === MINIGAME_SOURCE_ENTITY_TYPE.pvpAction &&
      offer.pvpActionId === sourceRef.sourceEntityId
      ? offer
      : null;
  }

  private isCurrentRequest(
    requestId: number,
    contextKey: string,
    sourceRef: MinigameSourceRef,
  ): boolean {
    return this.requests.isCurrent(requestId) &&
      contextKey === activeHeroContextKey(this.activeHero.state()) &&
      sameSourceRef(this.sourceRef(), sourceRef);
  }
}
