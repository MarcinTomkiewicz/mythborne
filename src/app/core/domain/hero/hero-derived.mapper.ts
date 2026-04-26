import { HeroDerivedRow } from '../../types/domain-row.types';
import { IHeroDerived } from './hero-derived.model';

export function mapHeroDerived(row: HeroDerivedRow): IHeroDerived {
  return {
    def: row.def,
    minDmg: row.min_dmg,
    maxDmg: row.max_dmg,
    luck: row.luck,
    critical: row.critical,
    evasion: row.evasion,
    health: row.health,
  };
}
