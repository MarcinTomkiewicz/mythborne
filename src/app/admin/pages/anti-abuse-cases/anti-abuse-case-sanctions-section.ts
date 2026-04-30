import { Component, input } from '@angular/core';
import {
  AntiAbuseSanctionTypeEntry,
} from '../../../core/domain/anti-abuse/anti-abuse-dictionary.model';
import {
  AntiAbuseSanctionStatus,
} from '../../../core/domain/anti-abuse/anti-abuse-decision.model';
import {
  AntiAbuseSanctionDecision,
  CharacterPointPenaltyDecision,
} from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import { antiAbuseSanctionStatusLabel } from '../../../core/utils/anti-abuse-decision-display';
import { displayValue } from '../../../core/utils/display-value';

@Component({
  selector: 'app-anti-abuse-case-sanctions-section',
  standalone: true,
  templateUrl: './anti-abuse-case-sanctions-section.html',
})
export class AntiAbuseCaseSanctionsSection {
  readonly sanctions = input.required<AntiAbuseSanctionDecision[]>();
  readonly penalties = input.required<CharacterPointPenaltyDecision[]>();
  readonly sanctionTypes = input.required<AntiAbuseSanctionTypeEntry[]>();

  sanctionType(
    sanction: AntiAbuseSanctionDecision,
  ): AntiAbuseSanctionTypeEntry | null {
    return this.sanctionTypes().find((entry) => entry.key === sanction.sanctionTypeKey) ?? null;
  }

  sanctionStatusLabel(status: AntiAbuseSanctionStatus): string {
    return antiAbuseSanctionStatusLabel(status);
  }

  value(value: string | number | null | undefined): string {
    return displayValue(value);
  }
}
