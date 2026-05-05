import {
  REPORTS_CENTER_SECTION_METADATA_KEYS,
  REPORTS_CENTER_SECTION_METADATA_NAMESPACE,
} from '../../../core/constants/game-report-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  metadataEntry,
  metadataText,
  missingUiMetadataGaps,
  missingUiMetadataLabel,
} from '../../../core/utils/admin-ui-metadata';

export const REPORTS_CENTER_SECTION = {
  pageHeader: 'page_header',
  filters: 'filters',
  reportList: 'report_list',
  emptyState: 'empty_state',
} as const;

export class ReportsUiMetadata {
  readonly section = REPORTS_CENTER_SECTION;

  constructor(private readonly entries: () => UiMetadataEntryReadModel[]) {}

  missingGaps(): string[] {
    return missingUiMetadataGaps(this.entries(), {
      [REPORTS_CENTER_SECTION_METADATA_NAMESPACE]: REPORTS_CENTER_SECTION_METADATA_KEYS,
    });
  }

  sectionTitle(key: string): string {
    return metadataEntry(
      this.entries(),
      REPORTS_CENTER_SECTION_METADATA_NAMESPACE,
      key,
    )?.label ?? missingUiMetadataLabel(
      REPORTS_CENTER_SECTION_METADATA_NAMESPACE,
      key,
    );
  }

  sectionText(key: string): string {
    return metadataText(
      this.entries(),
      REPORTS_CENTER_SECTION_METADATA_NAMESPACE,
      key,
    );
  }
}
