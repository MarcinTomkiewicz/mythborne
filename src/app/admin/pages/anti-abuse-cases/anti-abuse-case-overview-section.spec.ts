import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AntiAbuseCaseDetailReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseCaseOverviewSection } from './anti-abuse-case-overview-section';

describe('AntiAbuseCaseOverviewSection', () => {
  let fixture: ComponentFixture<AntiAbuseCaseOverviewSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntiAbuseCaseOverviewSection],
    }).compileComponents();

    fixture = TestBed.createComponent(AntiAbuseCaseOverviewSection);
  });

  it('explains DB-owned signal grouping without implying automatic punishment', () => {
    fixture.componentRef.setInput('detail', detail());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Signal grouping and review context');
    expect(text).toContain('This case was created or linked by DB-owned signal grouping.');
    expect(text).toContain('They do not automatically punish players or apply sanctions');
    expect(text).toContain('Trade funnel signal - player_trade_transaction: trade-1 - Grouped automatically.');
    expect(text).toContain('actor - Hero: hero-1 - User: user-1 - Signal actor');
  });
});

function detail(): AntiAbuseCaseDetailReadModel {
  return {
    case: {
      id: 'case-1',
      serverId: 'server-1',
      title: 'Signal case',
      summary: null,
      source: 'system_signal',
      status: 'open',
      statusReason: null,
      verdict: null,
      verdictReason: null,
      sanctionRequired: null,
      noSanctionReason: null,
      operatorNotes: null,
      groupingKey: 'hero-pair:1',
      primaryHeroId: 'hero-1',
      primaryUserId: 'user-1',
      assignedToUserId: null,
      openedByUserId: null,
      resolvedByUserId: null,
      signalCount: 1,
      lastSignalAt: '2026-05-01T10:00:00.000Z',
      possibleRecidivism: false,
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
      resolvedAt: null,
      cancelledAt: null,
    },
    dictionaries: {
      sanctionTypes: [],
      reportTypes: [],
      declarationTypes: [],
      signalTypes: [
        {
          key: 'trade.repeated_pair_transfers',
          label: 'Trade funnel signal',
          description: 'Repeated transfer.',
          helperText: null,
          adminDescription: null,
          category: 'trade',
          sortOrder: 10,
          isActive: true,
          defaultSeverity: 'warning',
          defaultScore: 70,
          defaultConfidence: 0.8,
        },
      ],
    },
    signals: [
      {
        id: 'signal-1',
        serverId: 'server-1',
        signalTypeKey: 'trade.repeated_pair_transfers',
        title: 'Repeated transfer',
        description: 'Repeated trade transfer.',
        severity: 'warning',
        score: 70,
        confidence: 0.8,
        reason: 'Signal reason.',
        groupingKey: 'hero-pair:1',
        actorHeroId: 'hero-1',
        actorUserId: 'user-1',
        targetHeroId: 'hero-2',
        targetUserId: 'user-2',
        entityTypeKey: 'player_trade_transaction',
        entityId: 'trade-1',
        auditLogId: null,
        metadataJson: {},
        isDismissed: false,
        dismissedAt: null,
        dismissedByUserId: null,
        dismissedReason: null,
        createdAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    caseSignals: [
      {
        caseId: 'case-1',
        signalId: 'signal-1',
        reason: 'Grouped automatically.',
        linkedByUserId: null,
        createdAt: '2026-05-01T10:01:00.000Z',
      },
    ],
    participants: [
      {
        id: 'participant-1',
        caseId: 'case-1',
        userId: 'user-1',
        heroId: 'hero-1',
        roleKey: 'actor',
        reason: 'Signal actor',
        description: null,
        createdByUserId: null,
        createdAt: '2026-05-01T10:01:00.000Z',
      },
    ],
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
