import { EXPLORATION_RUNTIME_COPY } from '../../constants/exploration-runtime-copy.const';
import type { HeroExplorationMovementOptionReadModel } from './exploration-runtime.model';

export function movementOptionValidationError(
  option: HeroExplorationMovementOptionReadModel,
): string | null {
  const stepKind = option.stepKind.trim();
  const isBacktrack = option.isBacktrack || stepKind === 'backtrack';

  if (!stepKind) {
    return EXPLORATION_RUNTIME_COPY.movementStepKindMissing;
  }

  if (isBacktrack) {
    if (stepKind !== 'backtrack') {
      return EXPLORATION_RUNTIME_COPY.movementBacktrackKindInvalid;
    }

    return option.edgeId === null
      ? null
      : EXPLORATION_RUNTIME_COPY.movementBacktrackEdgeInvalid;
  }

  return option.edgeId
    ? null
    : EXPLORATION_RUNTIME_COPY.movementEdgeMissing;
}
