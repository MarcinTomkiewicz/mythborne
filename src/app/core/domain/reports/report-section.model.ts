import type {
  ExplorationResultNarrativeSnapshot,
} from '../exploration/exploration-result-copy.model';
import type { RichTextFragment } from '../rich-text/rich-text.model';

export interface ReportParticipantRow {
  participantRole: string | null;
  sideLabel: string | null;
  displayName: string;
  levelSnapshot: number | null;
  sortOrder: number | null;
  heroId?: string | null;
}

export interface ReportItemReferenceRow {
  itemReferenceId: string;
  sourceKind: string;
  sourceItemId: string | null;
  displayNameFallback: string | null;
  qualityKey: string | null;
  baseId: string | null;
  prefixAffixId: string | null;
  suffixAffixId: string | null;
  sortOrder: number | null;
}

export interface ReportMissingSection {
  missing: true;
  sourceEntityType?: string | null;
  sectionKind?: string | null;
  sourceLabel: string;
  title: string;
  summary: string;
  message: string;
}

export interface ReportTrialSection {
  trialKey: string;
  trialLabel: string;
  sourceLabel: string;
  minigameKey: string | null;
  difficultyKey: string | null;
  status: string;
  trialManifested: boolean;
  manifestationStatus: string;
  resultKind: string;
  resultKey: string;
  outcomeKind: string;
  title: string;
  summary: string;
  outcomeLabel: string;
  resultLabel: string;
  narrativeLines: string[];
  descriptionLines: string[];
  success: boolean | null;
  completionMode: string | null;
  score: number | null;
  performanceRating: string | null;
  testedStatKey: string | null;
  testedStatLabel: string | null;
  createdAt: string | null;
  completedAt: string | null;
  trialManifestationNarrativeJson: ExplorationResultNarrativeSnapshot | null;
  resultNarrativeJson: ExplorationResultNarrativeSnapshot | null;
}

export interface ReportEncounterSection {
  encounterKey: string | null;
  encounterLabel: string;
  sourceLabel: string;
  encounterKind: string;
  minigameKey: string | null;
  difficultyKey: string | null;
  outcomeKind: string | null;
  status: string | null;
  resolvedAt: string | null;
  noRewardReason: string | null;
  noEffectReason: string | null;
  noReportReason: string | null;
  challengeKind: string | null;
  success: boolean | null;
  completionMode: string | null;
  createdAt: string | null;
  completedAt: string | null;
  title: string;
  summary: string;
  outcomeLabel: string;
  narrativeLines: string[];
  descriptionLines: string[];
  encounterCombatHandoffNarrativeJson: ExplorationResultNarrativeSnapshot | null;
  resultNarrativeJson: ExplorationResultNarrativeSnapshot | null;
}

export interface ReportCombatDisplayStatRow {
  statKey?: string;
  key?: string;
  label?: string;
  statLabel?: string;
  displayLabel?: string;
  value?: number | string;
  statValue?: number | string;
  finalValue?: number | string;
  displayValue?: string;
  tone?: string;
  colorTone?: string;
  colorableFinalValue?: boolean;
  sortOrder?: number;
}

export interface ReportCombatParticipantStatRow {
  statKey: string;
  statLabel: string;
  statValue: number;
}

export interface ReportCombatParticipantRow {
  heroId: string | null;
  side: string;
  sideLabel: string;
  participantKind: string;
  participantKindLabel: string;
  displayName: string;
  level: number | null;
  healthStart: number | null;
  healthEnd: number | null;
  healthCurrent: number | null;
  healthMax: number | null;
  maxHealth: number | null;
  defense: number | null;
  minDamage: number | null;
  maxDamage: number | null;
  luck: number | null;
  criticalChance: number | null;
  criticalDamage: number | null;
  evasionChance: number | null;
  stats: ReportCombatParticipantStatRow[];
  baseStatRows: ReportCombatDisplayStatRow[];
  combatStatRows: ReportCombatDisplayStatRow[];
}

export interface ReportCombatAttackRow {
  turnNumber: number;
  attackOrder: number;
  actorSide: string;
  actorSideLabel: string;
  targetSide: string;
  targetSideLabel: string;
  actorDisplayName: string | null;
  targetDisplayName: string | null;
  attackSlotIndex: number | null;
  attackSourceKind: string;
  attackSourceKindLabel: string;
  attackSourceLabel: string | null;
  sourceQualityKey: string | null;
  timingHit: boolean | null;
  evaded: boolean | null;
  critical: boolean | null;
  criticalDamage: number | null;
  rolledDamage: number | null;
  finalDamage: number | null;
  targetHealthBefore: number | null;
  targetHealthAfter: number | null;
  displayText: string | null;
  eventLabel: string | null;
  detailText: string | null;
  summary: string | null;
  damageDisplay: string | null;
  resultDisplay: string | null;
  presentationKind: string | null;
  tone: string | null;
  createdAt: string | null;
}

export interface ReportCombatSection {
  combatResultId: string | null;
  sourceLabel: string;
  title: string;
  summary: string;
  pvpOutcome: string | null;
  sourceType: string;
  sourceTypeLabel: string;
  outcome: string;
  outcomeLabel: string;
  winnerSide: string | null;
  winnerSideLabel: string | null;
  loserSide: string | null;
  loserSideLabel: string | null;
  turnsCompleted: number;
  startedAt: string | null;
  completedAt: string | null;
  narrativeLines: string[];
  participants: ReportCombatParticipantRow[];
  attacks: ReportCombatAttackRow[];
}

export interface ReportRewardEntryRow {
  entryKind: string;
  entryLabel: string;
  amount: number | null;
  amountDisplay: string | null;
  resourceType: string | null;
  resourceLabel: string | null;
  itemDisplayName: string | null;
  effectKey: string | null;
  effectLabel: string | null;
  effectKind: string | null;
  effectDisplay: ReportEffectDisplay | null;
  displayValue: string | null;
  summary: string | null;
  playerSummary: string | null;
  createdAt: string | null;
}

export interface ReportRewardRichTextSnapshot {
  inlineRichText: RichTextFragment[];
  sentenceRichText: RichTextFragment[];
}

export interface ReportRewardSection {
  hasReward: boolean;
  title: string;
  summary: string | null;
  sourceLabel: string;
  status: string | null;
  sourceKind: string | null;
  reason: string | null;
  grantedAt: string | null;
  entryCount: number | null;
  entries: ReportRewardEntryRow[];
  rewardRichTextJson: ReportRewardRichTextSnapshot | null;
  narrativeLines: string[];
  message: string | null;
}

export interface ReportEffectDisplay {
  effectKey: string;
  effectLabel: string;
  effectDescription: string | null;
  effectHelperText: string | null;
  effectKind: string;
  effectKindLabel: string;
  title: string;
  summary: string;
  playerSummary: string;
  displayValue: string;
  valueDisplay: string;
  narrativeLines: string[];
  descriptionLines: string[];
  bonusTemplateKey: string | null;
  bonusTemplateLabel: string | null;
  bonusTemplateDescription: string | null;
  bonusTypeKey: string | null;
  bonusTypeLabel: string | null;
  effectTargetKey: string | null;
  effectTargetLabel: string | null;
  effectTargetDescription: string | null;
  effectTargetHelperText: string | null;
  effectScopeKey: string | null;
  effectScopeLabel: string | null;
}

export interface ReportEffectRow extends ReportEffectDisplay {
  status: string;
  statusLabel: string;
  isActive: boolean;
  appliedAt: string | null;
  consumedAt: string | null;
}

export interface ReportRewardEffectEntryRow extends ReportEffectDisplay {
  skipped: boolean;
  applied: boolean;
  reason: string | null;
  createdAt: string | null;
}

export interface ReportEffectSection {
  hasEffects: boolean;
  title: string;
  summary: string;
  sourceLabel: string;
  effects: ReportEffectRow[];
  rewardEffectEntries: ReportRewardEffectEntryRow[];
  narrativeLines: string[];
}

export interface ReportSpyRevealedSections {
  baseStats: boolean;
  combatStats: boolean;
  resources: boolean;
  estate: boolean;
  buildings: boolean;
  equipment: boolean;
}

export interface ReportSpyBaseStatRow {
  key: string;
  kind: 'base_stat';
  statKey: string;
  label: string;
  statLabel: string;
  value: number;
  finalValue: number;
  baseValue: number;
  delta: number;
  tone: string;
  colorTone: string;
  displayValue: string;
  baseDisplayValue: string;
  deltaDisplayValue: string;
  colorableFinalValue: boolean;
  sortOrder: number;
}

export interface ReportSpyResourceRow {
  resourceType: string;
  resourceLabel: string;
  amount: number;
  displayValue: string;
}

export interface ReportSpyEquipmentRow {
  slotKey: string | null;
  slotLabel: string | null;
  equipmentArea: string | null;
  displayName: string;
  qualityKey: string | null;
}

export interface ReportSpyBuildingRow {
  buildingKey: string | null;
  buildingName: string | null;
  districtCode: string | null;
  level: number | null;
  displayValue: string;
}

export interface ReportSpySection {
  sectionKind: 'pvp_spy';
  sourceLabel: string;
  title: string;
  summary: string;
  outcomeKey: string;
  success: boolean;
  detected: boolean;
  outcomeLabel: string;
  playerSummary: string;
  visibilityKey: string | null;
  publicRedacted: boolean;
  viewerRole: string;
  spy: {
    level: number | null;
    roleLabel: string;
  };
  target: {
    displayName: string | null;
    level: number | null;
    districtCode: string | null;
    addressNumber: number | null;
    address: string | null;
  };
  revealedSections: ReportSpyRevealedSections;
  baseStats: ReportSpyBaseStatRow[];
  resources: ReportSpyResourceRow[];
  buildings: ReportSpyBuildingRow[];
  equipment: ReportSpyEquipmentRow[];
  narrativeLines: string[];
}

export interface ReportRelatedReportRow {
  relationKind: string;
  reportId?: string;
  publicToken: string | null;
  reportTypeKey: string;
  reportTypeLabel: string;
  title: string;
  sourceEntityType: string;
  createdAt: string;
}
