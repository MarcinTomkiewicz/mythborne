import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { EXPLORATION_DEBUG_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ExplorationDebugActionsSection } from './exploration-debug-actions-section';
import { ExplorationDebugReadinessSection } from './exploration-debug-readiness-section';
import { ExplorationDebugRuntimeSection } from './exploration-debug-runtime-section';
import { ExplorationDebugScopeSection } from './exploration-debug-scope-section';
import { ExplorationDebugTimerSection } from './exploration-debug-timer-section';
import { ExplorationDebugActionsState } from './exploration-debug-actions.state';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { ExplorationDebugScopeState } from './exploration-debug-scope.state';
import { ExplorationDebugFeedbackState } from './exploration-debug-feedback.state';
import { ExplorationDebugPageState } from './exploration-debug-page.state';
import { ExplorationDebugRuntimeState } from './exploration-debug-runtime.state';
import { ExplorationTimerConfigState } from './exploration-timer-config.state';
import { ExplorationSmokeReadinessState } from './exploration-smoke-readiness.state';

@Component({
  selector: 'app-exploration-debug-page',
  standalone: true,
  imports: [
    MessageModule,
    AdminServerSwitcher,
    AdminTagLinks,
    LoadingOverlay,
    ExplorationDebugActionsSection,
    ExplorationDebugReadinessSection,
    ExplorationDebugRuntimeSection,
    ExplorationDebugScopeSection,
    ExplorationDebugTimerSection,
  ],
  providers: [
    ExplorationDebugFeedbackState,
    ExplorationDebugScopeState,
    ExplorationDefinitionsState,
    ExplorationSmokeReadinessState,
    ExplorationDebugRuntimeState,
    ExplorationTimerConfigState,
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

