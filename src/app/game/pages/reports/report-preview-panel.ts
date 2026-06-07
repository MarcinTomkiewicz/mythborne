import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { REPORTS_CENTER_PREVIEW_FACT_ROWS } from '../../../core/configs/reports-center-preview-fact-rows.config';
import { ReportsCenterPreviewCopy } from '../../../core/domain/reports/reports-center-copy.model';
import { ReportsCenterPreviewV1 } from '../../../core/domain/reports/reports-center.model';
import {
  ReportsCenterPreviewFactRowConfig,
  ReportsCenterPreviewFactViewRow,
} from '../../../core/interfaces/reports-center-preview-fact-row.interface';
import { absoluteBrowserUrl, copyTextToClipboard } from '../../../core/utils/browser-clipboard';

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
  readonly preview = input<ReportsCenterPreviewV1 | null>(null);
  readonly copy = input.required<ReportsCenterPreviewCopy>();
  readonly previewFactRows = computed<readonly ReportsCenterPreviewFactViewRow[]>(() => {
    const preview = this.preview();
    const copy = this.copy();

    if (!preview) {
      return [];
    }

    return REPORTS_CENTER_PREVIEW_FACT_ROWS.map((row) =>
      mapPreviewFactRow(row, preview, copy),
    );
  });
  readonly rewardValues = computed<readonly string[]>(() => {
    const reward = this.preview()?.reward;

    if (!reward) {
      return [];
    }

    if (reward.entriesPreview.length > 0) {
      return reward.entriesPreview.map((entry) => entry.displayValue);
    }

    return reward.resources.rows.map((row) => row.displayValue);
  });

  copyPublicLink(path: string): void {
    void copyTextToClipboard(absoluteBrowserUrl(path));
  }
}

function mapPreviewFactRow(
  row: ReportsCenterPreviewFactRowConfig,
  preview: ReportsCenterPreviewV1,
  copy: ReportsCenterPreviewCopy,
): ReportsCenterPreviewFactViewRow {
  if (row.key === 'source') {
    return {
      key: row.key,
      label: copy[row.copyLabelKey],
      value: preview.source.label,
    };
  }

  if (row.key === 'eventType') {
    return {
      key: row.key,
      label: copy[row.copyLabelKey],
      value: preview.eventType.label,
    };
  }

  return {
    key: row.key,
    label: copy[row.copyLabelKey],
    value: preview.reportDate.displayValue ?? preview.reportDate.value,
    datetime: preview.reportDate.value,
  };
}
