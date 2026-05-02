import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { RewardProfilePreviewState } from './reward-profile-preview.state';
import { RewardProfileProfileActionsState } from './reward-profile-profile-actions.state';
import { RewardProfilesPageState } from './reward-profiles-page.state';

@Component({
  selector: 'app-reward-profile-editor-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './reward-profile-editor-section.html',
})
export class RewardProfileEditorSection {
  readonly page = inject(RewardProfilesPageState);
  readonly profileActions = inject(RewardProfileProfileActionsState);
  readonly preview = inject(RewardProfilePreviewState);
}
