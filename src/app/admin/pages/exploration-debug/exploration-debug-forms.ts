import { FormControl, Validators } from '@angular/forms';

import {
  EncounterDefinitionReadModel,
  TrialDefinitionReadModel,
} from '../../../core/domain/exploration/exploration-definition.model';
import { RewardProfileReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { ModerationHeroTarget } from '../../../core/domain/moderation/moderation-action.model';

export function createExplorationDebugScopeForm() {
  return {
    heroTarget: new FormControl<ModerationHeroTarget | null>(null),
    heroId: new FormControl<string | null>(null),
    explorationDate: new FormControl<string | null>(null),
  };
}

export function createExplorationDebugActionForms() {
  return {
    remainingActions: {
      actionKind: new FormControl<string>('trial', {
        nonNullable: true,
        validators: Validators.required,
      }),
      amount: new FormControl<number>(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      actionDate: new FormControl<string | null>(null),
      reason: new FormControl<string | null>(null, Validators.required),
    },
    reset: {
      difficultyKey: new FormControl<string | null>(null),
      explorationDate: new FormControl<string | null>(null),
      reason: new FormControl<string | null>(null, Validators.required),
    },
    skipTimer: {
      stepId: new FormControl<string | null>(null, Validators.required),
      reason: new FormControl<string | null>(null, Validators.required),
    },
    reward: {
      rewardProfile: new FormControl<RewardProfileReadModel | null>(
        null,
        Validators.required,
      ),
      rewardProfileId: new FormControl<string | null>(null, Validators.required),
      reason: new FormControl<string | null>(null, Validators.required),
    },
    override: {
      difficultyKey: new FormControl<string>('easy', {
        nonNullable: true,
        validators: Validators.required,
      }),
      forcedOutcomeKind: new FormControl<string>('known_path', {
        nonNullable: true,
        validators: Validators.required,
      }),
      trialDefinition: new FormControl<TrialDefinitionReadModel | null>(null),
      trialDefinitionId: new FormControl<string | null>(null),
      encounterDefinition: new FormControl<EncounterDefinitionReadModel | null>(null),
      encounterDefinitionId: new FormControl<string | null>(null),
      forceManifestationStatus: new FormControl<string | null>(null),
      expiresInMinutes: new FormControl<number | null>(60),
      reason: new FormControl<string | null>(null, Validators.required),
    },
    forceChallenge: {
      challengeAttemptId: new FormControl<string | null>(null, Validators.required),
      success: new FormControl<boolean>(true, { nonNullable: true }),
      reason: new FormControl<string | null>(null, Validators.required),
    },
  };
}

