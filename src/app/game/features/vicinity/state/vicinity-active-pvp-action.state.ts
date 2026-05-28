import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { ActivePvpActionOffer } from '../../../../core/domain/pvp/pvp.model';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import {
  activeHeroContextKey,
  RequestToken,
} from '../../../../core/utils/request-token';
import { getErrorMessage } from '../../../../core/utils/error-message';
import {
  formatTimeOfDayLabel,
  pendingTimerDisplay,
  pendingTimerHasElapsed,
} from '../../../../core/utils/pending-timer';

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

    return offer && shouldShowOffer(offer) ? offer : null;
  });
  readonly hasBlockingAction = computed(
    () => !!this.visibleOffer()?.isBlockingRuntimeActivity,
  );
  readonly timer = computed(() => {
    const offer = this.visibleOffer();
    const resolvesAt = offer ? travelResolvesAt(offer) : null;

    return pendingTimerDisplay({
      subjectId: offer?.runtimeActivityId ?? offer?.pvpActionId ?? null,
      startedAt: offer?.startedAt,
      resolvesAt,
      nowMs: this.nowMs(),
      isLoading: this.isLoading(),
    });
  });
  readonly isTimerReady = computed(() => {
    const offer = this.visibleOffer();

    return !!offer && pendingTimerHasElapsed({
      resolvesAt: travelResolvesAt(offer),
      nowMs: this.nowMs(),
    });
  });
  readonly factRows = computed(() => {
    const offer = this.visibleOffer();

    if (!offer) {
      return [];
    }

    const rows: { label: string; value: string | null }[] = [
      { label: 'Akcja', value: offer.actionKindLabel },
      { label: 'Stan', value: offer.phaseLabel },
      { label: 'Cel', value: offer.targetHeroDisplayName },
      { label: 'Adres celu', value: offer.targetAddressLabel },
      { label: 'Twój adres', value: offer.attackerAddressLabel },
      { label: 'Dotarcie', value: arrivalTimeDisplay(offer) },
    ];

    return rows.filter(
      (row): row is { label: string; value: string } => row.value !== null,
    );
  });
  readonly helperText = computed(() => {
    const offer = this.visibleOffer();

    if (!offer) {
      return '';
    }

    if (offer.actionKind === 'attack') {
      return offer.isManualWindow
        ? 'Atak dotarł do celu. Decyzję manual/auto podejmiesz w module walki.'
        : 'Po dotarciu walka otworzy się albo będzie kontynuowana poza wyborem celów.';
    }

    return offer.isManualWindow
      ? 'Szpiegowanie dotarło do celu. Wynik należy do przepływu raportów/wyników poza tym ekranem.'
      : 'Po zakończeniu szpiegowania wynik będzie obsługiwany w przepływie raportów/wyników.';
  });
  readonly pendingHelperText = computed(() => {
    const offer = this.visibleOffer();

    if (!offer) {
      return '';
    }

    return offer.actionKind === 'attack'
      ? 'Atak jest w drodze do wskazanej posiadłości.'
      : 'Szpieg jest w drodze do wskazanej posiadłości.';
  });

  constructor() {
    const intervalId = setInterval(() => this.nowMs.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));

    effect(() => {
      const offer = this.visibleOffer();
      const nowMs = this.nowMs();
      const refreshAt = offer ? elapsedRefreshAt(offer) : null;

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
        this.error.set(getErrorMessage(error, 'Nie udało się wczytać aktywnej akcji PvP.'));
        this.isLoading.set(false);
      },
    });
  }
}

function shouldShowOffer(offer: ActivePvpActionOffer): boolean {
  return !offer.isResolved
    && (
      offer.isTravelPhase
      || offer.isManualWindow
      || offer.isBlockingRuntimeActivity
    );
}

function travelResolvesAt(offer: ActivePvpActionOffer): string | null {
  return offer.arrivesAt ?? offer.availableAt;
}

function manualDeadlineResolvesAt(offer: ActivePvpActionOffer): string | null {
  return offer.manualDeadlineAt ?? offer.expiresAt;
}

function elapsedRefreshAt(offer: ActivePvpActionOffer): string | null {
  if (offer.isTravelPhase) {
    return travelResolvesAt(offer);
  }

  if (offer.isManualWindow) {
    return manualDeadlineResolvesAt(offer);
  }

  return null;
}

function arrivalTimeDisplay(offer: ActivePvpActionOffer): string | null {
  const value = offer.arrivesAt ?? offer.availableAt;

  if (!value) {
    return null;
  }

  return formatTimeOfDayLabel(value);
}
