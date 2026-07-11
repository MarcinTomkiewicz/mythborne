import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import type { StructuredConfirmDialogContent } from '../../core/interfaces/structured-dialog-content.interface';
import { GameCopyEditTrigger } from '../game-copy-edit-trigger/game-copy-edit-trigger';

@Component({
  selector: 'app-structured-confirm-dialog',
  standalone: true,
  imports: [ButtonModule, ConfirmDialogModule, GameCopyEditTrigger],
  templateUrl: './structured-confirm-dialog.html',
})
export class StructuredConfirmDialog {
  readonly key = input.required<string>();
  readonly styleClass = input('');
  readonly content = input.required<StructuredConfirmDialogContent>();
  readonly hidden = output<void>();
}
