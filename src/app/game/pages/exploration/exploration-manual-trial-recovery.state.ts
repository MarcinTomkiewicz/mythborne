import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, map, of, switchMap, tap } from 'rxjs';
import { activeHeroContextKey } from '../../../core/domain/hero/active-hero-context';
import {
  type ManualRuntimeManifest,
  type ManualTrialBackendVerdict,
  type ManualTrialRecoveryData,
  type TrialOffer,
} from '../../../core/domain/manual-trial/manual-trial-core.model';
import {
  manualTrialManifestMatchesOffer,
  manualTrialVerdictMatchesOffer,
} from '../../../core/domain/manual-trial/manual-trial-offer.guard';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ManualTrialFlow } from '../../../core/services/manual-trial/manual-trial-flow';
import { RequestToken } from '../../../core/utils/request-token';
import { MINIGAME_KEY } from '../../../core/domain/minigame/minigame-completion.model';

@Injectable()
export class ExplorationManualTrialRecoveryState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly flow = inject(ManualTrialFlow);
  private readonly offerRequest = new RequestToken();
  private readonly attemptId = signal<string | null>(null);
  private readonly manualSessionId = signal<string | null>(null);
  private activeScopeKey: string | null = null;

  readonly offer = signal<TrialOffer | null>(null);
  readonly manifest = signal<ManualRuntimeManifest | null>(null);
  readonly verdict = signal<ManualTrialBackendVerdict | null>(null);
  readonly workflowUnavailable = signal(false);
  readonly isOfferLoading = signal(false);
  readonly scopeKey = computed(() => {
    const heroContextKey = activeHeroContextKey(this.activeHero.state());
    const attemptId = this.attemptId();

    return heroContextKey && attemptId ? `${heroContextKey}:${attemptId}` : null;
  });
  readonly activeManualSessionId = computed(() => {
    const offer = this.offer();

    return offer?.minigameKey === MINIGAME_KEY.combat
      ? null
      : this.manualSessionId()
        ?? this.manifest()?.manualSessionId
        ?? offer?.existingManualSessionId
        ?? null;
  });
  readonly hasManualRuntimeSessionReference = computed(() =>
    Boolean(
      this.manualSessionId()
      || this.manifest()
      || this.offer()?.existingManualSessionId
      || this.offer()?.existingManifestId,
    ),
  );

  constructor() {
    effect(() => {
      const scopeKey = this.scopeKey();

      if (scopeKey === this.activeScopeKey) {
        return;
      }

      this.activeScopeKey = scopeKey;
      this.resetWorkflow();

      const heroContextKey = activeHeroContextKey(this.activeHero.state());
      const attemptId = this.attemptId();

      if (scopeKey && heroContextKey && attemptId) {
        this.loadOffer(heroContextKey, attemptId);
      }
    });
  }

  attachAttempt(attemptId: string): void {
    this.attemptId.set(attemptId);
  }

  detachAttempt(attemptId: string): void {
    if (this.attemptId() === attemptId) {
      this.attemptId.set(null);
    }
  }

  isCurrentScope(scopeKey: string, attemptId: string): boolean {
    return this.attemptId() === attemptId && this.scopeKey() === scopeKey;
  }

  beginAction(): void {
    this.workflowUnavailable.set(false);
  }

  acceptActionVerdict(
    verdict: ManualTrialBackendVerdict,
    offer: TrialOffer,
  ): boolean {
    if (!manualTrialVerdictMatchesOffer(verdict, offer)) {
      this.workflowUnavailable.set(true);
      return false;
    }

    this.acceptVerdict(verdict);

    return true;
  }

  markActionUnavailable(): void {
    this.workflowUnavailable.set(true);
  }

  private loadOffer(heroContextKey: string, attemptId: string): void {
    const scopeKey = `${heroContextKey}:${attemptId}`;
    const requestId = this.offerRequest.next();
    let loadedOffer: TrialOffer | null = null;

    this.isOfferLoading.set(true);
    this.flow.getActiveOffer()
      .pipe(
        tap((offer) => {
          loadedOffer = offer;

          if (
            offer?.attemptId === attemptId
            && this.isCurrent(requestId, scopeKey, attemptId)
          ) {
            this.offer.set(offer);
          }
        }),
        switchMap((offer) => this.selectRecoveryReads(offer, attemptId)),
        finalize(() => {
          if (this.isCurrent(requestId, scopeKey, attemptId)) {
            this.isOfferLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (recovery) => {
          if (!this.isCurrent(requestId, scopeKey, attemptId)) {
            return;
          }

          this.applyRecovery(recovery, attemptId);
        },
        error: () => {
          if (!this.isCurrent(requestId, scopeKey, attemptId)) {
            return;
          }

          this.acceptRecoveryError(loadedOffer, attemptId);
        },
      });
  }

  private selectRecoveryReads(
    offer: TrialOffer | null,
    attemptId: string,
  ): Observable<ManualTrialRecoveryData> {
    if (!offer || offer.attemptId !== attemptId) {
      return of({ offer, manifest: null, verdict: null });
    }

    if (offer.existingVerdictId) {
      return this.flow.getAttemptVerdict(attemptId).pipe(
        map((verdict) => ({ offer, manifest: null, verdict })),
      );
    }

    if (offer.existingManualSessionId && offer.minigameKey !== MINIGAME_KEY.combat) {
      return this.flow.getRuntimeManifest(offer.existingManualSessionId).pipe(
        map((manifest) => ({ offer, manifest, verdict: null })),
      );
    }

    return of({ offer, manifest: null, verdict: null });
  }

  private applyRecovery(
    recovery: ManualTrialRecoveryData,
    attemptId: string,
  ): void {
    const { offer, manifest, verdict } = recovery;

    if (!offer) {
      this.acceptNoOffer();
      return;
    }

    if (offer.attemptId !== attemptId) {
      this.acceptOfferMismatch();
      return;
    }

    this.offer.set(offer);

    if (offer.existingVerdictId) {
      this.acceptRecoveredVerdict(offer, verdict);
    } else if (offer.existingManualSessionId) {
      this.acceptRecoveredSession(offer, manifest);
    } else {
      this.acceptNeutralOffer();
    }
  }

  private acceptNoOffer(): void {
    this.offer.set(null);
    this.manifest.set(null);
    this.manualSessionId.set(null);
    this.workflowUnavailable.set(false);
  }

  private acceptOfferMismatch(): void {
    this.offer.set(null);
    this.manifest.set(null);
    this.manualSessionId.set(null);
    this.workflowUnavailable.set(true);
  }

  private acceptRecoveredVerdict(
    offer: TrialOffer,
    verdict: ManualTrialBackendVerdict | null,
  ): void {
    this.manifest.set(null);
    this.manualSessionId.set(null);

    if (!verdict || !manualTrialVerdictMatchesOffer(verdict, offer)) {
      this.workflowUnavailable.set(true);
      return;
    }

    this.acceptVerdict(verdict);
  }

  private acceptNeutralOffer(): void {
    this.manifest.set(null);
    this.manualSessionId.set(null);
    this.workflowUnavailable.set(false);
  }

  private acceptRecoveredSession(
    offer: TrialOffer,
    manifest: ManualRuntimeManifest | null,
  ): void {
    this.manifest.set(null);

    if (offer.minigameKey === MINIGAME_KEY.combat) {
      this.manualSessionId.set(null);
      this.workflowUnavailable.set(true);
      return;
    }

    this.manualSessionId.set(offer.existingManualSessionId);

    if (!manifest || !manualTrialManifestMatchesOffer(manifest, offer)) {
      this.workflowUnavailable.set(true);
      return;
    }

    this.manifest.set(manifest);
    this.workflowUnavailable.set(false);
  }

  private acceptRecoveryError(
    loadedOffer: TrialOffer | null,
    attemptId: string,
  ): void {
    if (loadedOffer?.attemptId === attemptId) {
      this.offer.set(loadedOffer);

      const recoverableSessionId = !loadedOffer.existingVerdictId
        && loadedOffer.existingManualSessionId
        && loadedOffer.minigameKey !== MINIGAME_KEY.combat
        ? loadedOffer.existingManualSessionId
        : null;

      this.manualSessionId.set(recoverableSessionId);
    } else {
      this.offer.set(null);
      this.manualSessionId.set(null);
    }

    this.manifest.set(null);
    this.workflowUnavailable.set(true);
  }

  private acceptVerdict(verdict: ManualTrialBackendVerdict): void {
    this.manifest.set(null);
    this.manualSessionId.set(null);
    this.workflowUnavailable.set(false);
    this.verdict.set(verdict);
  }

  private resetWorkflow(): void {
    this.offerRequest.next();
    this.offer.set(null);
    this.manifest.set(null);
    this.manualSessionId.set(null);
    this.verdict.set(null);
    this.workflowUnavailable.set(false);
    this.isOfferLoading.set(false);
  }

  private isCurrent(
    requestId: number,
    scopeKey: string,
    attemptId: string,
  ): boolean {
    return this.offerRequest.isCurrent(requestId)
      && this.isCurrentScope(scopeKey, attemptId);
  }
}
