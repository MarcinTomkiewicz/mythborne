import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';
import { GameCopyEditState } from '../../core/services/game-copy/game-copy-edit.state';

@Component({
  selector: 'app-game-copy-edit-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
    TextareaModule,
  ],
  templateUrl: './game-copy-edit-dialog.html',
})
export class GameCopyEditDialog {
  readonly state = input.required<GameCopyEditState>();
}
