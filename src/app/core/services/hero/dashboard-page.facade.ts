import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { BonusSource } from '../../domain/bonus/bonus.model';
import { IHeroDerived } from '../../types/hero.types';
import { OriginBonus, Origin } from '../../domain/origin/origin.model';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { Hero } from './hero';
import { Origins } from '../origins/origins';
import { StatsService } from '../stats/stats';
import { HeroDerivedStats } from './hero-derived-stats';
import { getErrorMessage } from '../../utils/error-message';

interface DerivedStatRow {
  key: string;
  label: string;
  value: number | string;
}

@Injectable()
export class DashboardPageFacade {
  private readonly heroService = inject(Hero);
  private readonly heroDerivedStats = inject(HeroDerivedStats);
  private readonly statsService = inject(StatsService);
  private readonly originsService = inject(Origins);

  heroName = signal('');
  level = signal(1);
  characterPoints = signal(0);
  readonly heroLevel = signal(1);
  experience = signal(0);
  totalExperienceEarned = signal(0);
  experienceToNextLevel = signal<number | null>(null);
  remainingExperience = signal<number | null>(null);
  experiencePercent = signal(0);
  isExperienceLoading = signal(false);
  experienceError = signal<string | null>(null);

  origin = signal<Origin | null>(null);
  originBonuses = signal<OriginBonus[]>([]);

  statsList = signal<IStat[]>([]);
  statsValues = signal<IHeroStats>({} as IHeroStats);
  derivedStatsList = signal<IStat[]>([]);
  derivedValues = signal<IHeroDerived>({} as IHeroDerived);

  statsDisplay = computed(() =>
    this.statsService.getFinalStats(this.statsValues(), [this.originBonusSource()], {
      heroLevel: this.heroLevel(),
    })
  );

  derivedDisplay = computed(() =>
    this.derivedValues()
  );

  derivedStatRows = computed<DerivedStatRow[]>(() => {
    const derived = this.derivedDisplay();

    return [
      { key: 'defense', label: 'DEF', value: derived.def },
      { key: 'damage', label: 'DMG', value: `${derived.minDmg} - ${derived.maxDmg}` },
      { key: 'luck', label: 'Luck', value: derived.luck },
      { key: 'critical_chance', label: 'Critical chance', value: derived.critical },
      { key: 'critical_damage', label: 'Critical damage', value: derived.criticalDamage },
      { key: 'evasion', label: 'Evasion', value: derived.evasion },
    ];
  });

  equipment = [
    { slot: 'Helmet', name: null, bonus: null },
    { slot: 'Weapon', name: null, bonus: null },
    { slot: 'Armor', name: null, bonus: null },
    { slot: 'Shield', name: null, bonus: null },
  ];

  loadData() {
    this.statsService.getStats().subscribe(this.statsList.set);
    this.statsService.getDerivedStats().subscribe(this.derivedStatsList.set);

    this.heroService.getHeroData().subscribe((hero) => {
      this.heroName.set(hero.name);
      this.level.set(hero.level ?? 1);
      this.characterPoints.set(hero.character_points ?? 0);
      this.heroLevel.set(hero.level ?? 1);
      this.experience.set(hero.experience ?? 0);
      this.totalExperienceEarned.set(hero.total_experience_earned ?? 0);

      if (hero.origin_id) {
        this.originsService
          .getOriginWithBonuses(hero.origin_id)
          .subscribe(({ origin, bonuses }) => {
            this.origin.set(origin);
            this.originBonuses.set(bonuses);
          });
      }
    });

    this.heroService.getHeroStats().subscribe(this.statsValues.set);
    this.heroDerivedStats
      .resolveActiveHeroDerivedStats()
      .subscribe(this.derivedValues.set);
    this.loadExperienceProgress();
  }

  private originBonusSource(): BonusSource {
    return {
      name: 'origin',
      bonuses: this.originBonuses().map((bonus) => ({
        target: bonus.target ?? '',
        value: bonus.baseValue,
        type: bonus.type,
        scope: bonus.scope,
        levelsStep: bonus.levelsStep,
        sourceStat: bonus.sourceStat,
        scalingFactor: bonus.scalingFactor,
      })),
    };
  }

  private loadExperienceProgress(): void {
    this.isExperienceLoading.set(true);
    this.experienceError.set(null);

    this.heroService
      .getHeroExperienceProgress()
      .pipe(finalize(() => this.isExperienceLoading.set(false)))
      .subscribe({
        next: (progress) => {
          this.level.set(progress.level);
          this.heroLevel.set(progress.level);
          this.experience.set(progress.currentExperience);
          this.totalExperienceEarned.set(progress.totalExperienceEarned);
          this.experienceToNextLevel.set(progress.experienceToNextLevel);
          this.remainingExperience.set(progress.remainingExperience);
          this.experiencePercent.set(progress.experiencePercent);
        },
        error: (error: unknown) => {
          this.experienceToNextLevel.set(null);
          this.remainingExperience.set(null);
          this.experiencePercent.set(0);
          this.experienceError.set(
            getErrorMessage(error, 'Experience threshold could not be calculated.'),
          );
        },
      });
  }
}

