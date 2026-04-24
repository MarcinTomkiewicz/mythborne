import {
  ItemAffixKind,
  ItemGenerationBucketProfile,
  ItemQualityDefinition,
  ItemSlot,
} from './item-generation.types';
import { BonusType } from './bonus.types';

export type CatalogSection = 'base' | 'prefix' | 'suffix';

export interface EditableItemGenerationBonus {
  templateId: string | null;
  target: string;
  type: BonusType;
  value: number;
  description: string;
}

export interface EditableItemGenerationBase {
  id: string | null;
  key: string;
  name: string;
  slot: ItemSlot;
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
  bases: EditableItemGenerationBase[];
  prefixes: EditableItemGenerationAffix[];
  suffixes: EditableItemGenerationAffix[];
  bonusTemplates: {
    id: string;
    target: string;
    type: BonusType;
    description: string;
  }[];
}

export interface ItemGenerationAdminBalanceData {
  qualities: EditableItemGenerationQuality[];
  bucketProfiles: EditableItemGenerationBucketProfile[];
}
