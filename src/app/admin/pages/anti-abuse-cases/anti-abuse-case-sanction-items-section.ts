import { Component, input } from '@angular/core';
import { AntiAbuseSanctionItemDecision } from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import { sanctionItemLinkDisplay } from '../../../core/utils/anti-abuse-decision-display';
import { displayValue } from '../../../core/utils/display-value';

@Component({
  selector: 'app-anti-abuse-case-sanction-items-section',
  standalone: true,
  templateUrl: './anti-abuse-case-sanction-items-section.html',
})
export class AntiAbuseCaseSanctionItemsSection {
  readonly sanctionItems = input.required<AntiAbuseSanctionItemDecision[]>();

  sanctionItemDisplay(item: AntiAbuseSanctionItemDecision): {
    label: string;
    description: string;
    helperText: string;
  } {
    return sanctionItemLinkDisplay(item);
  }

  value(value: string | null | undefined): string {
    return displayValue(value);
  }
}
