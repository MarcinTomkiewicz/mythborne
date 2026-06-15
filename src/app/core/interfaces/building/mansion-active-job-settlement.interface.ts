import { Signal } from '@angular/core';
import {
  EstateBuildingJob,
  EstateRuntimeState,
  PlayerEstatePageContext,
} from '../../domain/estate/player-estate-page-context.model';

export interface MansionActiveJobBindings {
  context: Signal<PlayerEstatePageContext | null>;
  applyContext: (context: PlayerEstatePageContext) => void;
  acceptsContext: (context: PlayerEstatePageContext) => boolean;
  contextKey: (context: PlayerEstatePageContext | null) => string | null;
  isCurrentContextKey: (contextKey: string | null) => boolean;
}

export interface ActiveJobSettlementAttempt {
  requestId: number;
  job: EstateBuildingJob;
  context: PlayerEstatePageContext;
  estate: EstateRuntimeState;
  contextKey: string;
  bindings: MansionActiveJobBindings;
}
