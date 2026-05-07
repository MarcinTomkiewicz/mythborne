import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_REWARD_SECTION_METADATA_NAMESPACE,
} from '../../constants/pvp-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { EMPTY_FORMULA_ADMIN_DATA } from '../../types/formula-admin-view.types';
import { FormulaService } from '../formula/formula';
import { PvpUiMetadata } from './pvp-ui-metadata';
import { PvpPrestigeContextAdmin } from './pvp-prestige-context-admin';

describe('PvpPrestigeContextAdmin', () => {
  let service: PvpPrestigeContextAdmin;
  let formulas: jasmine.SpyObj<FormulaService>;
  let metadata: jasmine.SpyObj<PvpUiMetadata>;

  beforeEach(() => {
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', [
      'getAdminData',
    ]);
    metadata = jasmine.createSpyObj<PvpUiMetadata>('PvpUiMetadata', [
      'getNamespaceEntries',
    ]);

    formulas.getAdminData.and.returnValue(of(EMPTY_FORMULA_ADMIN_DATA));
    metadata.getNamespaceEntries.and.callFake((namespace) => of([
      metadataEntry(
        namespace as typeof PVP_REWARD_SECTION_METADATA_NAMESPACE
          | typeof PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
        `${namespace}-prestige_context`,
      ),
    ]));

    TestBed.configureTestingModule({
      providers: [
        PvpPrestigeContextAdmin,
        { provide: FormulaService, useValue: formulas },
        { provide: PvpUiMetadata, useValue: metadata },
      ],
    });

    service = TestBed.inject(PvpPrestigeContextAdmin);
  });

  it('loads formula admin data and PvP prestige metadata namespaces', async () => {
    const data = await firstValueFrom(service.getData());

    expect(data.formulas).toBe(EMPTY_FORMULA_ADMIN_DATA);
    expect(data.metadataEntries.map((entry) => entry.namespace)).toEqual([
      PVP_REWARD_SECTION_METADATA_NAMESPACE,
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
    ]);
    expect(formulas.getAdminData).toHaveBeenCalled();
    expect(metadata.getNamespaceEntries).toHaveBeenCalledWith(
      PVP_REWARD_SECTION_METADATA_NAMESPACE,
    );
    expect(metadata.getNamespaceEntries).toHaveBeenCalledWith(
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
    );
  });
});

function metadataEntry(
  namespace: typeof PVP_REWARD_SECTION_METADATA_NAMESPACE
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
