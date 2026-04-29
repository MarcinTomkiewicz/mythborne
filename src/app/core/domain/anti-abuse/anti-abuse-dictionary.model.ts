export interface AntiAbuseDictionaryEntry {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AntiAbuseSanctionTypeEntry extends AntiAbuseDictionaryEntry {
  requiresReason: boolean;
  requiresTargetHero: boolean;
  requiresSourceHero: boolean;
  requiresDurationDays: boolean;
  requiresItemSelection: boolean;
  requiresCharacterPointsAmount: boolean;
}

export interface PlayerAbuseReportTypeEntry extends AntiAbuseDictionaryEntry {
  requiresAccusedHero: boolean;
  requiresDescription: boolean;
  requiresTradeSelection: boolean;
  requiresItemSelection: boolean;
}

export interface PlayerRelationshipDeclarationTypeEntry
  extends AntiAbuseDictionaryEntry {
  minParticipants: number;
  maxParticipants: number | null;
  requiresAmount: boolean;
  requiresExpiration: boolean;
  requiresTradeSelection: boolean;
  requiresItemSelection: boolean;
}

export interface AntiAbuseSignalTypeEntry extends AntiAbuseDictionaryEntry {
  defaultSeverity: string;
  defaultScore: number;
  defaultConfidence: number;
}

export interface AntiAbuseDictionaryData {
  sanctionTypes: AntiAbuseSanctionTypeEntry[];
  reportTypes: PlayerAbuseReportTypeEntry[];
  declarationTypes: PlayerRelationshipDeclarationTypeEntry[];
  signalTypes: AntiAbuseSignalTypeEntry[];
}
