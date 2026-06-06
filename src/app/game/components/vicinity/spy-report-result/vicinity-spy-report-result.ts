import { Component, computed, input } from '@angular/core';
import { ReportHandoffActionsViewModel } from '../../../../core/domain/reports/report-handoff.model';
import {
  GameReportContextSection,
  GameReportItemReference,
  PrivateGameReportDetail,
} from '../../../../core/domain/reports/game-report.model';
import { OutcomeReportLayout } from '../../../../shared/outcome-report-layout/outcome-report-layout';
import { ReportHandoffActions } from '../../report-handoff-actions/report-handoff-actions';

@Component({
  selector: 'app-vicinity-spy-report-result',
  standalone: true,
  imports: [
    OutcomeReportLayout,
    ReportHandoffActions,
  ],
  templateUrl: './vicinity-spy-report-result.html',
  host: { class: 'd-block w-100' },
})
export class VicinitySpyReportResult {
  readonly report = input.required<PrivateGameReportDetail>();
  readonly actions = input.required<ReportHandoffActionsViewModel>();

  readonly sections = computed(() =>
    [
      this.report().spySection,
      this.report().effectSection,
      this.report().rewardSection,
    ].filter((section): section is GameReportContextSection => section !== null),
  );

  itemReferenceTrackKey(index: number, item: GameReportItemReference): string {
    return `${item.sourceKind}-${item.displayName}-${item.sortOrder}-${index}`;
  }
}
