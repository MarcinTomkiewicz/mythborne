import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ReportsCenterPreviewCopy } from '../../../core/domain/reports/reports-center-copy.model';
import { ReportsCenterPreviewV1 } from '../../../core/domain/reports/reports-center.model';
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

  copyPublicLink(path: string): void {
    void copyTextToClipboard(absoluteBrowserUrl(path));
  }
}
