import {
  CombatAttackSourceSnapshot,
  CombatSide,
} from './combat.model';

export interface CombatAttackSourcePlanInput {
  source: CombatAttackSourceSnapshot;
  repeat?: number;
}

export interface EquippedCombatItemAttackSource {
  itemId: string;
  slotKey: string;
  baseId: string;
  baseName: string;
  baseTypeKey: string;
  equipmentSlotGroup: string;
  handUsage: string;
  qualityKey: string;
  qualityLabel: string;
  prefixAffixId: string | null;
  prefixName: string | null;
  suffixAffixId: string | null;
  suffixName: string | null;
  displayName: string;
  attackCount: number;
}

export interface HeroAttackPlanInput {
  side: CombatSide;
  equippedItems: readonly EquippedCombatItemAttackSource[];
  unarmedLabel?: string;
}
