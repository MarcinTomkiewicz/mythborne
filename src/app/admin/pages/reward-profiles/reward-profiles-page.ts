import { Component, OnInit, effect, inject } from '@angular/core';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ToastService } from '../../../core/services/ui/toast';
import { REWARD_PROFILES_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { RewardProfileEntryActionsState } from './reward-profile-entry-actions.state';
import { RewardProfileEditorSection } from './reward-profile-editor-section';
import { RewardProfileEntriesSection } from './reward-profile-entries-section';
import { RewardProfileOutcomeActionsState } from './reward-profile-outcome-actions.state';
import { RewardProfileOutcomesSection } from './reward-profile-outcomes-section';
import { RewardProfilePreviewState } from './reward-profile-preview.state';
import { RewardProfilePreviewSection } from './reward-profile-preview-section';
import { RewardProfileProfileActionsState } from './reward-profile-profile-actions.state';
import { RewardProfilesPageState } from './reward-profiles-page.state';

@Component({
  selector: 'app-reward-profiles-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    AdminTagLinks,
    RewardProfileEditorSection,
    RewardProfileEntriesSection,
    RewardProfileOutcomesSection,
    RewardProfilePreviewSection,
  ],
  providers: [
    RewardProfilesPageState,
    RewardProfileProfileActionsState,
    RewardProfileEntryActionsState,
    RewardProfileOutcomeActionsState,
    RewardProfilePreviewState,
  ],
  templateUrl: './reward-profiles-page.html',
})
export class RewardProfilesPage implements OnInit {
  readonly page = inject(RewardProfilesPageState);
  readonly links = REWARD_PROFILES_PAGE_LINKS;
  private readonly toast = inject(ToastService);

  constructor() {
    effect(() => {
      const message = this.page.error();

      if (message) {
        this.toast.show('error', 'Reward profiles', message);
      }
    });
  }

  ngOnInit(): void {
    this.page.loadInitialData();
  }
}
