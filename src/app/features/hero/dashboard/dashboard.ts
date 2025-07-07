import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IHeroStats } from '../../../core/interfaces/hero/i-hero-stats';
import { CommonModule } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Bar } from '../../../shared/bar/bar';
import { StatsService } from '../../../core/services/stats/stats';
import { IStat } from '../../../core/interfaces/i-stats/i-stats';
import { Hero } from '../../../core/services/hero/hero';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Bar, FieldsetModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  heroName = 'Herakles';
  level = 2;
  experience = 52; // procentowo
  health = 100;

  private readonly heroService = inject(Hero);

  private statsService = inject(StatsService);

  statsList = signal<IStat[]>([]); // nazwy i kolejność
  statsValues = signal<IHeroStats>({
    strength: 14,
    dexterity: 11,
    endurance: 13,
    agility: 12,
    cunning: 9,
    charisma: 10,
    wisdom: 8,
    intelligence: 12,
    spirituality: 7,
  });

  statsDisplay = computed(() =>
    this.statsList().map((stat) => ({
      label: stat.label,
      value: this.statsValues()[stat.key as keyof IHeroStats] ?? '?',
    }))
  );

  ngOnInit() {
    this.statsService.getStats().subscribe((list) => this.statsList.set(list));

    this.heroService.getHeroData().subscribe((hero) => {
console.log('Hero data:', hero);

    });

    this.heroService.getHeroStats().subscribe((stats) => {
      this.statsValues.set(stats);
    });
  }

  equipment = [
    {
      slot: 'Helmet',
      name: 'Bronze Helm',
      bonus: '+5 Defense',
    },
    {
      slot: 'Weapon',
      name: 'Bronze Spear',
      bonus: '+10 Attack',
    },
    {
      slot: 'Armor',
      name: 'Leather Cuirass',
      bonus: '+8 Defense',
    },
    {
      slot: 'Shield',
      name: 'Round Shield',
      bonus: '+6 Defense',
    },
  ];
}
