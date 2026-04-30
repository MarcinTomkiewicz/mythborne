import { DirectTradeOfferReadModel } from '../../../core/domain/trade/direct-trade.model';

export function directTradeOfferLabel(
  offer: DirectTradeOfferReadModel,
  activeHeroId: string | null,
): string {
  const otherHero = offer.creator.heroId === activeHeroId ? offer.target : offer.creator;
  const itemCount = offer.items.length;

  return `${otherHero.heroName ?? otherHero.heroId ?? 'Unknown hero'} - ${offer.status} - ${itemCount} items`;
}
