import { ReportParticipantRow } from './report-section.model';

export interface ReportListPage {
  contractVersion: 'report_list_page_v1';
  reports: ReportListRow[];
  unreadCount: number;
  pagination: ReportPagination;
  appliedFilters: {
    reportTypeKey: string | null;
    unreadOnly: boolean;
  };
}

export interface ReportListRow {
  reportId: string;
  publicToken: string | null;
  reportTypeKey: string;
  reportTypeLabel: string;
  title: string;
  summary: string | null;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  accessRole: string;
  createdAt: string;
  readAt: string | null;
  isUnread: boolean;
  participantsJson: ReportParticipantRow[];
  itemReferencesCount: number;
}

export interface ReportPagination {
  limit: number;
  offset: number;
  totalCount: number;
  hasNextPage: boolean;
  rangeStart: number;
  rangeEnd: number;
  rangeTotal: number;
  rangeTemplate: string;
  displayLabel: string;
}
