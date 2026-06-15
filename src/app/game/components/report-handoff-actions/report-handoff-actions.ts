import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ReportHandoffActionsViewModel } from '../../../core/domain/reports/report-handoff.model';
import { ToastService } from '../../../core/services/ui/toast';
import { absoluteBrowserUrl, copyTextToClipboard } from '../../../core/utils/browser-clipboard';

@Component({
  selector: 'app-report-handoff-actions',
  standalone: true,
  imports: [ButtonModule, RouterLink],
  template: `
    <section class="mg-card p-lg flex-col gap-sm w-100">
      <p class="small-caps color-muted text-xs m-0">{{ heading() }}</p>
      <div class="flex-row-start-center flex-wrap gap-sm w-100">
        @if (actions().directReportLink && directReportButtonLabel(); as label) {
          <p-button
            [label]="label"
            icon="pi pi-file"
            [routerLink]="actions().directReportLink"
          />
        }
        @if (actions().publicReportPath && publicReportButtonLabel(); as label) {
          <p-button
            type="button"
            [label]="label"
            icon="pi pi-link"
            severity="secondary"
            [text]="publicReportCopyText()"
            [outlined]="!publicReportCopyText()"
            (onClick)="copyPublicReportLink()"
          />
        }
      </div>
      @if (actions().directReportUnavailableMessage; as message) {
        <p class="warn-text text-sm m-0">{{ message }}</p>
      }
      @if (actions().directReportLink && !directReportButtonLabel()) {
        <p class="warn-text text-sm m-0">reportHandoff.actions.directReportLabel.missingCopy</p>
      }
      @if (actions().publicReportUnavailableMessage; as message) {
        <p class="warn-text text-sm m-0">{{ message }}</p>
      }
    </section>
  `,
  host: { class: 'd-contents' },
})
export class ReportHandoffActions {
  private readonly toast = inject(ToastService);
  readonly actions = input.required<ReportHandoffActionsViewModel>();
  readonly heading = input('reportHandoff.actions.heading');
  readonly directReportLabel = input<string | null>(null);
  readonly publicReportCopyLabel = input<string | null>(null);
  readonly publicReportCopyText = input(true);

  directReportButtonLabel(): string | null {
    return this.directReportLabel() ?? buttonLabelOrNull(this.actions().directReportLabel);
  }

  publicReportButtonLabel(): string | null {
    return this.publicReportCopyLabel() ?? buttonLabelOrNull(this.actions().publicReportCopyLabel);
  }

  copyPublicReportLink(): void {
    const link = this.actions().publicReportPath;

    if (!link) {
      this.toast.show(
        'error',
        'reportHandoff.toast.title',
        'reportHandoff.toast.copyPublicReportLinkFailed',
      );
      return;
    }

    void copyTextToClipboard(absoluteBrowserUrl(link))
      .then((copied) => this.toast.show(
        copied ? 'success' : 'error',
        'reportHandoff.toast.title',
        copied
          ? 'reportHandoff.toast.copyPublicReportLinkSuccess'
          : 'reportHandoff.toast.copyPublicReportLinkFailed',
      ));
  }
}

function buttonLabelOrNull(label: string | null): string | null {
  return label && !label.includes('.') ? label : null;
}
