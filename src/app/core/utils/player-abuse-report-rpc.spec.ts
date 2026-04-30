import { CreatePlayerAbuseReportInput } from '../domain/anti-abuse/player-abuse-report-submit.model';
import {
  mapCreatedPlayerAbuseReport,
  toCreatePlayerAbuseReportRpcArgs,
} from './player-abuse-report-rpc';

describe('player abuse report rpc mapper', () => {
  it('maps required report fields to create_player_abuse_report args', () => {
    expect(
      toCreatePlayerAbuseReportRpcArgs({
        ...createInput(),
        title: ' Trade scam ',
        description: ' Player did not send the agreed item. ',
      }),
    ).toEqual({
      p_server_id: 'server-1',
      p_report_type_key: 'scam',
      p_title: 'Trade scam',
      p_description: 'Player did not send the agreed item.',
      p_reporting_hero_id: 'hero-1',
    });
  });

  it('maps optional accused hero, item and trade context', () => {
    expect(
      toCreatePlayerAbuseReportRpcArgs({
        ...createInput(),
        accusedHeroId: 'hero-2',
        relatedItemId: 'item-1',
        relatedTradeId: 'trade-1',
        relatedTradeReference: ' Trade #1 ',
      }),
    ).toEqual(
      jasmine.objectContaining({
        p_accused_hero_id: 'hero-2',
        p_related_item_id: 'item-1',
        p_related_trade_id: 'trade-1',
        p_related_trade_reference: 'Trade #1',
      }),
    );
  });

  it('does not send unsupported user id RPC args', () => {
    const args = toCreatePlayerAbuseReportRpcArgs(createInput());

    expect(args as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        p_reporting_user_id: jasmine.any(String),
        p_user_id: jasmine.any(String),
      }),
    );
  });

  it('requires stable fields that the RPC contract requires', () => {
    expect(() =>
      toCreatePlayerAbuseReportRpcArgs({
        ...createInput(),
        serverId: '',
      }),
    ).toThrowError('serverId is required for abuse report submission.');

    expect(() =>
      toCreatePlayerAbuseReportRpcArgs({
        ...createInput(),
        reportTypeKey: ' ',
      }),
    ).toThrowError('reportTypeKey is required for abuse report submission.');

    expect(() =>
      toCreatePlayerAbuseReportRpcArgs({
        ...createInput(),
        title: '',
      }),
    ).toThrowError('title is required for abuse report submission.');

    expect(() =>
      toCreatePlayerAbuseReportRpcArgs({
        ...createInput(),
        description: '',
      }),
    ).toThrowError('description is required for abuse report submission.');

    expect(() =>
      toCreatePlayerAbuseReportRpcArgs({
        ...createInput(),
        reportingHeroId: '',
      }),
    ).toThrowError('reportingHeroId is required for abuse report submission.');
  });

  it('maps created report result and requires linked case id', () => {
    expect(
      mapCreatedPlayerAbuseReport({
        report_id: 'report-1',
        case_id: 'case-1',
      }),
    ).toEqual({
      reportId: 'report-1',
      caseId: 'case-1',
    });

    expect(() =>
      mapCreatedPlayerAbuseReport({
        report_id: 'report-1',
        case_id: '',
      }),
    ).toThrowError('caseId is required for abuse report submission.');
  });
});

function createInput(): CreatePlayerAbuseReportInput {
  return {
    serverId: 'server-1',
    reportTypeKey: 'scam',
    title: 'Trade scam',
    description: 'Player did not send the agreed item.',
    reportingHeroId: 'hero-1',
  };
}
