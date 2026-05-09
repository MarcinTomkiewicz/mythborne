import { CombatLuckRngReadModel } from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  jsonRecord,
  jsonValue,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import { trimToNull } from './normalize-text';

export function mapCombatLuckRng(
  manifest: JsonRecord,
  hitGreenZone: number,
): CombatLuckRngReadModel | null {
  const rngRecord = jsonRecord(read(
    manifest,
    'combatLuck',
    'combat_luck',
    'luckRng',
    'luck_rng',
  ));

  if (!rngRecord) {
    return null;
  }

  return {
    attackerLuck: optionalNumber(read(rngRecord, 'attackerLuck', 'attacker_luck')),
    attackerLuckInfluence: optionalNumber(read(
      rngRecord,
      'attackerLuckInfluence',
      'attacker_luck_influence',
    )),
    defenderLuck: optionalNumber(read(rngRecord, 'defenderLuck', 'defender_luck')),
    defenderLuckInfluence: optionalNumber(read(
      rngRecord,
      'defenderLuckInfluence',
      'defender_luck_influence',
    )),
    hitGreenZone: optionalNumber(read(
      rngRecord,
      'hitGreenZone',
      'hit_green_zone',
      'greenZonePercent',
      'green_zone_percent',
    )) ?? hitGreenZone,
    hitChance: optionalNumber(read(
      rngRecord,
      'hitChance',
      'hit_chance',
      'hitChancePercent',
      'hit_chance_percent',
    )) ?? optionalNumber(read(manifest, 'hitChancePercent')),
    evasionChance: optionalNumber(read(rngRecord, 'evasionChance', 'evasion_chance')),
    criticalChance: optionalNumber(read(rngRecord, 'criticalChance', 'critical_chance')),
    criticalMultiplier: optionalNumber(read(
      rngRecord,
      'criticalMultiplier',
      'critical_multiplier',
      'critMultiplier',
      'crit_multiplier',
    )),
    criticalDamage: optionalNumber(read(rngRecord, 'criticalDamage', 'critical_damage')),
    finalDamage: optionalNumber(read(rngRecord, 'finalDamage', 'final_damage')),
    formulaContextJson: jsonValue(read(
      rngRecord,
      'formulaContext',
      'formula_context',
      'formulasJson',
      'formulas_json',
    )),
    explanation: trimToNull(optionalText(read(rngRecord, 'explanation'))),
    rawJson: rngRecord as unknown as Json,
  };
}
