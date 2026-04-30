export interface CreatePlayerAbuseReportInput {
  serverId: string;
  reportTypeKey: string;
  title: string;
  description: string;
  reportingHeroId: string;
  accusedHeroId?: string | null;
  relatedItemId?: string | null;
  relatedTradeId?: string | null;
  relatedTradeReference?: string | null;
}

export interface CreatedPlayerAbuseReport {
  reportId: string;
  caseId: string;
}
