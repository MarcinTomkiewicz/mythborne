import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { GAME_COPY_DEFAULT_LOCALE } from '../../../core/constants/game-copy.const';
import {
  MANUAL_TRIAL_COPY_KIND,
  MANUAL_TRIAL_ERROR_CONTEXT,
} from '../../../core/constants/manual-trial.const';
import { GameCopyEditableText } from '../../../shared/game-copy-editable-text/game-copy-editable-text';
import { GameCopyEditTrigger } from '../../../shared/game-copy-edit-trigger/game-copy-edit-trigger';
import { ExplorationManualTrialCopyState } from './exploration-manual-trial-copy.state';
import { ExplorationManualTrialDisplayState } from './exploration-manual-trial-display.state';
import { ExplorationManualTrialExitState } from './exploration-manual-trial-exit.state';
import { ExplorationManualTrialState } from './exploration-manual-trial.state';

@Component({
  selector: 'app-exploration-manual-trial-unavailable-panel',
  standalone: true,
  imports: [
    ButtonModule,
    GameCopyEditableText,
    GameCopyEditTrigger,
    MessageModule,
  ],
  templateUrl: './exploration-manual-trial-unavailable-panel.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationManualTrialUnavailablePanel {
  readonly copyState = inject(ExplorationManualTrialCopyState);
  readonly display = inject(ExplorationManualTrialDisplayState);
  readonly exit = inject(ExplorationManualTrialExitState);
  readonly manualTrial = inject(ExplorationManualTrialState);
  readonly copyKind = MANUAL_TRIAL_COPY_KIND;
  readonly copyLocale = GAME_COPY_DEFAULT_LOCALE;
  readonly errorContext = MANUAL_TRIAL_ERROR_CONTEXT;
}
