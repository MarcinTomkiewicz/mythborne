import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { GuildSearchResult } from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuild } from './player-guild';
import { GuildDiscoveryState } from './guild-discovery.state';

describe('GuildDiscoveryState', () => {
  let state: GuildDiscoveryState;
  let playerGuild: jasmine.SpyObj<PlayerGuild>;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;

  beforeEach(() => {
    playerGuild = jasmine.createSpyObj<PlayerGuild>('PlayerGuild', [
      'searchGuildsForActiveHero',
    ]);
    activeHeroState = signal<ActiveHeroState | null>(activeContext());

    TestBed.configureTestingModule({
      providers: [
        GuildDiscoveryState,
        { provide: PlayerGuild, useValue: playerGuild },
        {
          provide: ActiveHero,
          useValue: { state: activeHeroState.asReadonly() },
        },
      ],
    });

    state = TestBed.inject(GuildDiscoveryState);
  });

  it('loads guild discovery results with query and pagination state', () => {
    playerGuild.searchGuildsForActiveHero.and.returnValue(result({
      query: 'argo',
      limit: 10,
      offset: 5,
      totalCount: 3,
    }));

    state.search({ query: 'argo', limit: 10, offset: 5 });

    expect(playerGuild.searchGuildsForActiveHero).toHaveBeenCalledWith({
      query: 'argo',
      limit: 10,
      offset: 5,
    });
    expect(state.guilds()[0].guildId).toBe('guild-1');
    expect(state.totalCount()).toBe(3);
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBeNull();
  });

  it('ignores stale search responses', () => {
    const first = new Subject<GuildSearchResult>();
    const second = new Subject<GuildSearchResult>();
    playerGuild.searchGuildsForActiveHero.and.returnValues(
      first.asObservable(),
      second.asObservable(),
    );

    state.search({ query: 'old' });
    state.search({ query: 'new' });
    first.next(searchResult({ query: 'old', totalCount: 1 }));
    second.next(searchResult({ query: 'new', totalCount: 2 }));

    expect(state.query()).toBe('new');
    expect(state.totalCount()).toBe(2);
  });

  it('clears discovery results on stale success after active hero changes', () => {
    const response = new Subject<GuildSearchResult>();
    playerGuild.searchGuildsForActiveHero.and.returnValue(response.asObservable());
    state.guilds.set([searchResult().guilds[0]]);
    state.totalCount.set(1);
    state.query.set('existing');

    state.search();
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    response.next(searchResult({
      query: 'stale-result',
      totalCount: 9,
      guilds: [{
        ...searchResult().guilds[0],
        guildId: 'guild-2',
      }],
    }));

    expect(state.guilds()).toEqual([]);
    expect(state.totalCount()).toBe(0);
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('keeps stale errors from overwriting current search state', () => {
    const first = new Subject<GuildSearchResult>();
    playerGuild.searchGuildsForActiveHero.and.returnValues(
      first.asObservable(),
      result({ query: 'new' }),
    );

    state.search({ query: 'old' });
    state.search({ query: 'new' });
    first.error(new Error('old failed'));

    expect(state.query()).toBe('new');
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('clears discovery results on stale error after active server changes', () => {
    const response = new Subject<GuildSearchResult>();
    playerGuild.searchGuildsForActiveHero.and.returnValue(response.asObservable());
    state.guilds.set([searchResult().guilds[0]]);
    state.totalCount.set(1);

    state.search({ query: 'argo' });
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.error(new Error('Guild search context changed.'));

    expect(state.guilds()).toEqual([]);
    expect(state.totalCount()).toBe(0);
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('sets current search error', () => {
    playerGuild.searchGuildsForActiveHero.and.returnValue(
      throwError(() => new Error('guild search failed')),
    );

    state.search();

    expect(state.error()).toBe('guild search failed');
    expect(state.isLoading()).toBeFalse();
  });

  it('requires active hero context before searching', () => {
    state.guilds.set([searchResult().guilds[0]]);
    state.totalCount.set(1);
    activeHeroState.set(activeContext({ heroId: null }));

    state.search();

    expect(playerGuild.searchGuildsForActiveHero).not.toHaveBeenCalled();
    expect(state.guilds()).toEqual([]);
    expect(state.totalCount()).toBe(0);
    expect(state.error()).toBe('No active hero for guild discovery.');
    expect(state.isLoading()).toBeFalse();
  });
});

function activeContext(
  overrides: Partial<Pick<ActiveHeroState, 'serverId' | 'heroId'>> = {},
): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    server: {} as ActiveHeroState['server'],
    hero: {} as ActiveHeroState['hero'],
    heroRow: {} as ActiveHeroState['heroRow'],
    ...overrides,
  };
}

function result(overrides: Partial<GuildSearchResult> = {}) {
  return of(searchResult(overrides));
}

function searchResult(overrides: Partial<GuildSearchResult> = {}): GuildSearchResult {
  const searchResult: GuildSearchResult = {
    query: null,
    limit: 25,
    offset: 0,
    totalCount: 1,
    guilds: [
      {
        guildId: 'guild-1',
        serverId: 'server-1',
        name: 'Argonauts',
        tag: 'ARGO',
        statusKey: 'active',
        memberCount: 12,
        memberLimit: 30,
        canRequestToJoin: true,
        currentJoinRequestStatusKey: null,
        currentInviteStatusKey: null,
      },
    ],
    ...overrides,
  };

  return searchResult;
}
