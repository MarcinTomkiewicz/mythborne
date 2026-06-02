import { Component, input, output } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

export interface StructuredConfirmDialogSegment {
  text: string;
  highlighted: boolean;
}

@Component({
  selector: 'app-structured-confirm-dialog',
  standalone: true,
  imports: [ConfirmDialogModule],
  templateUrl: './structured-confirm-dialog.html',
})
export class StructuredConfirmDialog {
  readonly key = input.required<string>();
  readonly styleClass = input('');
  readonly messageSegments =
    input.required<readonly StructuredConfirmDialogSegment[]>();
  readonly hidden = output<void>();
}
