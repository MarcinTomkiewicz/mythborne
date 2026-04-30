import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AntiAbuseCaseReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  antiAbuseCaseSourceLabel,
  antiAbuseCaseStatusLabel,
  antiAbuseCaseVerdictLabel,
} from '../../../core/utils/anti-abuse-decision-display';

@Component({
  selector: 'app-anti-abuse-case-list-card',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './anti-abuse-case-list-card.html',
})
export class AntiAbuseCaseListCard {
  readonly caseItem = input.required<AntiAbuseCaseReadModel>();

  statusLabel(): string {
    return antiAbuseCaseStatusLabel(this.caseItem().status);
  }

  sourceLabel(): string {
    return antiAbuseCaseSourceLabel(this.caseItem().source);
  }

  verdictLabel(): string | null {
    const verdict = this.caseItem().verdict;
    return verdict ? antiAbuseCaseVerdictLabel(verdict) : null;
  }

  facts(): { label: string; value: string }[] {
    const item = this.caseItem();

    return [
      { label: 'Primary hero', value: item.primaryHeroId ?? '-' },
      { label: 'Primary user', value: item.primaryUserId ?? '-' },
      { label: 'Assigned staff', value: item.assignedToUserId ?? '-' },
      { label: 'Last signal', value: item.lastSignalAt ?? '-' },
      { label: 'Resolved', value: item.resolvedAt ?? '-' },
      { label: 'Created', value: item.createdAt },
    ];
  }
}
