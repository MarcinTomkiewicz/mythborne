import { signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH } from '../../../core/constants/moderation-action.const';
import { AntiAbuseCaseReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { ServerAccessState, SelectedGameServer } from '../../../core/interfaces/server/active-server.interface';
import { AntiAbuseCases } from '../../../core/services/anti-abuse/anti-abuse-cases';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ModerationActions } from '../../../core/services/moderation/moderation-actions';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ActiveServerFormFactory } from '../../../core/factories/forms/active-server-form.factory';
import { AntiAbuseCasesPage } from './anti-abuse-cases-page';

let selectedServerSignal: ReturnType<typeof signal<SelectedGameServer | null>>;
let accessSignal: ReturnType<typeof signal<ServerAccessState>>;

describe('AntiAbuseCasesPage', () => {
  let fixture: ComponentFixture<AntiAbuseCasesPage>;
  let antiAbuseCases: jasmine.SpyObj<AntiAbuseCases>;
  let moderationActions: jasmine.SpyObj<ModerationActions>;

  beforeEach(async () => {
    antiAbuseCases = jasmine.createSpyObj<AntiAbuseCases>('AntiAbuseCases', [
      'getCasesForServer',
    ]);
    antiAbuseCases.getCasesForServer.and.returnValue(of([]));
    moderationActions = jasmine.createSpyObj<ModerationActions>('ModerationActions', [
      'canSearchTargets',
      'searchHeroTargets',
      'searchUserTargets',
    ]);
    moderationActions.canSearchTargets.and.returnValue(of(true));
    moderationActions.searchHeroTargets.and.returnValue(of([heroTarget()]));
    moderationActions.searchUserTargets.and.returnValue(of([userTarget()]));
    selectedServerSignal = signal<SelectedGameServer | null>(createServer('server-1'));
    accessSignal = signal(createAccess());

    await TestBed.configureTestingModule({
      imports: [AntiAbuseCasesPage],
      providers: [
        provideRouter([]),
        { provide: AntiAbuseCases, useValue: antiAbuseCases },
        { provide: ModerationActions, useValue: moderationActions },
        { provide: ActiveServer, useValue: createActiveServer() },
        { provide: ActiveHero, useValue: { loadActiveHero: () => of(null) } },
        {
          provide: ActiveServerFormFactory,
          useValue: {
            createSelectorForm: () =>
              new FormGroup({
                selectedServerId: new FormControl('server-1'),
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AntiAbuseCasesPage);
    fixture.detectChanges();
  });

  it('does not reload cases when filter fields change before explicit apply', () => {
    expect(antiAbuseCases.getCasesForServer).toHaveBeenCalledTimes(1);

    fixture.componentInstance.filterForm.controls.status.setValue('in_review');
    fixture.detectChanges();

    expect(antiAbuseCases.getCasesForServer).toHaveBeenCalledTimes(1);

    fixture.componentInstance.applyFilters();

    expect(antiAbuseCases.getCasesForServer).toHaveBeenCalledTimes(2);
    expect(antiAbuseCases.getCasesForServer.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({
        serverId: 'server-1',
        status: 'in_review',
      }),
    );
  });

  it('uses target search results for participant filters without auto reloading', () => {
    expect(antiAbuseCases.getCasesForServer).toHaveBeenCalledTimes(1);

    fixture.componentInstance.searchHeroTargets({ query: 'Aster' });
    fixture.componentInstance.selectHeroTarget(heroTarget());
    fixture.detectChanges();

    expect(moderationActions.searchHeroTargets).toHaveBeenCalledOnceWith({
      serverId: 'server-1',
      query: 'Aster',
      limit: 10,
    });
    expect(antiAbuseCases.getCasesForServer).toHaveBeenCalledTimes(1);

    fixture.componentInstance.applyFilters();

    expect(antiAbuseCases.getCasesForServer).toHaveBeenCalledTimes(2);
    expect(antiAbuseCases.getCasesForServer.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({
        participantHeroId: 'hero-1',
        participantUserId: null,
      }),
    );
  });

  it('clears target controls and participant filters when selected server changes', () => {
    setSelectedParticipantTargets(fixture.componentInstance);

    selectedServerSignal.set(createServer('server-2'));
    fixture.detectChanges();

    expect(fixture.componentInstance.targetSearch.heroTargetControl.value).toBeNull();
    expect(fixture.componentInstance.targetSearch.userTargetControl.value).toBeNull();
    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual(
      jasmine.objectContaining({
        participantHeroId: null,
        participantUserId: null,
      }),
    );
    expect(fixture.componentInstance.appliedFilters()).toEqual(
      jasmine.objectContaining({
        participantHeroId: null,
        participantUserId: null,
      }),
    );
  });

  it('clears target controls and participant filters when anti-abuse access is lost', () => {
    setSelectedParticipantTargets(fixture.componentInstance);

    accessSignal.set({ ...createAccess(), serverStaffRole: null, isServerStaff: false });
    fixture.detectChanges();

    expect(fixture.componentInstance.targetSearch.heroTargetControl.value).toBeNull();
    expect(fixture.componentInstance.targetSearch.userTargetControl.value).toBeNull();
    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual(
      jasmine.objectContaining({
        participantHeroId: null,
        participantUserId: null,
      }),
    );
    expect(fixture.componentInstance.appliedFilters()).toEqual(
      jasmine.objectContaining({
        participantHeroId: null,
        participantUserId: null,
      }),
    );
  });

  it('does not let stale case list responses overwrite current results', () => {
    const staleResponse = new Subject<AntiAbuseCaseReadModel[]>();
    const currentResponse = new Subject<AntiAbuseCaseReadModel[]>();

    antiAbuseCases.getCasesForServer.calls.reset();
    antiAbuseCases.getCasesForServer.and.returnValues(
      staleResponse.asObservable(),
      currentResponse.asObservable(),
    );

    fixture.componentInstance.refresh();
    fixture.componentInstance.filterForm.controls.status.setValue('in_review');
    fixture.componentInstance.applyFilters();

    currentResponse.next([caseItem('case-current')]);
    staleResponse.next([caseItem('case-stale')]);

    expect(fixture.componentInstance.cases()[0].id).toBe('case-current');
  });

  it('clears hero participant filters without leaving a hidden user filter', () => {
    fixture.componentInstance.selectHeroTarget(heroTarget());

    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual(
      jasmine.objectContaining({
        participantHeroId: 'hero-1',
        participantUserId: null,
      }),
    );

    fixture.componentInstance.clearHeroTarget();

    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual(
      jasmine.objectContaining({
        participantHeroId: null,
        participantUserId: null,
      }),
    );
  });

  it('uses user target search only for the user participant filter', () => {
    fixture.componentInstance.searchUserTargets({ query: 'Aster Account' });
    fixture.componentInstance.selectUserTarget(userTarget());

    expect(moderationActions.searchUserTargets).toHaveBeenCalledOnceWith({
      serverId: 'server-1',
      query: 'Aster Account',
      limit: 10,
    });
    expect(fixture.componentInstance.filterForm.getRawValue()).toEqual(
      jasmine.objectContaining({
        participantHeroId: null,
        participantUserId: 'user-1',
      }),
    );
  });

  it('does not let stale hero target search responses overwrite newer suggestions', () => {
    const staleResponse = new Subject<ReturnType<typeof heroTarget>[]>();
    const currentResponse = new Subject<ReturnType<typeof heroTarget>[]>();

    moderationActions.searchHeroTargets.and.returnValues(
      staleResponse.asObservable(),
      currentResponse.asObservable(),
    );

    fixture.componentInstance.searchHeroTargets({ query: 'Old' });
    fixture.componentInstance.searchHeroTargets({ query: 'New' });

    currentResponse.next([{ ...heroTarget(), heroId: 'hero-current', label: 'Current' }]);
    staleResponse.next([{ ...heroTarget(), heroId: 'hero-stale', label: 'Stale' }]);

    expect(fixture.componentInstance.targetSearch.heroTargetSuggestions()[0]).toEqual(
      jasmine.objectContaining({
        heroId: 'hero-current',
        label: 'Current',
      }),
    );
  });

  it('invalidates stale target search responses when selected server changes', () => {
    const staleResponse = new Subject<ReturnType<typeof userTarget>[]>();

    moderationActions.searchUserTargets.and.returnValue(staleResponse.asObservable());

    fixture.componentInstance.searchUserTargets({ query: 'Aster' });
    selectedServerSignal.set(createServer('server-2'));
    fixture.detectChanges();
    staleResponse.next([{ ...userTarget(), userId: 'user-stale', label: 'Stale' }]);

    expect(fixture.componentInstance.targetSearch.userTargetSuggestions()).toEqual([]);
  });

  it('exposes the shared target search min length for the template', () => {
    expect(fixture.componentInstance.targetSearch.minQueryLength).toBe(
      MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH,
    );
  });
});

function setSelectedParticipantTargets(component: AntiAbuseCasesPage): void {
  component.targetSearch.heroTargetControl.setValue(heroTarget());
  component.targetSearch.userTargetControl.setValue(userTarget());
  component.selectHeroTarget(heroTarget());
  component.selectUserTarget(userTarget());
  component.applyFilters();
}

function caseItem(id: string): AntiAbuseCaseReadModel {
  return {
    id,
    serverId: 'server-1',
    title: 'Case',
    summary: null,
    source: 'manual',
    status: 'open',
    statusReason: null,
    verdict: null,
    verdictReason: null,
    sanctionRequired: null,
    noSanctionReason: null,
    operatorNotes: null,
    groupingKey: null,
    primaryHeroId: null,
    primaryUserId: null,
    assignedToUserId: null,
    openedByUserId: null,
    resolvedByUserId: null,
    signalCount: 0,
    lastSignalAt: null,
    possibleRecidivism: false,
    createdAt: '2026-04-30T09:00:00.000Z',
    updatedAt: '2026-04-30T09:10:00.000Z',
    resolvedAt: null,
    cancelledAt: null,
  };
}

function heroTarget() {
  return {
    heroId: 'hero-1',
    heroName: 'Aster',
    userId: 'user-1',
    userDisplayName: 'Aster Account',
    email: 'aster@example.com',
    hasVisibleModerationHistory: false,
    matchKind: 'hero_name',
    technicalLabel: 'hero-1',
    label: 'Aster',
    description: 'Aster Account | aster@example.com | hero-1',
  };
}

function userTarget() {
  return {
    userId: 'user-1',
    displayName: 'Aster Account',
    email: 'aster@example.com',
    primaryHeroId: 'hero-1',
    primaryHeroName: 'Aster',
    hasVisibleModerationHistory: false,
    matchKind: 'display_name',
    technicalLabel: 'user-1',
    label: 'Aster Account',
    description: 'Primary hero: Aster | aster@example.com | user-1',
  };
}

function createActiveServer(): Partial<ActiveServer> {
  return {
    servers: signal([createServer('server-1'), createServer('server-2')]).asReadonly(),
    selectedServer: selectedServerSignal.asReadonly(),
    access: accessSignal.asReadonly(),
    isLoading: signal(false).asReadonly(),
    error: signal(null).asReadonly(),
    loadAccessibleServers: () => of([createServer('server-1'), createServer('server-2')]),
    selectServer: () => true,
  };
}

function createServer(id: string): SelectedGameServer {
  return {
    id,
    key: 'athens',
    name: 'Athens',
    kind: 'standard',
    status: 'live',
    description: null,
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: 'moderator',
    canManage: false,
    canUseAsSandbox: false,
  };
}

function createAccess(): ServerAccessState {
  return {
    userId: 'user-1',
    globalRoleKey: null,
    membershipStatus: 'active',
    membership: null,
    serverStaffRole: 'moderator',
    isAdmin: false,
    isOperator: false,
    isTester: false,
    isModerator: false,
    isServerStaff: true,
    isMembershipActive: true,
    isMembershipSuspended: false,
    isMembershipBanned: false,
    isMembershipBlocked: false,
    canAccessSandbox: false,
    canManageSelectedServer: false,
  };
}
