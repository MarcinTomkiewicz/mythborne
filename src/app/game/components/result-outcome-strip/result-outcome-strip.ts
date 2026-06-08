import { Component, input } from '@angular/core';
import type {
  ExplorationResultNarrativeSnapshotV1,
} from '../../../core/domain/exploration/exploration-result-copy.model';
import type {
  ReportDetailPreviewOutcomeTone,
} from '../../../core/domain/reports/report-detail-preview.model';

@Component({
  selector: 'app-result-outcome-strip',
  standalone: true,
  templateUrl: './result-outcome-strip.html',
  host: { class: 'd-block w-100' },
})
export class ResultOutcomeStrip {
  readonly narrative = input.required<ExplorationResultNarrativeSnapshotV1>();

  cardClass(): string {
    const tone = this.outcomeTone();
    const baseClass = 'mg-card mg-card--selected p-lg flex-col gap-xs w-100';

    if (tone === 'success') {
      return `${baseClass} mg-card--success`;
    }

    if (tone === 'danger') {
      return `${baseClass} mg-card--danger`;
    }

    if (tone === 'warning') {
      return `${baseClass} mg-card--warning`;
    }

    return baseClass;
  }

  titleToneClass(): string {
    const tone = this.outcomeTone();

    if (tone === 'success') {
      return 'success-text';
    }

    if (tone === 'danger') {
      return 'error-text';
    }

    if (tone === 'warning') {
      return 'warn-text';
    }

    return 'color-heading';
  }

  private outcomeTone(): ReportDetailPreviewOutcomeTone {
    const tone = this.narrative().titleTone;

    if (tone === 'success') {
      return 'success';
    }

    if (tone === 'danger') {
      return 'danger';
    }

    if (tone === 'warn') {
      return 'warning';
    }

    return 'neutral';
  }
}
