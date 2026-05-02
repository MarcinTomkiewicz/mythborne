import { Json } from '../../types/database.types';

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
  opponentViews: CombatOpponentAdminView[];
  emptyState: CombatOpponentEmptyState | null;
}
