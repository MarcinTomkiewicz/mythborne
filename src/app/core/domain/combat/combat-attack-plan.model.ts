import {
  CombatAttackPlan,
  CombatAttackSlot,
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

export interface CombatInitiativeParticipantStats {
  intelligence: number;
  agility: number;
}

export interface CombatInitiativeParticipantInput {
  side: CombatSide;
  attackPlan: CombatAttackPlan;
  stats: CombatInitiativeParticipantStats;
}

export interface CombatInitiativeFormulaInfo {
  targetKey: string;
  targetLabel: string;
  targetDescription: string | null;
  formulaId: string;
  formulaLabel: string;
  formulaExpression: string;
  formulaDescription: string | null;
  assignmentSource: 'entity' | 'global';
}

export interface CombatInitiativeSlot extends CombatAttackSlot {
  attackIndex: number;
  attackCount: number;
}

export interface CombatTurnOrderPlan {
  slots: readonly CombatInitiativeSlot[];
  formula: CombatInitiativeFormulaInfo;
  explanation: {
    scoreMeaning: string;
    tieBreaker: string;
    formulaSource: string;
  };
}
