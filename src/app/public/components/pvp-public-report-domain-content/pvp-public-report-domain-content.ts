import { Component, computed, input } from '@angular/core';
import { PvpPublicReportCopy } from '../../../core/domain/pvp/pvp-public-report-copy.model';
import { PvpResultSummaryV1 } from '../../../core/domain/pvp/pvp-result-snapshot.model';
import {
  PublicReportDetailV2,
  PublicReportDetailV2Available,
} from '../../../core/domain/reports/report-detail.model';
import { mapPvpAttackCombatStageView } from '../../../core/utils/combat-report-display.mapper';
import { publicPvpResultSummary } from '../../../core/utils/pvp-result-summary';
import { RichText } from '../../../shared/rich-text/rich-text';
import { CombatStage } from '../../../game/components/combat/combat-stage';

@Component({
  selector: 'app-pvp-public-report-domain-content',
  standalone: true,
  imports: [CombatStage, RichText],
  templateUrl: './pvp-public-report-domain-content.html',
  host: { class: 'd-block w-100' },
})
export class PvpPublicReportDomainContent {
  readonly copy = input<PvpPublicReportCopy | null>(null);
  readonly detail = input<PublicReportDetailV2 | null>(null);
  readonly availableDetail = computed((): PublicReportDetailV2Available | null => {
    const detail = this.detail();

    return detail?.report ? detail : null;
  });
  readonly resultSummary = computed((): PvpResultSummaryV1 | null =>
    publicPvpResultSummary(this.availableDetail()?.domainContextJson.pvpResult),
  );
  readonly missingResultDiagnostic = computed(() =>
    this.availableDetail()?.domainContextJson.pvp?.sourceKind === 'pvp_attack' &&
    !this.availableDetail()?.domainContextJson.pvpResult
      ? 'domainContextJson.pvpResult.public.missingBackfillRequired'
      : null,
  );
  readonly combatStage = computed(() => {
    const detail = this.availableDetail();

    return detail
      ? mapPvpAttackCombatStageView({
          report: detail.report,
          shell: detail.reportShellContextJson,
          combatResultId: detail.domainContextJson.pvp?.combatResultId,
          activeHeroId: null,
          pvpCombatContext: detail.domainContextJson.pvpCombatContext ?? null,
        })
      : null;
  });

  notFoundLabel(): string | null {
    const access = this.copy()?.access;

    return access && !access.isAvailable ? access.notFoundLabel : null;
  }
}
