import { RewardGrantEntryReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import {
  rewardEntryDetails,
  rewardEntryLabel,
} from './exploration-reward-card-ui';

describe('exploration reward card UI', () => {
  it('does not repeat resource type text in reward entry details', () => {
    const entry = rewardEntry({
      entryKind: 'resource',
      amount: 90,
      resourceType: 'drachma',
    });

    expect(rewardEntryLabel(entry)).toBe('Drachma +90');
    expect(rewardEntryDetails(entry)).toBeNull();
  });

  it('uses DB-provided helper text for resource entry details when present', () => {
    const entry = rewardEntry({
      entryKind: 'resource',
      amount: 5,
      resourceType: 'materials',
      metadataJson: { helperText: 'Gathered from the encounter cache.' },
    });

    expect(rewardEntryLabel(entry)).toBe('Materials +5');
    expect(rewardEntryDetails(entry)).toBe('Gathered from the encounter cache.');
  });
});

function rewardEntry(
  patch: Partial<RewardGrantEntryReadModel> = {},
): RewardGrantEntryReadModel {
  return {
    id: 'entry-1',
    rewardGrantId: 'reward-1',
    rewardProfileEntryId: 'profile-entry-1',
    entryKind: 'experience',
    amount: 10,
    resourceType: null,
    itemId: null,
    effectDefinitionId: null,
    sourceHeroId: null,
    targetHeroId: 'hero-1',
    oldValueJson: null,
    newValueJson: null,
    metadataJson: {},
    createdAt: '2026-05-01T10:00:00.000Z',
    ...patch,
  };
}
