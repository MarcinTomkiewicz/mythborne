import { Component } from '@angular/core';
import { IHeroStats } from '../../../core/interfaces/hero/i-hero-stats';
import { CommonModule } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Bar } from '../../../shared/bar/bar';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Bar, FieldsetModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  heroName = 'Herakles';
  level = 2;
  experience = 52; // procentowo
  health = 100;

  stats: IHeroStats = {
    strength: 14,
    dexterity: 11,
    endurance: 13,
    agility: 12,
    cunning: 9,
    charisma: 10,
    wisdom: 8,
    intelligence: 12,
    spirituality: 7,
  };
  equipment = [
    {
      slot: 'Helmet',
      name: 'Bronze Helm',
      bonus: '+5 Defense'
    },
    {
      slot: 'Weapon',
      name: 'Bronze Spear',
      bonus: '+10 Attack'
    },
    {
      slot: 'Armor',
      name: 'Leather Cuirass',
      bonus: '+8 Defense'
    },
    {
      slot: 'Shield',
      name: 'Round Shield',
      bonus: '+6 Defense'
    }
  ];
}
