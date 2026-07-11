import { Component, inject, input } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { GameCopyEditableText } from '../../../shared/game-copy-editable-text/game-copy-editable-text';
import { ExplorationManualTrialDisplayState } from './exploration-manual-trial-display.state';

@Component({
  selector: 'app-exploration-manual-trial-runtime-error',
  standalone: true,
  imports: [GameCopyEditableText, MessageModule],
  templateUrl: './exploration-manual-trial-runtime-error.html',
})
export class ExplorationManualTrialRuntimeError {
  readonly display = inject(ExplorationManualTrialDisplayState);
  readonly technicalContext = input.required<string>();
}
