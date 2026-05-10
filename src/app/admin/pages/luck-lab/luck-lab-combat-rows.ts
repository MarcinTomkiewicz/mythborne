import { COMBAT_FORMULA_TARGET } from '../../../core/constants/combat-formula-targets.const';
import { CombatLuckPreview } from '../../../core/domain/luck/luck.model';

export interface CombatRngSurfaceRow {
  surfaceKey: string;
  label: string;
  formulaTargetKey: string | null;
  value: number | null;
  unit: 'percent' | 'multiplier' | 'damage' | 'score';
  helperText: string;
}

export function toCombatRngSurfaceRows(
  preview: CombatLuckPreview | null,
): CombatRngSurfaceRow[] {
  if (!preview) {
    return [];
  }

  return [
    {
      surfaceKey: 'hit',
      label: 'Hit chance',
      formulaTargetKey: COMBAT_FORMULA_TARGET.hitGreenZone,
      value: preview.hitGreenZone,
      unit: 'percent',
      helperText: 'Damager hit window after DB-owned combat formula context.',
    },
    {
      surfaceKey: 'evasion',
      label: 'Evasion chance',
      formulaTargetKey: COMBAT_FORMULA_TARGET.evasionChance,
      value: preview.evasionChance,
      unit: 'percent',
      helperText: 'Target evasion chance from the same damager vs target context.',
    },
    {
      surfaceKey: 'critical',
      label: 'Critical chance',
      formulaTargetKey: COMBAT_FORMULA_TARGET.criticalChance,
      value: preview.criticalChance,
      unit: 'percent',
      helperText: 'Critical roll chance for the damager.',
    },
    {
      surfaceKey: 'critical_damage',
      label: 'Critical damage multiplier',
      formulaTargetKey: null,
      value: preview.criticalMultiplier,
      unit: 'multiplier',
      helperText: 'DB-returned critical multiplier context; no separate formula target is exposed here.',
    },
    {
      surfaceKey: 'final_damage',
      label: 'Final damage',
      formulaTargetKey: COMBAT_FORMULA_TARGET.finalDamage,
      value: preview.finalDamage,
      unit: 'damage',
      helperText: 'Rolled damage after DB-owned critical multiplier context.',
    },
    {
      surfaceKey: 'initiative',
      label: 'Initiative',
      formulaTargetKey: COMBAT_FORMULA_TARGET.initiativeScore,
      value: preview.initiativeScore,
      unit: 'score',
      helperText: 'Optional initiative score returned by the combat preview RPC.',
    },
  ];
}

export function combatRngValueText(row: Pick<CombatRngSurfaceRow, 'value' | 'unit'>): string {
  if (row.value === null) {
    return 'N/A';
  }

  switch (row.unit) {
    case 'percent':
      return `${row.value}%`;
    case 'multiplier':
      return `x${row.value}`;
    default:
      return `${row.value}`;
  }
}
