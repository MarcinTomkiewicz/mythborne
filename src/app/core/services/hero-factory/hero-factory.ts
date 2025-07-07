import { Injectable } from '@angular/core';
import { Insert } from '../../types/supabase.types';

@Injectable({ providedIn: 'root' })
export class HeroFactory {
  createStats(heroId: string): Insert<'hero_stats'>[] {
    const stats = [
      'strength',
      'dexterity',
      'endurance',
      'agility',
      'cunning',
      'charisma',
      'wisdom',
      'intelligence',
      'spirituality',
    ] as const;

    return stats.map((statKey) => ({
      hero_id: heroId,
      stat_key: statKey,
      value: 1,
    }));
  }

  createDerived(heroId: string): Insert<'hero_derived'> {
    return {
      hero_id: heroId,
      def: 10,
      min_dmg: 1,
      max_dmg: 2,
      luck: 0,
      critical: 0,
      evasion: 0,
      hp: 1000,
      health: 100,
    };
  }

  createResources(heroId: string): Insert<'hero_resources'>[] {
    return [
      { hero_id: heroId, resource_type: 'drachma', amount: 100, per_hour: 10 },
      {
        hero_id: heroId,
        resource_type: 'materials',
        amount: 100,
        per_hour: 10,
      },
      {
        hero_id: heroId,
        resource_type: 'workforce',
        amount: 100,
        per_hour: 10,
      },
    ];
  }
}
