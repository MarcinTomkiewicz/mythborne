import { Component, DestroyRef, OnInit, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ToastService } from '../../../core/services/ui/toast';
import { EXPLORATION_ENCOUNTERS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { ExplorationEncounterCandidateActionsState } from './exploration-encounter-candidate-actions.state';
import { ExplorationEncounterCombatSection } from './exploration-encounter-combat-section';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncounterEditSection } from './exploration-encounter-edit-section';
import { ExplorationEncounterEffectDefinitionActionsState } from './exploration-encounter-effect-definition-actions.state';
import { ExplorationEncounterEffectPayloadActionsState } from './exploration-encounter-effect-payload-actions.state';
import { ExplorationEncounterMeaningSection } from './exploration-encounter-meaning-section';
import { ExplorationEncounterPayloadSection } from './exploration-encounter-payload-section';
import { ExplorationEncounterResourcePayloadActionsState } from './exploration-encounter-resource-payload-actions.state';
import { ExplorationEncounterRewardActionsState } from './exploration-encounter-reward-actions.state';
import { ExplorationEncounterRewardSection } from './exploration-encounter-reward-section';
import { ExplorationEncountersListSection } from './exploration-encounters-list-section';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounters-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    AdminTagLinks,
    ExplorationEncountersListSection,
    ExplorationEncounterMeaningSection,
    ExplorationEncounterEditSection,
    ExplorationEncounterRewardSection,
    ExplorationEncounterCombatSection,
    ExplorationEncounterPayloadSection,
  ],
  providers: [
    ExplorationEncountersPageState,
    ExplorationEncounterDefinitionActionsState,
    ExplorationEncounterRewardActionsState,
    ExplorationEncounterCandidateActionsState,
    ExplorationEncounterResourcePayloadActionsState,
    ExplorationEncounterEffectDefinitionActionsState,
    ExplorationEncounterEffectPayloadActionsState,
  ],
  templateUrl: './exploration-encounters-page.html',
})
export class ExplorationEncountersPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly page = inject(ExplorationEncountersPageState);
  readonly links = EXPLORATION_ENCOUNTERS_PAGE_LINKS;

  constructor() {
    effect(() => {
      const message = this.page.error();

      if (message) {
        this.toast.show('error', 'Exploration encounters', message);
      }
    });
  }

  ngOnInit(): void {
    this.page.loadInitialData();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        filter((event) => event.urlAfterRedirects.startsWith('/admin/exploration-encounters')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.page.loadInitialData());
  }
}
