import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RewardProfileOutcomeActionsState } from './reward-profile-outcome-actions.state';
import { RewardProfilesPageState } from './reward-profiles-page.state';

@Component({
  selector: 'app-reward-profile-outcomes-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './reward-profile-outcomes-section.html',
})
export class RewardProfileOutcomesSection {
  readonly page = inject(RewardProfilesPageState);
  readonly outcomeActions = inject(RewardProfileOutcomeActionsState);
}
