import { Component, computed, inject } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CombatSourcePresentation } from '../../../core/domain/combat/combat-source-presentation.model';
import { RichText } from '../../../shared/rich-text/rich-text';
import { ExplorationChallengeDetailsCard } from '../exploration-challenge-details-card/exploration-challenge-details-card';
import { ExplorationChallengePendingRewardCard } from '../exploration-challenge-pending-reward-card/exploration-challenge-pending-reward-card';
import { MinigameHost } from '../minigame-host/minigame-host';
import {
  MINIGAME_KEY,
  MINIGAME_SOURCE_ENTITY_TYPE,
  MinigameCompletionEvent,
  MinigameSourceRef,
} from '../minigame-host/minigame-host.model';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';
import { ExplorationMinigameHandoffState } from '../../pages/exploration/exploration-minigame-handoff.state';
import { ExplorationPageState } from '../../pages/exploration/exploration-page.state';

@Component({
  selector: 'app-exploration-active-challenge-report',
  standalone: true,
  imports: [
    ExplorationChallengeDetailsCard,
    ExplorationChallengePendingRewardCard,
    MinigameHost,
    ProgressSpinnerModule,
    RichText,
  ],
  templateUrl: './exploration-active-challenge-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationActiveChallengeReport {
  readonly challenge = inject(ExplorationChallengeState);
  private readonly page = inject(ExplorationPageState);
  private readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  readonly sourceRef = computed<MinigameSourceRef | null>(() => {
    const activeChallenge = this.challenge.activeChallenge();

    return activeChallenge
      ? {
          sourceEntityType: MINIGAME_SOURCE_ENTITY_TYPE.explorationChallengeAttempt,
          sourceEntityId: activeChallenge.id,
        }
      : null;
  });
  readonly encounterCombatHandoffNarrative = computed(() => {
    const narrative = this.challenge.activeChallenge()?.encounterCombatHandoffNarrativeJson ?? null;

    return narrative?.resultKind === 'encounter_combat_handoff' ? narrative : null;
  });
  readonly trialManifestationNarrative = computed(() =>
    this.challenge.activeChallenge()?.trialManifestationNarrativeJson ?? null
  );
  readonly isRuntimeCopyLoading = computed(() => this.page.isRuntimeCopyLoading());
  readonly hasRuntimeCopyError = computed(() => this.page.hasRuntimeCopyError());
  readonly runtimeCopy = computed(() => this.page.runtimeCopy());
  readonly requiresCombatSourcePresentation = computed(() =>
    this.challenge.activeChallenge()?.minigameKey === MINIGAME_KEY.combat,
  );
  readonly combatSourcePresentation = computed<CombatSourcePresentation | null>(() => {
    const activeChallenge = this.challenge.activeChallenge();
    const copy = this.page.runtimeCopy();

    if (!activeChallenge || !copy) {
      return null;
    }

    const key = activeChallenge.trialDefinitionId
      ? copy.combatSourcePresentationKeys.trial
      : activeChallenge.encounterDefinitionId
        ? copy.combatSourcePresentationKeys.combatEncounter
        : copy.combatSourcePresentationKeys.default;

    return copy.combatSourcePresentations[key];
  });

  acceptMinigameCompletion(event: MinigameCompletionEvent): void {
    this.minigameHandoff.acceptMinigameCompletion(event);
  }
}
