import { Database } from './database.types';

export type GetReportPageCopyRpcResult =
  Database['public']['Functions']['get_report_page_copy']['Returns'];

export type GetReportsCenterPageContextRpcArgs =
  Database['public']['Functions']['get_reports_center_page_context']['Args'];

export type GetReportsCenterPageContextRpcResult =
  Database['public']['Functions']['get_reports_center_page_context']['Returns'];

export type MarkAllReportsReadRpcArgs =
  Database['public']['Functions']['mark_all_reports_read']['Args'];

export type MarkAllReportsReadRpcResult =
  Database['public']['Functions']['mark_all_reports_read']['Returns'];

export type GetReportDetailRpcArgs =
  Database['public']['Functions']['get_report_detail']['Args'];

export type GetReportDetailRpcResult =
  Database['public']['Functions']['get_report_detail']['Returns'];

export type GetPublicReportDetailRpcArgs =
  Database['public']['Functions']['get_public_report_detail']['Args'];

export type GetPublicReportDetailRpcResult =
  Database['public']['Functions']['get_public_report_detail']['Returns'];
