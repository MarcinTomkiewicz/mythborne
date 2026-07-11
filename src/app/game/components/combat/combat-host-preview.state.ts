import { Injectable, inject, signal } from '@angular/core';
import { GAME_COPY_DEFAULT_LOCALE } from '../../../core/constants/game-copy.const';
import type { CombatResolutionPreviewReadModel } from '../../../core/domain/combat/combat-live.model';
import type { MinigameSourceRef } from '../../../core/domain/minigame/minigame-completion.model';
import { CombatSessions } from '../../../core/services/combat/combat-sessions';
import { RequestToken } from '../../../core/utils/request-token';
import { CombatHostRequestRunner } from './combat-host-request-runner';

@Injectable()
export class CombatHostPreviewState {
  private readonly combatSessions = inject(CombatSessions);
  private readonly requestRunner = inject(CombatHostRequestRunner);
  private readonly requestToken = new RequestToken();

  readonly preview = signal<CombatResolutionPreviewReadModel | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  load(
    sourceRef: MinigameSourceRef,
    currentSourceRef: () => MinigameSourceRef | null,
    unavailableText: string | null,
  ): void {
    this.reset();
    this.isLoading.set(true);
    this.requestRunner.run({
      requestToken: this.requestToken,
      currentSourceRef,
      sourceRef,
      request: this.combatSessions.getCombatResolutionPreview({
        sourceEntityType: sourceRef.sourceEntityType,
        sourceEntityId: sourceRef.sourceEntityId,
        localeKey: GAME_COPY_DEFAULT_LOCALE,
      }),
      onSuccess: (preview) => this.preview.set(preview),
      onError: () => this.error.set(unavailableText),
      onFinalize: () => this.isLoading.set(false),
    });
  }

  reset(): void {
    this.requestToken.next();
    this.preview.set(null);
    this.error.set(null);
    this.isLoading.set(false);
  }
}
