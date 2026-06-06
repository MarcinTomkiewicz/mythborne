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
        @if (actions().directReportLink) {
          <p-button
            [label]="directReportLabel() ?? actions().directReportLabel"
            icon="pi pi-file"
            [routerLink]="actions().directReportLink"
          />
        }
        <p-button
          type="button"
          [label]="publicReportCopyLabel() ?? actions().publicReportCopyLabel"
          icon="pi pi-link"
          severity="secondary"
          [text]="publicReportCopyText()"
          [outlined]="!publicReportCopyText()"
          [disabled]="actions().publicReportCopyDisabled"
          (onClick)="copyPublicReportLink()"
        />
      </div>
      @if (actions().directReportUnavailableMessage; as message) {
        <p class="warn-text text-sm m-0">{{ message }}</p>
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
  readonly heading = input('Akcje raportu');
  readonly directReportLabel = input<string | null>(null);
  readonly publicReportCopyLabel = input<string | null>(null);
  readonly publicReportCopyText = input(true);

  copyPublicReportLink(): void {
    const link = this.actions().publicReportPath;

    if (!link) {
      this.toast.show('error', 'Raport', 'Nie udało się skopiować linku do raportu.');
      return;
    }

    void copyTextToClipboard(absoluteBrowserUrl(link))
      .then((copied) => this.toast.show(
        copied ? 'success' : 'error',
        'Raport',
        copied
          ? 'Link do raportu został skopiowany.'
          : 'Nie udało się skopiować linku do raportu.',
      ));
  }
}
