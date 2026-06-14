import type { RichTextFragment } from '../rich-text/rich-text.model';

export type PvpResultOutcomeKey = 'attacker_victory' | 'defender_victory' | 'draw';
export type PvpResultPerspective = 'attacker' | 'defender' | 'neutral';

export interface PvpResultSnapshotV1 {
  contractKey: 'pvp_result_snapshot';
  contractVersion: 'pvp_result_snapshot_v1';
  sourceOwner: 'pvp.result';
  private: PvpResultPrivateSummariesV1;
  public: PvpResultPublicSummariesV1;
}

export interface PvpResultPrivateSummariesV1 {
  attacker: PvpResultSummaryV1;
  defender: PvpResultSummaryV1;
}

export interface PvpResultPublicSummariesV1 {
  neutral: PvpResultSummaryV1;
  includesGlory: false;
  glory: null;
}

export interface PvpResultSummaryV1 {
  contractKey: 'pvp_result_summary';
  contractVersion: 'pvp_result_summary_v1';
  sourceOwner: 'pvp.result';
  locale: 'pl';
  outcomeKey: PvpResultOutcomeKey;
  perspective: PvpResultPerspective;
  title: string;
  summaryPlainText: string;
  summaryRichText: RichTextFragment[];
  includesGlory: boolean;
  glorySentence: PvpResultGlorySentenceV1 | null;
  technicalContext: PvpResultTechnicalContextV1;
}

export interface PvpResultGlorySentenceV1 {
  contractKey: 'pvp_result_glory_sentence';
  contractVersion: 'pvp_result_glory_sentence_v1';
  messageKind: string;
  plainText: string;
  richText: RichTextFragment[];
}

export interface PvpResultTechnicalContextV1 {
  pvpAttackResultId: string;
  combatResultId: string;
  attackerHeroId: string;
  defenderHeroId: string;
}
