import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ModerationActionsPageFacade } from '../../../core/services/moderation/moderation-actions-page.facade';

@Component({
  selector: 'app-moderation-action-create-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './moderation-action-create-section.html',
})
export class ModerationActionCreateSection {
  readonly page = input.required<ModerationActionsPageFacade>();
  readonly createAction = output<void>();
  readonly actionTypeChange = output<void>();
}
