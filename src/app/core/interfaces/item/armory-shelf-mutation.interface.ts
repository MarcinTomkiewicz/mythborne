import { Observable } from 'rxjs';
import { HeroArmoryReadModel } from '../../domain/item/item-equipment.model';

export interface ArmoryMutationOptions {
  operation: (
    requestId: number,
    requestContextKey: string,
    acceptsCurrentContext: () => boolean,
  ) => Observable<HeroArmoryReadModel>;
  afterResponse?: () => void;
  successMessage?: string;
  failureMessage: string;
  committedRefreshFailureMessage?: string;
  hasCommitted?: () => boolean;
}

export interface ArmoryLifecycleMutationInput<T> {
  itemId: string;
  operation: (actorHeroId: string, itemId: string) => Observable<T>;
  afterResponse?: () => void;
  successMessage: string;
}
