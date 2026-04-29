import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metadata-display',
  standalone: true,
  templateUrl: './metadata-display.html',
  host: { class: 'd-contents' },
})
export class MetadataDisplay {
  readonly label = input.required<string>();
  readonly description = input<string | null>(null);
  readonly helperText = input<string | null>(null);
  readonly technicalKey = input<string | null>(null);
  readonly technicalLabel = input('key');
  readonly labelClass = input('heading-color');
}
