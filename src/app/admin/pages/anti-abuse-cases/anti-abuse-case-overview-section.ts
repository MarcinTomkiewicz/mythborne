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
