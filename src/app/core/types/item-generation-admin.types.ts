import {
  BonusTargetDefinition,
  BonusTemplate,
  EditableAppliedBonus,
} from './bonus.types';
import {
  ItemAffixKind,
  ItemGenerationBaseType,
  ItemGenerationBaseTypeTarget,
  ItemGenerationBucketProfile,
  ItemQualityDefinition,
} from './item-generation.types';

export type CatalogSection = 'base' | 'prefix' | 'suffix';

export interface EditableItemGenerationBonus extends EditableAppliedBonus {}

export interface EditableItemGenerationBase {
  id: string | null;
  key: string;
  name: string;
  baseTypeKey: string;
  baseTypeLabel: string;
  equipmentSlotGroup: string;
  handUsage: string;
  baseValue: number;
  description: string;
  bonuses: EditableItemGenerationBonus[];
}

export interface EditableItemGenerationAffix {
  id: string | null;
  key: string;
  kind: ItemAffixKind;
  name: string;
  goldValue: number;
  description: string;
  bonuses: EditableItemGenerationBonus[];
}

export interface EditableItemGenerationQuality extends ItemQualityDefinition {
  id: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

export interface EditableItemGenerationBucketProfile
  extends ItemGenerationBucketProfile {
  id: string | null;
  isActive: boolean;
}

export interface ItemGenerationAdminCatalogData {
  baseTypes: ItemGenerationBaseType[];
  baseTypeTargets: ItemGenerationBaseTypeTarget[];
  bases: EditableItemGenerationBase[];
  prefixes: EditableItemGenerationAffix[];
  suffixes: EditableItemGenerationAffix[];
  bonusTemplates: BonusTemplate[];
  bonusTargets: BonusTargetDefinition[];
  bonusCategories: string[];
}

export interface ItemGenerationAdminBalanceData {
  qualities: EditableItemGenerationQuality[];
  bucketProfiles: EditableItemGenerationBucketProfile[];
  requirementAggregationSettings: ItemRequirementAggregationSettings | null;
}

export interface ItemQualityImpactPreviewInput {
  baseValue: number | null;
  bonusValue: number | null;
}

export interface ItemQualityImpactPreview {
  qualityKey: string;
  qualityLabel: string;
  multiplier: number;
  weight: number;
  isEnabled: boolean;
  sortOrder: number;
  sampleBaseValue: number;
  sampleBonusValue: number;
  sampleItemValue: number;
  sampleQualityScaledBonusValue: number;
  valueMultiplierExplanation: string;
  bonusScalingExplanation: string;
}

export interface ItemRequirementAggregationSettings {
  additionalRequirementFraction: number;
  minRequiredValue: number;
  roundingMode: string;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string | null;
}
