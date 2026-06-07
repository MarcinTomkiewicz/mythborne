import { Database } from './database.types';

export type GetReportPageCopyRpcResult =
  Database['public']['Functions']['get_report_page_copy']['Returns'];

export type GetReportListPageRpcArgs =
  Database['public']['Functions']['get_report_list_page']['Args'];

export type GetReportListPageRpcResult =
  Database['public']['Functions']['get_report_list_page']['Returns'];

export type GetReportDetailRpcArgs =
  Database['public']['Functions']['get_report_detail']['Args'];

export type GetReportDetailRpcResult =
  Database['public']['Functions']['get_report_detail']['Returns'];

export type GetPublicReportDetailRpcArgs =
  Database['public']['Functions']['get_public_report_detail']['Args'];

export type GetPublicReportDetailRpcResult =
  Database['public']['Functions']['get_public_report_detail']['Returns'];
