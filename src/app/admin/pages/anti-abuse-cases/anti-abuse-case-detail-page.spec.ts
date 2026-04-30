import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import {
  AntiAbuseCaseDetailReadModel,
} from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseCaseDecision } from '../../../core/domain/anti-abuse/anti-abuse-decision.model';
import { AntiAbuseSanctionDecision } from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../../../core/interfaces/server/active-server.interface';
import { AntiAbuseCaseDetails } from '../../../core/services/anti-abuse/anti-abuse-case-details';
import { AntiAbuseDecisions } from '../../../core/services/anti-abuse/anti-abuse-decisions';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ModerationActions } from '../../../core/services/moderation/moderation-actions';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ActiveServerFormFactory } from '../../../core/factories/forms/active-server-form.factory';
import { AntiAbuseCaseDetailPage } from './anti-abuse-case-detail-page';
import { AntiAbuseCaseStatusTransitionSection } from './anti-abuse-case-status-transition-section';
import {
  ANTI_ABUSE_VERDICT_STATUS_REASON_FALLBACK,
  AntiAbuseCaseVerdictSection,
} from './anti-abuse-case-verdict-section';

describe('AntiAbuseCaseDetailPage', () => {
  let fixture: ComponentFixture<AntiAbuseCaseDetailPage>;
  let caseDetails: jasmine.SpyObj<AntiAbuseCaseDetails>;
  let decisions: jasmine.SpyObj<AntiAbuseDecisions>;
  let moderationActions: jasmine.SpyObj<ModerationActions>;
  let selectedServer: WritableSignal<SelectedGameServer | null>;
  let paramMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let firstRequest: Subject<AntiAbuseCaseDetailReadModel>;
  let secondRequest: Subject<AntiAbuseCaseDetailReadModel>;
  let statusRequest: Subject<AntiAbuseCaseDecision>;
  let sanctionStatusRequest: Subject<AntiAbuseSanctionDecision>;

  beforeEach(async () => {
    selectedServer = signal(createServer('server-1'));
    paramMap = new BehaviorSubject(convertToParamMap({ caseId: 'case-1' }));
    firstRequest = new Subject<AntiAbuseCaseDetailReadModel>();
    secondRequest = new Subject<AntiAbuseCaseDetailReadModel>();
    statusRequest = new Subject<AntiAbuseCaseDecision>();
    sanctionStatusRequest = new Subject<AntiAbuseSanctionDecision>();
    caseDetails = jasmine.createSpyObj<AntiAbuseCaseDetails>('AntiAbuseCaseDetails', [
      'getCaseDetail',
    ]);
    caseDetails.getCaseDetail.and.callFake(({ serverId, caseId }) => {
      const callNumber = caseDetails.getCaseDetail.calls.count();

      if (callNumber === 1) {
        return firstRequest;
      }

      if (callNumber === 2) {
        return secondRequest;
      }

      return of(createDetail(serverId, caseId));
    });
    decisions = jasmine.createSpyObj<AntiAbuseDecisions>('AntiAbuseDecisions', [
      'setCaseDecision',
      'setSanctionStatus',
      'createSanction',
      'createCharacterPointPenalty',
      'addSanctionItem',
    ]);
    decisions.setCaseDecision.and.returnValue(statusRequest);
    decisions.setSanctionStatus.and.returnValue(sanctionStatusRequest);
    moderationActions = jasmine.createSpyObj<ModerationActions>('ModerationActions', [
      'canSearchTargets',
      'searchHeroTargets',
      'searchItemTargets',
      'searchUserTargets',
    ]);
    moderationActions.canSearchTargets.and.returnValue(of(true));
    moderationActions.searchHeroTargets.and.returnValue(of([]));
    moderationActions.searchItemTargets.and.returnValue(of([]));
    moderationActions.searchUserTargets.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AntiAbuseCaseDetailPage],
      providers: [
        provideRouter([]),
        { provide: AntiAbuseCaseDetails, useValue: caseDetails },
        { provide: AntiAbuseDecisions, useValue: decisions },
        { provide: ModerationActions, useValue: moderationActions },
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

  it('renders staff-facing case context sections from the detail aggregate', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Status reason');
    expect(text).toContain('Verdict reason');
    expect(text).toContain('Operator notes');
    expect(text).toContain('Participant reason');
    expect(text).toContain('Trade funnel signal');
    expect(text).toContain('Player report');
    expect(text).toContain('Shared household label');
    expect(text).toContain('Character Point fine');
    expect(text).toContain('Total / paid / remaining: 25 / 5 / 20');
    expect(text).toContain('Linked item evidence/context');
    expect(text).toContain('Stat allocation saved');
  });

  it('uses DB-backed type labels as primary staff detail labels', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Trade funnel signal');
    expect(text).toContain('Trade scam label');
    expect(text).toContain('Shared household label');
    expect(text).toContain('Character Point fine');
    expect(text).toContain('Type key: trade_funnel');
    expect(text).toContain('Type key: scam');
    expect(text).toContain('Type key: shared_household');
    expect(text).toContain('Type key: character_point_fine');
  });

  it('submits case status transitions through the canonical decision workflow', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    const section = fixture.debugElement.query(
      By.directive(AntiAbuseCaseStatusTransitionSection),
    ).componentInstance as AntiAbuseCaseStatusTransitionSection;

    section.form.controls.status.setValue('in_review');
    section.form.controls.statusReason.setValue(' Needs staff review. ');
    section.submit();

    statusRequest.next(createDecision('case-1', 'server-1'));
    statusRequest.complete();
    fixture.detectChanges();

    expect(decisions.setCaseDecision).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        caseId: 'case-1',
        status: 'in_review',
        statusReason: 'Needs staff review.',
      }),
    );
    const payload = decisions.setCaseDecision.calls.mostRecent().args[0];
    expect(payload.verdict).toBeUndefined();
    expect(payload.verdictReason).toBeUndefined();
    expect(payload.sanctionRequired).toBeUndefined();
    expect(payload.noSanctionReason).toBeUndefined();
    expect(payload.operatorNotes).toBeUndefined();
    expect(fixture.componentInstance.detail()?.case.status).toBe('in_review');
    expect(fixture.componentInstance.detail()?.case.statusReason).toBe(
      'Needs staff review.',
    );
  });

  it('syncs status control from current case status without clearing success feedback', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    const section = statusSection(fixture);
    section.form.controls.status.setValue('in_review');
    section.form.controls.statusReason.setValue('Needs staff review.');
    section.submit();

    statusRequest.next(createDecision('case-1', 'server-1'));
    statusRequest.complete();
    fixture.detectChanges();

    expect(section.successMessage()).toBe('Case status updated.');
    expect(section.form.controls.status.value).toBe('in_review');
  });

  it('ignores stale status transition response after selected server changes', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    const section = statusSection(fixture);
    section.form.controls.status.setValue('in_review');
    section.form.controls.statusReason.setValue('Needs staff review.');
    section.submit();

    selectedServer.set(createServer('server-2'));
    fixture.detectChanges();

    statusRequest.next(createDecision('case-1', 'server-1'));
    statusRequest.complete();
    fixture.detectChanges();

    expect(fixture.componentInstance.detail()).toBeNull();
  });

  it('ignores stale status transition response after route case id changes', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    const section = statusSection(fixture);
    section.form.controls.status.setValue('in_review');
    section.form.controls.statusReason.setValue('Needs staff review.');
    section.submit();

    paramMap.next(convertToParamMap({ caseId: 'case-2' }));
    fixture.detectChanges();

    statusRequest.next(createDecision('case-1', 'server-1'));
    statusRequest.complete();
    fixture.detectChanges();

    expect(fixture.componentInstance.detail()).toBeNull();
  });

  it('ignores case decisions for another case or server', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    fixture.componentInstance.applyCaseDecision(createDecision('case-2', 'server-1'));
    expect(fixture.componentInstance.detail()?.case.status).toBe('open');

    fixture.componentInstance.applyCaseDecision(createDecision('case-1', 'server-2'));
    expect(fixture.componentInstance.detail()?.case.status).toBe('open');
  });

  it('keeps success feedback visible after local detail update', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    const section = statusSection(fixture);
    section.form.controls.status.setValue('in_review');
    section.form.controls.statusReason.setValue('Needs staff review.');
    section.submit();

    statusRequest.next(createDecision('case-1', 'server-1'));
    statusRequest.complete();
    fixture.detectChanges();

    expect(section.successMessage()).toBe('Case status updated.');
    expect(fixture.nativeElement.textContent).toContain('Case status updated.');
  });

  it('submits case verdict through the canonical decision workflow', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    const section = verdictSection(fixture);
    section.form.controls.verdict.setValue('no_abuse');
    section.form.controls.verdictReason.setValue(' Evidence does not confirm abuse. ');
    section.form.controls.sanctionRequired.setValue(false);
    section.form.controls.noSanctionReason.setValue('No sanction needed.');
    section.submit();

    statusRequest.next(
      createDecision('case-1', 'server-1', {
        verdict: 'no_abuse',
        verdictReason: 'Evidence does not confirm abuse.',
        sanctionRequired: false,
        noSanctionReason: 'No sanction needed.',
      }),
    );
    statusRequest.complete();
    fixture.detectChanges();

    expect(decisions.setCaseDecision).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        caseId: 'case-1',
        status: 'open',
        statusReason: 'Status reason text.',
        verdict: 'no_abuse',
        verdictReason: 'Evidence does not confirm abuse.',
        sanctionRequired: false,
        noSanctionReason: 'No sanction needed.',
      }),
    );
    const payload = decisions.setCaseDecision.calls.mostRecent().args[0];
    expect(payload.operatorNotes).toBeUndefined();
    expect(fixture.componentInstance.detail()?.case.verdict).toBe('no_abuse');
    expect(fixture.componentInstance.detail()?.case.sanctionRequired).toBeFalse();
  });

  it('uses stable verdict status reason fallback and clears no-sanction reason when sanction is required', () => {
    firstRequest.next(createDetail('server-1', 'case-1', false));
    firstRequest.complete();
    fixture.detectChanges();

    const section = verdictSection(fixture);
    section.form.controls.verdict.setValue('abuse_confirmed');
    section.form.controls.verdictReason.setValue('Confirmed funneling.');
    section.form.controls.sanctionRequired.setValue(true);
    section.form.controls.noSanctionReason.setValue('Should not be sent.');
    section.submit();

    expect(decisions.setCaseDecision).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        caseId: 'case-1',
        status: 'open',
        statusReason: ANTI_ABUSE_VERDICT_STATUS_REASON_FALLBACK,
        verdict: 'abuse_confirmed',
        verdictReason: 'Confirmed funneling.',
        sanctionRequired: true,
        noSanctionReason: null,
      }),
    );
    const payload = decisions.setCaseDecision.calls.mostRecent().args[0];
    expect(payload.operatorNotes).toBeUndefined();
  });

  it('blocks resolved sanction-required verdicts when no sanctions exist', () => {
    const detail = createDetail('server-1', 'case-1', false);
    detail.case.status = 'resolved';
    detail.case.statusReason = 'Case resolved.';
    firstRequest.next(detail);
    firstRequest.complete();
    fixture.detectChanges();

    const section = verdictSection(fixture);
    section.form.controls.verdict.setValue('abuse_confirmed');
    section.form.controls.verdictReason.setValue('Confirmed abuse.');
    section.form.controls.sanctionRequired.setValue(true);
    section.submit();

    expect(decisions.setCaseDecision).not.toHaveBeenCalled();
    expect(section.error()).toContain('sanction required');
  });

  it('ignores stale verdict response after selected server changes', () => {
    firstRequest.next(createDetail('server-1', 'case-1', true));
    firstRequest.complete();
    fixture.detectChanges();

    const section = verdictSection(fixture);
    section.form.controls.verdict.setValue('no_abuse');
    section.form.controls.verdictReason.setValue('Evidence does not confirm abuse.');
    section.form.controls.sanctionRequired.setValue(false);
    section.submit();

    selectedServer.set(createServer('server-2'));
    fixture.detectChanges();

    statusRequest.next(createDecision('case-1', 'server-1', { verdict: 'no_abuse' }));
    statusRequest.complete();
    fixture.detectChanges();

    expect(fixture.componentInstance.detail()).toBeNull();
  });
});

function statusSection(
  fixture: ComponentFixture<AntiAbuseCaseDetailPage>,
): AntiAbuseCaseStatusTransitionSection {
  return fixture.debugElement.query(By.directive(AntiAbuseCaseStatusTransitionSection))
    .componentInstance as AntiAbuseCaseStatusTransitionSection;
}

function verdictSection(
  fixture: ComponentFixture<AntiAbuseCaseDetailPage>,
): AntiAbuseCaseVerdictSection {
  return fixture.debugElement.query(By.directive(AntiAbuseCaseVerdictSection))
    .componentInstance as AntiAbuseCaseVerdictSection;
}

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
  withLinkedData = false,
): AntiAbuseCaseDetailReadModel {
  return {
    case: {
      id: caseId,
      serverId,
      title: 'Case',
      summary: null,
      source: 'manual',
      status: 'open',
      statusReason: withLinkedData ? 'Status reason text.' : null,
      verdict: withLinkedData ? 'abuse_confirmed' : null,
      verdictReason: withLinkedData ? 'Verdict reason text.' : null,
      sanctionRequired: withLinkedData ? true : null,
      noSanctionReason: null,
      operatorNotes: withLinkedData ? 'Operator notes text.' : null,
      groupingKey: withLinkedData ? 'group-1' : null,
      primaryHeroId: withLinkedData ? 'hero-1' : null,
      primaryUserId: withLinkedData ? 'user-1' : null,
      assignedToUserId: withLinkedData ? 'staff-1' : null,
      openedByUserId: withLinkedData ? 'staff-2' : null,
      resolvedByUserId: null,
      signalCount: withLinkedData ? 1 : 0,
      lastSignalAt: withLinkedData ? '2026-04-30T00:10:00.000Z' : null,
      possibleRecidivism: withLinkedData,
      createdAt: '2026-04-30T00:00:00.000Z',
      updatedAt: '2026-04-30T00:00:00.000Z',
      resolvedAt: null,
      cancelledAt: null,
    },
    dictionaries: {
      sanctionTypes: [
        {
          key: 'character_point_fine',
          label: 'Character Point fine',
          description: 'Removes Character Points.',
          helperText: 'Use for confirmed abuse.',
          adminDescription: 'Staff sanction description.',
          category: 'points',
          sortOrder: 10,
          isActive: true,
          requiresReason: true,
          requiresTargetHero: true,
          requiresSourceHero: false,
          requiresDurationDays: false,
          requiresItemSelection: false,
          requiresCharacterPointsAmount: true,
        },
      ],
      reportTypes: [
        {
          key: 'scam',
          label: 'Trade scam label',
          description: 'Report a trade scam.',
          helperText: 'Attach trade context.',
          adminDescription: 'Staff report description.',
          category: 'trade',
          sortOrder: 10,
          isActive: true,
          requiresAccusedHero: true,
          requiresDescription: true,
          requiresTradeSelection: true,
          requiresItemSelection: false,
        },
      ],
      declarationTypes: [
        {
          key: 'shared_household',
          label: 'Shared household label',
          description: 'Shared household declaration.',
          helperText: 'Review participant overlap.',
          adminDescription: 'Staff declaration description.',
          category: 'relationship',
          sortOrder: 10,
          isActive: true,
          minParticipants: 2,
          maxParticipants: 4,
          requiresAmount: false,
          requiresExpiration: false,
          requiresTradeSelection: false,
          requiresItemSelection: false,
        },
      ],
      signalTypes: [
        {
          key: 'trade_funnel',
          label: 'Trade funnel signal',
          description: 'Potential trade funnel.',
          helperText: 'Review trade graph.',
          adminDescription: 'Staff signal description.',
          category: 'trade',
          sortOrder: 10,
          isActive: true,
          defaultSeverity: 'warning',
          defaultScore: 25,
          defaultConfidence: 0.8,
        },
      ],
    },
    signals: withLinkedData
      ? [
          {
            id: 'signal-1',
            serverId,
            signalTypeKey: 'trade_funnel',
            title: 'Trade funnel',
            description: 'Potential trade funnel.',
            severity: 'warning',
            score: 25,
            confidence: 0.8,
            reason: 'Signal reason.',
            groupingKey: 'group-1',
            actorHeroId: 'hero-1',
            actorUserId: 'user-1',
            targetHeroId: 'hero-2',
            targetUserId: 'user-2',
            entityTypeKey: 'trade',
            entityId: 'trade-1',
            auditLogId: 'audit-1',
            metadataJson: { score: 25 },
            isDismissed: false,
            dismissedAt: null,
            dismissedByUserId: null,
            dismissedReason: null,
            createdAt: '2026-04-30T00:10:00.000Z',
          },
        ]
      : [],
    caseSignals: withLinkedData
      ? [
          {
            caseId,
            signalId: 'signal-1',
            reason: 'Linked by score.',
            linkedByUserId: 'staff-1',
            createdAt: '2026-04-30T00:11:00.000Z',
          },
        ]
      : [],
    participants: withLinkedData
      ? [
          {
            id: 'participant-1',
            caseId,
            userId: 'user-1',
            heroId: 'hero-1',
            roleKey: 'primary',
            reason: 'Participant reason',
            description: 'Participant description',
            createdByUserId: 'staff-1',
            createdAt: '2026-04-30T00:12:00.000Z',
          },
        ]
      : [],
    auditLinks: withLinkedData
      ? [
          {
            caseId,
            auditLogId: 'audit-1',
            reason: 'Audit link reason.',
            linkedByUserId: 'staff-1',
            createdAt: '2026-04-30T00:13:00.000Z',
          },
        ]
      : [],
    auditLogs: withLinkedData
      ? [
          {
            id: 'audit-1',
            actionTypeKey: 'gameplay.stat_allocation.saved',
            actionType: {
              id: 'action-1',
              key: 'gameplay.stat_allocation.saved',
              label: 'Stat allocation saved',
              category: 'gameplay',
              description: null,
              defaultSeverity: 'notice',
              sortOrder: 10,
              isActive: true,
              createdAt: '2026-04-30T00:00:00.000Z',
              updatedAt: '2026-04-30T00:00:00.000Z',
            },
            entityTypeKey: 'hero',
            entityType: {
              id: 'entity-1',
              key: 'hero',
              label: 'Hero',
              category: 'gameplay',
              description: null,
              sortOrder: 10,
              isActive: true,
              createdAt: '2026-04-30T00:00:00.000Z',
              updatedAt: '2026-04-30T00:00:00.000Z',
            },
            entityId: 'hero-1',
            severity: 'notice',
            reason: 'Audit reason.',
            serverId,
            actorUserId: 'user-1',
            actorHeroId: 'hero-1',
            targetUserId: 'user-1',
            targetHeroId: 'hero-1',
            requestId: 'request-1',
            metadataJson: { source: 'test' },
            oldValueJson: { characterPoints: 30 },
            newValueJson: { characterPoints: 5 },
            createdAt: '2026-04-30T00:14:00.000Z',
          },
        ]
      : [],
    declarationLinks: withLinkedData
      ? [
          {
            caseId,
            declarationId: 'declaration-1',
            reason: 'Declaration link reason.',
            linkedByUserId: 'staff-1',
            createdAt: '2026-04-30T00:15:00.000Z',
          },
        ]
      : [],
    declarations: withLinkedData
      ? [
          {
            id: 'declaration-1',
            serverId,
            declarationTypeKey: 'shared_household',
            title: 'Shared household',
            status: 'approved',
            statusReason: 'Declaration status reason.',
            adminNotes: 'Declaration admin notes.',
            playerNotes: 'Declaration player notes.',
            reviewedAt: '2026-04-30T00:16:00.000Z',
            reviewedByUserId: 'staff-1',
            updatedAt: '2026-04-30T00:16:00.000Z',
          },
        ]
      : [],
    reports: withLinkedData
      ? [
          {
            id: 'report-1',
            serverId,
            reportTypeKey: 'scam',
            title: 'Player report',
            status: 'linked_to_case',
            statusReason: 'Report status reason.',
            caseId,
            adminNotes: 'Report admin notes.',
            playerNotes: 'Report player notes.',
            resolvedAt: null,
            updatedAt: '2026-04-30T00:17:00.000Z',
          },
        ]
      : [],
    sanctions: withLinkedData
      ? [
          {
            id: 'sanction-1',
            caseId,
            sanctionTypeKey: 'character_point_fine',
            status: 'pending',
            statusReason: 'Sanction status reason.',
            reason: 'Sanction reason.',
            operatorNotes: 'Sanction operator notes.',
            targetHeroId: 'hero-1',
            targetUserId: 'user-1',
            sourceHeroId: null,
            destinationHeroId: null,
            amountCharacterPoints: 25,
            durationDays: null,
            startsAt: null,
            endsAt: null,
            appliedAt: null,
            completedAt: null,
            cancelledAt: null,
            forgivenAt: null,
            failedAt: null,
            imposedByUserId: 'staff-1',
            createdAt: '2026-04-30T00:18:00.000Z',
            updatedAt: '2026-04-30T00:18:00.000Z',
          },
        ]
      : [],
    characterPointPenalties: withLinkedData
      ? [
          {
            id: 'penalty-1',
            sanctionId: 'sanction-1',
            caseId,
            serverId,
            heroId: 'hero-1',
            userId: 'user-1',
            status: 'pending',
            statusReason: 'Penalty status reason.',
            reason: 'Penalty reason.',
            operatorNotes: 'Penalty operator notes.',
            totalAmount: 25,
            remainingAmount: 20,
            paidAmount: 5,
            appliedAt: null,
            completedAt: null,
            cancelledAt: null,
            forgivenAt: null,
            failedAt: null,
            createdByUserId: 'staff-1',
            createdAt: '2026-04-30T00:19:00.000Z',
            updatedAt: '2026-04-30T00:19:00.000Z',
          },
        ]
      : [],
    sanctionItems: withLinkedData
      ? [
          {
            id: 'sanction-item-1',
            sanctionId: 'sanction-1',
            itemId: 'item-1',
            sourceHeroId: 'hero-1',
            destinationHeroId: null,
            reason: 'Item reason.',
            operatorNotes: 'Item operator notes.',
            createdByUserId: 'staff-1',
            createdAt: '2026-04-30T00:20:00.000Z',
          },
        ]
      : [],
  };
}

function createDecision(
  caseId: string,
  serverId = 'server-1',
  overrides: Partial<AntiAbuseCaseDecision> = {},
): AntiAbuseCaseDecision {
  return {
    id: caseId,
    serverId,
    title: 'Case',
    summary: null,
    status: 'in_review',
    statusReason: 'Needs staff review.',
    verdict: 'abuse_confirmed',
    verdictReason: 'Verdict reason text.',
    sanctionRequired: true,
    noSanctionReason: null,
    operatorNotes: 'Operator notes text.',
    resolvedAt: null,
    resolvedByUserId: null,
    cancelledAt: null,
    updatedAt: '2026-04-30T01:00:00.000Z',
    ...overrides,
  };
}
