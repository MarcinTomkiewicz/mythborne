import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ModerationActionCreateActions } from '../../../core/services/moderation/moderation-action-create.actions';
import { ModerationActionDictionariesState } from '../../../core/services/moderation/moderation-action-dictionaries.state';
import { ModerationActionHistoryState } from '../../../core/services/moderation/moderation-action-history.state';
import { ModerationActionsPageFacade } from '../../../core/services/moderation/moderation-actions-page.facade';
import { MODERATION_ACTIONS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { ModerationActionCreateSection } from './moderation-action-create-section';
import { ModerationActionHistorySection } from './moderation-action-history-section';

@Component({
  selector: 'app-moderation-actions-page',
  standalone: true,
  imports: [
    MessageModule,
    LoadingOverlay,
    AdminServerSwitcher,
    AdminTagLinks,
    ModerationActionCreateSection,
    ModerationActionHistorySection,
  ],
  providers: [
    ModerationActionsPageFacade,
    ModerationActionDictionariesState,
    ModerationActionCreateActions,
    ModerationActionHistoryState,
  ],
  templateUrl: './moderation-actions-page.html',
})
export class ModerationActionsPage implements OnInit {
  readonly page = inject(ModerationActionsPageFacade);
  readonly links = MODERATION_ACTIONS_PAGE_LINKS;

  ngOnInit(): void {
    this.page.loadInitialData();
  }
}
