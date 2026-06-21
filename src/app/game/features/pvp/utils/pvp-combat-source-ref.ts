import {
  isPvpActiveCombatOffer,
  isPvpManualCombatDecisionOffer,
} from '../../../../core/domain/pvp/pvp-active-action-display.mapper';
import { ActivePvpActionOffer } from '../../../../core/domain/pvp/pvp.model';
import {
  MINIGAME_SOURCE_ENTITY_TYPE,
  MinigameSourceRef,
} from '../../../components/minigame-host/minigame-host.model';

export function isPvpCombatHostOffer(
  offer: ActivePvpActionOffer | null,
): offer is ActivePvpActionOffer {
  return !!offer &&
    (isPvpManualCombatDecisionOffer(offer) || isPvpActiveCombatOffer(offer));
}

export function pvpCombatSourceRef(
  offer: ActivePvpActionOffer | null,
): MinigameSourceRef | null {
  return isPvpCombatHostOffer(offer)
    ? {
        sourceEntityType: MINIGAME_SOURCE_ENTITY_TYPE.pvpAction,
        sourceEntityId: offer.pvpActionId,
      }
    : null;
}
