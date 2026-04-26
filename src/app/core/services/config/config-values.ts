import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  ConfigValueOrderColumn,
  ConfigValueStatusKey,
} from '../../enums/config-governance.enum';
import { FilterOperator } from '../../enums/filter-operators';
import {
  ConfigDefinition,
  EffectiveConfigValue,
  GlobalConfigValue,
  GlobalConfigValueRow,
  ServerConfigValue,
  ServerConfigValueRow,
} from '../../types/config-governance.types';
import {
  mapGlobalConfigValue,
  mapServerConfigValue,
  resolveEffectiveConfigValues,
} from '../../utils/config-governance';
import { Backend } from '../backend/backend';
import { ActiveServer } from '../server/active-server';

@Injectable({ providedIn: 'root' })
export class ConfigValues {
  private readonly backend = inject(Backend);
  private readonly activeServer = inject(ActiveServer);

  getActiveGlobalValues(): Observable<GlobalConfigValue[]> {
    return this.backend
      .getAll<GlobalConfigValueRow>({
        table: TABLES.global_config_values,
        filters: {
          status: { operator: FilterOperator.EQ, value: ConfigValueStatusKey.Active },
        },
        orderBy: { column: ConfigValueOrderColumn.Version, ascending: false },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapGlobalConfigValue)));
  }

  getSelectedServerValues(): Observable<ServerConfigValue[]> {
    return this.resolveSelectedServerId().pipe(
      switchMap((serverId) => (serverId ? this.getServerValues(serverId) : of([]))),
    );
  }

  getServerValues(serverId: string): Observable<ServerConfigValue[]> {
    return this.backend
      .getAll<ServerConfigValueRow>({
        table: TABLES.server_config_values,
        filters: {
          serverId: { operator: FilterOperator.EQ, value: serverId },
        },
        orderBy: { column: ConfigValueOrderColumn.UpdatedAt, ascending: false },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapServerConfigValue)));
  }

  getEffectiveValuesForSelectedServer(
    definitions: readonly ConfigDefinition[],
  ): Observable<Map<string, EffectiveConfigValue>> {
    return this.resolveSelectedServerId().pipe(
      switchMap((serverId) =>
        this.getEffectiveValues(definitions, serverId),
      ),
    );
  }

  getEffectiveValues(
    definitions: readonly ConfigDefinition[],
    serverId: string | null,
  ): Observable<Map<string, EffectiveConfigValue>> {
    return this.getActiveGlobalValues().pipe(
      switchMap((globalValues) =>
        (serverId ? this.getServerValues(serverId) : of([])).pipe(
          map((serverValues) =>
            resolveEffectiveConfigValues(definitions, globalValues, serverValues),
          ),
        ),
      ),
    );
  }

  private resolveSelectedServerId(): Observable<string | null> {
    const selectedServerId = this.activeServer.selectedServer()?.id ?? null;

    if (selectedServerId) {
      return of(selectedServerId);
    }

    return this.activeServer.loadAccessibleServers().pipe(
      map(() => this.activeServer.selectedServer()?.id ?? null),
    );
  }
}
