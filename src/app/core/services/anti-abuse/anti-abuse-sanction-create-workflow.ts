import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import {
  CreatedSanctionWorkflowResult,
  CreateSanctionWorkflowRequest,
} from '../../domain/anti-abuse/anti-abuse-sanction-create.model';
import {
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionItemDecision,
  CharacterPointPenaltyDecision,
} from '../../domain/anti-abuse/anti-abuse-sanction.model';
import { AntiAbuseDecisions } from './anti-abuse-decisions';

@Injectable({ providedIn: 'root' })
export class AntiAbuseSanctionCreateWorkflow {
  private readonly decisions = inject(AntiAbuseDecisions);

  create(input: CreateSanctionWorkflowRequest): Observable<CreatedSanctionWorkflowResult> {
    return this.decisions
      .createSanction({
        caseId: input.caseId,
        sanctionTypeKey: input.sanctionTypeKey,
        targetHeroId: input.targetHeroId,
        targetUserId: input.targetUserId,
        reason: input.reason,
        operatorNotes: input.operatorNotes,
        sourceHeroId: input.sourceHeroId,
        amountCharacterPoints: input.amountCharacterPoints,
        durationDays: input.durationDays,
      })
      .pipe(
        switchMap((sanction) =>
          this.createLinkedRecords(input, sanction).pipe(
            catchError((error: unknown) =>
              of({
                sanction,
                penalty: null,
                sanctionItems: [],
                partialFailureMessage: linkedFailureMessage(error),
              }),
            ),
          ),
        ),
      );
  }

  private createLinkedRecords(
    input: CreateSanctionWorkflowRequest,
    sanction: AntiAbuseSanctionDecision,
  ): Observable<CreatedSanctionWorkflowResult> {
    return forkJoin({
      penalty: input.requiresCharacterPointPenalty
        ? this.createPenalty(input, sanction.id)
        : of(null),
      sanctionItems: input.requiresItemLinks
        ? this.addSanctionItems(input, sanction)
        : of([]),
    }).pipe(
      map((linked) => ({
        sanction,
        ...linked,
        partialFailureMessage: null,
      })),
    );
  }

  private createPenalty(
    input: CreateSanctionWorkflowRequest,
    sanctionId: string,
  ): Observable<CharacterPointPenaltyDecision> {
    return this.decisions.createCharacterPointPenalty({
      sanctionId,
      reason: input.reason,
      operatorNotes: input.operatorNotes,
    });
  }

  private addSanctionItems(
    input: CreateSanctionWorkflowRequest,
    sanction: AntiAbuseSanctionDecision,
  ): Observable<AntiAbuseSanctionItemDecision[]> {
    if (!input.itemIds.length) {
      return of([]);
    }

    return forkJoin(
      input.itemIds.map((itemId) =>
        this.decisions.addSanctionItem({
          sanctionId: sanction.id,
          itemId,
          reason: input.reason,
          operatorNotes: input.operatorNotes,
          sourceHeroId: input.sourceHeroId,
          destinationHeroId: sanction.targetHeroId,
        }),
      ),
    );
  }
}

function linkedFailureMessage(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  return `Sanction was created, but linked penalty or item records failed: ${detail}`;
}
