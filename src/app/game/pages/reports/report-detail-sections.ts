import { Component, computed, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import type {
  PrivateReportDetailPage,
  ReportDetailV2,
} from '../../../core/domain/reports/report-detail.model';
import { PvpPrivateReportCopy } from '../../../core/domain/pvp/pvp-private-report-copy.model';
import type { ReportShellCopy } from '../../../core/domain/reports/report-page-copy.model';
import { absoluteBrowserUrl, copyTextToClipboard } from '../../../core/utils/browser-clipboard';
import { mapNonPvpCanonicalReportCombatStageView } from '../../../core/utils/combat-report-display.mapper';
import { publicReportPathFromToken } from '../../../core/utils/public-report-path';
import {
  isPrivatePvpReportDetail,
} from '../../../core/utils/pvp-report-domain-context';
import { CombatStage } from '../../components/combat/combat-stage';
import { ExplorationReportDomainContent } from '../../components/exploration-report-domain-content/exploration-report-domain-content';
import { PvpReportDomainContent } from '../../components/pvp-report-domain-content/pvp-report-domain-content';

@Component({
  selector: 'app-report-detail-sections',
  standalone: true,
  imports: [
    ButtonModule,
    CombatStage,
    ExplorationReportDomainContent,
    PvpReportDomainContent,
  ],
  templateUrl: './report-detail-sections.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportDetailSections {
  readonly detail = input.required<ReportDetailV2>();
  readonly activeHeroId = input<string | null>(null);
  readonly pvpPrivateReportCopy = input<PvpPrivateReportCopy | null>(null);
  readonly shellCopy = input.required<ReportShellCopy>();

  readonly context = computed(() => this.detail().domainContextJson);
  readonly isPrivateExploration = computed(() => {
    const context = this.context();

    return context.reportDomainKey === 'exploration' &&
      context.frontendUsage.canUsePrivateDomainReads &&
      !context.frontendUsage.sourceIdsRedacted &&
      context.missingContextReason === null;
  });
  readonly privatePvpDetail = computed(() =>
    isPrivatePvpReportDetail(this.detail())
      ? this.detail() as PrivateReportDetailPage
      : null,
  );
  readonly combatStage = computed(() =>
    this.isPrivateExploration() || this.privatePvpDetail()
      ? null
      : mapNonPvpCanonicalReportCombatStageView(this.detail().report, {
          activeHeroId: this.activeHeroId(),
          combatResultId: this.context().combat?.combatResultId ?? null,
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
