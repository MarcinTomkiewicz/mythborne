import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { ExplorationChallengeRewardReadModel } from '../../domain/exploration/exploration-reward.model';
import {
  GetExplorationChallengeRewardReadModelRpcRow,
  GetExplorationStepRewardReadModelRpcRow,
} from '../../types/exploration-runtime-rpc.types';
import {
  mapExplorationChallengeRewardReadModel,
  mapExplorationStepRewardReadModel,
} from '../../utils/exploration-challenge-reward-read-model.mapper';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class HeroExplorationRewards {
  private readonly backend = inject(Backend);

  getChallengeReward(input: {
    challengeAttemptId: string;
  }): Observable<ExplorationChallengeRewardReadModel | null> {
    const challengeAttemptId = requiredText(input.challengeAttemptId, 'challengeAttemptId');

    return this.backend
      .rpc<GetExplorationChallengeRewardReadModelRpcRow[]>(
        RPC.get_exploration_challenge_reward_read_model,
        { p_challenge_attempt_id: challengeAttemptId },
      )
      .pipe(
        map((rows) => rows[0] ? mapExplorationChallengeRewardReadModel(rows[0]) : null),
      );
  }

  getStepReward(input: {
    stepId: string;
  }): Observable<ExplorationChallengeRewardReadModel | null> {
    const stepId = requiredText(input.stepId, 'stepId');

    return this.backend
      .rpc<GetExplorationStepRewardReadModelRpcRow[]>(
        RPC.get_exploration_step_reward_read_model,
        { p_step_id: stepId },
      )
      .pipe(
        map((rows) => rows[0] ? mapExplorationStepRewardReadModel(rows[0]) : null),
      );
  }

}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for exploration reward read model.`);
  }

  return normalized;
}
