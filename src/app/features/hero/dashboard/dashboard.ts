import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Bar } from '../../../shared/bar/bar';

import { StatsService } from '../../../core/services/stats/stats';
import { IStat } from '../../../core/interfaces/i-stats/i-stats';
import { IHeroStats } from '../../../core/interfaces/hero/i-hero-stats';
import { Hero } from '../../../core/services/hero/hero';
import { Origins } from '../../../core/services/origins/origins';
import { Origin } from '../../../core/domain/origin/origin.model';
import { IHeroDerived } from '../../../core/domain/hero/hero-derived.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Bar, FieldsetModule],
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
  developmentPoints = 0;

  origin = signal<Origin | null>(null);
  derived = signal<IHeroDerived | null>(null);

  statsList = signal<IStat[]>([]);
  statsValues = signal<IHeroStats>({} as IHeroStats);

  statsDisplay = computed(() =>
    this.statsList().map((stat) => ({
      label: stat.label,
      value: this.statsValues()[stat.key as keyof IHeroStats] ?? '?',
    }))
  );

  equipment = [
    {
      slot: 'Helmet',
      name: null,
      bonus: null,
    },
    {
      slot: 'Weapon',
      name: null,
      bonus: null,
    },
    {
      slot: 'Armor',
      name: null,
      bonus: null,
    },
    {
      slot: 'Shield',
      name: null,
      bonus: null,
    },
  ];

  ngOnInit() {
    // Pobranie stat labels
    this.statsService.getStats().subscribe((list) => this.statsList.set(list));

    // Pobranie hero danych podstawowych
    this.heroService.getHeroData().subscribe((hero) => {
      this.heroName = hero.name;
      this.level = hero.level ?? 1;
      this.experiencePercent = this.calculateExperiencePercent(hero.experience);

      if (hero.origin_id) {
        this.originsService
          .getOriginWithBonuses(hero.origin_id)
          .subscribe(({ origin }) => {
            this.origin.set(origin);
            console.log('[Dashboard] Origin loaded:', origin);
            
          });
      }
    });

    // Statystyki
    this.heroService.getHeroStats().subscribe((stats) => {
      this.statsValues.set(stats);
    });

    // Derived stats
    this.heroService.getHeroDerived().subscribe((derived) => {
      this.derived.set(derived);
      this.developmentPoints = this.derived()?.hp ?? 0;
    });
  }

  private calculateExperiencePercent(xp: number | null): number {
    if (!xp) return 0;
    // TODO: podmień, jeśli masz inne wyliczanie poziomu
    const levelCap = 1000; // np. stały próg lub pobrany z configu
    return Math.min(Math.round((xp / levelCap) * 100), 100);
  }
}
