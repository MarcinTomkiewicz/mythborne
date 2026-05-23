import { CombatDisplayDictionaries } from '../domain/combat/combat-dictionary.model';
import {
  CombatParticipantKind,
  COMBAT_OUTCOME,
  CombatSide,
  COMBAT_SIDE,
  COMBAT_SOURCE_TYPE,
} from '../domain/combat/combat.model';
import { SandboxCombatResult } from '../domain/combat/combat-sandbox.model';

export function combatSandboxOutcomeLabel(
  sandboxResult: SandboxCombatResult | null,
  dictionaries: CombatDisplayDictionaries | null,
): string | null {
  if (!sandboxResult) {
    return null;
  }

  const outcome = canonicalOutcomeKey(sandboxResult.outcome);

  return dictionaryLabel(
    dictionaries?.outcomes ?? [],
    outcome,
    sandboxOutcomeFallbackLabel(sandboxResult.outcome),
  );
}

export function combatSandboxSourceTypeLabel(
  dictionaries: CombatDisplayDictionaries | null,
): string | null {
  return dictionaryLabel(
    dictionaries?.sourceTypes ?? [],
    COMBAT_SOURCE_TYPE.sandbox,
    'Sandbox',
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

  return dictionaryLabel(dictionaries?.sides ?? [], winnerSide, sideFallbackLabel(winnerSide));
}

export function combatSandboxSideLabel(
  side: CombatSide,
  dictionaries: CombatDisplayDictionaries | null,
): string {
  return dictionaryLabel(dictionaries?.sides ?? [], side, sideFallbackLabel(side));
}

export function combatSandboxParticipantKindLabel(
  kind: CombatParticipantKind,
  dictionaries: CombatDisplayDictionaries | null,
): string {
  return dictionaryLabel(dictionaries?.participantKinds ?? [], kind, participantKindFallbackLabel(kind));
}

function sandboxOutcomeFallbackLabel(outcome: SandboxCombatResult['outcome']): string {
  switch (outcome) {
    case 'victory':
      return 'Zwycięstwo';
    case 'defeat':
      return 'Porażka';
    case 'draw':
      return 'Remis';
  }
}

function sideFallbackLabel(side: CombatSide): string {
  return side === COMBAT_SIDE.initiator ? 'Inicjator' : 'Obrońca';
}

function participantKindFallbackLabel(kind: CombatParticipantKind): string {
  return kind === 'hero' ? 'Bohater' : 'Przeciwnik';
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
