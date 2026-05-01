export interface RecordAntiAbuseIdentityObservationEdgeBody {
  serverId?: string;
  heroId?: string;
  sourceKey?: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  deviceToken?: string;
}

export interface RecordAntiAbuseIdentityObservationEdgeResponse {
  ok: boolean;
  observationId?: string | null;
  error?: string;
}
