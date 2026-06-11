export type PvpRankingDistrictKey = 'A' | 'B' | 'C' | 'D' | 'E';
export type PvpRankingActionKind = 'spy' | 'attack' | 'siege';
export const PVP_RANKING_DISABLED_REASON_KEYS = [
  'no_target',
  'self_target',
  'daily_attack_limit_reached',
  'attack_protection_active',
  'target_level_too_high',
  'target_level_too_low',
  'spy_unavailable',
  'attack_unavailable',
  'siege_unavailable',
  'siege_not_available',
  'cooldown_active',
] as const;
export type PvpRankingDisabledReasonKey = typeof PVP_RANKING_DISABLED_REASON_KEYS[number];

export interface PvpRankingContext {
  contractVersion: 'pvp_ranking_context_v1';
  activeHero: PvpRankingActiveHero;
  filters: PvpRankingFilters;
  ranking: PvpRankingList;
  selectedTarget: PvpRankingRow | null;
  capabilities: PvpRankingCapabilities;
}

export interface PvpRankingActiveHero {
  heroId: string;
  heroName: string;
  addressDisplay: string;
  rankingPosition: number;
  dailyAttackLimitRemaining: number;
  dailyAttackLimitMax: number;
  attackProtectionDisplay: string | null;
  siegeProtectionDisplay: string | null;
  attackMinTargetLevel: number;
  attackMaxTargetLevel: number;
  attackLevelRangeDisplay: string | null;
}

export interface PvpRankingFilters {
  appliedDistrictKey: PvpRankingDistrictKey | null;
  query: string | null;
  districtOptions: readonly PvpRankingDistrictOption[];
}

export interface PvpRankingDistrictOption {
  key: PvpRankingDistrictKey;
  enabled: boolean;
}

export interface PvpRankingList {
  rows: readonly PvpRankingRow[];
  totalCount: number;
  limit: 20;
  offset: number;
  hasNextPage: boolean;
}

export interface PvpRankingRow {
  rankPosition: number;
  heroId: string;
  heroName: string;
  guildName: string | null;
  level: number;
  addressDisplay: string;
  districtKey: PvpRankingDistrictKey;
  attackDurationDisplay: string | null;
  spyDurationDisplay: string | null;
  protectionDisplay: string | null;
  isSelf: boolean;
  isWithinAttackLevelRange: boolean;
  actions: Record<PvpRankingActionKind, PvpRankingActionState>;
}

export interface PvpRankingActionState {
  enabled: boolean;
  disabledReasonKey: PvpRankingDisabledReasonKey | null;
}

export interface PvpRankingCapabilities {
  canSearch: boolean;
  canFilterDistrict: boolean;
  canJumpToMyPosition: boolean;
  canSpy: boolean;
  canAttack: boolean;
  canSiege: false;
}

export interface PvpRankingCopy {
  contractKey: 'pvp_ranking_copy';
  requestedLocale: string;
  locale: 'pl' | 'en';
  fallbackLocale: 'en';
  common: PvpRankingCommonCopy;
  header: PvpRankingHeaderCopy;
  playerStatus: PvpRankingPlayerStatusCopy;
  ranking: PvpRankingRankingCopy;
  filters: PvpRankingFiltersCopy;
  table: PvpRankingTableCopy;
  targetPanel: PvpRankingTargetPanelCopy;
  actions: Record<PvpRankingActionKind, PvpRankingActionCopy>;
  disabledReasonTooltips: Record<PvpRankingDisabledReasonKey, string>;
  feedback: PvpRankingFeedbackCopy;
}

export interface PvpRankingCommonCopy {
  emptyValues: Record<'noAttackProtection' | 'noData' | 'noGuild' | 'noValue', string>;
}

export interface PvpRankingHeaderCopy {
  eyebrow: string;
  title: string;
  intro: string;
}

export interface PvpRankingPlayerStatusCopy {
  labels: Record<'dailyAttackLimit' | 'rankingPosition' | 'attackProtection' | 'siegeProtection', string>;
  emptyValueKeys: Record<'attackProtection' | 'siegeProtection' | 'generic', keyof PvpRankingCommonCopy['emptyValues']>;
}

export interface PvpRankingRankingCopy {
  title: string;
  description: string;
}

export interface PvpRankingFiltersCopy {
  districtLabel: string;
  districtOptions: Record<PvpRankingDistrictKey, string>;
  searchLabel: string;
  searchPlaceholder: string;
  searchAction: string;
  myPositionAction: string;
}

export interface PvpRankingTableCopy {
  columns: Record<'rankPosition' | 'hero' | 'level' | 'address' | 'attackDuration' | 'spyDuration' | 'actions', string>;
  emptyValueKeys: Record<'noGuild' | 'noValue', keyof PvpRankingCommonCopy['emptyValues']>;
  emptyState: {
    title: string;
    text: string;
  };
}

export interface PvpRankingTargetPanelCopy {
  labels: Record<'target' | 'guild' | 'address' | 'attackDuration' | 'spyDuration' | 'protection', string>;
  emptyValueKeys: Record<'guild' | 'protection' | 'generic', keyof PvpRankingCommonCopy['emptyValues']>;
  emptyState: {
    title: string;
    text: string;
  };
}

export interface PvpRankingActionCopy {
  label: string;
  tooltip: string;
  disabledTooltip?: string;
}

export interface PvpRankingFeedbackCopy {
  searchFailed: PvpRankingFeedbackMessageCopy;
  targetUnavailable: PvpRankingFeedbackMessageCopy;
}

export interface PvpRankingFeedbackMessageCopy {
  summary: string;
  detail: string;
}

export interface PvpRankingContextInput {
  query?: string | null;
  districtKey?: PvpRankingDistrictKey | null;
  offset?: number | null;
  selectedTargetHeroId?: string | null;
}

export interface PvpRankingActionFeedback {
  summary: string;
  detail: string;
  severity: 'error';
}

export interface PvpRankingPageChangeEvent {
  first?: number | null;
}
