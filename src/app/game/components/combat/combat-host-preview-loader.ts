import { Injectable, inject } from '@angular/core';
import { CombatResolutionPreviewReadModel } from '../../../core/domain/combat/combat-live.model';
import { CombatSessions } from '../../../core/services/combat/combat-sessions';
import { RequestToken } from '../../../core/utils/request-token';
import { MinigameSourceRef } from '../minigame-host/minigame-host.model';
import { CombatHostRequestRunner } from './combat-host-request-runner';

export interface CombatHostPreviewLoaderContext {
  sourceRef: MinigameSourceRef;
  currentSourceRef: () => MinigameSourceRef | null;
  unavailableText: () => string | null;
  resetForPreviewLoad: () => void;
  setPreview: (preview: CombatResolutionPreviewReadModel | null) => void;
  setPreviewError: (message: string | null) => void;
  setIsLoadingPreview: (value: boolean) => void;
}

@Injectable()
export class CombatHostPreviewLoader {
  private readonly combatSessions = inject(CombatSessions);
  private readonly requestRunner = inject(CombatHostRequestRunner);
  private readonly previewToken = new RequestToken();

  load(context: CombatHostPreviewLoaderContext): void {
    context.resetForPreviewLoad();
    context.setIsLoadingPreview(true);

    this.requestRunner.run({
      requestToken: this.previewToken,
      currentSourceRef: context.currentSourceRef,
      sourceRef: context.sourceRef,
      request: this.combatSessions.getCombatResolutionPreview({
        sourceEntityType: context.sourceRef.sourceEntityType,
        sourceEntityId: context.sourceRef.sourceEntityId,
        localeKey: 'pl',
      }),
      onSuccess: (preview) => context.setPreview(preview),
      onError: () => context.setPreviewError(context.unavailableText()),
      onFinalize: () => context.setIsLoadingPreview(false),
    });
  }
}
