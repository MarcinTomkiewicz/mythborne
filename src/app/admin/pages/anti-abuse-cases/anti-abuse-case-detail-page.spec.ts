import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import {
  AntiAbuseCaseDetailReadModel,
} from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../../../core/interfaces/server/active-server.interface';
import { AntiAbuseCaseDetails } from '../../../core/services/anti-abuse/anti-abuse-case-details';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ActiveServerFormFactory } from '../../../core/factories/forms/active-server-form.factory';
import { AntiAbuseCaseDetailPage } from './anti-abuse-case-detail-page';

describe('AntiAbuseCaseDetailPage', () => {
  let fixture: ComponentFixture<AntiAbuseCaseDetailPage>;
  let caseDetails: jasmine.SpyObj<AntiAbuseCaseDetails>;
  let selectedServer: WritableSignal<SelectedGameServer | null>;
  let paramMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let firstRequest: Subject<AntiAbuseCaseDetailReadModel>;
  let secondRequest: Subject<AntiAbuseCaseDetailReadModel>;

  beforeEach(async () => {
    selectedServer = signal(createServer('server-1'));
    paramMap = new BehaviorSubject(convertToParamMap({ caseId: 'case-1' }));
    firstRequest = new Subject<AntiAbuseCaseDetailReadModel>();
    secondRequest = new Subject<AntiAbuseCaseDetailReadModel>();
    caseDetails = jasmine.createSpyObj<AntiAbuseCaseDetails>('AntiAbuseCaseDetails', [
      'getCaseDetail',
    ]);
    caseDetails.getCaseDetail.and.returnValues(firstRequest, secondRequest);

    await TestBed.configureTestingModule({
      imports: [AntiAbuseCaseDetailPage],
      providers: [
        provideRouter([]),
        { provide: AntiAbuseCaseDetails, useValue: caseDetails },
        { provide: ActiveServer, useValue: createActiveServer(selectedServer) },
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
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ caseId: 'case-1' }) },
            paramMap: paramMap.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AntiAbuseCaseDetailPage);
    fixture.detectChanges();
  });

  it('does not set stale detail when selected server changes before old request returns', () => {
    expect(caseDetails.getCaseDetail).toHaveBeenCalledOnceWith({
      serverId: 'server-1',
      caseId: 'case-1',
    });

    selectedServer.set(createServer('server-2'));
    fixture.detectChanges();

    expect(caseDetails.getCaseDetail).toHaveBeenCalledTimes(2);
    expect(caseDetails.getCaseDetail.calls.mostRecent().args[0]).toEqual({
      serverId: 'server-2',
      caseId: 'case-1',
    });

    firstRequest.next(createDetail('server-1', 'case-1'));
    firstRequest.complete();

    expect(fixture.componentInstance.detail()).toBeNull();

    secondRequest.next(createDetail('server-2', 'case-1'));
    secondRequest.complete();

    expect(fixture.componentInstance.detail()?.case.serverId).toBe('server-2');
  });
});

function createActiveServer(
  selectedServer: WritableSignal<SelectedGameServer | null>,
): Partial<ActiveServer> {
  return {
    servers: signal([createServer('server-1'), createServer('server-2')]).asReadonly(),
    selectedServer: selectedServer.asReadonly(),
    access: signal(createAccess()).asReadonly(),
    isLoading: signal(false).asReadonly(),
    error: signal(null).asReadonly(),
    loadAccessibleServers: () => of([createServer('server-1'), createServer('server-2')]),
    selectServer: () => true,
  };
}

function createServer(id: string): SelectedGameServer {
  return {
    id,
    key: id,
    name: id,
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

function createDetail(
  serverId: string,
  caseId: string,
): AntiAbuseCaseDetailReadModel {
  return {
    case: {
      id: caseId,
      serverId,
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
      createdAt: '2026-04-30T00:00:00.000Z',
      updatedAt: '2026-04-30T00:00:00.000Z',
      resolvedAt: null,
      cancelledAt: null,
    },
    signals: [],
    caseSignals: [],
    participants: [],
    auditLinks: [],
    auditLogs: [],
    declarationLinks: [],
    declarations: [],
    reports: [],
    sanctions: [],
    characterPointPenalties: [],
    sanctionItems: [],
  };
}
