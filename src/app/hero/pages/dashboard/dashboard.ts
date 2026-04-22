import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BonusSource } from '../../../core/domain/bonus/bonus.model';
import { IHeroDerived } from '../../../core/domain/hero/hero-derived.model';
import { OriginBonus, Origin } from '../../../core/domain/origin/origin.model';
import { IHeroStats } from '../../../core/interfaces/hero/i-hero-stats';
import { IStat } from '../../../core/interfaces/i-stats/i-stats';
import { Hero } from '../../../core/services/hero/hero';
import { Origins } from '../../../core/services/origins/origins';
import { StatsService } from '../../../core/services/stats/stats';
import { Bar } from '../../../shared/bar/bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Bar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly heroService = inject(Hero);
  private readonly statsService = inject(StatsService);
  private readonly originsService = inject(Origins);

  heroName = '';
  level = 1;
  experiencePercent = 0;

  origin = signal<Origin | null>(null);
  originBonuses = signal<OriginBonus[]>([]);
  derivedFull = signal<IHeroDerived | null>(null);

  statsList = signal<IStat[]>([]);
  statsValues = signal<IHeroStats>({} as IHeroStats);
  derivedStatsList = signal<IStat[]>([]);
  derivedValues = signal<IHeroDerived>({} as IHeroDerived);

  statsDisplay = computed(() =>
    this.statsService.getFinalStats(this.statsValues(), [this.originBonusSource()])
  );

  derivedDisplay = computed(() =>
    this.statsService.getFinalStats(this.derivedValues(), [this.originBonusSource()])
  );

  equipment = [
    { slot: 'Helmet', name: null, bonus: null },
    { slot: 'Weapon', name: null, bonus: null },
    { slot: 'Armor', name: null, bonus: null },
    { slot: 'Shield', name: null, bonus: null },
  ];

  ngOnInit() {
    this.statsService.getStats().subscribe(this.statsList.set);
    this.statsService.getDerivedStats().subscribe(this.derivedStatsList.set);

    this.heroService.getHeroData().subscribe((hero) => {
      this.heroName = hero.name;
      this.level = hero.level ?? 1;
      this.experiencePercent = this.calculateExperiencePercent(hero.experience);

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
    this.heroService.getHeroDerived().subscribe(this.derivedValues.set);
  }

  private calculateExperiencePercent(xp: number | null): number {
    if (!xp) {
      return 0;
    }

    const levelCap = 1000;
    return Math.min(Math.round((xp / levelCap) * 100), 100);
  }

  private originBonusSource(): BonusSource {
    return {
      name: 'origin',
      bonuses: this.originBonuses().map((bonus) => ({
        target: bonus.target ?? '',
        value: bonus.value,
        type: bonus.type,
      })),
    };
  }
}
