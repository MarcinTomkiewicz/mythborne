import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { AntiAbuseCaseReadModel } from '../../domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseSanctionTypeEntry } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  AntiAbuseRepeatOffenderHistory,
  AntiAbuseRepeatOffenderHistoryInput,
} from '../../domain/anti-abuse/anti-abuse-repeat-offender-history.model';
import {
  AntiAbuseSanctionDecision,
  CharacterPointPenaltyDecision,
} from '../../domain/anti-abuse/anti-abuse-sanction.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import { mapAntiAbuseCaseReadModel } from '../../utils/anti-abuse-case-mappers';
import {
  mapAntiAbuseSanctionDecision,
  mapCharacterPointPenaltyDecision,
} from '../../utils/anti-abuse-decision-mappers';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { AntiAbuseReferencedDictionaries } from './anti-abuse-referenced-dictionaries';

@Injectable({ providedIn: 'root' })
export class AntiAbuseRepeatOffenderHistoryService {
  private readonly backend = inject(Backend);
  private readonly dictionaries = inject(AntiAbuseReferencedDictionaries);

  getHistory(
    input: AntiAbuseRepeatOffenderHistoryInput,
  ): Observable<AntiAbuseRepeatOffenderHistory> {
    const serverId = requiredServerId(input.serverId);
    const heroId = trimToNull(input.heroId);
    const userId = trimToNull(input.userId);
    const excludeCaseId = trimToNull(input.excludeCaseId);

    if (!heroId && !userId) {
      throw new Error('heroId or userId is required for anti-abuse history.');
    }

    return forkJoin({
      participantCaseIds: this.getParticipantCaseIds(heroId, userId),
      sanctions: this.getSanctions(heroId, userId),
      penalties: this.getPenalties(serverId, heroId, userId),
    }).pipe(
      switchMap(({ participantCaseIds, sanctions, penalties }) => {
        const candidateCaseIds = uniqueTexts([
          ...participantCaseIds,
          ...sanctions.map((entry) => entry.caseId),
          ...penalties.map((entry) => entry.caseId),
        ]);

        if (!candidateCaseIds.length) {
          return of({
            cases: [],
            sanctions: [],
            penalties: [],
            sanctionTypes: [],
          });
        }

        return this.getCases(serverId, candidateCaseIds).pipe(
          switchMap((cases) => {
            const serverCaseIds = new Set(cases.map((entry) => entry.id));
            const serverSanctions = sanctions.filter((entry) =>
              serverCaseIds.has(entry.caseId),
            );

            return this.getSanctionTypes(serverSanctions).pipe(
              map((sanctionTypes) => ({
                cases,
                sanctions: serverSanctions,
                penalties: penalties.filter((entry) => serverCaseIds.has(entry.caseId)),
                sanctionTypes,
              })),
            );
          }),
        );
      }),
      map(({ cases, sanctions, penalties, sanctionTypes }) =>
        toHistory({
          heroId,
          userId,
          excludeCaseId,
          cases,
          sanctions,
          penalties,
          sanctionTypes,
        }),
      ),
    );
  }

  private getParticipantCaseIds(
    heroId: string | null,
    userId: string | null,
  ): Observable<string[]> {
    const requests: Observable<Row<'anti_abuse_case_participants'>[]>[] = [];

    if (heroId) {
      requests.push(
        this.backend.getAll<Row<'anti_abuse_case_participants'>>({
          table: TABLES.anti_abuse_case_participants,
          filters: { heroId: eq(heroId) },
          camelCase: false,
        }),
      );
    }

    if (userId) {
      requests.push(
        this.backend.getAll<Row<'anti_abuse_case_participants'>>({
          table: TABLES.anti_abuse_case_participants,
          filters: { userId: eq(userId) },
          camelCase: false,
        }),
      );
    }

    return forkJoinOrEmpty(requests).pipe(
      map((groups) => uniqueTexts(groups.flat().map((row) => row.case_id))),
    );
  }

  private getSanctions(
    heroId: string | null,
    userId: string | null,
  ): Observable<AntiAbuseSanctionDecision[]> {
    const requests: Observable<Row<'anti_abuse_sanctions'>[]>[] = [];

    if (heroId) {
      requests.push(
        this.backend.getAll<Row<'anti_abuse_sanctions'>>({
          table: TABLES.anti_abuse_sanctions,
          filters: { targetHeroId: eq(heroId) },
          orderBy: [{ column: 'created_at', ascending: false }],
          camelCase: false,
        }),
      );
    }

    if (userId) {
      requests.push(
        this.backend.getAll<Row<'anti_abuse_sanctions'>>({
          table: TABLES.anti_abuse_sanctions,
          filters: { targetUserId: eq(userId) },
          orderBy: [{ column: 'created_at', ascending: false }],
          camelCase: false,
        }),
      );
    }

    return forkJoinOrEmpty(requests).pipe(
      map((groups) => uniqueById(groups.flat().map(mapAntiAbuseSanctionDecision))),
    );
  }

  private getPenalties(
    serverId: string,
    heroId: string | null,
    userId: string | null,
  ): Observable<CharacterPointPenaltyDecision[]> {
    const requests: Observable<Row<'character_point_penalties'>[]>[] = [];

    if (heroId) {
      requests.push(
        this.backend.getAll<Row<'character_point_penalties'>>({
          table: TABLES.character_point_penalties,
          filters: {
            serverId: eq(serverId),
            heroId: eq(heroId),
          },
          orderBy: [{ column: 'created_at', ascending: false }],
          camelCase: false,
        }),
      );
    }

    if (userId) {
      requests.push(
        this.backend.getAll<Row<'character_point_penalties'>>({
          table: TABLES.character_point_penalties,
          filters: {
            serverId: eq(serverId),
            userId: eq(userId),
          },
          orderBy: [{ column: 'created_at', ascending: false }],
          camelCase: false,
        }),
      );
    }

    return forkJoinOrEmpty(requests).pipe(
      map((groups) => uniqueById(groups.flat().map(mapCharacterPointPenaltyDecision))),
    );
  }

  private getCases(
    serverId: string,
    caseIds: readonly string[],
  ): Observable<AntiAbuseCaseReadModel[]> {
    if (!caseIds.length) {
      return of([]);
    }

    return this.backend
      .getAll<Row<'anti_abuse_cases'>>({
        table: TABLES.anti_abuse_cases,
        filters: {
          serverId: eq(serverId),
          id: inList(caseIds),
        },
        orderBy: [{ column: 'updated_at', ascending: false }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapAntiAbuseCaseReadModel)));
  }

  private getSanctionTypes(
    sanctions: readonly AntiAbuseSanctionDecision[],
  ): Observable<AntiAbuseSanctionTypeEntry[]> {
    const sanctionTypeKeys = uniqueTexts(sanctions.map((entry) => entry.sanctionTypeKey));

    if (!sanctionTypeKeys.length) {
      return of([]);
    }

    return this.dictionaries
      .getForReferences({
        sanctionTypeKeys,
        reportTypeKeys: [],
        declarationTypeKeys: [],
        signalTypeKeys: [],
      })
      .pipe(
        map((data) =>
          data.sanctionTypes.filter((entry) => sanctionTypeKeys.includes(entry.key)),
        ),
      );
  }
}

function toHistory(input: {
  heroId: string | null;
  userId: string | null;
  excludeCaseId: string | null;
  cases: AntiAbuseCaseReadModel[];
  sanctions: AntiAbuseSanctionDecision[];
  penalties: CharacterPointPenaltyDecision[];
  sanctionTypes: AntiAbuseSanctionTypeEntry[];
}): AntiAbuseRepeatOffenderHistory {
  const cases = input.excludeCaseId
    ? input.cases.filter((entry) => entry.id !== input.excludeCaseId)
    : input.cases;
  const serverCaseIds = new Set(cases.map((entry) => entry.id));
  const sanctions = input.sanctions.filter((entry) => serverCaseIds.has(entry.caseId));
  const characterPointPenalties = input.penalties.filter((entry) =>
    serverCaseIds.has(entry.caseId),
  );
  const warnings = sanctions.filter((entry) => entry.sanctionTypeKey === 'warning');

  return {
    target: {
      heroId: input.heroId,
      userId: input.userId,
    },
    cases,
    sanctions,
    warnings,
    characterPointPenalties,
    dictionaries: {
      sanctionTypes: input.sanctionTypes,
    },
    totals: {
      cases: cases.length,
      sanctions: sanctions.length,
      warnings: warnings.length,
      characterPointPenalties: characterPointPenalties.length,
      remainingCharacterPoints: characterPointPenalties.reduce(
        (sum, entry) => sum + entry.remainingAmount,
        0,
      ),
    },
  };
}

function forkJoinOrEmpty<T>(requests: Observable<T[]>[]): Observable<T[][]> {
  return requests.length ? forkJoin(requests) : of([]);
}

function requiredServerId(value: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error('serverId is required for anti-abuse history.');
  }

  return normalized;
}

function eq(value: string): FilterDefinition {
  return { operator: FilterOperator.EQ, value };
}

function inList(values: readonly string[]): FilterDefinition {
  return { operator: FilterOperator.IN, value: [...values] };
}

function uniqueTexts(values: readonly (string | null | undefined)[]): string[] {
  return [...new Set(values.map((value) => trimText(value)).filter(Boolean))];
}

function uniqueById<T extends { id: string }>(values: readonly T[]): T[] {
  const entries = new Map<string, T>();

  for (const value of values) {
    entries.set(value.id, value);
  }

  return [...entries.values()];
}
