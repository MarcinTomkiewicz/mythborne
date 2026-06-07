import { Component, computed, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  ReportDetailV2,
  ReportShellCopyV2,
} from '../../../core/domain/reports/report.model';
import { absoluteBrowserUrl, copyTextToClipboard } from '../../../core/utils/browser-clipboard';
import { mapCanonicalReportCombatStageView } from '../../../core/utils/combat-report-display.mapper';
import { publicReportPathFromToken } from '../../../core/utils/public-report-path';
import { CombatStage } from '../../components/combat/combat-stage';
import { ExplorationReportDomainContent } from '../../components/exploration-report-domain-content/exploration-report-domain-content';

@Component({
  selector: 'app-report-detail-sections',
  standalone: true,
  imports: [
    ButtonModule,
    CombatStage,
    ExplorationReportDomainContent,
  ],
  templateUrl: './report-detail-sections.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportDetailSections {
  readonly detail = input.required<ReportDetailV2>();
  readonly activeHeroId = input<string | null>(null);
  readonly shellCopy = input.required<ReportShellCopyV2>();

  readonly context = computed(() => this.detail().domainContextJson);
  readonly isPrivateExploration = computed(() => {
    const context = this.context();

    return context.reportDomainKey === 'exploration' &&
      context.frontendUsage.canUsePrivateDomainReads &&
      !context.frontendUsage.sourceIdsRedacted &&
      context.missingContextReason === null;
  });
  readonly combatStage = computed(() =>
    this.isPrivateExploration()
      ? null
      : mapCanonicalReportCombatStageView(this.detail().report, {
          activeHeroId: this.activeHeroId(),
          reportId: this.context().gameReportId,
        }),
  );
  readonly publicReportPath = computed(() =>
    publicReportPathFromToken(
      this.detail().report.publicToken ?? this.context().publicToken,
    ),
  );

  copyPublicReportLink(): void {
    const path = this.publicReportPath();

    if (!path) {
      return;
    }

    void copyTextToClipboard(absoluteBrowserUrl(path));
  }
}
