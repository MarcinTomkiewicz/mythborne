import {
  AntiAbuseIdentityObservationResult,
  RecordAntiAbuseIdentityObservationInput,
} from '../domain/anti-abuse/anti-abuse-identity-observation.model';
import {
  RecordAntiAbuseIdentityObservationEdgeBody,
  RecordAntiAbuseIdentityObservationEdgeResponse,
} from '../types/anti-abuse-identity-observation-edge.types';
import { trimText, trimToNull } from './normalize-text';

export function toRecordAntiAbuseIdentityObservationEdgeBody(
  input: RecordAntiAbuseIdentityObservationInput,
): RecordAntiAbuseIdentityObservationEdgeBody {
  const body: RecordAntiAbuseIdentityObservationEdgeBody = {};

  addOptionalText(body, 'serverId', input.serverId);
  addOptionalText(body, 'heroId', input.heroId);
  addOptionalText(body, 'sourceKey', input.sourceKey);
  addOptionalText(body, 'sourceEntityType', input.sourceEntityType);
  addOptionalText(body, 'sourceEntityId', input.sourceEntityId);
  addOptionalText(body, 'deviceToken', input.deviceToken);

  return body;
}

export function mapAntiAbuseIdentityObservationEdgeResponse(
  response: RecordAntiAbuseIdentityObservationEdgeResponse | null,
): AntiAbuseIdentityObservationResult {
  if (!response?.ok) {
    return {
      ok: false,
      observationId: null,
      statusMessage: 'Identity observation was not recorded.',
    };
  }

  return {
    ok: true,
    observationId: trimText(response.observationId) || null,
    statusMessage: 'Identity observation recorded.',
  };
}

function addOptionalText<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = normalized as T[K];
  }
}
