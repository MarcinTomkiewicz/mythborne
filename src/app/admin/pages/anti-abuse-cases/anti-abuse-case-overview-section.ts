import { Component, input } from '@angular/core';
import {
  AntiAbuseCaseDetailReadModel,
  AntiAbuseCaseSource,
} from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseCaseStatus,
  AntiAbuseCaseVerdict,
} from '../../../core/domain/anti-abuse/anti-abuse-decision.model';
import {
  antiAbuseCaseSourceLabel,
  antiAbuseCaseStatusLabel,
  antiAbuseCaseVerdictLabel,
} from '../../../core/utils/anti-abuse-decision-display';
import { displayValue } from '../../../core/utils/display-value';

@Component({
  selector: 'app-anti-abuse-case-overview-section',
  standalone: true,
  templateUrl: './anti-abuse-case-overview-section.html',
})
export class AntiAbuseCaseOverviewSection {
  readonly detail = input.required<AntiAbuseCaseDetailReadModel>();

  overviewFacts(): { label: string; value: string }[] {
    const item = this.detail().case;

    return [
      { label: 'Primary hero', value: this.value(item.primaryHeroId) },
      { label: 'Primary user', value: this.value(item.primaryUserId) },
      { label: 'Assigned staff', value: this.value(item.assignedToUserId) },
      { label: 'Opened by', value: this.value(item.openedByUserId) },
      { label: 'Resolved by', value: this.value(item.resolvedByUserId) },
      { label: 'Grouping key', value: this.value(item.groupingKey) },
      { label: 'Last signal', value: this.value(item.lastSignalAt) },
      { label: 'Created', value: item.createdAt },
      { label: 'Updated', value: item.updatedAt },
      { label: 'Resolved', value: this.value(item.resolvedAt) },
      { label: 'Cancelled', value: this.value(item.cancelledAt) },
      {
        label: 'Possible recidivism',
        value: item.possibleRecidivism ? 'Yes' : 'No',
      },
    ];
  }

  groupingFacts(): { label: string; value: string }[] {
    const detail = this.detail();

    return [
      { label: 'Grouping key', value: this.value(detail.case.groupingKey) },
      { label: 'Linked signals', value: String(detail.signals.length) },
      { label: 'Case-signal links', value: String(detail.caseSignals.length) },
      { label: 'Participants', value: String(detail.participants.length) },
    ];
  }

  linkedSignalFacts(): { label: string; value: string }[] {
    const detail = this.detail();

    return detail.caseSignals.map((link) => {
      const signal = detail.signals.find((entry) => entry.id === link.signalId);
      const signalType = detail.dictionaries.signalTypes.find(
        (entry) => entry.key === signal?.signalTypeKey,
      );
      const label = signalType?.label ?? signal?.title ?? link.signalId;
      const entity = signal?.entityTypeKey
        ? `${signal.entityTypeKey}: ${this.value(signal.entityId)}`
        : 'No related entity';
      const reason = link.reason ? ` - ${link.reason}` : '';

      return {
        label,
        value: `${entity}${reason}`,
      };
    });
  }

  participantFacts(): { label: string; value: string }[] {
    return this.detail().participants.map((participant) => ({
      label: participant.roleKey,
      value: [
        `Hero: ${this.value(participant.heroId)}`,
        `User: ${this.value(participant.userId)}`,
        this.value(participant.reason),
      ].join(' - '),
    }));
  }

  sourceExplanation(): string {
    const item = this.detail().case;

    switch (item.source) {
      case 'system_signal':
        return 'This case was created or linked by DB-owned signal grouping. Staff still reviews the evidence and chooses any status, verdict or sanction action explicitly.';
      case 'player_report':
        return 'This case originated from a player report flow. Linked signals and declarations are review context and do not decide the outcome automatically.';
      case 'manual':
        return 'This case was opened manually by staff. Any linked signals, reports or participants are context for review, not automatic punishment.';
      default:
        return 'This case is staff-reviewed. Signals and links are review aids, not automatic punishment.';
    }
  }

  statusLabel(status: AntiAbuseCaseStatus): string {
    return antiAbuseCaseStatusLabel(status);
  }

  sourceLabel(source: AntiAbuseCaseSource): string {
    return antiAbuseCaseSourceLabel(source);
  }

  verdictLabel(verdict: AntiAbuseCaseVerdict | null): string {
    return verdict ? antiAbuseCaseVerdictLabel(verdict) : '-';
  }

  value(value: string | number | boolean | null | undefined): string {
    return displayValue(value);
  }
}
