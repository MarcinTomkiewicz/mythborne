import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
} from '../../constants/pvp-ui-metadata.const';
import { TABLES } from '../../constants/tables.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { EMPTY_FORMULA_ADMIN_DATA } from '../../types/formula-admin-view.types';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { PvpUiMetadata } from './pvp-ui-metadata';
import { PvpResourceConsequencesAdmin } from './pvp-resource-consequences-admin';

describe('PvpResourceConsequencesAdmin', () => {
  let service: PvpResourceConsequencesAdmin;
  let backend: jasmine.SpyObj<Backend>;
  let formulas: jasmine.SpyObj<FormulaService>;
  let metadata: jasmine.SpyObj<PvpUiMetadata>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', [
      'getAdminData',
    ]);
    metadata = jasmine.createSpyObj<PvpUiMetadata>('PvpUiMetadata', [
      'getNamespaceEntries',
    ]);

    backend.getAll.and.returnValue(of([resourceTypeRow('drachma', 'Drachma')]) as never);
    formulas.getAdminData.and.returnValue(of(EMPTY_FORMULA_ADMIN_DATA));
    metadata.getNamespaceEntries.and.callFake((namespace) => of([
      metadataEntry(
        namespace as typeof PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE
          | typeof PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
        `${namespace}-resource_boundary`,
      ),
    ]));

    TestBed.configureTestingModule({
      providers: [
        PvpResourceConsequencesAdmin,
        { provide: Backend, useValue: backend },
        { provide: FormulaService, useValue: formulas },
        { provide: PvpUiMetadata, useValue: metadata },
      ],
    });

    service = TestBed.inject(PvpResourceConsequencesAdmin);
  });

  it('loads formulas, resource types and PvP resource metadata through read services', async () => {
    const data = await firstValueFrom(service.getData());

    expect(data.formulas).toBe(EMPTY_FORMULA_ADMIN_DATA);
    expect(data.resourceTypes.map((entry) => entry.key)).toEqual(['drachma']);
    expect(data.metadataEntries.map((entry) => entry.namespace)).toEqual([
      PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
    ]);
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.resource_types,
      camelCase: false,
    }));
    expect(formulas.getAdminData).toHaveBeenCalled();
    expect(metadata.getNamespaceEntries).toHaveBeenCalledWith(
      PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
    );
    expect(metadata.getNamespaceEntries).toHaveBeenCalledWith(
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
    );
  });
});

function resourceTypeRow(key: string, label: string) {
  return {
    admin_description: `${label} admin.`,
    created_at: '2026-05-07T00:00:00.000Z',
    description: `${label} description.`,
    helper_text: `${label} helper.`,
    is_active: true,
    key,
    label,
    metadata_json: {},
    sort_order: 10,
    updated_at: '2026-05-07T00:00:00.000Z',
  };
}

function metadataEntry(
  namespace: typeof PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE
    | typeof PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  key: string,
): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace,
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
