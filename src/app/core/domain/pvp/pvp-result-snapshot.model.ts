import type { RichTextFragment } from '../rich-text/rich-text.model';

export type PvpResultOutcomeKey = 'attacker_victory' | 'defender_victory' | 'draw';
export type PvpResultPerspective = 'attacker' | 'defender' | 'neutral';
export type PvpResultOutcomeBannerTone = 'success' | 'danger' | 'warning' | 'neutral';

export interface PvpResultSnapshot {
  contractKey: 'pvp_result_snapshot';
  contractVersion: 'pvp_result_snapshot_v1';
  sourceOwner: 'pvp.result';
  private: PvpResultPrivateSummaries;
  public: PvpResultPublicSummaries;
}

export interface PvpResultPrivateSummaries {
  attacker: PvpResultSummary;
  defender: PvpResultSummary;
}

export interface PvpResultPublicSummaries {
  neutral: PvpResultSummary;
  includesGlory: false;
  glory: null;
}

export interface PvpResultSummary {
  contractKey: 'pvp_result_summary';
  contractVersion: 'pvp_result_summary_v1';
  sourceOwner: 'pvp.result';
  locale: 'pl';
  outcomeKey: PvpResultOutcomeKey;
  perspective: PvpResultPerspective;
  title: string;
  summaryPlainText: string;
  summaryRichText: RichTextFragment[];
  outcomeBanner: PvpResultOutcomeBanner;
  includesGlory: boolean;
  glorySentence: PvpResultGlorySentence | null;
  technicalContext: PvpResultTechnicalContext;
}

export interface PvpResultOutcomeBanner {
  contractKey: 'pvp_result_outcome_banner';
  contractVersion: 'pvp_result_outcome_banner_v1';
  sourceOwner: 'pvp.result';
  perspective: PvpResultPerspective;
  outcomeKey: PvpResultOutcomeKey;
  label: string;
  statusLabel: string;
  title: string;
  description: string;
  tone: PvpResultOutcomeBannerTone;
  iconKey: string;
}

export interface PvpResultGlorySentence {
  contractKey: 'pvp_result_glory_sentence';
  contractVersion: 'pvp_result_glory_sentence_v1';
  messageKind: string;
  plainText: string;
  richText: RichTextFragment[];
}

export interface PvpResultTechnicalContext {
  pvpAttackResultId: string;
  combatResultId: string;
  attackerHeroId: string;
  defenderHeroId: string;
}
