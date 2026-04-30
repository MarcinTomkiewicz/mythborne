import { Component, input } from '@angular/core';
import {
  AntiAbuseSignalReadModel,
} from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseSignalTypeEntry } from '../../../core/domain/anti-abuse/anti-abuse-dictionary.model';
import { displayValue } from '../../../core/utils/display-value';
import { CollapsedJsonPreview } from '../../../shared/json-preview/collapsed-json-preview';

@Component({
  selector: 'app-anti-abuse-case-signals-section',
  standalone: true,
  imports: [CollapsedJsonPreview],
  templateUrl: './anti-abuse-case-signals-section.html',
})
export class AntiAbuseCaseSignalsSection {
  readonly signals = input.required<AntiAbuseSignalReadModel[]>();
  readonly signalTypes = input.required<AntiAbuseSignalTypeEntry[]>();

  signalType(signal: AntiAbuseSignalReadModel): AntiAbuseSignalTypeEntry | null {
    return this.signalTypes().find((entry) => entry.key === signal.signalTypeKey) ?? null;
  }

  value(value: string | number | null | undefined): string {
    return displayValue(value);
  }
}
