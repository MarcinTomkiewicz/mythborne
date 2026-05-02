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
import { RewardProfileEntryActionsState } from './reward-profile-entry-actions.state';
import { RewardProfilesPageState } from './reward-profiles-page.state';

@Component({
  selector: 'app-reward-profile-entries-section',
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
  templateUrl: './reward-profile-entries-section.html',
})
export class RewardProfileEntriesSection {
  readonly page = inject(RewardProfilesPageState);
  readonly entryActions = inject(RewardProfileEntryActionsState);
}
