import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { EXPLORATION_DEBUG_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { CollapsedJsonPreview } from '../../../shared/json-preview/collapsed-json-preview';
import { ExplorationDebugActionsSection } from './exploration-debug-actions-section';
import { ExplorationDebugActionsState } from './exploration-debug-actions.state';
import { ExplorationDebugDefinitionsState } from './exploration-debug-definitions.state';
import { ExplorationDebugScopeState } from './exploration-debug-scope.state';
import { ExplorationDebugFeedbackState } from './exploration-debug-feedback.state';
import { ExplorationDebugPageState } from './exploration-debug-page.state';
import { ExplorationDebugRuntimeState } from './exploration-debug-runtime.state';

@Component({
  selector: 'app-exploration-debug-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    AdminServerSwitcher,
    AdminTagLinks,
    LoadingOverlay,
    CollapsedJsonPreview,
    ExplorationDebugActionsSection,
  ],
  providers: [
    ExplorationDebugFeedbackState,
    ExplorationDebugScopeState,
    ExplorationDebugDefinitionsState,
    ExplorationDebugRuntimeState,
    ExplorationDebugActionsState,
    ExplorationDebugPageState,
  ],
  templateUrl: './exploration-debug-page.html',
})
export class ExplorationDebugPage implements OnInit {
  readonly page = inject(ExplorationDebugPageState);
  readonly links = EXPLORATION_DEBUG_PAGE_LINKS;

  ngOnInit(): void {
    this.page.loadInitialData();
  }
}

