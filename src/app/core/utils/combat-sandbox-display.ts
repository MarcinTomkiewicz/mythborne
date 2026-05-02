import { CombatDisplayDictionaries } from '../domain/combat/combat-dictionary.model';
import {
  COMBAT_OUTCOME,
  COMBAT_SIDE,
  COMBAT_SOURCE_TYPE,
  CombatAttackEvent,
} from '../domain/combat/combat.model';
import {
  CombatRoundEntry,
  SandboxCombatResult,
} from '../domain/combat/combat-sandbox.model';

export function combatSandboxOutcomeLabel(
  sandboxResult: SandboxCombatResult | null,
  dictionaries: CombatDisplayDictionaries | null,
): string | null {
  const outcome = sandboxResult ? canonicalOutcomeKey(sandboxResult.outcome) : null;

  if (!outcome) {
    return null;
  }

  return dictionaryLabel(dictionaries?.outcomes ?? [], outcome, sandboxResult?.outcome ?? outcome);
}

export function combatSandboxSourceTypeLabel(
  dictionaries: CombatDisplayDictionaries | null,
): string | null {
  return dictionaryLabel(
    dictionaries?.sourceTypes ?? [],
    COMBAT_SOURCE_TYPE.sandbox,
    COMBAT_SOURCE_TYPE.sandbox,
  );
}

export function combatSandboxWinnerSideLabel(
  sandboxResult: SandboxCombatResult | null,
  dictionaries: CombatDisplayDictionaries | null,
): string | null {
  const winnerSide =
    sandboxResult?.outcome === 'victory'
      ? COMBAT_SIDE.initiator
      : sandboxResult?.outcome === 'defeat'
        ? COMBAT_SIDE.defender
        : null;

  if (!winnerSide) {
    return null;
  }

  return dictionaryLabel(dictionaries?.sides ?? [], winnerSide, winnerSide);
}

export function withCombatSandboxAttackSourceKindLabels(
  entries: CombatRoundEntry[],
  attacks: readonly CombatAttackEvent[],
  dictionaries: CombatDisplayDictionaries | null,
): CombatRoundEntry[] {
  const attackSourceKinds = dictionaries?.attackSourceKinds ?? [];

  return entries.map((entry, index) => ({
      ...entry,
      attackSourceKindLabel: dictionaryLabel(
        attackSourceKinds,
        attacks[index]?.source.kind ?? '',
        attacks[index]?.source.kind ?? 'Attack',
      ),
    }));
}

function canonicalOutcomeKey(outcome: SandboxCombatResult['outcome']): string {
  switch (outcome) {
    case 'victory':
      return COMBAT_OUTCOME.initiatorVictory;
    case 'defeat':
      return COMBAT_OUTCOME.defenderVictory;
    case 'draw':
      return COMBAT_OUTCOME.draw;
  }
}

function dictionaryLabel(
  entries: readonly { key: string; label: string }[],
  key: string,
  fallback: string,
): string {
  return entries.find((entry) => entry.key === key)?.label ?? fallback;
}
