import { Component, computed, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  ReportDetailCore,
} from '../../../core/domain/reports/report.model';
import { absoluteBrowserUrl, copyTextToClipboard } from '../../../core/utils/browser-clipboard';
import { mapCanonicalReportCombatStageView } from '../../../core/utils/combat-report-display.mapper';
import { publicReportPathFromToken } from '../../../core/utils/public-report-path';
import { CombatSurface } from '../../components/combat/combat-surface';

@Component({
  selector: 'app-report-detail-sections',
  standalone: true,
  imports: [
    ButtonModule,
    CombatSurface,
  ],
  templateUrl: './report-detail-sections.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportDetailSections {
  readonly report = input.required<ReportDetailCore>();
  readonly reportId = input.required<string>();
  readonly activeHeroId = input.required<string>();
  readonly shareActionLabel = input.required<string>();

  readonly combatStage = computed(() =>
    mapCanonicalReportCombatStageView(this.report(), {
      activeHeroId: this.activeHeroId(),
      reportId: this.reportId(),
    }),
  );
  readonly publicReportPath = computed(() =>
    publicReportPathFromToken(this.report().publicToken),
  );

  copyPublicReportLink(): void {
    const path = this.publicReportPath();

    if (!path) {
      return;
    }

    void copyTextToClipboard(absoluteBrowserUrl(path));
  }
}
