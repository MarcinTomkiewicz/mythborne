import { Component, input } from '@angular/core';
import {
  PlayerAbuseReportTypeEntry,
  PlayerRelationshipDeclarationTypeEntry,
} from '../../../core/domain/anti-abuse/anti-abuse-dictionary.model';
import {
  PlayerAbuseReportDecision,
  PlayerAbuseReportStatus,
  PlayerRelationshipDeclarationDecision,
  PlayerRelationshipDeclarationStatus,
} from '../../../core/domain/anti-abuse/anti-abuse-decision.model';
import {
  playerAbuseReportStatusLabel,
  relationshipDeclarationStatusLabel,
} from '../../../core/utils/anti-abuse-decision-display';
import { displayValue } from '../../../core/utils/display-value';

@Component({
  selector: 'app-anti-abuse-case-reports-declarations-section',
  standalone: true,
  templateUrl: './anti-abuse-case-reports-declarations-section.html',
})
export class AntiAbuseCaseReportsDeclarationsSection {
  readonly reports = input.required<PlayerAbuseReportDecision[]>();
  readonly declarations = input.required<PlayerRelationshipDeclarationDecision[]>();
  readonly reportTypes = input.required<PlayerAbuseReportTypeEntry[]>();
  readonly declarationTypes = input.required<PlayerRelationshipDeclarationTypeEntry[]>();

  reportType(report: PlayerAbuseReportDecision): PlayerAbuseReportTypeEntry | null {
    return this.reportTypes().find((entry) => entry.key === report.reportTypeKey) ?? null;
  }

  declarationType(
    declaration: PlayerRelationshipDeclarationDecision,
  ): PlayerRelationshipDeclarationTypeEntry | null {
    return (
      this.declarationTypes().find(
        (entry) => entry.key === declaration.declarationTypeKey,
      ) ?? null
    );
  }

  reportStatusLabel(status: PlayerAbuseReportStatus): string {
    return playerAbuseReportStatusLabel(status);
  }

  declarationStatusLabel(status: PlayerRelationshipDeclarationStatus): string {
    return relationshipDeclarationStatusLabel(status);
  }

  value(value: string | null | undefined): string {
    return displayValue(value);
  }
}
