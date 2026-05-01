import {
  mapAntiAbuseIdentityObservationEdgeResponse,
  toRecordAntiAbuseIdentityObservationEdgeBody,
} from './anti-abuse-identity-observation-edge';

describe('anti-abuse identity observation edge mappers', () => {
  it('maps only approved Edge Function body fields and never accepts raw IP fields', () => {
    const body = toRecordAntiAbuseIdentityObservationEdgeBody({
      serverId: ' server-1 ',
      heroId: ' hero-1 ',
      sourceKey: ' login ',
      sourceEntityType: ' session ',
      sourceEntityId: ' session-1 ',
      deviceToken: ' device-token-1 ',
    });

    expect(body).toEqual({
      serverId: 'server-1',
      heroId: 'hero-1',
      sourceKey: 'login',
      sourceEntityType: 'session',
      sourceEntityId: 'session-1',
      deviceToken: 'device-token-1',
    });
    expect('ipAddress' in body).toBeFalse();
    expect('ipHash' in body).toBeFalse();
    expect('userAgentHash' in body).toBeFalse();
  });

  it('maps successful Edge Function response to a safe status result', () => {
    expect(
      mapAntiAbuseIdentityObservationEdgeResponse({
        ok: true,
        observationId: ' observation-1 ',
      }),
    ).toEqual({
      ok: true,
      observationId: 'observation-1',
      statusMessage: 'Identity observation recorded.',
    });
  });

  it('does not surface raw Edge Function error text', () => {
    expect(
      mapAntiAbuseIdentityObservationEdgeResponse({
        ok: false,
        error: 'Missing required env var: IDENTITY_HASH_PEPPER',
      }),
    ).toEqual({
      ok: false,
      observationId: null,
      statusMessage: 'Identity observation was not recorded.',
    });
  });
});
