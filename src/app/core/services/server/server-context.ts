import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, of, tap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import {
  GameServerOrderColumn,
  USER_ROLE_SELECT,
} from '../../enums/server-context.enum';
import {
  SelectedGameServer,
  ServerAccessContext,
  ServerContextRows,
} from '../../interfaces/server/server-context.interface';
import { Row } from '../../types/supabase.types';
import {
  emptyServerAccessContext,
  resolveServerContext,
  toAccessContext,
} from '../../utils/server-context';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ServerContext {
  private readonly authState = inject(AuthState);
  private readonly backend = inject(Backend);
  private readonly _servers = signal<SelectedGameServer[]>([]);
  private readonly _selectedServer = signal<SelectedGameServer | null>(null);
  private readonly _access = signal<ServerAccessContext>(
    emptyServerAccessContext(),
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

    return this.loadContextRows(user?.id ?? null).pipe(
      map((rows) =>
        resolveServerContext(rows, user?.id ?? null, this._selectedServer()),
      ),
      tap({
        next: ({ selectedServers, selectedServer, access }) => {
          this._servers.set(selectedServers);
          this._selectedServer.set(selectedServer);
          this._access.set(access);
          this._isLoading.set(false);
        },
        error: (error: unknown) => {
          this._error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load server context.',
          );
          this._isLoading.set(false);
        },
      }),
      map(({ selectedServers }) => selectedServers),
    );
  }

  selectServer(serverId: string): boolean {
    const server =
      this._servers().find((entry) => entry.id === serverId) ?? null;

    if (!server) {
      return false;
    }

    this._selectedServer.set(server);
    this._access.set(
      toAccessContext(
        this.authState.user()?.id ?? null,
        this._access().globalRoleKey,
        server,
      ),
    );

    return true;
  }

  private loadContextRows(
    userId: string | null,
  ): Observable<ServerContextRows> {
    return forkJoin({
      servers: this.loadServers(),
      userData: this.loadUserData(userId),
      roles: this.loadRoles(userId),
      memberships: this.loadMemberships(userId),
      staffAssignments: this.loadStaffAssignments(userId),
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

  private loadUserData(
    userId: string | null,
  ): Observable<Array<Pick<Row<'user_data'>, 'role_id'>>> {
    if (!userId) {
      return of([]);
    }

    return this.backend.getAll<Pick<Row<'user_data'>, 'role_id'>>({
      table: TABLES.user_data,
      select: USER_ROLE_SELECT,
      filters: { id: { operator: FilterOperator.EQ, value: userId } },
      range: { from: 0, to: 0 },
      camelCase: false,
    });
  }

  private loadRoles(userId: string | null): Observable<Row<'roles'>[]> {
    return userId
      ? this.backend.getAll<Row<'roles'>>({
          table: TABLES.roles,
          camelCase: false,
        })
      : of([]);
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
