import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  DeleteGameReportForHeroRpcRow,
  GetHeroGameReportsRpcRow,
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
