import { Component, input } from '@angular/core';
import { CombatStage } from '../combat/combat-stage';
import type { ReportDetailPreviewView } from '../../../core/domain/reports/report-detail-preview.model';
import { OutcomeReportLayout } from '../../../shared/outcome-report-layout/outcome-report-layout';
import { ReportHandoffActions } from '../report-handoff-actions/report-handoff-actions';

@Component({
  selector: 'app-report-detail-preview-display',
  standalone: true,
  imports: [
    CombatStage,
    OutcomeReportLayout,
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
}
