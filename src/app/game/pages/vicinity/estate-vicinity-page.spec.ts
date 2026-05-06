import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PvpTargetCandidate } from '../../../core/domain/pvp/pvp.model';
import { PvpUiMetadata } from '../../../core/services/pvp/pvp-ui-metadata';
import { EstateVicinityPage } from './estate-vicinity-page';
import { EstateVicinityPageState } from './estate-vicinity-page.state';
import { VicinityTargetCandidatesState } from './vicinity-target-candidates.state';
import { VicinityRelocationRunner } from './vicinity-relocation-runner';

describe('EstateVicinityPage', () => {
  let fixture: ComponentFixture<EstateVicinityPage>;
  let page: ReturnType<typeof pageStateStub>;
  let pvpTargets: ReturnType<typeof pvpTargetStateStub>;

  beforeEach(() => {
    page = pageStateStub();
    pvpTargets = pvpTargetStateStub();

    TestBed.configureTestingModule({
      imports: [EstateVicinityPage],
      providers: [
        provideRouter([]),
        {
          provide: PvpUiMetadata,
          useValue: { getNamespaceEntries: jasmine.createSpy().and.returnValue(of([])) },
        },
      ],
    });
    TestBed.overrideComponent(EstateVicinityPage, {
      set: {
        providers: [
          { provide: EstateVicinityPageState, useValue: page },
          { provide: VicinityRelocationRunner, useValue: {} },
          { provide: VicinityTargetCandidatesState, useValue: pvpTargets },
        ],
      },
    });

    fixture = TestBed.createComponent(EstateVicinityPage);
  });

  it('loads vicinity and PvP candidates on init', () => {
    fixture.detectChanges();

    expect(page.loadData).toHaveBeenCalled();
    expect(pvpTargets.loadCandidates).toHaveBeenCalled();
  });

  it('renders safe PvP target candidate data with attack and spy actions', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('PvP targets');
    expect(text).toContain('Target Hero');
    expect(text).toContain('Level 12');
    expect(text).toContain('B-120');
    expect(text).toContain('Distance 8');
    expect(text).toContain('Attack travel');
    expect(text).toContain('3m');
    expect(text).toContain('Spy travel');
    expect(text).toContain('1m 30s');
    expect(text).toContain('No active protection');
    expect(text).toContain('Attack Available');
    expect(text).toContain('Spy Available');
    expect(text).not.toContain('target-hero-private-id');
    expect(text).not.toContain('estate-private-id');
    expect(text).not.toContain('Combat preview');
    expect(text).not.toContain('Combat log');
    expect(text).toContain('Start attack');
    expect(text).toContain('Start spy');
  });

  it('delegates attack and spy starts from PvP target card without direct PvP table access', () => {
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const attackButton = buttons.find((button) =>
      button.textContent?.includes('Start attack')
    );
    const spyButton = buttons.find((button) =>
      button.textContent?.includes('Start spy')
    );

    expect(attackButton).toBeDefined();
    expect(spyButton).toBeDefined();
    attackButton?.click();
    spyButton?.click();

    expect(pvpTargets.startAttack).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ targetHeroId: 'target-hero-private-id' }),
    );
    expect(pvpTargets.startSpy).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ targetHeroId: 'target-hero-private-id' }),
    );
  });
});

function pageStateStub() {
  const districts = signal([
    {
      districtCode: 'B',
      label: 'Beta District',
      districtName: 'Beta District',
      addressCapacity: 5000,
      sortOrder: 10,
      isActive: true,
    },
  ]);

  return {
    isLoading: signal(false),
    isRelocating: signal(false),
    error: signal<string | null>(null),
    relocationError: signal<string | null>(null),
    relocationSuccess: signal<string | null>(null),
    districts,
    selectedDistrictCode: signal('B'),
    centerAddressInput: signal('120'),
    selectedDistrict: computed(() => districts()[0]),
    kindFilter: signal('all'),
    destructiveConfirmed: signal(false),
    currentAddressLabel: signal('B-100'),
    currentDistrictLabel: signal('Beta District (B)'),
    selectedDistrictCapacityLabel: signal('5000 addresses'),
    rangeLabel: signal('B-90 - B-110'),
    visibleRows: signal([]),
    selectedTargetLabel: signal('None'),
    canRelocate: signal(false),
    loadData: jasmine.createSpy('loadData'),
    setSelectedDistrictCode: jasmine.createSpy('setSelectedDistrictCode'),
    setCenterAddressInput: jasmine.createSpy('setCenterAddressInput'),
    applyCenterAddress: jasmine.createSpy('applyCenterAddress'),
    setKindFilter: jasmine.createSpy('setKindFilter'),
    selectRow: jasmine.createSpy('selectRow'),
    setDestructiveConfirmed: jasmine.createSpy('setDestructiveConfirmed'),
    relocate: jasmine.createSpy('relocate'),
  };
}

function pvpTargetStateStub() {
  return {
    isLoading: signal(false),
    error: signal<string | null>(null),
    actionError: signal<string | null>(null),
    actionSuccess: signal<string | null>(null),
    isEmpty: signal(false),
    candidates: signal([candidate()]),
    districtCode: signal<string | null>(null),
    search: signal(''),
    limit: signal(20),
    canGoPrevious: signal(false),
    canGoNext: signal(false),
    isStartingAction: signal(false),
    isAttackPending: jasmine.createSpy('isAttackPending').and.returnValue(false),
    isSpyPending: jasmine.createSpy('isSpyPending').and.returnValue(false),
    startAttack: jasmine.createSpy('startAttack'),
    startSpy: jasmine.createSpy('startSpy'),
    loadCandidates: jasmine.createSpy('loadCandidates'),
    setDistrictCode: jasmine.createSpy('setDistrictCode'),
    setSearch: jasmine.createSpy('setSearch'),
    setPageSize: jasmine.createSpy('setPageSize'),
    previousPage: jasmine.createSpy('previousPage'),
    nextPage: jasmine.createSpy('nextPage'),
  };
}

function candidate(): PvpTargetCandidate {
  return {
    targetHeroId: 'target-hero-private-id',
    targetDisplayName: 'Target Hero',
    targetLevel: 12,
    targetAddress: {
      estateId: 'estate-private-id',
      districtCode: 'B',
      address: 'B-120',
      addressNumber: 120,
      estateRank: 2,
    },
    distanceScore: 8,
    underProtection: false,
    protectionExpiresAt: null,
    attackEligibility: {
      canStart: true,
      blockReason: null,
      travelTimeSeconds: 180,
      minTargetLevel: 8,
      maxTargetLevel: 16,
      attackerHasBlockingActivity: false,
    },
    spyEligibility: {
      canStart: true,
      blockReason: null,
      travelTimeSeconds: 90,
    },
  };
}
