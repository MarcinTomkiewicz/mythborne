import type { CombatStageViewModel } from '../combat/combat-stage.model';
import type {
  ExplorationResultNarrativeSnapshot,
} from '../exploration/exploration-result-copy.model';
import type { ReportHandoffActionsViewModel } from './report-handoff.model';

export type ReportDetailPreviewOutcomeTone = 'success' | 'danger' | 'warning' | 'neutral';
export type ReportDetailPreviewExplorationSourceKind = 'trial' | 'encounter';

export interface ReportDetailPreviewView {
  isExplorationSource: boolean;
  explorationSourceKind: ReportDetailPreviewExplorationSourceKind | null;
  trialManifestationNarrative: ExplorationResultNarrativeSnapshot | null;
  encounterCombatHandoffNarrative: ExplorationResultNarrativeSnapshot | null;
  explorationResultNarrative: ExplorationResultNarrativeSnapshot | null;
  missingExplorationNarrativeFields: readonly string[];
  outcomeBanner: ReportDetailPreviewOutcomeBanner | null;
  combatStage: CombatStageViewModel | null;
  narrativeLines: readonly string[];
  sections: readonly ReportDetailPreviewSection[];
  actions: ReportHandoffActionsViewModel | null;
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
