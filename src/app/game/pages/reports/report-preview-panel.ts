import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { REPORTS_CENTER_PREVIEW_FACT_ROWS } from '../../../core/configs/reports-center-preview-fact-rows.config';
import {
  ReportsCenterEventTypeCopy,
  ReportsCenterPreviewCopy,
} from '../../../core/domain/reports/reports-center-copy.model';
import { ReportsCenterPreview } from '../../../core/domain/reports/reports-center.model';
import {
  ReportsCenterPreviewFactRowConfig,
  ReportsCenterPreviewFactViewRow,
} from '../../../core/interfaces/reports-center-preview-fact-row.interface';
import { absoluteBrowserUrl, copyTextToClipboard } from '../../../core/utils/browser-clipboard';
import { reportsCenterRewardPreviewValues } from '../../../core/utils/reports-center-reward-preview-values';

@Component({
  selector: 'app-report-preview-panel',
  standalone: true,
  imports: [
    ButtonModule,
    RouterLink,
  ],
  templateUrl: './report-preview-panel.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportPreviewPanel {
  readonly preview = input<ReportsCenterPreview | null>(null);
  readonly copy = input.required<ReportsCenterPreviewCopy>();
  readonly eventTypeCopy = input<ReportsCenterEventTypeCopy | null>(null);
  readonly previewFactRows = computed<readonly ReportsCenterPreviewFactViewRow[]>(() => {
    const preview = this.preview();
    const copy = this.copy();
    const eventTypeCopy = this.eventTypeCopy();

    if (!preview) {
      return [];
    }

    return REPORTS_CENTER_PREVIEW_FACT_ROWS.map((row) =>
      mapPreviewFactRow(row, preview, copy, eventTypeCopy),
    );
  });
  readonly rewardValues = computed<readonly string[]>(() => {
    const reward = this.preview()?.reward;

    if (!reward) {
      return [];
    }

    return reportsCenterRewardPreviewValues(reward);
  });

  copyPublicLink(path: string): void {
    void copyTextToClipboard(absoluteBrowserUrl(path));
  }
}

function mapPreviewFactRow(
  row: ReportsCenterPreviewFactRowConfig,
  preview: ReportsCenterPreview,
  copy: ReportsCenterPreviewCopy,
  eventTypeCopy: ReportsCenterEventTypeCopy | null,
): ReportsCenterPreviewFactViewRow {
  if (row.key === 'source') {
    return {
      key: row.key,
      label: copy[row.copyLabelKey],
      value: preview.source.label,
    };
  }

  if (row.key === 'eventType') {
    if (!eventTypeCopy) {
      throw new Error('reportsCenter preview event type copy is missing.');
    }

    return {
      key: row.key,
      label: copy[row.copyLabelKey],
      value: eventTypeCopy.label,
    };
  }

  return {
    key: row.key,
    label: copy[row.copyLabelKey],
    value: preview.reportDate.displayValue ?? preview.reportDate.value,
    datetime: preview.reportDate.value,
  };
}
