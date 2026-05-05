import {
  PUBLIC_REPORT_SECTION_METADATA_KEYS,
  PUBLIC_REPORT_SECTION_METADATA_NAMESPACE,
} from '../../../core/constants/game-report-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  metadataEntry,
  metadataText,
  missingUiMetadataGaps,
  missingUiMetadataLabel,
} from '../../../core/utils/admin-ui-metadata';

export const PUBLIC_REPORT_SECTION = {
  pageHeader: 'page_header',
  participants: 'participants',
  itemReferences: 'item_references',
  combatSection: 'combat_section',
  notFound: 'not_found',
} as const;

export class PublicReportUiMetadata {
  readonly section = PUBLIC_REPORT_SECTION;

  constructor(private readonly entries: () => UiMetadataEntryReadModel[]) {}

  missingGaps(): string[] {
    return missingUiMetadataGaps(this.entries(), {
      [PUBLIC_REPORT_SECTION_METADATA_NAMESPACE]: PUBLIC_REPORT_SECTION_METADATA_KEYS,
    });
  }

  sectionTitle(key: string): string {
    return metadataEntry(
      this.entries(),
      PUBLIC_REPORT_SECTION_METADATA_NAMESPACE,
      key,
    )?.label ?? missingUiMetadataLabel(
      PUBLIC_REPORT_SECTION_METADATA_NAMESPACE,
      key,
    );
  }

  sectionText(key: string): string {
    return metadataText(
      this.entries(),
      PUBLIC_REPORT_SECTION_METADATA_NAMESPACE,
      key,
    );
  }
}
