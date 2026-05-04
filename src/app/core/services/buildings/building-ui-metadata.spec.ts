import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { BuildingUiMetadata } from './building-ui-metadata';

describe('BuildingUiMetadata', () => {
  it('uses DB-backed labels/text and reports exact missing keys', () => {
    const metadata = new BuildingUiMetadata(() => [
      entry('building_configurator_section', 'page_header', {
        label: 'Building configuration',
        description: 'DB-backed building configuration copy.',
      }),
    ]);

    expect(metadata.adminSectionTitle(metadata.adminSection.pageHeader))
      .toBe('Building configuration');
    expect(metadata.adminSectionText(metadata.adminSection.pageHeader))
      .toBe('DB-backed building configuration copy.');
    expect(metadata.missingAdminGaps()).toContain(
      'building_configurator_section/resource_costs',
    );
    expect(metadata.missingAdminGaps()).toContain(
      'building_configurator_field/base_build_time_seconds',
    );
  });
});

function entry(
  namespace: string,
  key: string,
  input: { label: string; description: string },
): UiMetadataEntryReadModel {
  return {
    id: `${namespace}-${key}`,
    namespace,
    key,
    label: input.label,
    description: input.description,
    helperText: null,
    impactSummary: null,
    warningText: null,
    uiGroupKey: null,
    uiGroupLabel: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-04T10:00:00.000Z',
    updatedAt: '2026-05-04T10:00:00.000Z',
  };
}
