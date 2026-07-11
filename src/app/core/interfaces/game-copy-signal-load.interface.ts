import type { DestroyRef, WritableSignal } from '@angular/core';
import type {
  GameCopyRegistry,
  GameCopyRegistryArgs,
  GameCopyRegistryKind,
} from '../types/game-copy-registry.types';
import type { RequestToken } from '../utils/request-token';

export interface GameCopySignalLoadOptions<Kind extends GameCopyRegistryKind> {
  kind: Kind;
  args: GameCopyRegistryArgs[Kind];
  requestToken: RequestToken;
  destroyRef: DestroyRef;
  loading: WritableSignal<boolean>;
  target: WritableSignal<GameCopyRegistry[Kind] | null>;
  preserveCurrent: boolean;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: unknown, preservedCurrent: boolean) => void;
}
