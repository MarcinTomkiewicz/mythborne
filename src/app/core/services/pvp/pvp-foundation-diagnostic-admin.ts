import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Database } from '../../types/database.types';
import { Backend } from '../backend/backend';

type InspectPvpFoundationIntegrationStateArgs =
  Database['public']['Functions']['inspect_pvp_foundation_integration_state']['Args'];
type InspectPvpFoundationIntegrationStateReturn =
  Database['public']['Functions']['inspect_pvp_foundation_integration_state']['Returns'];

export interface PvpFoundationDiagnostic {
  structuralStatus: string | null;
  formulaStatus: string | null;
  missingFunctions: string[];
  missingTriggers: string[];
  incomingNotificationCount: number | null;
  positiveSmokePrerequisites: string[];
}

@Injectable({ providedIn: 'root' })
export class PvpFoundationDiagnosticAdmin {
  private readonly backend = inject(Backend);

  getDiagnostic(
    serverId: string | null | undefined,
  ): Observable<PvpFoundationDiagnostic> {
    const args: InspectPvpFoundationIntegrationStateArgs = {};

    if (serverId) {
      args.p_server_id = serverId;
    }

    return this.backend.rpc<InspectPvpFoundationIntegrationStateReturn>(
      RPC.inspect_pvp_foundation_integration_state,
      args,
    ).pipe(map(mapPvpFoundationDiagnostic));
  }
}

export function mapPvpFoundationDiagnostic(
  value: InspectPvpFoundationIntegrationStateReturn,
): PvpFoundationDiagnostic {
  const record = isRecord(value) ? value : {};

  return {
    structuralStatus: optionalText(
      firstValue(record, ['structuralStatus', 'structural_status', 'status']),
    ),
    formulaStatus: optionalText(
      firstValue(record, ['formulaStatus', 'formula_status']),
    ),
    missingFunctions: stringArray(
      firstValue(record, ['missingFunctions', 'missing_functions']),
    ),
    missingTriggers: stringArray(
      firstValue(record, ['missingTriggers', 'missing_triggers']),
    ),
    incomingNotificationCount: optionalNumber(
      firstValue(record, [
        'incomingNotificationCount',
        'incoming_notification_count',
      ]),
    ),
    positiveSmokePrerequisites: stringArray(
      firstValue(record, [
        'positiveSmokePrerequisites',
        'positive_smoke_prerequisites',
        'smokePrerequisites',
        'smoke_prerequisites',
      ]),
    ),
  };
}

function firstValue(
  record: Record<string, unknown>,
  keys: readonly string[],
): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
  }

  return undefined;
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
