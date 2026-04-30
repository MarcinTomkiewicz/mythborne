import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { PlayerAbuseReports } from './player-abuse-reports';

describe('PlayerAbuseReports', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: PlayerAbuseReports;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'getAll',
      'create',
      'createMany',
      'update',
      'upsert',
    ]);
    backend.rpc.and.returnValue(of([{ report_id: 'report-1', case_id: 'case-1' }]));

    TestBed.configureTestingModule({
      providers: [
        PlayerAbuseReports,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(PlayerAbuseReports);
  });

  it('submits abuse report through canonical RPC only', async () => {
    const result = await firstValueFrom(
      service.createReport({
        serverId: 'server-1',
        reportTypeKey: 'scam',
        title: 'Trade scam',
        description: 'Player did not send the agreed item.',
        reportingHeroId: 'hero-1',
        accusedHeroId: 'hero-2',
      }),
    );

    expect(result).toEqual({ reportId: 'report-1', caseId: 'case-1' });
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.create_player_abuse_report,
      jasmine.objectContaining({
        p_server_id: 'server-1',
        p_report_type_key: 'scam',
        p_title: 'Trade scam',
        p_description: 'Player did not send the agreed item.',
        p_reporting_hero_id: 'hero-1',
        p_accused_hero_id: 'hero-2',
      }),
    );
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.createMany).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('fails clearly when report RPC returns no row', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(
      firstValueFrom(
        service.createReport({
          serverId: 'server-1',
          reportTypeKey: 'scam',
          title: 'Trade scam',
          description: 'Player did not send the agreed item.',
          reportingHeroId: 'hero-1',
        }),
      ),
    ).toBeRejectedWithError('Abuse report submission returned no report.');
  });
});
