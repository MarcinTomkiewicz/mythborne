import { Component, computed, input } from '@angular/core';
import { MinigameCompletionEvent } from '../minigame-host/minigame-host.model';
import { ReportDetailPreviewCard } from '../report-detail-preview-card/report-detail-preview-card';

@Component({
  selector: 'app-combat-report-handoff-card',
  standalone: true,
  imports: [
    ReportDetailPreviewCard,
  ],
  template: `
    @if (completion()) {
      <app-report-detail-preview-card
        [reportId]="reportId()"
        label="Raport walki"
        directReportLabel="Otwórz raport"
        publicReportCopyLabel="Kopiuj link publiczny"
        [showRewardResult]="true"
      />
    }
  `,
  host: { class: 'd-block w-100' },
})
export class CombatReportHandoffCard {
  readonly completion = input<MinigameCompletionEvent | null>(null);
  readonly reportId = computed(() => requiredCombatReportId(this.completion()?.reportId));
}

function requiredCombatReportId(reportId: string | null | undefined): string {
  if (!reportId) {
    throw new Error(
      'CombatReportHandoffCard requires MinigameCompletionEvent.reportId from combat RPC game_report_id.',
    );
  }

  return reportId;
}
