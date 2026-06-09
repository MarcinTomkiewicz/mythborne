import { Signal } from '@angular/core';
import {
  EstateBuildingJob,
  EstateRuntimeState,
  PlayerEstatePageContextV3,
} from '../../domain/estate/player-estate-page-context.model';

export interface MansionActiveJobBindings {
  context: Signal<PlayerEstatePageContextV3 | null>;
  applyContext: (context: PlayerEstatePageContextV3) => void;
  acceptsContext: (context: PlayerEstatePageContextV3) => boolean;
  contextKey: (context: PlayerEstatePageContextV3 | null) => string | null;
  isCurrentContextKey: (contextKey: string | null) => boolean;
}

export interface ActiveJobSettlementAttempt {
  requestId: number;
  job: EstateBuildingJob;
  context: PlayerEstatePageContextV3;
  estate: EstateRuntimeState;
  contextKey: string;
  bindings: MansionActiveJobBindings;
}
