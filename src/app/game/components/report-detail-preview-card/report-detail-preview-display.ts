import { Component, input } from '@angular/core';
import type {
  ExplorationResultNarrativeSnapshotV1,
  ExplorationRichTextFragment,
} from '../../../core/domain/exploration/exploration-result-copy.model';
import {
  canRenderExplorationEffectSupplement,
  canRenderExplorationRewardSupplement,
  isEncounterCombatResultKind,
  isTrialResultKind,
} from '../../../core/utils/exploration-result-kind';
import { CombatStage } from '../combat/combat-stage';
import { ResultOutcomeStrip } from '../result-outcome-strip/result-outcome-strip';
import type { ReportDetailPreviewView } from '../../../core/domain/reports/report-detail-preview.model';
import { OutcomeReportLayout } from '../../../shared/outcome-report-layout/outcome-report-layout';
import { RichText } from '../../../shared/rich-text/rich-text';
import { ReportHandoffActions } from '../report-handoff-actions/report-handoff-actions';

@Component({
  selector: 'app-report-detail-preview-display',
  standalone: true,
  imports: [
    CombatStage,
    ResultOutcomeStrip,
    OutcomeReportLayout,
    RichText,
    ReportHandoffActions,
  ],
  templateUrl: './report-detail-preview-display.html',
  host: { class: 'd-block w-100' },
})
export class ReportDetailPreviewDisplay {
  readonly label = input.required<string>();
  readonly view = input.required<ReportDetailPreviewView>();
  readonly directReportLabel = input<string | null>(null);
  readonly publicReportCopyLabel = input<string | null>(null);
  readonly showActions = input(true);

  showsOutcomeStrip(view: ReportDetailPreviewView): boolean {
    const result = view.explorationResultNarrative;

    return Boolean(
      result &&
      (
        (
          view.explorationSourceKind === 'trial' &&
          isTrialResultKind(result)
        ) ||
        (
          view.explorationSourceKind === 'encounter' &&
          isEncounterCombatResultKind(result)
        )
      ),
    );
  }

  showResultHeading(view: ReportDetailPreviewView): boolean {
    const result = view.explorationResultNarrative;

    return Boolean(
      result &&
      !this.showsOutcomeStrip(view) &&
      !isEncounterCombatResultKind(result),
    );
  }

  rewardRichText(
    result: ExplorationResultNarrativeSnapshotV1,
  ): readonly ExplorationRichTextFragment[] | null {
    return canRenderExplorationRewardSupplement(result) && result.rewardRichText?.length
      ? result.rewardRichText
      : null;
  }

  effectRichText(
    result: ExplorationResultNarrativeSnapshotV1,
  ): readonly ExplorationRichTextFragment[] | null {
    return canRenderExplorationEffectSupplement(result) && result.effectRichText?.length
      ? result.effectRichText
      : null;
  }
}
