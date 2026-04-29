import { AntiAbuseDictionaryEntry } from './anti-abuse-dictionary.model';

export interface AntiAbuseDisplayMetadata extends AntiAbuseDictionaryEntry {
  technicalKey: string;
}

export interface AntiAbuseDecisionReasonDisplay {
  reason: string | null;
  statusReason: string | null;
  verdictReason?: string | null;
  noSanctionReason?: string | null;
}

export interface StaffAntiAbuseDecisionDisplay {
  label: string;
  statusLabel: string;
  technicalKey: string;
  reason: string | null;
  statusReason: string | null;
  operatorNotes: string | null;
  adminDescription: string | null;
}

export interface PlayerAntiAbuseDecisionDisplay {
  label: string;
  statusLabel: string;
  reason: string | null;
  statusReason: string | null;
  playerNotes: string | null;
}

export interface AntiAbuseSanctionItemLinkDisplay {
  label: string;
  description: string;
  helperText: string;
}
