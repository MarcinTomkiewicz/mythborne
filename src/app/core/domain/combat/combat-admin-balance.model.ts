import { CombatTurnOrderPlan } from './combat-attack-plan.model';
import {
  CombatDictionaryReadModel,
  CombatOpponentAdminData,
} from './combat-opponent.model';

export type CombatCandidateSourceKind = 'encounter' | 'trial';

export interface CombatCandidateInspectionRow {
  id: string;
  sourceKind: CombatCandidateSourceKind;
  sourceLabel: string;
  sourceKey: string;
  candidateKindKey: string;
  candidateKindLabel: string;
  candidateKindDescription: string | null;
  targetLabel: string;
  targetDescription: string | null;
  formulaLabel: string;
  levelRangeLabel: string;
  difficultyMultiplier: number;
  weight: number;
  sortOrder: number;
  isActive: boolean;
}

export interface CombatDictionaryLabelReadModel {
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  isActive: boolean;
}

export interface CombatAdminBalanceData {
  opponents: CombatOpponentAdminData;
  trialCandidates: CombatCandidateInspectionRow[];
  encounterCandidates: CombatCandidateInspectionRow[];
  dictionaries: {
    sourceTypes: CombatDictionaryReadModel[];
    sides: CombatDictionaryReadModel[];
    outcomes: CombatDictionaryReadModel[];
    participantKinds: CombatDictionaryReadModel[];
    attackSourceKinds: CombatDictionaryReadModel[];
    candidateKinds: CombatDictionaryReadModel[];
    equipmentModes: CombatDictionaryLabelReadModel[];
    equipmentSlots: CombatDictionaryLabelReadModel[];
  };
}

export interface CombatInitiativePreviewInput {
  initiatorIntelligence: number;
  initiatorAgility: number;
  initiatorAttackCount: number;
  defenderIntelligence: number;
  defenderAgility: number;
  defenderAttackCount: number;
}

export interface CombatInitiativePreviewResult {
  plan: CombatTurnOrderPlan;
  usesRandomFormula: boolean;
}
