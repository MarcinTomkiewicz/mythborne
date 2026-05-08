import { DerivedStatKey } from '../enums/derived-stat.enum';
import { BonusScope } from '../types/bonus.types';

export const DEFAULT_DERIVED_STAT_SCOPE: BonusScope = 'global';

export const DERIVED_STAT_SCOPE_CHAIN: Record<BonusScope, readonly BonusScope[]> = {
  global: ['global'],
  combat: ['global', 'combat'],
  pvp_attack: ['global', 'combat', 'pvp_attack'],
  pvp_defense: ['global', 'combat', 'pvp_defense'],
  trial: ['global', 'trial'],
  exploration: ['global', 'exploration'],
  requirements: ['global', 'requirements'],
  trade: ['global', 'trade'],
  auction: ['global', 'trade', 'auction'],
  economy: ['global', 'economy'],
  building_management: ['global', 'building_management'],
};

export const DERIVED_STAT_CHANCE_TARGETS: readonly DerivedStatKey[] = [
  DerivedStatKey.CriticalChance,
  DerivedStatKey.EvasionChance,
] as const;

export const BASE_CRITICAL_DAMAGE_PERCENT = 50;

export const TRANSITIONAL_BASE_WEAPON_DAMAGE = {
  min: 1,
  max: 3,
} as const;

export const TRANSITIONAL_HEALTH_FALLBACK = {
  base: 80,
  enduranceMultiplier: 8,
} as const;
