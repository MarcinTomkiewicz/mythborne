import { DerivedStatKey } from '../enums/derived-stat.enum';

export const BONUS_TARGETS = {
  Damage: DerivedStatKey.Damage,
  MinDamage: DerivedStatKey.MinDamage,
  MaxDamage: DerivedStatKey.MaxDamage,
  CriticalChance: DerivedStatKey.CriticalChance,
  CriticalDamage: DerivedStatKey.CriticalDamage,
  EvasionChance: DerivedStatKey.EvasionChance,
} as const;

export const COMBAT_ITEM_BONUS_TARGETS = {
  // No canonical hit/accuracy bonus target exists in the current DB dictionary.
  Hit: [],
  Critical: [BONUS_TARGETS.CriticalChance],
  CriticalDamage: [BONUS_TARGETS.CriticalDamage],
  Evasion: [BONUS_TARGETS.EvasionChance],
  Damage: [BONUS_TARGETS.Damage, BONUS_TARGETS.MinDamage, BONUS_TARGETS.MaxDamage],
} as const;
