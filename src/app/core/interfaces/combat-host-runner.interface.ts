import type { Observable } from 'rxjs';
import type { CombatSourcePresentation } from '../domain/combat/combat-source-presentation.model';
import type { MinigameSourceRef } from '../domain/minigame/minigame-completion.model';
import type { RequestToken } from '../utils/request-token';

export interface CombatHostContextInput {
  sourceRef: MinigameSourceRef;
  contextTitle: string;
  sourcePresentation: CombatSourcePresentation;
  combatLiveSessionId: string | null;
}

export interface CombatHostRequestRunnerInput<T> {
  requestToken: RequestToken;
  currentSourceRef: () => MinigameSourceRef | null;
  sourceRef: MinigameSourceRef;
  request: Observable<T>;
  onSuccess: (result: T) => void;
  onError: (error: unknown) => void;
  onFinalize?: () => void;
  isCurrent?: () => boolean;
}
