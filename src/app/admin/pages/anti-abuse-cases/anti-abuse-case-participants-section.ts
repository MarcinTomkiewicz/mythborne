import { Component, input } from '@angular/core';
import { AntiAbuseCaseParticipant } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { displayValue } from '../../../core/utils/display-value';

@Component({
  selector: 'app-anti-abuse-case-participants-section',
  standalone: true,
  templateUrl: './anti-abuse-case-participants-section.html',
})
export class AntiAbuseCaseParticipantsSection {
  readonly participants = input.required<AntiAbuseCaseParticipant[]>();

  value(value: string | null | undefined): string {
    return displayValue(value);
  }
}
