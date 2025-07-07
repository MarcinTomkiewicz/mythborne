import { Row } from '../../types/supabase.types';
import { IHeroDerived } from './hero-derived.model';

export type HeroDerivedRow = Row<'hero_derived'>;

export function mapHeroDerived(row: HeroDerivedRow): IHeroDerived {
  return {
    heroId: row.hero_id,
    hp: row.hp,
    def: row.def,
    minDmg: row.min_dmg,
    maxDmg: row.max_dmg,
    luck: row.luck,
    critical: row.critical,
    evasion: row.evasion,
    health: row.health,
  };
}
