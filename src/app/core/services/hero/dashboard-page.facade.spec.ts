import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { Hero } from './hero';
import { Origins } from '../origins/origins';
import { DashboardPageFacade } from './dashboard-page.facade';
import { HeroDashboardRuntimeStats } from './hero-dashboard-runtime-stats';
import { ActiveServer } from '../server/active-server';
import { SelectedGameServer } from '../../interfaces/server/active-server.interface';
import { ActiveHeroVitalsState } from './active-hero-vitals-state';
import { HeroEquipment } from '../items/hero-equipment';
import { CurrentEquipmentState } from '../items/current-equipment.state';
import { EquippedItemSummary } from '../../domain/item/item-equipment.model';
import { EstateAddresses } from '../estate/estate-addresses';
import { CurrentEstateAddressReadModel } from '../../domain/estate/estate-address.model';
import { BuildingsService } from '../buildings/buildings';
import { GameReports } from '../reports/game-reports';
import { MansionEstateView } from '../../domain/building/building.model';
import { HeroExplorations } from '../exploration/hero-explorations';
import {
  HeroDailyActionCounterReadModel,
  HeroPendingCombatEffectStateReadModel,
} from '../../domain/exploration/exploration-runtime.model';
import { ActiveHero } from './active-hero';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';

describe('DashboardPageFacade', () => {
  let facade: DashboardPageFacade;
  let hero: jasmine.SpyObj<Hero>;
  let runtimeStats: jasmine.SpyObj<HeroDashboardRuntimeStats>;
  let heroEquipment: jasmine.SpyObj<HeroEquipment>;
  let estateAddresses: jasmine.SpyObj<EstateAddresses>;
  let buildingsService: jasmine.SpyObj<BuildingsService>;
  let gameReports: jasmine.SpyObj<GameReports>;
  let heroExplorations: jasmine.SpyObj<HeroExplorations>;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let selectedServer: ReturnType<typeof signal<SelectedGameServer | null>>;
  let equipmentLoad: jasmine.Spy;
  let equipmentClear: jasmine.Spy;
  let equipmentStatus: ReturnType<typeof signal<string>>;
  let equipmentError: ReturnType<typeof signal<string | null>>;
  let equipmentIsLoading: ReturnType<typeof signal<boolean>>;
  let equippedSlots: ReturnType<typeof signal<EquippedItemSummary[]>>;
  let vitalsLoad: jasmine.Spy;
  let vitalsLevel: ReturnType<typeof signal<number | null>>;
  let vitalsCurrentHealth: ReturnType<typeof signal<number>>;
  let vitalsMaxHealth: ReturnType<typeof signal<number>>;
  let vitalsCurrentExperience: ReturnType<typeof signal<number>>;
  let vitalsTotalExperienceEarned: ReturnType<typeof signal<number>>;
  let vitalsExperienceToNextLevel: ReturnType<typeof signal<number | null>>;
  let vitalsRemainingExperience: ReturnType<typeof signal<number | null>>;
  let vitalsExperiencePercent: ReturnType<typeof signal<number>>;
  let vitalsIsLoading: ReturnType<typeof signal<boolean>>;
  let vitalsError: ReturnType<typeof signal<string | null>>;

  beforeEach(() => {
    hero = jasmine.createSpyObj<Hero>('Hero', [
      'getHeroData',
      'getHeroStats',
    ]);
    hero.getHeroData.and.returnValue(
      of({
        id: 'hero-1',
        name: 'Ariadne',
        level: 4,
        server_id: 'server-1',
        experience: 125,
        total_experience_earned: 2125,
        character_points: 9,
        total_character_points_earned: 42,
        origin_id: null,
      }) as ReturnType<Hero['getHeroData']>,
    );
    hero.getHeroStats.and.throwError('Dashboard must use runtime display_stats_json.');
    vitalsLoad = jasmine.createSpy('load');
    vitalsLevel = signal<number | null>(4);
    vitalsCurrentHealth = signal(84);
    vitalsMaxHealth = signal(120);
    vitalsCurrentExperience = signal(125);
    vitalsTotalExperienceEarned = signal(2125);
    vitalsExperienceToNextLevel = signal<number | null>(500);
    vitalsRemainingExperience = signal<number | null>(375);
    vitalsExperiencePercent = signal(25);
    vitalsIsLoading = signal(false);
    vitalsError = signal<string | null>(null);
    selectedServer = signal<SelectedGameServer | null>({
      id: 'server-1',
      key: 'sandbox',
      name: 'Sandbox',
      kind: 'sandbox',
      status: 'live',
      description: null,
      launchedAt: null,
      archivedAt: null,
      membershipStatus: 'active',
      membership: null,
      staffRole: null,
      canManage: false,
      canUseAsSandbox: true,
    });
    activeHeroState = signal<ActiveHeroState | null>(activeHeroContext());

    runtimeStats = jasmine.createSpyObj<HeroDashboardRuntimeStats>('HeroDashboardRuntimeStats', {
      getActiveHeroRuntimeStats: of({
        heroId: 'hero-1',
        displayStats: {
          heroStats: [
            {
              statKey: 'strength',
              label: 'Strength',
              displayValue: '19',
              finalValue: 19,
              tone: 'neutral',
              colorableFinalValue: false,
              sortOrder: 10,
            },
            {
              statKey: 'dexterity',
              label: 'Dexterity',
              displayValue: '6',
              finalValue: 6,
              tone: 'neutral',
              colorableFinalValue: false,
              sortOrder: 20,
            },
          ],
          derivedStats: [
            {
              statKey: 'defense',
              label: 'Defense',
              displayValue: '104',
              finalValue: 104,
              tone: 'neutral',
              colorableFinalValue: true,
              sortOrder: 10,
            },
            {
              statKey: 'luck',
              label: 'Luck',
              displayValue: '3',
              finalValue: 3,
              tone: 'positive',
              colorableFinalValue: false,
              sortOrder: 20,
            },
            {
              statKey: 'critical_chance',
              label: 'Critical chance',
              displayValue: '2%',
              finalValue: 2,
              tone: 'positive',
              colorableFinalValue: true,
              sortOrder: 30,
            },
            {
              statKey: 'critical_damage',
              label: 'Critical damage',
              displayValue: '50%',
              finalValue: 50,
              tone: 'neutral',
              colorableFinalValue: true,
              sortOrder: 40,
            },
            {
              statKey: 'evasion',
              label: 'Evasion',
              displayValue: '8%',
              finalValue: 8,
              tone: 'neutral',
              colorableFinalValue: true,
              sortOrder: 50,
            },
            {
              statKey: 'attack_count',
              label: 'Attack count',
              displayValue: '2',
              finalValue: 2,
              tone: 'positive',
              colorableFinalValue: false,
              sortOrder: 60,
            },
          ],
          damageRows: [
            {
              key: 'main_hand',
              label: 'Demonic Dagger',
              displayValue: '21-28',
              baseDamage: { min: '21', max: '28' },
              finalDamage: { min: '21', max: '28' },
              minDelta: 0,
              maxDelta: 0,
              minTone: 'neutral',
              maxTone: 'neutral',
              tone: 'neutral',
              colorableFinalValue: true,
              sortOrder: 10,
            },
            {
              key: 'off_hand',
              label: 'Unarmed',
              displayValue: '20-21',
              baseDamage: { min: '20', max: '21' },
              finalDamage: { min: '20', max: '21' },
              minDelta: 0,
              maxDelta: 0,
              minTone: 'neutral',
              maxTone: 'neutral',
              tone: 'neutral',
              colorableFinalValue: true,
              sortOrder: 20,
            },
          ],
        },
        defense: 104,
        currentHealth: 84,
        maxHealth: 120,
        luck: 3,
        criticalChanceBonus: 2,
        criticalDamage: 50,
        evasionChanceBonus: 8,
        attackCount: 2,
      }),
    });
    heroEquipment = jasmine.createSpyObj<HeroEquipment>('HeroEquipment', {
      getEquipmentSlots: of([
        {
          slotKey: 'main_hand',
          label: 'Main hand',
          sortOrder: 10,
          equipmentArea: 'weapon',
          equipmentSlotGroup: 'hand',
        },
        {
          slotKey: 'off_hand',
          label: 'Off hand',
          sortOrder: 20,
          equipmentArea: 'weapon',
          equipmentSlotGroup: 'hand',
        },
      ]),
    });
    estateAddresses = jasmine.createSpyObj<EstateAddresses>('EstateAddresses', {
      getActiveHeroCurrentAddress: of(currentEstateAddress()),
    });
    buildingsService = jasmine.createSpyObj<BuildingsService>('BuildingsService', {
      getMansionEstateView: of(mansionEstateView()),
    });
    gameReports = jasmine.createSpyObj<GameReports>('GameReports', {
      getActiveHeroUnreadCount: of(2),
    });
    heroExplorations = jasmine.createSpyObj<HeroExplorations>('HeroExplorations', {
      getHeroTrialCounter: of(trialCounter()),
      getHeroPendingCombatEffectState: of([combatEffectState()]),
    });
    equipmentLoad = jasmine.createSpy('load');
    equipmentClear = jasmine.createSpy('clear');
    equipmentStatus = signal('loaded');
    equipmentError = signal<string | null>(null);
    equipmentIsLoading = signal(false);
    equippedSlots = signal<EquippedItemSummary[]>([
      {
        itemId: 'item-main',
        heroId: 'hero-1',
        ownerHeroId: 'hero-1',
        itemName: 'Demonic Dagger',
        lifecycleStatus: 'active',
        generationBaseId: 'base-1',
        generationQualityKey: 'normal',
        prefixAffixId: null,
        suffixAffixId: null,
        slotKey: 'main_hand',
        slotLabel: 'Main hand',
        slotSortOrder: 10,
        equipmentArea: 'weapon',
        equipmentSlotGroup: 'hand',
        equippedAt: '2026-05-13T10:00:00.000Z',
        baseKey: 'dagger',
        baseName: 'Dagger',
        baseTypeKey: 'weapon',
        handUsage: 'one_handed',
        qualityLabel: 'Normal',
        qualityMultiplier: 1,
        prefixKey: null,
        prefixName: null,
        suffixKey: null,
        suffixName: null,
        isRuntimeUsable: true,
      },
    ]);
    const initialEquippedSlots = equippedSlots();
    equipmentClear.and.callFake(() => equippedSlots.set([]));
    equipmentLoad.and.callFake(() => equippedSlots.set(initialEquippedSlots));

    TestBed.configureTestingModule({
      providers: [
        DashboardPageFacade,
        { provide: Hero, useValue: hero },
        { provide: HeroDashboardRuntimeStats, useValue: runtimeStats },
        { provide: HeroEquipment, useValue: heroEquipment },
        { provide: EstateAddresses, useValue: estateAddresses },
        { provide: BuildingsService, useValue: buildingsService },
        { provide: GameReports, useValue: gameReports },
        { provide: HeroExplorations, useValue: heroExplorations },
        {
          provide: ActiveHero,
          useValue: { state: activeHeroState.asReadonly() },
        },
        {
          provide: CurrentEquipmentState,
          useValue: {
            load: equipmentLoad,
            clear: equipmentClear,
            status: equipmentStatus.asReadonly(),
            error: equipmentError.asReadonly(),
            isLoading: equipmentIsLoading.asReadonly(),
            slots: equippedSlots.asReadonly(),
          },
        },
        {
          provide: ActiveHeroVitalsState,
          useValue: {
            load: vitalsLoad,
            level: vitalsLevel.asReadonly(),
            currentHealth: vitalsCurrentHealth.asReadonly(),
            maxHealth: vitalsMaxHealth.asReadonly(),
            currentExperience: vitalsCurrentExperience.asReadonly(),
            totalExperienceEarned: vitalsTotalExperienceEarned.asReadonly(),
            experienceToNextLevel: vitalsExperienceToNextLevel.asReadonly(),
            remainingExperience: vitalsRemainingExperience.asReadonly(),
            experiencePercent: vitalsExperiencePercent.asReadonly(),
            isLoading: vitalsIsLoading.asReadonly(),
            error: vitalsError.asReadonly(),
          },
        },
        {
          provide: Origins,
          useValue: jasmine.createSpyObj<Origins>('Origins', ['getOriginWithBonuses']),
        },
        {
          provide: ActiveServer,
          useValue: { selectedServer: selectedServer.asReadonly() },
        },
      ],
    });
    facade = TestBed.inject(DashboardPageFacade);
  });

  it('displays XP progress from the canonical threshold read model', () => {
    facade.loadData();

    expect(vitalsLoad).toHaveBeenCalled();
    expect(facade.level()).toBe(4);
    expect(facade.experience()).toBe(125);
    expect(facade.experienceToNextLevel()).toBe(500);
    expect(facade.remainingExperience()).toBe(375);
    expect(facade.totalExperienceEarned()).toBe(2125);
    expect(facade.experiencePercent()).toBe(25);
    expect(facade.experienceError()).toBeNull();
    expect(facade.characterPoints()).toBe(9);
    expect(facade.estateAddress()).toBe('A-3');
    expect(facade.currentEstateAddress()).toEqual(currentEstateAddress());
    expect(facade.estateAddressError()).toBeNull();
    expect(facade.selectedServer()?.name).toBe('Sandbox');
  });

  it('combines confirmed equipment slot definitions with current equipment state', () => {
    facade.loadData();

    expect(equipmentLoad).toHaveBeenCalled();
    expect(heroEquipment.getEquipmentSlots).toHaveBeenCalled();
    expect(facade.equipmentPreviewRows()).toEqual([
      {
        slotKey: 'main_hand',
        label: 'Main hand',
        sortOrder: 10,
        iconClass: 'pi pi-one-handed',
        item: {
          name: 'Demonic Dagger',
          metadata: 'Main hand \u00b7 Normal',
        },
      },
      {
        slotKey: 'off_hand',
        label: 'Off hand',
        sortOrder: 20,
        iconClass: 'pi pi-one-handed',
        item: null,
      },
    ]);
  });

  it('clears estate address state and surfaces read errors', () => {
    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(
      throwError(() => new Error('Estate read failed.')),
    );

    facade.loadData();

    expect(facade.currentEstateAddress()).toBeNull();
    expect(facade.estateAddress()).toBeNull();
    expect(facade.estateAddressError()).toBe('Estate read failed.');
    expect(facade.worldStateErrors()).toContain('Estate read failed.');
  });

  it('exposes only real persistent state rows from approved read models', () => {
    facade.loadData();

    expect(buildingsService.getMansionEstateView).toHaveBeenCalled();
    expect(gameReports.getActiveHeroUnreadCount).toHaveBeenCalled();
    expect(heroExplorations.getHeroTrialCounter)
      .toHaveBeenCalledWith({ heroId: 'hero-1', serverId: 'server-1' });
    expect(heroExplorations.getHeroPendingCombatEffectState)
      .toHaveBeenCalledWith('hero-1');
    expect(facade.persistentStateRows()).toEqual([
      {
        key: 'trials-remaining',
        label: 'Trials remaining',
        value: '3 trials remaining',
        route: '/game/exploration',
        isAttention: true,
      },
      {
        key: 'active-combat-effect-effect-1',
        label: 'Active state',
        value: 'Blessing: +10% defense',
        route: '/game/exploration',
        isAttention: true,
      },
      {
        key: 'estate-job-job-1',
        label: 'Building job',
        value: 'Farm to level 2 - 30 min remaining',
        route: '/game/mansion',
        isAttention: true,
      },
      {
        key: 'estate-district',
        label: 'District',
        value: 'Agora District (A)',
        route: null,
        isAttention: false,
      },
      {
        key: 'vicinity-view',
        label: 'Vicinity view',
        value: 'Open Vicinity',
        route: '/game/vicinity',
        isAttention: false,
      },
      {
        key: 'unread-reports',
        label: 'Unread reports',
        value: '2 unread reports',
        route: '/game/reports',
        isAttention: true,
      },
    ]);
    expect(facade.isPersistentStateLoaded()).toBeTrue();
    expect(facade.persistentStateErrors()).toEqual([]);
  });

  it('renders source-backed negative persistent state rows after real sources load empty', () => {
    buildingsService.getMansionEstateView.and.returnValue(of({
      ...mansionEstateView(),
      activeBuildingJob: null,
    }));
    gameReports.getActiveHeroUnreadCount.and.returnValue(of(0));
    heroExplorations.getHeroTrialCounter.and.returnValue(of({
      ...trialCounter(),
      remainingCount: 0,
    }));
    heroExplorations.getHeroPendingCombatEffectState.and.returnValue(of([]));

    facade.loadData();

    expect(facade.persistentStateRows()).toEqual([
      {
        key: 'trials-remaining',
        label: 'Trials remaining',
        value: '0 trials remaining',
        route: '/game/exploration',
        isAttention: false,
      },
      {
        key: 'active-combat-effect-none',
        label: 'Active state',
        value: 'No active state',
        route: null,
        isAttention: false,
      },
      {
        key: 'estate-job-none',
        label: 'Building job',
        value: 'No building in progress',
        route: null,
        isAttention: false,
      },
      {
        key: 'estate-district',
        label: 'District',
        value: 'Agora District (A)',
        route: null,
        isAttention: false,
      },
      {
        key: 'vicinity-view',
        label: 'Vicinity view',
        value: 'Open Vicinity',
        route: '/game/vicinity',
        isAttention: false,
      },
      {
        key: 'unread-reports',
        label: 'Unread reports',
        value: 'No unread reports',
        route: null,
        isAttention: false,
      },
    ]);
    expect(facade.isPersistentStateLoaded()).toBeTrue();
    expect(facade.persistentStateErrors()).toEqual([]);
  });

  it('does not pretend there is no building job when estate state fails', () => {
    buildingsService.getMansionEstateView.and.returnValue(
      throwError(() => new Error('Estate state failed.')),
    );

    facade.loadData();

    expect(facade.persistentStateRows()).toEqual([
      {
        key: 'trials-remaining',
        label: 'Trials remaining',
        value: '3 trials remaining',
        route: '/game/exploration',
        isAttention: true,
      },
      {
        key: 'active-combat-effect-effect-1',
        label: 'Active state',
        value: 'Blessing: +10% defense',
        route: '/game/exploration',
        isAttention: true,
      },
      {
        key: 'estate-district',
        label: 'District',
        value: 'Agora District (A)',
        route: null,
        isAttention: false,
      },
      {
        key: 'vicinity-view',
        label: 'Vicinity view',
        value: 'Open Vicinity',
        route: '/game/vicinity',
        isAttention: false,
      },
      {
        key: 'unread-reports',
        label: 'Unread reports',
        value: '2 unread reports',
        route: '/game/reports',
        isAttention: true,
      },
    ]);
    expect(facade.persistentStateErrors()).toEqual(['Estate state failed.']);
  });

  it('renders trials from the daily counter without exploration difficulty state', () => {
    facade.loadData();

    expect(facade.persistentStateRows().map((row) => row.label)).toEqual([
      'Trials remaining',
      'Active state',
      'Building job',
      'District',
      'Vicinity view',
      'Unread reports',
    ]);
    expect(facade.persistentStateRows().some((row) =>
      row.label === 'Active exploration'
      || row.label === 'Active effect'
    )).toBeFalse();
  });

  it('surfaces active state errors without inventing a no-effect row', () => {
    heroExplorations.getHeroPendingCombatEffectState.and.returnValue(
      throwError(() => new Error('Active effect failed.')),
    );

    facade.loadData();

    expect(facade.persistentStateRows()).toEqual([
      {
        key: 'trials-remaining',
        label: 'Trials remaining',
        value: '3 trials remaining',
        route: '/game/exploration',
        isAttention: true,
      },
      {
        key: 'estate-job-job-1',
        label: 'Building job',
        value: 'Farm to level 2 - 30 min remaining',
        route: '/game/mansion',
        isAttention: true,
      },
      {
        key: 'estate-district',
        label: 'District',
        value: 'Agora District (A)',
        route: null,
        isAttention: false,
      },
      {
        key: 'vicinity-view',
        label: 'Vicinity view',
        value: 'Open Vicinity',
        route: '/game/vicinity',
        isAttention: false,
      },
      {
        key: 'unread-reports',
        label: 'Unread reports',
        value: '2 unread reports',
        route: '/game/reports',
        isAttention: true,
      },
    ]);
    expect(facade.persistentStateErrors()).toEqual(['Active effect failed.']);
  });

  it('ignores stale persistent state responses after the active hero changes', () => {
    const estateAddressResponse = new Subject<CurrentEstateAddressReadModel>();
    const estateViewResponse = new Subject<MansionEstateView>();
    const unreadReportsResponse = new Subject<number>();
    const trialCounterResponse = new Subject<HeroDailyActionCounterReadModel | null>();
    const activeStateResponse = new Subject<HeroPendingCombatEffectStateReadModel[]>();

    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(estateAddressResponse);
    buildingsService.getMansionEstateView.and.returnValue(estateViewResponse);
    gameReports.getActiveHeroUnreadCount.and.returnValue(unreadReportsResponse);
    heroExplorations.getHeroTrialCounter.and.returnValue(trialCounterResponse);
    heroExplorations.getHeroPendingCombatEffectState.and.returnValue(activeStateResponse);

    facade.loadData();

    activeHeroState.set(activeHeroContext({ heroId: 'hero-2' }));
    estateAddressResponse.next(currentEstateAddress());
    estateAddressResponse.complete();
    estateViewResponse.next(mansionEstateView());
    estateViewResponse.complete();
    unreadReportsResponse.next(2);
    unreadReportsResponse.complete();
    trialCounterResponse.next(trialCounter());
    trialCounterResponse.complete();
    activeStateResponse.next([combatEffectState()]);
    activeStateResponse.complete();

    expect(facade.persistentStateRows()).toEqual([]);
    expect(facade.isPersistentStateLoaded()).toBeFalse();
  });

  it('ignores stale estate address responses after selected server changes', () => {
    const estateAddressResponse = new Subject<CurrentEstateAddressReadModel>();

    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(estateAddressResponse);

    facade.loadData();
    selectedServer.set({
      ...selectedGameServer(),
      id: 'server-2',
      key: 'other',
      name: 'Other',
    });
    TestBed.flushEffects();

    estateAddressResponse.next(currentEstateAddress());
    estateAddressResponse.complete();

    expect(facade.currentEstateAddress()).toBeNull();
    expect(facade.estateAddress()).toBeNull();
    expect(facade.isEstateAddressLoaded()).toBeFalse();
    expect(facade.estateAddressError()).toBeNull();
  });

  it('ignores stale estate address errors after selected server clears', () => {
    const estateAddressResponse = new Subject<CurrentEstateAddressReadModel>();

    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(estateAddressResponse);

    facade.loadData();
    selectedServer.set(null);
    TestBed.flushEffects();

    estateAddressResponse.error(new Error('Stale estate read failed.'));

    expect(facade.currentEstateAddress()).toBeNull();
    expect(facade.estateAddress()).toBeNull();
    expect(facade.isEstateAddressLoaded()).toBeFalse();
    expect(facade.estateAddressError()).toBeNull();
  });

  it('clears dashboard data and ignores stale hero responses after active hero changes', () => {
    const staleHeroResponse =
      new Subject<ObservableValue<ReturnType<Hero['getHeroData']>>>();
    const pendingHeroResponse =
      new Subject<ObservableValue<ReturnType<Hero['getHeroData']>>>();
    const pendingRuntimeStats = new Subject<
      ObservableValue<ReturnType<HeroDashboardRuntimeStats['getActiveHeroRuntimeStats']>>
    >();
    const pendingEstateAddress = new Subject<CurrentEstateAddressReadModel>();
    const pendingEquipmentSlots =
      new Subject<ObservableValue<ReturnType<HeroEquipment['getEquipmentSlots']>>>();

    hero.getHeroData.and.returnValues(
      staleHeroResponse as ReturnType<Hero['getHeroData']>,
      pendingHeroResponse as ReturnType<Hero['getHeroData']>,
    );
    runtimeStats.getActiveHeroRuntimeStats.and.returnValue(
      pendingRuntimeStats as ReturnType<
        HeroDashboardRuntimeStats['getActiveHeroRuntimeStats']
      >,
    );
    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(
      pendingEstateAddress as ReturnType<
        EstateAddresses['getActiveHeroCurrentAddress']
      >,
    );
    heroEquipment.getEquipmentSlots.and.returnValue(
      pendingEquipmentSlots as ReturnType<HeroEquipment['getEquipmentSlots']>,
    );

    facade.loadData();
    equipmentLoad.and.stub();
    activeHeroState.set(activeHeroContext({ heroId: 'hero-2' }));
    TestBed.flushEffects();

    staleHeroResponse.next({
      id: 'hero-1',
      name: 'Stale Ariadne',
      level: 7,
      server_id: 'server-1',
      experience: 999,
      total_experience_earned: 999,
      character_points: 99,
      total_character_points_earned: 99,
      origin_id: null,
      created_at: null,
      estate_id: null,
      profile_picture: null,
      rank: null,
      user_id: 'user-1',
    });
    staleHeroResponse.complete();

    expect(facade.heroName()).toBe('');
    expect(facade.characterPoints()).toBe(0);
    expect(facade.baseStatRows()).toEqual([]);
    expect(facade.derivedStatRows()).toEqual([]);
    expect(facade.persistentStateRows()).toEqual([]);
    expect(facade.equipmentPreviewRows()).toEqual([]);
    expect(facade.estateAddress()).toBeNull();
  });

  it('exposes DB-owned runtime combat stat rows for dashboard rendering', () => {
    facade.loadData();

    expect(runtimeStats.getActiveHeroRuntimeStats).toHaveBeenCalled();
    expect(facade.derivedStatRows()).toEqual([
      {
        key: 'damage-main_hand',
        label: 'Demonic Dagger',
        value: '21-28',
        valueClass: 'text-md',
        parts: [
          { text: '21', className: 'color-heading text-md' },
          { text: '-', className: 'color-heading text-md' },
          { text: '28', className: 'color-heading text-md' },
        ],
      },
      {
        key: 'damage-off_hand',
        label: 'Unarmed',
        value: '20-21',
        valueClass: 'text-md',
        parts: [
          { text: '20', className: 'color-heading text-md' },
          { text: '-', className: 'color-heading text-md' },
          { text: '21', className: 'color-heading text-md' },
        ],
      },
      {
        key: 'defense',
        label: 'Defense',
        value: '104',
        valueClass: 'color-heading text-md',
        parts: [{ text: '104', className: 'color-heading text-md' }],
      },
      {
        key: 'critical_chance',
        label: 'Critical chance',
        value: '2%',
        valueClass: 'success-text text-md',
        parts: [{ text: '2%', className: 'success-text text-md' }],
      },
      {
        key: 'critical_damage',
        label: 'Critical damage',
        value: '50%',
        valueClass: 'color-heading text-md',
        parts: [{ text: '50%', className: 'color-heading text-md' }],
      },
      {
        key: 'evasion',
        label: 'Evasion',
        value: '8%',
        valueClass: 'color-heading text-md',
        parts: [{ text: '8%', className: 'color-heading text-md' }],
      },
      {
        key: 'attack_count',
        label: 'Attack count',
        value: '2',
        valueClass: 'color-heading text-md',
        parts: [{ text: '2', className: 'color-heading text-md' }],
      },
      {
        key: 'luck',
        label: 'Luck',
        value: '3',
        valueClass: 'color-heading text-md',
        parts: [{ text: '3', className: 'color-heading text-md' }],
      },
    ]);
    expect(facade.derivedDisplay().health).toBe(120);
    expect(facade.healthDisplay()).toEqual({
      currentHealth: 84,
      maxHealth: 120,
    });
  });

  it('uses DB-provided display_stats_json for Hero Stats display', () => {
    facade.loadData();

    expect(facade.baseStatRows()).toEqual([
      {
        key: 'strength',
        label: 'Strength',
        value: '19',
        valueClass: 'color-heading text-lg',
      },
      {
        key: 'dexterity',
        label: 'Dexterity',
        value: '6',
        valueClass: 'color-heading text-lg',
      },
    ]);
    expect(hero.getHeroStats).not.toHaveBeenCalled();
  });

  it('surfaces XP threshold errors instead of using a hardcoded display threshold', () => {
    vitalsExperienceToNextLevel.set(null);
    vitalsRemainingExperience.set(null);
    vitalsExperiencePercent.set(0);
    vitalsError.set('Formula target "Hero experience to next level" failed.');

    facade.loadData();

    expect(facade.experienceToNextLevel()).toBeNull();
    expect(facade.remainingExperience()).toBeNull();
    expect(facade.experiencePercent()).toBe(0);
    expect(facade.experienceError()).toBe(
      'Formula target "Hero experience to next level" failed.',
    );
  });
});

function currentEstateAddress(): CurrentEstateAddressReadModel {
  return {
    estateId: 'estate-1',
    serverId: 'server-1',
    districtCode: 'A',
    districtName: 'Agora District',
    addressNumber: 3,
    addressLabel: 'A-3',
  };
}

function activeHeroContext(
  overrides: Partial<ActiveHeroState> = {},
): ActiveHeroState {
  const server = selectedGameServer();

  return {
    userId: 'user-1',
    serverId: server.id,
    heroId: 'hero-1',
    server,
    hero: null,
    heroRow: null,
    ...overrides,
  };
}

function selectedGameServer(): SelectedGameServer {
  return {
    id: 'server-1',
    key: 'sandbox',
    name: 'Sandbox',
    kind: 'sandbox',
    status: 'live',
    description: null,
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: null,
    canManage: false,
    canUseAsSandbox: true,
  };
}

function mansionEstateView(): MansionEstateView {
  return {
    heroId: 'hero-1',
    serverId: 'server-1',
    currentAddress: 'A-3',
    currentDistrictCode: 'A',
    currentDistrictName: 'Agora District',
    currentDistrictRank: 1,
    resourceBalances: [],
    activeBuildingJob: {
      id: 'job-1',
      estateId: 'estate-1',
      buildingId: 'building-1',
      buildingKey: 'farm',
      buildingName: 'Farm',
      targetLevel: 2,
      status: 'active',
      startedAt: '2026-05-13T10:00:00.000Z',
      completesAt: '2026-05-13T11:00:00.000Z',
      durationSeconds: 3600,
      remainingSeconds: 1800,
      progressPercent: 50,
      createdAt: '2026-05-13T10:00:00.000Z',
      updatedAt: '2026-05-13T10:00:00.000Z',
    },
    recentBuildingJobs: [],
    finalizedBuildingJobsCount: 0,
    buildings: [],
  };
}

function trialCounter(): HeroDailyActionCounterReadModel {
  return {
    id: 'counter-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    actionKind: 'trial',
    actionDate: '2026-05-13',
    remainingCount: 3,
    metadataJson: {},
    createdAt: '2026-05-13T00:00:00.000Z',
    updatedAt: '2026-05-13T10:00:00.000Z',
  };
}

function combatEffectState(): HeroPendingCombatEffectStateReadModel {
  return {
    effectId: 'effect-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationId: 'exploration-1',
    effectDefinitionId: 'effect-definition-1',
    effectKey: 'blessing',
    effectLabel: 'Blessing',
    effectDescription: 'Defensive blessing.',
    effectHelperText: 'Improves defense in combat.',
    effectKind: 'buff',
    effectKindLabel: 'Buff',
    effectTargetKey: 'defense',
    effectTargetLabel: 'Defense',
    bonusTemplateKey: 'defense_percent',
    bonusTemplateLabel: 'Defense percent',
    valueDisplay: '+10%',
    status: 'pending',
    isActive: true,
    runtimeIncluded: true,
    playerSummary: 'Blessing: +10% defense',
    metadataJson: {},
    appliedAt: '2026-05-13T10:00:00.000Z',
    consumedAt: null,
    consumedByKind: null,
    consumedById: null,
  };
}

type ObservableValue<T> = T extends Observable<infer Value> ? Value : never;
