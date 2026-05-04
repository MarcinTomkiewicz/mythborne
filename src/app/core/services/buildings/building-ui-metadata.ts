import {
  BUILDING_CONFIGURATOR_FIELD_METADATA_KEYS,
  BUILDING_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
  BUILDING_CONFIGURATOR_SECTION_METADATA_KEYS,
  BUILDING_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  ESTATE_BUILDING_RUNTIME_SECTION_METADATA_KEYS,
  ESTATE_BUILDING_RUNTIME_SECTION_METADATA_NAMESPACE,
  ESTATE_RUNTIME_SECTION_METADATA_KEYS,
  ESTATE_RUNTIME_SECTION_METADATA_NAMESPACE,
} from '../../constants/building-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import {
  metadataEntry,
  metadataText,
  missingUiMetadataGaps,
  missingUiMetadataLabel,
} from '../../utils/admin-ui-metadata';

export const BUILDING_CONFIGURATOR_SECTION = {
  pageHeader: 'page_header',
  formulaAssignments: 'formula_assignments',
  editedBuilding: 'edited_building',
  buildingIdentity: 'building_identity',
  buildingProgression: 'building_progression',
  localFormulas: 'local_formulas',
  resourceCosts: 'resource_costs',
  centralRequirements: 'central_requirements',
  buildingBonuses: 'building_bonuses',
  preview: 'preview',
  diagnostics: 'diagnostics',
} as const;

export const ESTATE_RUNTIME_SECTION = {
  pageHeader: 'page_header',
  addressModel: 'address_model',
  relocationReset: 'relocation_reset',
  resourceLedger: 'resource_ledger',
  diagnostics: 'diagnostics',
} as const;

export const ESTATE_BUILDING_RUNTIME_SECTION = {
  baselineInitialization: 'baseline_initialization',
  districtInheritance: 'district_inheritance',
  activeJobModel: 'active_job_model',
  lazyFinalization: 'lazy_finalization',
  secondsBasedTimers: 'seconds_based_timers',
  previewVsAuthoritativeRpc: 'preview_vs_authoritative_rpc',
  requirements: 'requirements',
  bonuses: 'bonuses',
} as const;

export class BuildingUiMetadata {
  readonly adminSection = BUILDING_CONFIGURATOR_SECTION;
  readonly runtimeSection = ESTATE_RUNTIME_SECTION;
  readonly buildingRuntimeSection = ESTATE_BUILDING_RUNTIME_SECTION;

  constructor(private readonly entries: () => UiMetadataEntryReadModel[]) {}

  missingAdminGaps(): string[] {
    return missingUiMetadataGaps(this.entries(), {
      [BUILDING_CONFIGURATOR_SECTION_METADATA_NAMESPACE]:
        BUILDING_CONFIGURATOR_SECTION_METADATA_KEYS,
      [BUILDING_CONFIGURATOR_FIELD_METADATA_NAMESPACE]:
        BUILDING_CONFIGURATOR_FIELD_METADATA_KEYS,
    });
  }

  missingRuntimeGaps(): string[] {
    return missingUiMetadataGaps(this.entries(), {
      [ESTATE_RUNTIME_SECTION_METADATA_NAMESPACE]: ESTATE_RUNTIME_SECTION_METADATA_KEYS,
      [ESTATE_BUILDING_RUNTIME_SECTION_METADATA_NAMESPACE]:
        ESTATE_BUILDING_RUNTIME_SECTION_METADATA_KEYS,
    });
  }

  adminSectionTitle(key: string): string {
    return this.title(BUILDING_CONFIGURATOR_SECTION_METADATA_NAMESPACE, key);
  }

  adminSectionText(key: string): string {
    return metadataText(this.entries(), BUILDING_CONFIGURATOR_SECTION_METADATA_NAMESPACE, key);
  }

  adminSectionSecondaryText(key: string): string | null {
    return metadataEntry(
      this.entries(),
      BUILDING_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    )?.impactSummary ?? null;
  }

  adminFieldLabel(key: string): string {
    return this.title(BUILDING_CONFIGURATOR_FIELD_METADATA_NAMESPACE, key);
  }

  adminFieldText(key: string): string {
    return metadataText(this.entries(), BUILDING_CONFIGURATOR_FIELD_METADATA_NAMESPACE, key);
  }

  runtimeSectionTitle(key: string): string {
    return this.title(ESTATE_RUNTIME_SECTION_METADATA_NAMESPACE, key);
  }

  runtimeSectionText(key: string): string {
    return metadataText(this.entries(), ESTATE_RUNTIME_SECTION_METADATA_NAMESPACE, key);
  }

  buildingRuntimeTitle(key: string): string {
    return this.title(ESTATE_BUILDING_RUNTIME_SECTION_METADATA_NAMESPACE, key);
  }

  buildingRuntimeText(key: string): string {
    return metadataText(
      this.entries(),
      ESTATE_BUILDING_RUNTIME_SECTION_METADATA_NAMESPACE,
      key,
    );
  }

  private title(namespace: string, key: string): string {
    return metadataEntry(this.entries(), namespace, key)?.label
      ?? missingUiMetadataLabel(namespace, key);
  }
}
