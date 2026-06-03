import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { RPC } from '../../constants/rpc.const';
import { FilterOperator } from '../../enums/filter-operators';
import {
  GameServerOrderColumn,
  GLOBAL_ROLE_PRIORITY,
  GlobalRoleKey,
} from '../../enums/active-server.enum';
import { StartFlowServerAvailability } from '../../domain/start-flow/start-flow.model';
import {
  SelectedGameServer,
  ServerAccessState,
  ActiveServerRows,
} from '../../interfaces/server/active-server.interface';
import { Row } from '../../types/supabase.types';
import {
  emptyServerAccessState,
  resolveActiveServerState,
  resolveActiveServerStateFromStartFlowAvailability,
  toAccessState,
} from '../../utils/active-server';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { Platform } from '../platform/platform';

const SELECTED_SERVER_STORAGE_KEY_PREFIX = 'mythsworn.selectedServerId';

@Injectable({ providedIn: 'root' })
export class ActiveServer {
  private readonly authState = inject(AuthState);
  private readonly backend = inject(Backend);
  private readonly platform = inject(Platform);
  private readonly _servers = signal<SelectedGameServer[]>([]);
  private readonly _selectedServer = signal<SelectedGameServer | null>(null);
  private readonly _access = signal<ServerAccessState>(
    emptyServerAccessState(),
  );
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly servers = this._servers.asReadonly();
  readonly selectedServer = this._selectedServer.asReadonly();
  readonly access = this._access.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadAccessibleServers(): Observable<SelectedGameServer[]> {
    const user = this.authState.user();

    this._isLoading.set(true);
    this._error.set(null);

    return this.loadActiveServerRows(user?.id ?? null).pipe(
      map((rows) =>
        resolveActiveServerState(
          rows,
          user?.id ?? null,
          this._selectedServer(),
          this.readStoredSelectedServerId(user?.id ?? null),
        ),
      ),
      tap({
        next: ({ selectedServers, selectedServer, access }) => {
          this._servers.set(selectedServers);
          this._selectedServer.set(selectedServer);
          this._access.set(access);
          this.persistSelectedServer(user?.id ?? null, selectedServer?.id ?? null);
          this._isLoading.set(false);
        },
        error: (error: unknown) => {
          this._error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load active server state.',
          );
          this._isLoading.set(false);
        },
      }),
      map(({ selectedServers }) => selectedServers),
    );
  }

  loadAccessibleServersFromStartFlowAvailability(
    availability: StartFlowServerAvailability[],
  ): SelectedGameServer[] {
    const userId = this.authState.user()?.id ?? null;
    const { selectedServers, selectedServer, access } =
      resolveActiveServerStateFromStartFlowAvailability(
        availability,
        userId,
        this._access().globalRoleKey,
        this._selectedServer(),
        this.readStoredSelectedServerId(userId),
      );

    this._servers.set(selectedServers);
    this._selectedServer.set(selectedServer);
    this._access.set(access);
    this.persistSelectedServer(userId, selectedServer?.id ?? null);
    this._isLoading.set(false);
    this._error.set(null);

    return selectedServers;
  }

  selectServer(serverId: string): boolean {
    const server =
      this._servers().find((entry) => entry.id === serverId) ?? null;

    if (!server) {
      return false;
    }

    this._selectedServer.set(server);
    this._access.set(
      toAccessState(
        this.authState.user()?.id ?? null,
        this._access().globalRoleKey,
        server,
      ),
    );
    this.persistSelectedServer(this.authState.user()?.id ?? null, server.id);

    return true;
  }

  private selectedServerStorageKey(userId: string | null): string | null {
    return userId ? `${SELECTED_SERVER_STORAGE_KEY_PREFIX}.${userId}` : null;
  }

  private readStoredSelectedServerId(userId: string | null): string | null {
    const key = this.selectedServerStorageKey(userId);

    if (!key || !this.platform.isBrowser) {
      return null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private persistSelectedServer(userId: string | null, serverId: string | null): void {
    const key = this.selectedServerStorageKey(userId);

    if (!key || !this.platform.isBrowser) {
      return;
    }

    try {
      if (serverId) {
        window.localStorage.setItem(key, serverId);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage is best-effort; server/read-model access remains authoritative.
    }
  }

  private loadActiveServerRows(
    userId: string | null,
  ): Observable<ActiveServerRows> {
    return forkJoin({
      servers: this.loadServers(),
      memberships: this.loadMemberships(userId),
      staffAssignments: this.loadStaffAssignments(userId),
      globalRoleKey: this.loadGlobalRoleKey(userId),
    });
  }

  private loadServers(): Observable<Row<'game_servers'>[]> {
    return this.backend.getAll<Row<'game_servers'>>({
      table: TABLES.game_servers,
      orderBy: [
        { column: GameServerOrderColumn.Kind },
        { column: GameServerOrderColumn.Status },
        { column: GameServerOrderColumn.Name },
      ],
      camelCase: false,
    });
  }

  private loadGlobalRoleKey(userId: string | null): Observable<ActiveServerRows['globalRoleKey']> {
    if (!userId) {
      return of(null);
    }

    return forkJoin(
      GLOBAL_ROLE_PRIORITY.map((roleKey) =>
        this.hasGlobalRole(roleKey).pipe(map((hasRole) => ({ roleKey, hasRole }))),
      ),
    ).pipe(
      map((entries) => entries.find((entry) => entry.hasRole)?.roleKey ?? null),
    );
  }

  private hasGlobalRole(roleKey: GlobalRoleKey): Observable<boolean> {
    return this.backend
      .rpc<boolean>(RPC.has_global_role, { required_keys: [roleKey] })
      .pipe(
        map((hasRole) => hasRole ?? false),
        catchError(() => of(false)),
      );
  }

  private loadMemberships(
    userId: string | null,
  ): Observable<Row<'server_memberships'>[]> {
    return userId
      ? this.backend.getAll<Row<'server_memberships'>>({
          table: TABLES.server_memberships,
          filters: { userId: { operator: FilterOperator.EQ, value: userId } },
          camelCase: false,
        })
      : of([]);
  }

  private loadStaffAssignments(
    userId: string | null,
  ): Observable<Row<'server_staff_assignments'>[]> {
    return userId
      ? this.backend.getAll<Row<'server_staff_assignments'>>({
          table: TABLES.server_staff_assignments,
          filters: { userId: { operator: FilterOperator.EQ, value: userId } },
          camelCase: false,
        })
      : of([]);
  }
}
