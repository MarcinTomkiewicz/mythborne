import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { RewardProfilePreviewState } from './reward-profile-preview.state';

@Component({
  selector: 'app-reward-profile-preview-section',
  standalone: true,
  imports: [TableModule],
  templateUrl: './reward-profile-preview-section.html',
})
export class RewardProfilePreviewSection {
  readonly preview = inject(RewardProfilePreviewState);
}
