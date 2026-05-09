import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { CollapsedJsonPreview } from '../../../shared/json-preview/collapsed-json-preview';
import { RewardProfilePreviewState } from './reward-profile-preview.state';
import { RewardProfilesPageState } from './reward-profiles-page.state';

@Component({
  selector: 'app-reward-profile-preview-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    TableModule,
    CollapsedJsonPreview,
  ],
  templateUrl: './reward-profile-preview-section.html',
})
export class RewardProfilePreviewSection {
  readonly preview = inject(RewardProfilePreviewState);
  readonly page = inject(RewardProfilesPageState);
}
