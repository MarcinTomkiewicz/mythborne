import { Component, input } from '@angular/core';

@Component({
  selector: 'app-sandbox-test-tools-strip',
  standalone: true,
  templateUrl: './sandbox-test-tools-strip.html',
  host: { class: 'd-block w-100' },
})
export class SandboxTestToolsStrip {
  readonly title = input.required<string>();
  readonly helperText = input.required<string>();
}
