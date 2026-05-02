import { CombatDictionaryReadModel } from './combat-opponent.model';

export interface CombatDisplayDictionaries {
  sourceTypes: readonly CombatDictionaryReadModel[];
  sides: readonly CombatDictionaryReadModel[];
  outcomes: readonly CombatDictionaryReadModel[];
  participantKinds: readonly CombatDictionaryReadModel[];
  attackSourceKinds: readonly CombatDictionaryReadModel[];
}
