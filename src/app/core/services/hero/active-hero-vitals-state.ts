import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { getErrorMessage } from '../../utils/error-message';
import { Hero } from './hero';
import { ActiveHero } from './active-hero';
import { HeroHealthState } from './hero-health-state';

export interface ActiveHeroVitalsReadModel {
  heroId: string;
  currentHealth: number;
  maxHealth: number;
  level: number;
  currentExperience: number;
  totalExperienceEarned: number;
  experienceToNextLevel: number;
  remainingExperience: number;
  experiencePercent: number;
}

@Injectable({ providedIn: 'root' })
export class ActiveHeroVitalsState {
  private readonly activeHero = inject(ActiveHero);
  private readonly hero = inject(Hero);
  private readonly heroHealthState = inject(HeroHealthState);
  private readonly activeHeroState$ = toObservable(this.activeHero.state);
  private loadRequestId = 0;
  private loadingHeroId: string | null = null;

  private readonly _heroId = signal<string | null>(null);
  private readonly _vitals = signal<ActiveHeroVitalsReadModel | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly heroId = this._heroId.asReadonly();
  readonly vitals = this._vitals.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly currentHealth = computed(() => this._vitals()?.currentHealth ?? 0);
  readonly maxHealth = computed(() => this._vitals()?.maxHealth ?? 0);
  readonly level = computed(() => this._vitals()?.level ?? null);
  readonly currentExperience = computed(() => this._vitals()?.currentExperience ?? 0);
  readonly totalExperienceEarned = computed(() =>
    this._vitals()?.totalExperienceEarned ?? 0
  );
  readonly experienceToNextLevel = computed(() =>
    this._vitals()?.experienceToNextLevel ?? null
  );
  readonly remainingExperience = computed(() =>
    this._vitals()?.remainingExperience ?? null
  );
  readonly experiencePercent = computed(() => this._vitals()?.experiencePercent ?? 0);

  constructor() {
    this.activeHeroState$.subscribe((state) => {
      const heroId = state?.heroId ?? null;

      if (heroId !== this._heroId()) {
        this.resetForHero(heroId);
      }
    });
  }

  load(): void {
    const heroId = this.activeHero.state()?.heroId ?? null;

    if (!heroId) {
      this.resetForHero(null);
      return;
    }

    if (heroId !== this._heroId()) {
      this.resetForHero(heroId);
    }

    if (this.loadingHeroId === heroId || this._vitals()?.heroId === heroId) {
      return;
    }

    const requestId = ++this.loadRequestId;
    this.loadingHeroId = heroId;
    this._isLoading.set(true);
    this._error.set(null);

    forkJoin({
      health: this.heroHealthState.getHeroHealthState(heroId),
      experience: this.hero.getHeroExperienceProgress(),
    }).subscribe({
      next: ({ health, experience }) => {
        if (!this.acceptsResponse(requestId, heroId)) {
          return;
        }

        this._vitals.set({
          heroId,
          currentHealth: health.currentHealth,
          maxHealth: health.maxHealth,
          level: experience.level,
          currentExperience: experience.currentExperience,
          totalExperienceEarned: experience.totalExperienceEarned,
          experienceToNextLevel: experience.experienceToNextLevel,
          remainingExperience: experience.remainingExperience,
          experiencePercent: experience.experiencePercent,
        });
        this.loadingHeroId = null;
        this._isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsResponse(requestId, heroId)) {
          return;
        }

        this._vitals.set(null);
        this.loadingHeroId = null;
        this._isLoading.set(false);
        this._error.set(
          getErrorMessage(error, 'Active hero vitals could not be loaded.'),
        );
      },
    });
  }

  refresh(): void {
    this._vitals.set(null);
    this.load();
  }

  private resetForHero(heroId: string | null): void {
    this.loadRequestId++;
    this.loadingHeroId = null;
    this._heroId.set(heroId);
    this._vitals.set(null);
    this._isLoading.set(false);
    this._error.set(null);
  }

  private acceptsResponse(requestId: number, heroId: string): boolean {
    return (
      requestId === this.loadRequestId &&
      this._heroId() === heroId &&
      this.activeHero.state()?.heroId === heroId
    );
  }
}
