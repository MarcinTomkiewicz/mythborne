import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  AntiAbuseCaseDetailReadModel,
  AntiAbuseCaseReadModel,
} from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseRepeatOffenderHistory } from '../../../core/domain/anti-abuse/anti-abuse-repeat-offender-history.model';
import {
  AntiAbuseSanctionDecision,
  CharacterPointPenaltyDecision,
} from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import { AntiAbuseRepeatOffenderHistoryService } from '../../../core/services/anti-abuse/anti-abuse-repeat-offender-history';
import { AntiAbuseCaseRepeatOffenderHistorySection } from './anti-abuse-case-repeat-offender-history-section';

describe('AntiAbuseCaseRepeatOffenderHistorySection', () => {
  let fixture: ComponentFixture<AntiAbuseCaseRepeatOffenderHistorySection>;
  let component: AntiAbuseCaseRepeatOffenderHistorySection;
  let historyService: jasmine.SpyObj<AntiAbuseRepeatOffenderHistoryService>;

  beforeEach(async () => {
    historyService = jasmine.createSpyObj<AntiAbuseRepeatOffenderHistoryService>(
      'AntiAbuseRepeatOffenderHistoryService',
      ['getHistory'],
    );

    await TestBed.configureTestingModule({
      imports: [AntiAbuseCaseRepeatOffenderHistorySection],
      providers: [
        { provide: AntiAbuseRepeatOffenderHistoryService, useValue: historyService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AntiAbuseCaseRepeatOffenderHistorySection);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('detail', createDetail());
    fixture.detectChanges();
  });

  it('builds target options from case participants and linked sanction targets', () => {
    expect(component.targetOptions().map((entry) => entry.label)).toEqual([
      'accused - hero hero-1 - account user-1',
      'Sanction target - hero hero-2 - account user-2',
    ]);
  });

  it('does not add empty participant targets to the selector', () => {
    const detail = createDetail();
    detail.participants = [
      {
        id: 'participant-empty',
        caseId: 'case-1',
        userId: null,
        heroId: null,
        roleKey: 'observer',
        reason: null,
        description: null,
        createdByUserId: null,
        createdAt: '2026-04-30T00:00:00.000Z',
      },
    ];
    detail.sanctions = [];
    detail.characterPointPenalties = [];

    fixture.componentRef.setInput('detail', detail);
    fixture.detectChanges();
    component.loadHistory();

    expect(component.targetOptions()).toEqual([]);
    expect(component.error()).toBe('Select a hero/account target before loading history.');
    expect(historyService.getHistory).not.toHaveBeenCalled();
  });

  it('loads server-scoped history for the selected target', () => {
    const history = createHistory();
    historyService.getHistory.and.returnValue(of(history));

    component.loadHistory();

    expect(historyService.getHistory).toHaveBeenCalledOnceWith({
      serverId: 'server-1',
      heroId: 'hero-1',
      userId: 'user-1',
      excludeCaseId: 'case-1',
    });
    expect(component.history()).toBe(history);
  });

  it('renders history DB-backed sanction type labels as primary history text', () => {
    historyService.getHistory.and.returnValue(of(createHistory()));

    component.loadHistory();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Legacy warning label');
    expect(text).toContain('Type key: legacy_warning');
  });

  it('ignores stale history success after selected target changes', () => {
    const request = new Subject<AntiAbuseRepeatOffenderHistory>();
    historyService.getHistory.and.returnValue(request);

    component.loadHistory();
    component.targetControl.setValue(component.targetOptions()[1]);
    component.onTargetChange();
    request.next(createHistory());
    request.complete();

    expect(component.history()).toBeNull();
  });

  it('ignores stale history error after case context changes', () => {
    const request = new Subject<AntiAbuseRepeatOffenderHistory>();
    historyService.getHistory.and.returnValue(request);

    component.loadHistory();
    fixture.componentRef.setInput('detail', createDetail('server-2', 'case-2'));
    fixture.detectChanges();
    request.error(new Error('Old request failed.'));

    expect(component.error()).toBeNull();
  });
});

function createHistory(): AntiAbuseRepeatOffenderHistory {
  return {
    target: { heroId: 'hero-1', userId: 'user-1' },
    cases: [createCase('case-old')],
    sanctions: [createSanction({ sanctionTypeKey: 'legacy_warning' })],
    warnings: [createSanction({ sanctionTypeKey: 'legacy_warning' })],
    characterPointPenalties: [createPenalty()],
    dictionaries: {
      sanctionTypes: [
        {
          key: 'legacy_warning',
          label: 'Legacy warning label',
          description: 'Inactive warning type.',
          helperText: null,
          adminDescription: null,
          category: 'staff',
          sortOrder: 1,
          isActive: false,
          requiresReason: true,
          requiresTargetHero: false,
          requiresSourceHero: false,
          requiresDurationDays: false,
          requiresItemSelection: false,
          requiresCharacterPointsAmount: false,
        },
      ],
    },
    totals: {
      cases: 1,
      sanctions: 1,
      warnings: 1,
      characterPointPenalties: 1,
      remainingCharacterPoints: 12,
    },
  };
}

function createDetail(
  serverId = 'server-1',
  caseId = 'case-1',
): AntiAbuseCaseDetailReadModel {
  return {
    case: createCase(caseId, serverId),
    dictionaries: {
      signalTypes: [],
      sanctionTypes: [
        {
          key: 'warning',
          label: 'Staff warning',
          description: 'A warning sanction.',
          helperText: null,
          adminDescription: null,
          category: 'staff',
          sortOrder: 1,
          isActive: true,
          requiresReason: true,
          requiresTargetHero: false,
          requiresSourceHero: false,
          requiresDurationDays: false,
          requiresItemSelection: false,
          requiresCharacterPointsAmount: false,
        },
      ],
      reportTypes: [],
      declarationTypes: [],
    },
    signals: [],
    caseSignals: [],
    participants: [
      {
        id: 'participant-1',
        caseId,
        userId: 'user-1',
        heroId: 'hero-1',
        roleKey: 'accused',
        reason: null,
        description: null,
        createdByUserId: null,
        createdAt: '2026-04-30T00:00:00.000Z',
      },
    ],
    auditLinks: [],
    auditLogs: [],
    declarationLinks: [],
    declarations: [],
    reports: [],
    sanctions: [createSanction({ caseId })],
    characterPointPenalties: [createPenalty({ caseId, serverId })],
    sanctionItems: [],
  };
}

function createCase(
  caseId = 'case-1',
  serverId = 'server-1',
): AntiAbuseCaseReadModel {
  return {
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
  };
}

function createSanction(
  overrides: Partial<AntiAbuseSanctionDecision> = {},
): AntiAbuseSanctionDecision {
  return {
    id: 'sanction-1',
    caseId: 'case-old',
    sanctionTypeKey: 'warning',
    status: 'completed',
    statusReason: null,
    reason: 'Prior warning.',
    operatorNotes: null,
    targetHeroId: 'hero-2',
    targetUserId: 'user-2',
    sourceHeroId: null,
    destinationHeroId: null,
    amountCharacterPoints: null,
    durationDays: null,
    startsAt: null,
    endsAt: null,
    appliedAt: null,
    completedAt: null,
    cancelledAt: null,
    forgivenAt: null,
    failedAt: null,
    imposedByUserId: 'staff-1',
    createdAt: '2026-04-30T00:00:00.000Z',
    updatedAt: '2026-04-30T00:00:00.000Z',
    ...overrides,
  };
}

function createPenalty(
  overrides: Partial<CharacterPointPenaltyDecision> = {},
): CharacterPointPenaltyDecision {
  return {
    id: 'penalty-1',
    sanctionId: 'sanction-1',
    caseId: 'case-old',
    serverId: 'server-1',
    heroId: 'hero-1',
    userId: 'user-1',
    status: 'pending',
    statusReason: null,
    reason: 'Prior CP fine.',
    operatorNotes: null,
    totalAmount: 15,
    remainingAmount: 12,
    paidAmount: 3,
    appliedAt: null,
    completedAt: null,
    cancelledAt: null,
    forgivenAt: null,
    failedAt: null,
    createdByUserId: 'staff-1',
    createdAt: '2026-04-30T00:00:00.000Z',
    updatedAt: '2026-04-30T00:00:00.000Z',
    ...overrides,
  };
}
