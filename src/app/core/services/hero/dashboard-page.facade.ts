import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  CharacterPointHistoryReadModel,
  IHeroDerived,
} from '../../types/hero.types';
import { Origin } from '../../domain/origin/origin.model';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { Hero } from './hero';
import { Origins } from '../origins/origins';
import { StatsService } from '../stats/stats';
import { getErrorMessage } from '../../utils/error-message';
import { CharacterPointHistory } from './character-point-history';
import {
  HeroDashboardRuntimeStats,
  HeroDashboardRuntimeStatsReadModel,
  HeroRuntimeDamageRow,
} from './hero-dashboard-runtime-stats';

interface DerivedStatRow {
  key: string;
  label: string;
  value: number | string;
  damageRows: HeroRuntimeDamageRow[];
}

@Injectable()
export class DashboardPageFacade {
  private readonly heroService = inject(Hero);
  private readonly runtimeStatsService = inject(HeroDashboardRuntimeStats);
  private readonly characterPointHistory = inject(CharacterPointHistory);
  private readonly statsService = inject(StatsService);
  private readonly originsService = inject(Origins);

  heroName = signal('');
  level = signal(1);
  characterPoints = signal(0);
  totalCharacterPointsEarned = signal(0);
  readonly heroLevel = signal(1);
  experience = signal(0);
  totalExperienceEarned = signal(0);
  experienceToNextLevel = signal<number | null>(null);
  remainingExperience = signal<number | null>(null);
  experiencePercent = signal(0);
  isExperienceLoading = signal(false);
  experienceError = signal<string | null>(null);

  origin = signal<Origin | null>(null);

  statsList = signal<IStat[]>([]);
  runtimeStats = signal<HeroDashboardRuntimeStatsReadModel | null>(null);
  runtimeStatsError = signal<string | null>(null);
  characterPointHistoryEntries = signal<CharacterPointHistoryReadModel[]>([]);
  characterPointHistoryError = signal<string | null>(null);

  statsDisplay = computed(() =>
    this.runtimeStats()?.stats ?? {}
  );

  derivedDisplay = computed(() =>
    toDerivedDisplay(this.runtimeStats())
  );

  derivedStatRows = computed<DerivedStatRow[]>(() => {
    const runtime = this.runtimeStats();

    return [
      {
        key: 'damage',
        label: 'Damage',
        value: runtime?.damageRows.length ? '' : 'No attack sources returned',
        damageRows: runtime?.damageRows ?? [],
      },
      row('defense', 'Defense', runtime?.defense ?? 0),
      row('luck', 'Luck', runtime?.luck ?? 0),
      row(
        'critical_chance',
        'Critical chance',
        percentValue(runtime?.criticalChanceBonus ?? 0),
      ),
      row(
        'critical_damage',
        'Critical damage',
        percentValue(runtime?.criticalDamage ?? 0),
      ),
      row(
        'evasion',
        'Evasion',
        percentValue(runtime?.evasionChanceBonus ?? 0),
      ),
      row('attack_count', 'Attack count', runtime?.attackCount ?? 0),
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

    this.heroService.getHeroData().subscribe((hero) => {
      this.heroName.set(hero.name);
      this.level.set(hero.level ?? 1);
      this.characterPoints.set(hero.character_points ?? 0);
      this.totalCharacterPointsEarned.set(hero.total_character_points_earned ?? 0);
      this.heroLevel.set(hero.level ?? 1);
      this.experience.set(hero.experience ?? 0);
      this.totalExperienceEarned.set(hero.total_experience_earned ?? 0);

      if (hero.origin_id) {
        this.originsService
          .getOriginWithBonuses(hero.origin_id)
          .subscribe(({ origin }) => {
            this.origin.set(origin);
          });
      }
    });

    this.loadRuntimeStats();
    this.loadCharacterPointHistory();
    this.loadExperienceProgress();
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

  private loadCharacterPointHistory(): void {
    this.characterPointHistoryError.set(null);

    this.characterPointHistory
      .getActiveHeroHistory({ limit: 5 })
      .subscribe({
        next: (entries) => this.characterPointHistoryEntries.set(entries),
        error: (error: unknown) => {
          this.characterPointHistoryEntries.set([]);
          this.characterPointHistoryError.set(
            getErrorMessage(error, 'Character Points history could not be loaded.'),
          );
        },
      });
  }

  private loadRuntimeStats(): void {
    this.runtimeStatsError.set(null);

    this.runtimeStatsService.getActiveHeroRuntimeStats().subscribe({
      next: (stats) => this.runtimeStats.set(stats),
      error: (error: unknown) => {
        this.runtimeStats.set(null);
        this.runtimeStatsError.set(
          getErrorMessage(error, 'Dashboard runtime stats could not be loaded.'),
        );
      },
    });
  }
}

function row(
  key: string,
  label: string,
  value: number | string,
): DerivedStatRow {
  return {
    key,
    label,
    value,
    damageRows: [],
  };
}

function percentValue(value: number): string {
  return `${value}%`;
}

function toDerivedDisplay(
  runtime: HeroDashboardRuntimeStatsReadModel | null,
): IHeroDerived {
  return {
    health: runtime?.maxHealth ?? 0,
    def: runtime?.defense ?? 0,
    minDmg: 0,
    maxDmg: 0,
    luck: runtime?.luck ?? 0,
    critical: runtime?.criticalChanceBonus ?? 0,
    criticalDamage: runtime?.criticalDamage ?? 0,
    evasion: runtime?.evasionChanceBonus ?? 0,
  };
}
