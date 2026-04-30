import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { PlayerRelationshipDeclarationTypeEntry } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import { PlayerRelationshipDeclarationDecision } from '../../domain/anti-abuse/anti-abuse-decision.model';
import {
  StaffPlayerRelationshipDeclarationDecisionInput,
  StaffPlayerRelationshipDeclarationDetailInput,
  StaffPlayerRelationshipDeclarationReviewDetail,
} from '../../domain/anti-abuse/player-relationship-declaration-review.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import { mapPlayerRelationshipDeclarationType } from '../../utils/anti-abuse-dictionary';
import {
  mapPlayerRelationshipDeclarationItem,
  mapPlayerRelationshipDeclarationTrade,
} from '../../utils/player-relationship-declaration-view';
import {
  mapStaffPlayerRelationshipDeclarationParticipant,
  mapStaffPlayerRelationshipDeclarationReviewDetail,
} from '../../utils/player-relationship-declaration-review';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { AntiAbuseDecisions } from './anti-abuse-decisions';
import { AntiAbuseDictionaries } from './anti-abuse-dictionaries';

@Injectable({ providedIn: 'root' })
export class PlayerRelationshipDeclarationReview {
  private readonly backend = inject(Backend);
  private readonly decisions = inject(AntiAbuseDecisions);
  private readonly dictionaries = inject(AntiAbuseDictionaries);

  getDeclarationForStaff(
    input: StaffPlayerRelationshipDeclarationDetailInput,
  ): Observable<StaffPlayerRelationshipDeclarationReviewDetail> {
    const serverId = requiredText(input.serverId, 'serverId');
    const declarationId = requiredText(input.declarationId, 'declarationId');

    return this.getDeclarationRow(serverId, declarationId).pipe(
      switchMap((declaration) =>
        forkJoin({
          declaration: of(declaration),
          declarationTypes: this.getDeclarationTypes(declaration.declaration_type_key),
          participants: this.getLinkedRows(
            TABLES.player_relationship_declaration_participants,
            declaration.id,
          ).pipe(map((rows) => rows.map(mapStaffPlayerRelationshipDeclarationParticipant))),
          items: this.getLinkedRows(
            TABLES.player_relationship_declaration_items,
            declaration.id,
          ).pipe(map((rows) => rows.map(mapPlayerRelationshipDeclarationItem))),
          trades: this.getLinkedRows(
            TABLES.player_relationship_declaration_trades,
            declaration.id,
          ).pipe(map((rows) => rows.map(mapPlayerRelationshipDeclarationTrade))),
        }),
      ),
      map((data) =>
        mapStaffPlayerRelationshipDeclarationReviewDetail(data.declaration, {
          declarationTypes: data.declarationTypes,
          participants: data.participants,
          items: data.items,
          trades: data.trades,
        }),
      ),
    );
  }

  setDeclarationDecision(
    input: StaffPlayerRelationshipDeclarationDecisionInput,
  ): Observable<PlayerRelationshipDeclarationDecision> {
    const serverId = requiredText(input.serverId, 'serverId');
    const declarationId = requiredText(input.declarationId, 'declarationId');

    return this.getDeclarationRow(serverId, declarationId).pipe(
      switchMap(() =>
        this.decisions.setRelationshipDeclarationDecision({
          declarationId,
          status: input.status,
          statusReason: input.statusReason,
          adminNotes: input.adminNotes,
          playerNotes: input.playerNotes,
        }),
      ),
    );
  }

  private getDeclarationRow(
    serverId: string,
    declarationId: string,
  ): Observable<Row<'player_relationship_declarations'>> {
    return this.backend
      .getAll<Row<'player_relationship_declarations'>>({
        table: TABLES.player_relationship_declarations,
        filters: {
          id: eq(declarationId),
          serverId: eq(serverId),
        },
        camelCase: false,
      })
      .pipe(
        map((rows) => {
          const row = rows[0];

          if (!row) {
            throw new Error('Player relationship declaration not found for selected server.');
          }

          return row;
        }),
      );
  }

  private getDeclarationTypes(
    declarationTypeKey: string,
  ): Observable<PlayerRelationshipDeclarationTypeEntry[]> {
    return this.dictionaries.getActiveDeclarationTypes().pipe(
      switchMap((activeTypes) => {
        if (activeTypes.some((entry) => entry.key === declarationTypeKey)) {
          return of(activeTypes);
        }

        return this.backend
          .getAll<Row<'player_relationship_declaration_types'>>({
            table: TABLES.player_relationship_declaration_types,
            filters: { key: eq(declarationTypeKey) },
            orderBy: [{ column: 'sort_order' }, { column: 'key' }],
            camelCase: false,
          })
          .pipe(
            map((rows) => [
              ...activeTypes,
              ...rows.map(mapPlayerRelationshipDeclarationType),
            ]),
          );
      }),
    );
  }

  private getLinkedRows<T extends LinkedDeclarationTable>(
    table: T,
    declarationId: string,
  ): Observable<Row<T>[]> {
    return this.backend.getAll<Row<T>>({
      table,
      filters: { declarationId: eq(declarationId) },
      orderBy: [{ column: 'created_at' }],
      camelCase: false,
    });
  }
}

type LinkedDeclarationTable =
  | typeof TABLES.player_relationship_declaration_participants
  | typeof TABLES.player_relationship_declaration_items
  | typeof TABLES.player_relationship_declaration_trades;

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for staff declaration review.`);
  }

  return normalized;
}

function eq(value: string): FilterDefinition {
  return { operator: FilterOperator.EQ, value };
}
