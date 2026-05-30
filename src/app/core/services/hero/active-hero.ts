import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { mapHero } from '../../domain/hero/hero.mapper';
import {
  AccountEntryActiveHeroContext,
  StartFlowHeroCreationResult,
} from '../../domain/start-flow/start-flow.model';
import { HeroOrderColumn } from '../../enums/active-hero.enum';
import { FilterOperator } from '../../enums/filter-operators';
import {
  ActiveHeroState,
  RequiredActiveHeroState,
} from '../../interfaces/hero/active-hero.interface';
import { Row } from '../../types/supabase.types';
import { IHero } from '../../types/hero.types';
import { jsonRecord, optionalNumber, optionalText, read } from '../../utils/json-read';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { Platform } from '../platform/platform';
import { ActiveServer } from '../server/active-server';

const SELECTED_HERO_STORAGE_KEY_PREFIX = 'mythsworn.selectedHeroId';

@Injectable({ providedIn: 'root' })
export class ActiveHero {
  private readonly authState = inject(AuthState);
  private readonly backend = inject(Backend);
  private readonly activeServer = inject(ActiveServer);
  private readonly platform = inject(Platform);
  private readonly _state = signal<ActiveHeroState | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly state = this._state.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadActiveHero(): Observable<ActiveHeroState | null> {
    const userId = this.authState.user()?.id ?? null;

    if (!userId) {
      this.clear();
      return of(null);
    }

    this._isLoading.set(true);
    this._error.set(null);

    return this.resolveSelectedServerId().pipe(
      switchMap((serverId) => {
        if (!serverId) {
          return of(null);
        }

        return this.loadHeroRows(userId, serverId).pipe(
          map((heroRows) =>
            this.resolveState(
              userId,
              heroRows,
              this.readStoredSelectedHeroId(userId, serverId),
            ),
          ),
        );
      }),
      tap({
        next: (state) => {
          this._state.set(state);
          this.authState.setHero(state?.hero ?? null);
          this._isLoading.set(false);
        },
        error: (error: unknown) => {
          this._error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load active hero state.',
          );
          this._isLoading.set(false);
        },
      }),
    );
  }

  selectHero(heroId: string): Observable<ActiveHeroState> {
    const userId = this.authState.user()?.id ?? null;

    if (!userId) {
      return throwError(() => new Error('No authenticated user for hero selection.'));
    }

    this._isLoading.set(true);
    this._error.set(null);

    return this.resolveSelectedServerId().pipe(
      switchMap((serverId) =>
        serverId
          ? this.loadHeroRows(userId, serverId)
          : throwError(() => new Error('No selected server for hero selection.')),
      ),
      map((heroRows) => {
        const heroRow = heroRows.find((row) => row.id === heroId) ?? null;

        if (!heroRow) {
          throw new Error('Selected hero is not available on this server.');
        }

        return this.toState(userId, heroRow);
      }),
      tap({
        next: (state) => {
          this._state.set(state);
          this.authState.setHero(state.hero);
          this.persistSelectedHero(userId, state.serverId, state.heroId);
          this._isLoading.set(false);
        },
        error: (error: unknown) => {
          this._error.set(
            error instanceof Error
              ? error.message
              : 'Failed to select active hero.',
          );
          this._isLoading.set(false);
        },
      }),
    );
  }

  requireActiveHero(): Observable<RequiredActiveHeroState> {
    const state = this._state();

    if (state?.hero && state.heroRow && state.heroId) {
      return of({
        ...state,
        hero: state.hero,
        heroId: state.heroId,
        heroRow: state.heroRow,
      });
    }

    return this.loadActiveHero().pipe(
      map((state) => {
        if (!state?.hero || !state.heroRow || !state.heroId) {
          throw new Error('No active hero for selected server.');
        }

        return {
          ...state,
          hero: state.hero,
          heroId: state.heroId,
          heroRow: state.heroRow,
        };
      }),
    );
  }

  clear() {
    this._state.set(null);
    this._error.set(null);
    this._isLoading.set(false);
    this.authState.setHero(null);
  }

  applyAccountEntryActiveHeroContext(
    context: AccountEntryActiveHeroContext,
  ): ActiveHeroState {
    const userId = this.authState.user()?.id ?? null;

    if (!userId) {
      throw new Error('No authenticated user for account-entry hero selection.');
    }

    const server = this.activeServer.selectedServer();

    if (!server || server.id !== context.serverId) {
      throw new Error('Selected server does not match account-entry hero context.');
    }

    const activeHero = jsonRecord(context.activeHeroJson);
    const hero: IHero = {
      id: context.heroId,
      userId: optionalText(read(activeHero, 'userId', 'user_id')) ?? userId,
      serverId: context.serverId,
      name: optionalText(read(activeHero, 'name', 'heroName', 'hero_name')) ?? context.heroName,
      level: optionalNumber(read(activeHero, 'level', 'heroLevel', 'hero_level')) ?? context.heroLevel,
      rank: optionalNumber(read(activeHero, 'rank')) ?? 1,
      experience: optionalNumber(read(activeHero, 'experience')) ?? 0,
      totalExperienceEarned:
        optionalNumber(read(activeHero, 'totalExperienceEarned', 'total_experience_earned')) ?? 0,
      characterPoints:
        optionalNumber(read(activeHero, 'characterPoints', 'character_points')) ?? 0,
      totalCharacterPointsEarned:
        optionalNumber(
          read(activeHero, 'totalCharacterPointsEarned', 'total_character_points_earned'),
        ) ?? 0,
      originId: optionalText(read(activeHero, 'originId', 'origin_id')),
      estateId: optionalText(read(activeHero, 'estateId', 'estate_id')) ?? context.estateId,
      profilePicture: optionalText(read(activeHero, 'profilePicture', 'profile_picture')),
      createdAt: optionalText(read(activeHero, 'createdAt', 'created_at')) ?? context.createdAt,
    };
    const heroRow = {
      id: hero.id,
      user_id: hero.userId,
      server_id: hero.serverId,
      name: hero.name,
      level: hero.level,
      rank: hero.rank,
      experience: hero.experience,
      total_experience_earned: hero.totalExperienceEarned,
      character_points: hero.characterPoints,
      total_character_points_earned: hero.totalCharacterPointsEarned,
      origin_id: hero.originId,
      estate_id: hero.estateId,
      profile_picture: hero.profilePicture,
      created_at: hero.createdAt,
    } as Row<'hero'>;
    const state: ActiveHeroState = {
      userId,
      serverId: context.serverId,
      heroId: context.heroId,
      server,
      hero,
      heroRow,
    };

    this._state.set(state);
    this.authState.setHero(hero);
    this.persistSelectedHero(userId, context.serverId, context.heroId);
    this._error.set(null);
    this._isLoading.set(false);

    return state;
  }

  applyStartFlowHeroCreationResult(
    result: StartFlowHeroCreationResult,
  ): ActiveHeroState {
    const userId = this.authState.user()?.id ?? null;

    if (!userId) {
      throw new Error('No authenticated user for created hero selection.');
    }

    const server = this.activeServer.selectedServer();

    if (!server || server.id !== result.serverId) {
      throw new Error('Selected server does not match created hero result.');
    }

    const hero: IHero = {
      id: result.heroId,
      userId,
      serverId: result.serverId,
      name: result.heroName,
      level: 1,
      rank: result.prestigeRankNumber,
      experience: 0,
      totalExperienceEarned: 0,
      characterPoints: result.characterPointsBalance,
      totalCharacterPointsEarned: result.characterPointsBalance,
      originId: result.originId,
      estateId: result.estateId,
      profilePicture: null,
      createdAt: null,
    };
    const heroRow = {
      id: hero.id,
      user_id: hero.userId,
      server_id: hero.serverId,
      name: hero.name,
      level: hero.level,
      rank: hero.rank,
      experience: hero.experience,
      total_experience_earned: hero.totalExperienceEarned,
      character_points: hero.characterPoints,
      total_character_points_earned: hero.totalCharacterPointsEarned,
      origin_id: hero.originId,
      estate_id: hero.estateId,
      profile_picture: hero.profilePicture,
      created_at: hero.createdAt,
    } as Row<'hero'>;
    const state: ActiveHeroState = {
      userId,
      serverId: result.serverId,
      heroId: result.heroId,
      server,
      hero,
      heroRow,
    };

    this._state.set(state);
    this.authState.setHero(hero);
    this.persistSelectedHero(userId, result.serverId, result.heroId);
    this._error.set(null);
    this._isLoading.set(false);

    return state;
  }

  private resolveSelectedServerId(): Observable<string | null> {
    return of(this.activeServer.selectedServer()?.id ?? null);
  }

  private loadHeroRows(
    userId: string,
    serverId: string,
  ): Observable<Row<'hero'>[]> {
    return this.backend.getAll<Row<'hero'>>({
      table: TABLES.hero,
      filters: {
        userId: { operator: FilterOperator.EQ, value: userId },
        serverId: { operator: FilterOperator.EQ, value: serverId },
      },
      orderBy: { column: HeroOrderColumn.CreatedAt },
      camelCase: false,
    });
  }

  private resolveState(
    userId: string,
    heroRows: Row<'hero'>[],
    preferredHeroId: string | null,
  ): ActiveHeroState | null {
    const server = this.activeServer.selectedServer();

    if (!server) {
      return null;
    }

    const currentHero = this._state()?.heroRow ?? null;
    const heroRow =
      heroRows.find((row) => row.id === currentHero?.id) ??
      heroRows.find((row) => row.id === preferredHeroId) ??
      heroRows[0] ??
      null;
    const hero = heroRow ? mapHero(heroRow) : null;

    return {
      userId,
      serverId: server.id,
      heroId: heroRow?.id ?? null,
      server,
      hero,
      heroRow,
    };
  }

  private toState(
    userId: string,
    heroRow: Row<'hero'>,
  ): ActiveHeroState {
    const server = this.activeServer.selectedServer();

    if (!server) {
      throw new Error('No selected server for active hero selection.');
    }

    const hero = mapHero(heroRow);

    return {
      userId,
      serverId: server.id,
      heroId: heroRow.id,
      server,
      hero,
      heroRow,
    };
  }

  private selectedHeroStorageKey(
    userId: string | null,
    serverId: string | null,
  ): string | null {
    return userId && serverId
      ? `${SELECTED_HERO_STORAGE_KEY_PREFIX}.${userId}.${serverId}`
      : null;
  }

  private readStoredSelectedHeroId(
    userId: string | null,
    serverId: string | null,
  ): string | null {
    const key = this.selectedHeroStorageKey(userId, serverId);

    if (!key || !this.platform.isBrowser) {
      return null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private persistSelectedHero(
    userId: string | null,
    serverId: string | null,
    heroId: string | null,
  ): void {
    const key = this.selectedHeroStorageKey(userId, serverId);

    if (!key || !this.platform.isBrowser) {
      return;
    }

    try {
      if (heroId) {
        window.localStorage.setItem(key, heroId);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage is best-effort; selected server hero rows remain authoritative.
    }
  }
}
