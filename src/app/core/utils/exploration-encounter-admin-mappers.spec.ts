import { ExplorationEncounterAdminData } from '../domain/exploration/exploration-encounter-admin.model';
import { toEncounterDefinitionAdminView } from './exploration-encounter-admin-mappers';

describe('exploration encounter admin mappers', () => {
  it('attaches DB-owned readiness to encounter definition views', () => {
    const view = toEncounterDefinitionAdminView(adminData(), 'encounter-1');

    expect(view?.readiness?.statusKey).toBe('incomplete');
    expect(view?.readiness?.reasons[0].label).toBe('Missing resource payload');
    expect(view?.kindLabel).toBe('Resource');
  });
});

function adminData(): ExplorationEncounterAdminData {
  return {
    encounters: [
      {
        id: 'encounter-1',
        key: 'loose-coins',
        label: 'Loose coins',
        description: 'Find coins.',
        helperText: null,
        adminDescription: null,
        encounterKind: 'resource',
        minigameKey: null,
        rewardProfileId: null,
        minDifficultyKey: null,
        maxDifficultyKey: null,
        minDistrictCode: null,
        maxDistrictCode: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    minigames: [],
    difficulties: [],
    districts: [],
    rewardProfiles: [],
    rewardProfileEntries: [],
    rewardOutcomeKinds: [],
    resourceTypes: [],
    rewardAssignmentMatchKinds: [],
    rewardSourceKinds: [],
    rewardEntryKinds: [],
    rewardEntryAmountModes: [],
    rewardAssignments: [],
    encounterReadiness: [
      {
        definitionKind: 'encounter',
        definitionId: 'encounter-1',
        definitionKey: 'loose-coins',
        isActive: true,
        isReady: false,
        statusKey: 'incomplete',
        minigameKey: null,
        encounterKind: 'resource',
        combatCandidateCount: 0,
        rewardAssignmentCount: 0,
        effectPayloadCount: 0,
        blockingReasonCount: 1,
        reasons: [
          {
            key: 'missing_resource_payload',
            label: 'Missing resource payload',
            description: 'Configure resource payload.',
            severity: 'error',
            isBlocking: true,
            metadataJson: {},
          },
        ],
        metadataJson: {},
      },
    ],
    combatCandidates: [],
    resourcePayloads: [],
    effectPayloads: [],
    effectDefinitions: [],
    bonusTemplates: [],
    opponents: [],
    families: [],
    formulas: [],
    uiMetadataEntries: [],
  };
}
