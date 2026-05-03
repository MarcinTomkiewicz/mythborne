import { Json } from '../../types/database.types';
import { UiMetadataEntryReadModel } from '../admin-ui-metadata.model';
import { BalanceFormula, FormulaAssignment, FormulaTarget } from '../formula/formula.model';
import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../item/item-generation-admin.model';
import {
  CombatAttackSourceSnapshot,
  CombatParticipantInput,
} from './combat.model';

export interface CombatDictionaryReadModel {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface CombatOpponentFamilyReadModel {
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CombatOpponentDefinitionReadModel {
  id: string;
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  familyKey: string;
  equipmentMode: string;
  defaultScalingFormulaId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CombatOpponentStatValueReadModel {
  id: string;
  opponentDefinitionId: string;
  statKey: string;
  baseValue: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CombatOpponentAttackSourceReadModel {
  id: string;
  opponentDefinitionId: string;
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  minDamage: number;
  maxDamage: number;
  criticalChance: number;
  criticalDamage: number;
  attackCount: number;
  minOpponentLevel: number | null;
  maxOpponentLevel: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CombatOpponentEquipmentEntryReadModel {
  id: string;
  opponentDefinitionId: string;
  slotKey: string;
  entryMode: string;
  manualBaseId: string | null;
  manualQualityKey: string | null;
  manualPrefixAffixId: string | null;
  manualSuffixAffixId: string | null;
  generatedBucketProfileId: string | null;
  generatedMaxQualityKey: string | null;
  minOpponentLevel: number | null;
  maxOpponentLevel: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CombatOpponentEquipmentModeReadModel {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentSlotDefinitionReadModel {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  equipmentArea: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CombatStatDefinitionReadModel {
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
}

export interface CombatOpponentAdminView {
  opponent: CombatOpponentDefinitionReadModel;
  familyLabel: string;
  familyDescription: string | null;
  equipmentModeLabel: string;
  equipmentModeDescription: string | null;
  statBaselines: CombatOpponentStatBaselineView[];
  naturalAttacks: CombatOpponentAttackSourceView[];
  equipmentEntries: CombatOpponentEquipmentEntryView[];
}

export interface CombatOpponentStatBaselineView {
  stat: CombatOpponentStatValueReadModel;
  statLabel: string;
  statDescription: string | null;
}

export interface CombatOpponentStatGridRow {
  statKey: string;
  statLabel: string;
  statDescription: string | null;
  statValueId: string | null;
  baseValue: number;
  sortOrder: number;
  isConfigured: boolean;
}

export interface CombatOpponentAttackSourceView {
  attack: CombatOpponentAttackSourceReadModel;
  damageLabel: string;
  levelRangeLabel: string;
}

export interface CombatOpponentEquipmentEntryView {
  entry: CombatOpponentEquipmentEntryReadModel;
  slotLabel: string;
  slotDescription: string | null;
  entryModeLabel: string;
  entryModeDescription: string | null;
  levelRangeLabel: string;
}

export interface CombatOpponentEmptyState {
  kind: 'empty_opponent_catalog';
  message: string;
}

export interface CombatOpponentAdminData {
  families: CombatOpponentFamilyReadModel[];
  opponents: CombatOpponentDefinitionReadModel[];
  statValues: CombatOpponentStatValueReadModel[];
  attackSources: CombatOpponentAttackSourceReadModel[];
  equipmentEntries: CombatOpponentEquipmentEntryReadModel[];
  equipmentModes: CombatOpponentEquipmentModeReadModel[];
  equipmentSlots: EquipmentSlotDefinitionReadModel[];
  stats: CombatStatDefinitionReadModel[];
  dictionaries: {
    sourceTypes: CombatDictionaryReadModel[];
    sides: CombatDictionaryReadModel[];
    outcomes: CombatDictionaryReadModel[];
    participantKinds: CombatDictionaryReadModel[];
    attackSourceKinds: CombatDictionaryReadModel[];
    candidateKinds: CombatDictionaryReadModel[];
  };
  formulas?: BalanceFormula[];
  formulaTargets?: FormulaTarget[];
  assignments?: FormulaAssignment[];
  itemCatalog?: {
    bases: EditableItemGenerationBase[];
    prefixes: EditableItemGenerationAffix[];
    suffixes: EditableItemGenerationAffix[];
  };
  itemBalance?: {
    qualities: EditableItemGenerationQuality[];
    bucketProfiles: EditableItemGenerationBucketProfile[];
  };
  uiMetadataEntries?: UiMetadataEntryReadModel[];
  opponentViews: CombatOpponentAdminView[];
  emptyState: CombatOpponentEmptyState | null;
}

export interface CombatOpponentFamilyDraft {
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  reason: string;
}

export interface CombatOpponentDefinitionDraft {
  opponentDefinitionId: string | null;
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  familyKey: string;
  equipmentMode: string;
  defaultScalingFormulaId: string | null;
  sortOrder: number;
  isActive: boolean;
  reason: string;
}

export interface CombatOpponentStatValueDraft {
  statValueId: string | null;
  opponentDefinitionId: string;
  statKey: string;
  baseValue: number;
  sortOrder: number;
  reason: string;
}

export interface CombatOpponentAttackSourceDraft {
  attackSourceId: string | null;
  opponentDefinitionId: string;
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  minOpponentLevel: number | null;
  maxOpponentLevel: number | null;
  attackCount: number;
  minDamage: number;
  maxDamage: number;
  criticalChance: number;
  criticalDamage: number;
  sortOrder: number;
  isActive: boolean;
  reason: string;
}

export interface CombatOpponentEquipmentEntryDraft {
  equipmentEntryId: string | null;
  opponentDefinitionId: string;
  slotKey: string;
  entryMode: string;
  manualBaseId: string | null;
  manualQualityKey: string | null;
  manualPrefixAffixId: string | null;
  manualSuffixAffixId: string | null;
  generatedBucketProfileId: string | null;
  generatedMaxQualityKey: string | null;
  minOpponentLevel: number | null;
  maxOpponentLevel: number | null;
  sortOrder: number;
  isActive: boolean;
  reason: string;
}

export interface ResolveCombatOpponentInput {
  opponentDefinitionId: string;
  side: CombatParticipantInput['side'];
  heroLevel: number;
  opponentLevel?: number;
  difficultyMultiplier: number;
  scalingFormulaId?: string | null;
}

export interface ResolvedCombatOpponentStat {
  statKey: string;
  baseValue: number;
  scaledValue: number;
}

export type ResolvedCombatOpponentEquipmentKind = 'manual' | 'generated';

export interface ResolvedCombatOpponentEquipment {
  kind: ResolvedCombatOpponentEquipmentKind;
  equipmentEntryId: string;
  slotKey: string;
  levelRange: {
    min: number | null;
    max: number | null;
  };
  source: CombatAttackSourceSnapshot;
  generatedItem: ResolvedCombatOpponentGeneratedItem | null;
}

export interface ResolvedCombatOpponentGeneratedItem {
  displayName: string;
  baseId: string;
  qualityKey: string;
  prefixAffixId: string | null;
  suffixAffixId: string | null;
  bucketProfileId: string | null;
  maxQualityKey: string | null;
}

export interface ResolvedCombatOpponent {
  participant: CombatParticipantInput;
  opponent: CombatOpponentDefinitionReadModel;
  scalingFormula: {
    targetKey: string;
    formulaId: string;
    label: string;
    expression: string;
  };
  scaledStats: ResolvedCombatOpponentStat[];
  naturalAttackSources: CombatOpponentAttackSourceReadModel[];
  equipment: ResolvedCombatOpponentEquipment[];
}
