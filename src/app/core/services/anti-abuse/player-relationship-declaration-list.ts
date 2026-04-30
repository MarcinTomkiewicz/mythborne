import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { PlayerRelationshipDeclarationTypeEntry } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  PlayerRelationshipDeclarationListInput,
  PlayerRelationshipDeclarationListItem,
} from '../../domain/anti-abuse/player-relationship-declaration-view.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import { mapPlayerRelationshipDeclarationType } from '../../utils/anti-abuse-dictionary';
import {
  mapPlayerRelationshipDeclarationItem,
  mapPlayerRelationshipDeclarationListItem,
  mapPlayerRelationshipDeclarationParticipant,
  mapPlayerRelationshipDeclarationTrade,
} from '../../utils/player-relationship-declaration-view';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { AntiAbuseDictionaries } from './anti-abuse-dictionaries';

@Injectable({ providedIn: 'root' })
export class PlayerRelationshipDeclarationList {
  private readonly backend = inject(Backend);
  private readonly dictionaries = inject(AntiAbuseDictionaries);

  getDeclarationsForPlayer(
    input: PlayerRelationshipDeclarationListInput,
  ): Observable<PlayerRelationshipDeclarationListItem[]> {
    const serverId = requiredText(input.serverId, 'serverId');
    const heroId = requiredText(input.heroId, 'heroId');
    const userId = requiredText(input.userId, 'userId');

    return forkJoin({
      ownDeclarations: this.getDeclarationsByCreator(serverId, heroId),
      heroParticipantRows: this.getParticipantRows({ heroId }),
      userParticipantRows: this.getParticipantRows({ userId }),
      declarationTypes: this.dictionaries.getActiveDeclarationTypes(),
    }).pipe(
      switchMap((base) => {
        const participantRows = uniqueRowsById([
          ...base.heroParticipantRows,
          ...base.userParticipantRows,
        ]);
        const participantDeclarationIds = uniqueTexts(
          participantRows.map((row) => row.declaration_id),
        );

        return forkJoin({
          ownDeclarations: of(base.ownDeclarations),
          participantRows: of(participantRows),
          participantDeclarations: this.getDeclarationsByIds(
            serverId,
            participantDeclarationIds,
          ),
          declarationTypes: of(base.declarationTypes),
        });
      }),
      switchMap((base) => {
        const declarations = uniqueRowsById([
          ...base.ownDeclarations,
          ...base.participantDeclarations,
        ]).sort((left, right) => right.updated_at.localeCompare(left.updated_at));
        const declarationIds = declarations.map((entry) => entry.id);
        const referencedTypeKeys = uniqueTexts(
          declarations.map((entry) => entry.declaration_type_key),
        );

        return forkJoin({
          declarations: of(declarations),
          declarationTypes: this.getReferencedDeclarationTypes(
            base.declarationTypes,
            referencedTypeKeys,
          ),
          participants: this.getLinkedRows(
            TABLES.player_relationship_declaration_participants,
            declarationIds,
          ).pipe(map((rows) => rows.map(mapPlayerRelationshipDeclarationParticipant))),
          items: this.getLinkedRows(
            TABLES.player_relationship_declaration_items,
            declarationIds,
          ).pipe(map((rows) => rows.map(mapPlayerRelationshipDeclarationItem))),
          trades: this.getLinkedRows(
            TABLES.player_relationship_declaration_trades,
            declarationIds,
          ).pipe(map((rows) => rows.map(mapPlayerRelationshipDeclarationTrade))),
        });
      }),
      map((data) =>
        data.declarations.map((declaration) =>
          mapPlayerRelationshipDeclarationListItem(declaration, {
            declarationTypes: data.declarationTypes,
            participants: data.participants.filter(
              (entry) => entry.declarationId === declaration.id,
            ),
            items: data.items.filter((entry) => entry.declarationId === declaration.id),
            trades: data.trades.filter((entry) => entry.declarationId === declaration.id),
          }),
        ),
      ),
    );
  }

  private getDeclarationsByCreator(
    serverId: string,
    heroId: string,
  ): Observable<Row<'player_relationship_declarations'>[]> {
    return this.backend.getAll<Row<'player_relationship_declarations'>>({
      table: TABLES.player_relationship_declarations,
      filters: {
        serverId: eq(serverId),
        createdByHeroId: eq(heroId),
      },
      orderBy: [{ column: 'updated_at', ascending: false }],
      camelCase: false,
    });
  }

  private getDeclarationsByIds(
    serverId: string,
    declarationIds: readonly string[],
  ): Observable<Row<'player_relationship_declarations'>[]> {
    if (!declarationIds.length) {
      return of([]);
    }

    return this.backend.getAll<Row<'player_relationship_declarations'>>({
      table: TABLES.player_relationship_declarations,
      filters: {
        serverId: eq(serverId),
        id: inList(declarationIds),
      },
      orderBy: [{ column: 'updated_at', ascending: false }],
      camelCase: false,
    });
  }

  private getParticipantRows(filters: {
    heroId?: string;
    userId?: string;
  }): Observable<Row<'player_relationship_declaration_participants'>[]> {
    return this.backend.getAll<Row<'player_relationship_declaration_participants'>>({
      table: TABLES.player_relationship_declaration_participants,
      filters: Object.entries(filters).reduce<Record<string, FilterDefinition>>(
        (result, [key, value]) => {
          if (value) {
            result[key] = eq(value);
          }

          return result;
        },
        {},
      ),
      orderBy: [{ column: 'created_at', ascending: false }],
      camelCase: false,
    });
  }

  private getLinkedRows<T extends LinkedDeclarationTable>(
    table: T,
    declarationIds: readonly string[],
  ): Observable<Row<T>[]> {
    if (!declarationIds.length) {
      return of([]);
    }

    return this.backend.getAll<Row<T>>({
      table,
      filters: { declarationId: inList(declarationIds) },
      orderBy: [{ column: 'created_at' }],
      camelCase: false,
    });
  }

  private getReferencedDeclarationTypes(
    activeTypes: readonly PlayerRelationshipDeclarationTypeEntry[],
    referencedKeys: readonly string[],
  ): Observable<PlayerRelationshipDeclarationTypeEntry[]> {
    const activeKeys = new Set(activeTypes.map((entry) => entry.key));
    const missingKeys = referencedKeys.filter((key) => !activeKeys.has(key));

    if (!missingKeys.length) {
      return of([...activeTypes]);
    }

    return this.backend
      .getAll<Row<'player_relationship_declaration_types'>>({
        table: TABLES.player_relationship_declaration_types,
        filters: { key: inList(missingKeys) },
        orderBy: [{ column: 'sort_order' }, { column: 'key' }],
        camelCase: false,
      })
      .pipe(
        map((rows) =>
          uniqueDeclarationTypesByKey([
            ...activeTypes,
            ...rows.map(mapPlayerRelationshipDeclarationType),
          ]),
        ),
      );
  }
}

type LinkedDeclarationTable =
  | typeof TABLES.player_relationship_declaration_participants
  | typeof TABLES.player_relationship_declaration_items
  | typeof TABLES.player_relationship_declaration_trades;

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for player declaration list.`);
  }

  return normalized;
}

function eq(value: string): FilterDefinition {
  return { operator: FilterOperator.EQ, value };
}

function inList(values: readonly string[]): FilterDefinition {
  return { operator: FilterOperator.IN, value: values };
}

function uniqueTexts(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function uniqueRowsById<T extends { id: string }>(rows: readonly T[]): T[] {
  const byId = new Map<string, T>();

  for (const row of rows) {
    byId.set(row.id, row);
  }

  return [...byId.values()];
}

function uniqueDeclarationTypesByKey(
  rows: readonly PlayerRelationshipDeclarationTypeEntry[],
): PlayerRelationshipDeclarationTypeEntry[] {
  const byKey = new Map<string, PlayerRelationshipDeclarationTypeEntry>();

  for (const row of rows) {
    byKey.set(row.key, row);
  }

  return [...byKey.values()];
}
