import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  DirectTradeHeroTarget,
  DirectTradeMutationResult,
  DirectTradeOverviewReadModel,
} from '../../../core/domain/trade/direct-trade.model';
import { RequiredActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { DirectTradeActions } from '../../../core/services/trade/direct-trade-actions';
import { DirectTrades } from '../../../core/services/trade/direct-trades';
import { TradeCreateOfferState } from './trade-create-offer.state';
import { TradeFeedbackState } from './trade-feedback.state';
import { TradeOfferActionsState } from './trade-offer-actions.state';
import { TradeOverviewState } from './trade-overview.state';
import { TradePageState } from './trade-page.state';
import { TradeRespondOfferState } from './trade-respond-offer.state';

describe('TradePage states', () => {
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let directTrades: jasmine.SpyObj<DirectTrades>;
  let actions: jasmine.SpyObj<DirectTradeActions>;
  let overview: TradeOverviewState;
  let create: TradeCreateOfferState;
  let respond: TradeRespondOfferState;
  let feedback: TradeFeedbackState;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    directTrades = jasmine.createSpyObj<DirectTrades>('DirectTrades', ['getTradesForHero']);
    actions = jasmine.createSpyObj<DirectTradeActions>('DirectTradeActions', [
      'searchHeroTargets',
      'searchOwnItemTargets',
      'createOffer',
      'respondToOffer',
      'confirmOffer',
      'cancelOffer',
      'rejectOffer',
    ]);

    activeHero.requireActiveHero.and.returnValue(
      of({
        userId: 'user-1',
        serverId: 'server-1',
        heroId: 'hero-1',
        server: { id: 'server-1', name: 'Server' } as RequiredActiveHeroState['server'],
        hero: {} as never,
        heroRow: {} as never,
      }),
    );
    directTrades.getTradesForHero.and.returnValue(of(emptyOverview()));

    TestBed.configureTestingModule({
      providers: [
        TradeFeedbackState,
        TradeOverviewState,
        TradeCreateOfferState,
        TradeRespondOfferState,
        TradeOfferActionsState,
        TradePageState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: DirectTrades, useValue: directTrades },
        { provide: DirectTradeActions, useValue: actions },
      ],
    });
    overview = TestBed.inject(TradeOverviewState);
    create = TestBed.inject(TradeCreateOfferState);
    respond = TestBed.inject(TradeRespondOfferState);
    feedback = TestBed.inject(TradeFeedbackState);
    overview.loadData();
  });

  it('keeps TradePageState as a composition facade', () => {
    const page = TestBed.inject(TradePageState);

    expect(page.overview).toBe(overview);
    expect(page.create).toBe(create);
    expect(page.respond).toBe(respond);
    expect(page.feedback).toBe(feedback);
  });

  it('keeps incomingOfferOptions as a pure getter', () => {
    overview.overview.set(overviewWithIncomingOffer());
    respond.form.controls.offerId.setValue('manual-selection');

    const options = respond.incomingOfferOptions();

    expect(options.map((option) => option.value)).toEqual(['offer-1']);
    expect(respond.form.controls.offerId.value).toBe('manual-selection');
  });

  it('ignores stale hero target search results after a newer query', () => {
    const first = new Subject<DirectTradeHeroTarget[]>();
    const second = new Subject<DirectTradeHeroTarget[]>();
    actions.searchHeroTargets.and.returnValues(first.asObservable(), second.asObservable());

    create.searchHeroTargets({ query: 'Al' } as never);
    create.searchHeroTargets({ query: 'Be' } as never);

    first.next([heroTarget('stale-hero')]);
    expect(create.targetSuggestions()).toEqual([]);

    second.next([heroTarget('fresh-hero')]);
    expect(create.targetSuggestions().map((entry) => entry.heroId)).toEqual([
      'fresh-hero',
    ]);
  });

  it('ignores stale create action errors and finalize state after a newer submit starts', () => {
    const first = new Subject<DirectTradeMutationResult>();
    const second = new Subject<DirectTradeMutationResult>();
    actions.createOffer.and.returnValues(first.asObservable(), second.asObservable());

    create.form.controls.target.setValue(heroTarget('hero-2'));
    create.form.controls.characterPoints.setValue(1);
    create.submit();
    create.form.controls.target.setValue(heroTarget('hero-3'));
    create.form.controls.characterPoints.setValue(2);
    create.submit();

    first.error(new Error('stale failure'));
    expect(feedback.error()).toBeNull();
    expect(create.isSaving()).toBeTrue();

    second.error(new Error('fresh failure'));
    expect(feedback.error()).toBe('fresh failure');
    expect(create.isSaving()).toBeFalse();
  });

  it('keeps stale overview errors from changing loading or feedback state', () => {
    const first = new Subject<DirectTradeOverviewReadModel>();
    const second = new Subject<DirectTradeOverviewReadModel>();
    directTrades.getTradesForHero.and.returnValues(first.asObservable(), second.asObservable());

    overview.loadData();
    overview.loadData();

    first.error(new Error('stale overview failure'));
    expect(feedback.error()).toBeNull();
    expect(overview.isLoading()).toBeTrue();

    second.next(emptyOverview());
    second.complete();
    expect(feedback.error()).toBeNull();
    expect(overview.isLoading()).toBeFalse();
  });
});

function emptyOverview(): DirectTradeOverviewReadModel {
  return {
    offers: [],
    transactions: [],
  };
}

function heroTarget(heroId: string): DirectTradeHeroTarget {
  return {
    heroId,
    heroName: heroId,
    label: heroId,
    description: null,
  };
}

function overviewWithIncomingOffer(): DirectTradeOverviewReadModel {
  return {
    offers: [
      {
        acceptedByCreatorAt: null,
        acceptedByTargetAt: null,
        cancelledAt: null,
        completedAt: null,
        createdAt: '2026-04-30T10:00:00.000Z',
        creator: { heroId: 'hero-2', heroName: 'Creator' },
        creatorCharacterPoints: 1,
        description: null,
        expiresAt: null,
        failedAt: null,
        id: 'offer-1',
        items: [],
        rejectedAt: null,
        serverId: 'server-1',
        status: 'pending_target',
        target: { heroId: 'hero-1', heroName: 'Target' },
        targetCharacterPoints: 0,
        updatedAt: '2026-04-30T10:00:00.000Z',
      },
    ],
    transactions: [],
  };
}
