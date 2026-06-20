import type { CombatLiveStateReadModel, CombatResolutionPreviewReadModel } from '../../../core/domain/combat/combat-live.model';
import type { RequestToken } from '../../../core/utils/request-token';
import type { MinigameCompletionEvent, MinigameSourceRef } from '../minigame-host/minigame-host.model';

export interface CombatHostSessionRunnerContext {
  sourceRef: () => MinigameSourceRef | null;
  preview: () => CombatResolutionPreviewReadModel | null;
  liveState: () => CombatLiveStateReadModel | null;
  completion: () => MinigameCompletionEvent | null;
  isPreparingSession: () => boolean;
  isAutoResolving: () => boolean;
  isSubmittingAction: () => boolean;
  isFinalizingResult: () => boolean;
  isRecoveringState: () => boolean;
  actionUnavailableText: () => string | null;
  finalizeUnavailableText: () => string | null;
  tokens: {
    manualStart: RequestToken;
    autoResolve: RequestToken;
    submitAction: RequestToken;
    finalizeResult: RequestToken;
    recoverState: RequestToken;
  };
  setLiveState: (state: CombatLiveStateReadModel) => void;
  setCompletion: (completion: MinigameCompletionEvent) => void;
  setActionError: (message: string | null) => void;
  setFinalizeError: (message: string | null) => void;
  setIsPreparingSession: (value: boolean) => void;
  setIsAutoResolving: (value: boolean) => void;
  setIsSubmittingAction: (value: boolean) => void;
  setIsFinalizingResult: (value: boolean) => void;
  setIsRecoveringState: (value: boolean) => void;
}
