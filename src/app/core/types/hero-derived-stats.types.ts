import { Row } from './supabase.types';
import { DerivedStatKey } from '../enums/derived-stat.enum';

export type RuntimeDerivedStatKey =
  | DerivedStatKey.Health
  | DerivedStatKey.Defense
  | DerivedStatKey.MinDamage
  | DerivedStatKey.MaxDamage
  | DerivedStatKey.Luck
  | DerivedStatKey.CriticalChance
  | DerivedStatKey.EvasionChance;

export type RuntimeDerivedStats = Record<RuntimeDerivedStatKey, number>;

export type EntityBonusWithTemplateRow = Row<'entity_bonuses'> & {
  bonus_templates: Row<'bonus_templates'> | null;
};
