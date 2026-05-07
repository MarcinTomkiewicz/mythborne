import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE } from '../../constants/pvp-ui-metadata.const';
import { AntiAbuseDictionaryData } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { AntiAbuseDictionaries } from '../anti-abuse/anti-abuse-dictionaries';
import { PvpUiMetadata } from './pvp-ui-metadata';
import { PvpAntiAbuseExplainabilityAdmin } from './pvp-anti-abuse-explainability-admin';

describe('PvpAntiAbuseExplainabilityAdmin', () => {
  let service: PvpAntiAbuseExplainabilityAdmin;
  let dictionaries: jasmine.SpyObj<AntiAbuseDictionaries>;
  let metadata: jasmine.SpyObj<PvpUiMetadata>;

  beforeEach(() => {
    dictionaries = jasmine.createSpyObj<AntiAbuseDictionaries>(
      'AntiAbuseDictionaries',
      ['getActiveDictionaries'],
    );
    metadata = jasmine.createSpyObj<PvpUiMetadata>('PvpUiMetadata', [
      'getNamespaceEntries',
    ]);

    dictionaries.getActiveDictionaries.and.returnValue(of(dictionaryData()));
    metadata.getNamespaceEntries.and.returnValue(of([
      metadataEntry('pvp_review_aids'),
    ]));

    TestBed.configureTestingModule({
      providers: [
        PvpAntiAbuseExplainabilityAdmin,
        { provide: AntiAbuseDictionaries, useValue: dictionaries },
        { provide: PvpUiMetadata, useValue: metadata },
      ],
    });

    service = TestBed.inject(PvpAntiAbuseExplainabilityAdmin);
  });

  it('loads active anti-abuse dictionaries and PvP anti-abuse metadata', async () => {
    const data = await firstValueFrom(service.getData());

    expect(data.dictionaries.signalTypes.map((entry) => entry.key)).toEqual([
      'same_ip_pvp_attack',
    ]);
    expect(data.dictionaries.declarationTypes.map((entry) => entry.key))
      .toEqual(['mercenary_contract']);
    expect(data.metadataEntries.map((entry) => entry.namespace)).toEqual([
      PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
    ]);
    expect(dictionaries.getActiveDictionaries).toHaveBeenCalled();
    expect(metadata.getNamespaceEntries).toHaveBeenCalledWith(
      PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
    );
  });
});

function dictionaryData(): AntiAbuseDictionaryData {
  return {
    sanctionTypes: [],
    reportTypes: [],
    declarationTypes: [
      {
        key: 'mercenary_contract',
        label: 'Mercenary contract',
        description: 'Case declaration.',
        helperText: null,
        adminDescription: null,
        category: 'pvp',
        sortOrder: 10,
        isActive: true,
        minParticipants: 2,
        maxParticipants: null,
        requiresAmount: true,
        requiresExpiration: true,
        requiresTradeSelection: false,
        requiresItemSelection: false,
      },
    ],
    signalTypes: [
      {
        key: 'same_ip_pvp_attack',
        label: 'Shared network PvP attack',
        description: 'Review signal.',
        helperText: null,
        adminDescription: null,
        category: 'pvp',
        sortOrder: 10,
        isActive: true,
        defaultSeverity: 'warning',
        defaultScore: 20,
        defaultConfidence: 70,
      },
    ],
  };
}

function metadataEntry(key: string): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace: PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
    key,
    label: key,
    description: `${key} description.`,
    helperText: null,
    impactSummary: null,
    warningText: null,
    uiGroupKey: null,
    uiGroupLabel: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}
