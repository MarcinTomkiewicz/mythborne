import { Component, computed, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CombatSourcePresentation } from '../../../core/domain/combat/combat-source-presentation.model';
import {
  MINIGAME_KEY,
  MINIGAME_SOURCE_ENTITY_TYPE,
  type MinigameCompletionEvent,
  type MinigameSourceRef,
} from '../../../core/domain/minigame/minigame-completion.model';
import { GameCopyEditableText } from '../../../shared/game-copy-editable-text/game-copy-editable-text';
import { RichText } from '../../../shared/rich-text/rich-text';
import { ExplorationChallengeDetailsCard } from '../exploration-challenge-details-card/exploration-challenge-details-card';
import { ExplorationChallengePendingRewardCard } from '../exploration-challenge-pending-reward-card/exploration-challenge-pending-reward-card';
import { MinigameHost } from '../minigame-host/minigame-host';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';
import { ExplorationManualTrialHost } from '../../pages/exploration/exploration-manual-trial-host';
import { ExplorationMinigameHandoffState } from '../../pages/exploration/exploration-minigame-handoff.state';
import { ExplorationPageState } from '../../pages/exploration/exploration-page.state';

@Component({
  selector: 'app-exploration-active-challenge-report',
  standalone: true,
  imports: [
    ExplorationChallengeDetailsCard,
    ExplorationChallengePendingRewardCard,
    ExplorationManualTrialHost,
    GameCopyEditableText,
    MessageModule,
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
  readonly activeChallengeNarrative = computed(() => {
    const activeChallenge = this.challenge.activeChallenge();

    if (activeChallenge?.trialDefinitionId) {
      return activeChallenge.trialManifestationNarrativeJson ?? null;
    }

    const narrative = activeChallenge?.encounterCombatHandoffNarrativeJson ?? null;

    return narrative?.resultKind === 'encounter_combat_handoff' ? narrative : null;
  });
  readonly isRuntimeCopyLoading = computed(() => this.page.isRuntimeCopyLoading());
  readonly runtimeCopyError = this.page.runtimeCopyError;
  readonly runtimeCopy = computed(() => this.page.runtimeCopy());
  readonly combatSourcePresentation = computed<CombatSourcePresentation | null>(() => {
    const activeChallenge = this.challenge.activeChallenge();
    const copy = this.page.runtimeCopy();

    if (!activeChallenge || activeChallenge.trialDefinitionId || !copy) {
      return null;
    }

    const key = activeChallenge.encounterDefinitionId
      ? copy.combatSourcePresentationKeys.combatEncounter
      : copy.combatSourcePresentationKeys.default;

    return copy.combatSourcePresentations[key];
  });
  readonly presentation = computed(() => {
    const activeChallenge = this.challenge.activeChallenge();
    const sourceRef = this.sourceRef();
    const sourcePresentation = this.combatSourcePresentation();

    if (!activeChallenge) {
      return null;
    }

    if (activeChallenge.trialDefinitionId) {
      return { kind: 'manualTrial', attemptId: activeChallenge.id } as const;
    }

    if (
      activeChallenge.minigameKey === MINIGAME_KEY.combat
      && sourceRef
      && sourcePresentation
    ) {
      return {
        kind: 'renderer',
        minigameKey: MINIGAME_KEY.combat,
        sourceRef,
        sourcePresentation,
      } as const;
    }

    if (!activeChallenge.encounterDefinitionId && !activeChallenge.minigameKey) {
      return { kind: 'details' } as const;
    }

    return {
      kind: 'unavailable',
      diagnostic: [
        'missing renderer',
        `minigameKey=${activeChallenge.minigameKey ?? 'missing'}`,
        `sourceType=${sourceRef?.sourceEntityType ?? 'missing'}`,
        `sourceId=${sourceRef?.sourceEntityId ?? 'missing'}`,
      ].join('; '),
    } as const;
  });

  acceptMinigameCompletion(event: MinigameCompletionEvent): void {
    this.minigameHandoff.acceptMinigameCompletion(event);
  }
}
