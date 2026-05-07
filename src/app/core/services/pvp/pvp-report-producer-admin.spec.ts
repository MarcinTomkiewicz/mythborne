import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { PVP_REPORT_SECTION_METADATA_NAMESPACE } from '../../constants/pvp-ui-metadata.const';
import { TABLES } from '../../constants/tables.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { Backend } from '../backend/backend';
import { PvpUiMetadata } from './pvp-ui-metadata';
import { PvpReportProducerAdmin } from './pvp-report-producer-admin';

describe('PvpReportProducerAdmin', () => {
  let service: PvpReportProducerAdmin;
  let backend: jasmine.SpyObj<Backend>;
  let metadata: jasmine.SpyObj<PvpUiMetadata>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    metadata = jasmine.createSpyObj<PvpUiMetadata>('PvpUiMetadata', [
      'getNamespaceEntries',
    ]);

    backend.getAll.and.returnValue(of([
      reportTypeRow('pvp_combat', 'PvP combat'),
      reportTypeRow('combat', 'Combat'),
    ]) as never);
    metadata.getNamespaceEntries.and.returnValue(of([
      metadataEntry('pvp_report_producer'),
    ]));

    TestBed.configureTestingModule({
      providers: [
        PvpReportProducerAdmin,
        { provide: Backend, useValue: backend },
        { provide: PvpUiMetadata, useValue: metadata },
      ],
    });

    service = TestBed.inject(PvpReportProducerAdmin);
  });

  it('loads report type dictionary rows and PvP report metadata', async () => {
    const data = await firstValueFrom(service.getData());

    expect(data.reportTypes.map((entry) => entry.key)).toEqual([
      'pvp_combat',
      'combat',
    ]);
    expect(data.reportTypes[0]).toEqual(jasmine.objectContaining({
      label: 'PvP combat',
      isActive: true,
    }));
    expect(data.metadataEntries.map((entry) => entry.namespace)).toEqual([
      PVP_REPORT_SECTION_METADATA_NAMESPACE,
    ]);
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.game_report_types,
      camelCase: false,
    }));
    expect(metadata.getNamespaceEntries).toHaveBeenCalledWith(
      PVP_REPORT_SECTION_METADATA_NAMESPACE,
    );
  });
});

function reportTypeRow(key: string, label: string) {
  return {
    created_at: '2026-05-07T00:00:00.000Z',
    description: `${label} description.`,
    helper_text: `${label} helper.`,
    is_active: true,
    key,
    label,
    sort_order: 10,
    updated_at: '2026-05-07T00:00:00.000Z',
  };
}

function metadataEntry(key: string): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace: PVP_REPORT_SECTION_METADATA_NAMESPACE,
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
