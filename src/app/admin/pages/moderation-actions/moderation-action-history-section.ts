import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ModerationActionHistoryMode } from '../../../core/domain/moderation/moderation-action.model';
import { ModerationActionsPageFacade } from '../../../core/services/moderation/moderation-actions-page.facade';

@Component({
  selector: 'app-moderation-action-history-section',
  standalone: true,
  imports: [ReactiveFormsModule, AutoCompleteModule, ButtonModule, MessageModule],
  templateUrl: './moderation-action-history-section.html',
})
export class ModerationActionHistorySection {
  readonly page = input.required<ModerationActionsPageFacade>();
  readonly loadHistory = output<void>();
  readonly resetHistoryFilters = output<void>();
  readonly historyModeChange = output<ModerationActionHistoryMode>();
}
