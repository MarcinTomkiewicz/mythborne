export interface RecordAntiAbuseIdentityObservationInput {
  serverId?: string | null;
  heroId?: string | null;
  sourceKey?: string | null;
  sourceEntityType?: string | null;
  sourceEntityId?: string | null;
  deviceToken?: string | null;
}

export interface AntiAbuseIdentityObservationResult {
  ok: boolean;
  observationId: string | null;
  statusMessage: string;
}
