import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  DeleteGameReportForHeroRpcRow,
  GetHeroGameReportDetailRpcRow,
  GetHeroGameReportsRpcRow,
  GetPublicGameReportByTokenRpcRow,
  MarkGameReportReadRpcReturn,
} from '../../types/game-report-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { GameReports } from './game-reports';

describe('GameReports', () => {
  let service: GameReports;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'requireActiveHero',
    ]);
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'getAll',
      'delete',
    ]);

    activeHero.requireActiveHero.and.returnValue(of({
      heroRow: { id: 'hero-1' } as never,
      heroId: 'hero-1',
      hero: {} as never,
      userId: 'user-1',
      serverId: 'server-1',
      server: {} as never,
    }));

    TestBed.configureTestingModule({
      providers: [
        GameReports,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(GameReports);
  });

  it('lists active hero reports through the owner-safe list RPC', async () => {
    backend.rpc.and.returnValue(of([listRow()]));

    const reports = await firstValueFrom(
      service.getActiveHeroReports({
        reportTypeKey: 'combat',
        unreadOnly: true,
        limit: 25,
        offset: 10,
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_game_reports,
      {
        p_hero_id: 'hero-1',
        p_limit: 25,
        p_offset: 10,
        p_report_type_key: 'combat',
        p_unread_only: true,
      },
    );
    expect(reports[0]).toEqual(jasmine.objectContaining({
      reportId: 'report-1',
      reportTypeLabel: 'Combat',
      readState: jasmine.objectContaining({ isUnread: true }),
    }));
    expect(backend.getAll).not.toHaveBeenCalled();
  });

  it('loads active hero unread count through the report count RPC', async () => {
    backend.rpc.and.returnValue(of(3));

    await expectAsync(firstValueFrom(service.getActiveHeroUnreadCount()))
      .toBeResolvedTo(3);

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_game_report_unread_count,
      { p_hero_id: 'hero-1' },
    );
  });

  it('loads active hero report detail through the owner-safe detail RPC', async () => {
    backend.rpc.and.returnValue(of([detailRow()]));

    const detail = await firstValueFrom(
      service.getActiveHeroReportDetail('report-1'),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_game_report_detail,
      {
        p_hero_id: 'hero-1',
        p_report_id: 'report-1',
      },
    );
    expect(detail).toEqual(jasmine.objectContaining({
      reportId: 'report-1',
      reportTypeLabel: 'Combat',
      itemReferences: [
        jasmine.objectContaining({
          displayName: 'Fine Bronze Blade',
        }),
      ],
      combatSection: jasmine.objectContaining({
        outcome: 'initiator_victory',
      }),
    }));
    expect(backend.getAll).not.toHaveBeenCalled();
  });

  it('marks active hero report read through mark_game_report_read', async () => {
    backend.rpc.and.returnValue(of(markReadRow()));

    const result = await firstValueFrom(
      service.markActiveHeroReportRead('report-1'),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.mark_game_report_read,
      {
        p_hero_id: 'hero-1',
        p_report_id: 'report-1',
      },
    );
    expect(result).toEqual({
      reportId: 'report-1',
      heroId: 'hero-1',
      accessRole: 'owner',
      readAt: '2026-05-05T10:05:00.000Z',
    });
  });

  it('loads public reports by token without active hero context or direct table reads', async () => {
    backend.rpc.and.returnValue(of([publicRow()]));

    const report = await firstValueFrom(
      service.getPublicReportByToken('public-token-1'),
    );

    expect(activeHero.requireActiveHero).not.toHaveBeenCalled();
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_public_game_report_by_token,
      { p_public_token: 'public-token-1' },
    );
    expect(report).toEqual(jasmine.objectContaining({
      publicToken: 'public-token-1',
      reportTypeLabel: 'Combat',
      itemReferences: [
        {
          sourceKind: 'reward_drop',
          displayName: 'Fine Bronze Blade',
          qualityKey: 'fine',
          displayDetails: ['Quality fine'],
          sortOrder: 10,
        },
      ],
    }));
    expect(Object.keys(report).sort()).not.toContain('reportId');
    expect(backend.getAll).not.toHaveBeenCalled();
  });

  it('removes active hero report access through delete_game_report_for_hero', async () => {
    backend.rpc.and.returnValue(of([deleteRow()]));

    const result = await firstValueFrom(service.deleteActiveHeroReport('report-1'));

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.delete_game_report_for_hero,
      {
        p_hero_id: 'hero-1',
        p_report_id: 'report-1',
        p_reason: 'Player removed a report from the reports center.',
      },
    );
    expect(result).toEqual(jasmine.objectContaining({
      reportId: 'report-1',
      removedAccess: true,
      deletedReport: false,
      remainingAccessCount: 1,
    }));
    expect(backend.delete).not.toHaveBeenCalled();
  });
});

function listRow(): GetHeroGameReportsRpcRow {
  return {
    access_role: 'owner',
    created_at: '2026-05-05T10:00:00.000Z',
    is_unread: true,
    item_references_count: 1,
    participants_json: [
      {
        displayName: 'Hero One',
        participantRole: 'initiator',
        sideLabel: 'Initiator',
        levelSnapshot: 7,
        sortOrder: 10,
      },
    ],
    public_token: 'public-token-1',
    read_at: null,
    report_id: 'report-1',
    report_type_key: 'combat',
    report_type_label: 'Combat',
    source_entity_id: 'combat-result-1',
    source_entity_type: 'combat_result',
    summary: 'A combat was completed.',
    title: 'Training combat',
  } as unknown as GetHeroGameReportsRpcRow;
}

function detailRow(): GetHeroGameReportDetailRpcRow {
  return {
    ...listRow(),
    report_type_description: 'Combat report.',
    item_references_json: [
      {
        sourceKind: 'reward_drop',
        sourceItemId: 'item-1',
        displayName: 'Fine Bronze Blade',
        qualityKey: 'fine',
        baseId: 'base-1',
        prefixAffixId: null,
        suffixAffixId: 'suffix-1',
        sortOrder: 10,
      },
    ],
    combat_section_json: {
      outcome: 'initiator_victory',
      turnsCompleted: 1,
      participants: [
        {
          side: 'initiator',
          participantKind: 'hero',
          displayName: 'Hero One',
          level: 7,
          healthStart: 30,
          healthEnd: 18,
          maxHealth: 30,
        },
      ],
      attacks: [
        {
          turnNumber: 1,
          attackOrder: 10,
          actorSide: 'initiator',
          targetSide: 'defender',
          sourceKind: 'item',
          sourceLabel: 'Bronze blade',
          timingHit: true,
          evaded: false,
          critical: true,
          finalDamage: 12,
          targetHealthBefore: 24,
          targetHealthAfter: 12,
          displayText: 'Hero One strikes.',
        },
      ],
    },
  } as unknown as GetHeroGameReportDetailRpcRow;
}

function publicRow(): GetPublicGameReportByTokenRpcRow {
  const detail = detailRow();

  return {
    combat_section_json: detail.combat_section_json,
    created_at: detail.created_at,
    item_references_json: detail.item_references_json,
    participants_json: detail.participants_json,
    public_token: detail.public_token,
    report_type_description: detail.report_type_description,
    report_type_key: detail.report_type_key,
    report_type_label: detail.report_type_label,
    source_entity_type: detail.source_entity_type,
    summary: detail.summary,
    title: detail.title,
  } as unknown as GetPublicGameReportByTokenRpcRow;
}

function markReadRow(): MarkGameReportReadRpcReturn {
  return {
    access_role: 'owner',
    created_at: '2026-05-05T10:00:00.000Z',
    hero_id: 'hero-1',
    id: 'access-1',
    read_at: '2026-05-05T10:05:00.000Z',
    report_id: 'report-1',
  };
}

function deleteRow(): DeleteGameReportForHeroRpcRow {
  return {
    audit_log_id: 'audit-1',
    deleted_report: false,
    hero_id: 'hero-1',
    public_token: 'public-token-1',
    remaining_access_count: 1,
    removed_access: true,
    report_id: 'report-1',
  };
}
