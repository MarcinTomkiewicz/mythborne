import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ModerationActionsPageFacade } from '../../../core/services/moderation/moderation-actions-page.facade';

@Component({
  selector: 'app-moderation-action-history-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './moderation-action-history-section.html',
})
export class ModerationActionHistorySection {
  readonly page = input.required<ModerationActionsPageFacade>();
  readonly loadHistory = output<void>();
  readonly resetHistoryFilters = output<void>();
}
