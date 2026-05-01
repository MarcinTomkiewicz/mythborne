import { inject, Injectable } from '@angular/core';
import { catchError, from, map, Observable, of } from 'rxjs';
import { EDGE_FUNCTIONS } from '../../constants/edge-functions.const';
import {
  AntiAbuseIdentityObservationResult,
  RecordAntiAbuseIdentityObservationInput,
} from '../../domain/anti-abuse/anti-abuse-identity-observation.model';
import { RecordAntiAbuseIdentityObservationEdgeResponse } from '../../types/anti-abuse-identity-observation-edge.types';
import {
  mapAntiAbuseIdentityObservationEdgeResponse,
  toRecordAntiAbuseIdentityObservationEdgeBody,
} from '../../utils/anti-abuse-identity-observation-edge';
import { SupabaseClientService } from '../supabase/supabase-client';

@Injectable({ providedIn: 'root' })
export class AntiAbuseIdentityObservation {
  private readonly supabase = inject(SupabaseClientService);

  recordIdentityObservation(
    input: RecordAntiAbuseIdentityObservationInput,
  ): Observable<AntiAbuseIdentityObservationResult> {
    return from(
      this.supabase.client.functions.invoke<RecordAntiAbuseIdentityObservationEdgeResponse>(
        EDGE_FUNCTIONS.record_identity_observation,
        {
          body: toRecordAntiAbuseIdentityObservationEdgeBody(input),
        },
      ),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          return failedObservationResult();
        }

        return mapAntiAbuseIdentityObservationEdgeResponse(data);
      }),
      catchError(() => of(failedObservationResult())),
    );
  }
}

function failedObservationResult(): AntiAbuseIdentityObservationResult {
  return {
    ok: false,
    observationId: null,
    statusMessage: 'Identity observation was not recorded.',
  };
}
