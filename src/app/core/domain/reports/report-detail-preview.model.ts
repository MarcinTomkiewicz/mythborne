import type { CombatStageViewModel } from '../combat/combat-stage.model';
import type { ReportHandoffActionsViewModel } from './report-handoff.model';

export type ReportDetailPreviewOutcomeTone = 'success' | 'danger' | 'warning' | 'neutral';

export interface ReportDetailPreviewView {
  outcomeBanner: ReportDetailPreviewOutcomeBanner | null;
  combatStage: CombatStageViewModel | null;
  narrativeLines: readonly string[];
  sections: readonly ReportDetailPreviewSection[];
  rewardResult: ReportDetailPreviewRewardResult | null;
  actions: ReportHandoffActionsViewModel;
}

export interface ReportDetailPreviewSection {
  key: string;
  title: string;
  summary: string | null;
  chips: readonly string[];
  lines: readonly string[];
}

export interface ReportDetailPreviewOutcomeBanner {
  title: string;
  tone: ReportDetailPreviewOutcomeTone;
}

export interface ReportDetailPreviewRewardResult {
  title: string;
  segments: readonly ReportDetailPreviewRewardTextSegment[];
}

export interface ReportDetailPreviewRewardTextSegment {
  text: string;
  isHighlighted: boolean;
}
