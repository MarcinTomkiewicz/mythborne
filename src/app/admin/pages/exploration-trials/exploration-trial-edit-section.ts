import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ExplorationTrialsActionsState } from './exploration-trials-actions.state';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

@Component({
  selector: 'app-exploration-trial-edit-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './exploration-trial-edit-section.html',
})
export class ExplorationTrialEditSection {
  readonly page = inject(ExplorationTrialsPageState);
  readonly actions = inject(ExplorationTrialsActionsState);
}
