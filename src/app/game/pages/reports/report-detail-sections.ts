import { Component, computed, input } from '@angular/core';
import type {
  PrivateReportDetailPage,
  ReportDetail,
} from '../../../core/domain/reports/report-detail.model';
import { PvpPrivateReportCopy } from '../../../core/domain/pvp/pvp-private-report-copy.model';
import type { ReportShellCopy } from '../../../core/domain/reports/report-page-copy.model';
import { mapNonPvpCanonicalReportCombatStageView } from '../../../core/utils/combat-report-display.mapper';
import {
  isPrivatePvpReportDetail,
} from '../../../core/utils/pvp-report-domain-context';
import { mapReportDetailPreviewView } from '../../../core/utils/report-detail-preview.mapper';
import { mapReportHandoffActions } from '../../../core/utils/report-handoff-actions.mapper';
import { CombatStage } from '../../components/combat/combat-stage';
import { PvpReportDomainContent } from '../../components/pvp-report-domain-content/pvp-report-domain-content';
import { ReportHandoffActions } from '../../components/report-handoff-actions/report-handoff-actions';
import { ReportDetailPreviewDisplay } from '../../components/report-detail-preview-card/report-detail-preview-display';

@Component({
  selector: 'app-report-detail-sections',
  standalone: true,
  imports: [
    CombatStage,
    PvpReportDomainContent,
    ReportHandoffActions,
    ReportDetailPreviewDisplay,
  ],
  templateUrl: './report-detail-sections.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportDetailSections {
  readonly detail = input.required<ReportDetail>();
  readonly activeHeroId = input<string | null>(null);
  readonly pvpPrivateReportCopy = input<PvpPrivateReportCopy | null>(null);
  readonly shellCopy = input<ReportShellCopy | null>(null);

  readonly context = computed(() => this.detail().domainContextJson);
  readonly privateDetail = computed(() =>
    this.detail().access.visibility === 'private'
      ? this.detail() as PrivateReportDetailPage
      : null,
  );
  readonly isPrivateExploration = computed(() => {
    const context = this.context();

    return context.reportDomainKey === 'exploration' &&
      context.frontendUsage.canUsePrivateDomainReads &&
      !context.frontendUsage.sourceIdsRedacted &&
      context.missingContextReason === null;
  });
  readonly privatePvpDetail = computed(() => {
    const detail = this.privateDetail();

    return detail && isPrivatePvpReportDetail(detail) ? detail : null;
  });
  readonly privateExplorationPreview = computed(() => {
    const detail = this.privateDetail();

    return detail && this.isPrivateExploration()
      ? mapReportDetailPreviewView({
          detail,
          activeHeroId: this.activeHeroId(),
        })
      : null;
  });
  readonly combatStage = computed(() =>
    this.isPrivateExploration() || this.privatePvpDetail()
      ? null
      : mapNonPvpCanonicalReportCombatStageView(this.detail().report, {
          activeHeroId: this.activeHeroId(),
          combatResultId: this.context().combat?.combatResultId ?? null,
        }),
  );
  readonly reportActions = computed(() => {
    const detail = this.privateDetail();

    return detail
      ? mapReportHandoffActions({
          reportId: detail.access.reportId,
          publicToken: detail.report.publicToken,
        })
      : null;
  });
}
