import { HeroActiveRuntimeActivity } from '../domain/pvp/pvp.model';
import {
  isPvpRuntimeActivity,
  pvpRuntimeActivityDisplay,
} from './pvp-runtime-activity-display';

describe('pvp runtime activity display', () => {
  it('formats PvP runtime activity without creating a separate busy model', () => {
    const display = pvpRuntimeActivityDisplay(activity());

    expect(display).toEqual(jasmine.objectContaining({
      title: 'PvP attack',
      statusLabel: 'Traveling',
    }));
    expect(display?.facts.map((fact) => fact.label)).toEqual([
      'Status',
      'Started',
      'Arrival',
      'Deadline',
    ]);
  });

  it('ignores non-PvP runtime activity kinds', () => {
    const nonPvp = activity({ activityKind: 'exploration_step' });

    expect(isPvpRuntimeActivity(nonPvp)).toBeFalse();
    expect(pvpRuntimeActivityDisplay(nonPvp)).toBeNull();
  });
});

function activity(
  patch: Partial<HeroActiveRuntimeActivity> = {},
): HeroActiveRuntimeActivity {
  return {
    activityId: 'runtime-1',
    heroId: 'hero-1',
    serverId: 'server-1',
    activityKind: 'pvp_attack',
    activityKindLabel: 'PvP attack',
    status: 'traveling',
    statusLabel: 'Traveling',
    sourceEntityType: 'pvp_action',
    sourceEntityId: 'pvp-action-1',
    startedAt: '2026-05-06T10:00:00.000Z',
    availableAt: '2026-05-06T10:03:00.000Z',
    expiresAt: '2026-05-06T10:08:00.000Z',
    endedAt: null,
    reason: null,
    requestId: null,
    metadataJson: {},
    ...patch,
  };
}
