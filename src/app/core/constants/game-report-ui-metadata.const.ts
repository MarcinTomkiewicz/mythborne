export const REPORTS_CENTER_SECTION_METADATA_NAMESPACE = 'reports_center_section';
export const REPORT_DETAIL_SECTION_METADATA_NAMESPACE = 'report_detail_section';

export const REPORTS_CENTER_SECTION_METADATA_KEYS = [
  'page_header',
  'filters',
  'report_list',
  'empty_state',
] as const;

export const REPORT_DETAIL_SECTION_METADATA_KEYS = [
  'page_header',
  'participants',
  'item_references',
  'combat_section',
] as const;
