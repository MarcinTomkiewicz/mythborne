import { Injectable } from '@angular/core';
import { CombatantSnapshot } from '../../domain/combat/combat.model';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';

const DEMO_BASE_STATS: IHeroStats = {
  strength: 8,
  dexterity: 7,
  endurance: 9,
  agility: 6,
  cunning: 7,
  charisma: 5,
  wisdom: 6,
  intelligence: 6,
  spirituality: 5,
};

@Injectable({ providedIn: 'root' })
export class CombatDemoFactoryService {
  createOpponent(heroLevel = 1): CombatantSnapshot {
    const level = Math.max(1, Math.min(3, heroLevel));
    const baseStats = { ...DEMO_BASE_STATS };
    const minDmg = 3 + Math.floor((baseStats.strength + baseStats.dexterity) / 4);
    const maxDmg = minDmg + 4 + Math.floor(baseStats.cunning / 3);

    return {
      key: 'training-hoplite',
      name: 'Training Hoplite',
      level,
      baseStats,
      derived: {
        health: 45 + baseStats.endurance * 4 + baseStats.agility,
        def: 1 + Math.floor(baseStats.endurance / 2) + Math.floor(baseStats.agility / 3),
        luck: 6,
        minDmg,
        maxDmg,
        critical: Math.min(30, 4 + Math.floor(baseStats.cunning / 2)),
        evasion: Math.min(30, 3 + Math.floor(baseStats.agility / 2)),
      },
      bonuses: {
        hitBonusFromItems: 0,
        critBonusFromItems: 0,
        evasionBonusFromItems: 0,
        damageBonusFromItems: 0,
      },
    };
  }
}
