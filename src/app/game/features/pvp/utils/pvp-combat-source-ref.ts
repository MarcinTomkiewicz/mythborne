import { ActivePvpActionOffer } from '../../../../core/domain/pvp/pvp.model';
import {
  MINIGAME_SOURCE_ENTITY_TYPE,
  MinigameSourceRef,
} from '../../../components/minigame-host/minigame-host.model';

export function isManualPvpCombatOffer(
  offer: ActivePvpActionOffer | null,
): offer is ActivePvpActionOffer {
  return !!offer &&
    offer.actionKind === 'attack' &&
    offer.isManualWindow &&
    !offer.isResolved;
}

export function pvpCombatSourceRef(
  offer: ActivePvpActionOffer | null,
): MinigameSourceRef | null {
  return isManualPvpCombatOffer(offer)
    ? {
        sourceEntityType: MINIGAME_SOURCE_ENTITY_TYPE.pvpAction,
        sourceEntityId: offer.pvpActionId,
      }
    : null;
}
