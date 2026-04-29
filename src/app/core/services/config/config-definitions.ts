import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { ConfigDefinitionOrderColumn } from '../../enums/config-governance.enum';
import { FilterOperator } from '../../enums/filter-operators';
import {
  ConfigDefinition,
  ConfigDefinitionExplainability,
  ConfigDefinitionExplainabilityRow,
  ConfigDefinitionRow,
  ConfigManagedEntityType,
} from '../../types/config-governance.types';
import {
  mapConfigDefinition,
  mapConfigDefinitionExplainability,
} from '../../utils/config-governance';
import { RPC } from '../../constants/rpc.const';
import { GetConfigDefinitionExplainabilityRpcArgs } from '../../types/config-governance-rpc.types';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ConfigDefinitions {
  private readonly backend = inject(Backend);

  getDefinitions(): Observable<ConfigDefinition[]> {
    return this.loadDefinitions();
  }

  getActiveDefinitions(): Observable<ConfigDefinition[]> {
    return this.loadDefinitions({
      isActive: { operator: FilterOperator.EQ, value: true },
    });
  }

  getDefinitionsByManagedEntity(
    managedEntityType: ConfigManagedEntityType,
  ): Observable<ConfigDefinition[]> {
    return this.loadDefinitions({
      managedEntityType: { operator: FilterOperator.EQ, value: managedEntityType },
    });
  }

  getActiveDefinitionsByManagedEntityKey(
    managedEntityKey: string,
  ): Observable<ConfigDefinition[]> {
    return this.loadDefinitions({
      isActive: { operator: FilterOperator.EQ, value: true },
      managedEntityKey: { operator: FilterOperator.EQ, value: managedEntityKey },
    });
  }

  getDefinitionExplainability(input: {
    serverId: string | null;
    managedEntityKey?: string | null;
    includeInactive?: boolean;
  }): Observable<ConfigDefinitionExplainability[]> {
    const args: GetConfigDefinitionExplainabilityRpcArgs = {
      p_include_inactive: input.includeInactive ?? true,
    };

    if (input.serverId) {
      args.p_server_id = input.serverId;
    }

    if (input.managedEntityKey) {
      args.p_managed_entity_key = input.managedEntityKey;
    }

    return this.backend
      .rpc<ConfigDefinitionExplainabilityRow[]>(
        RPC.get_config_definition_explainability,
        args,
      )
      .pipe(map((rows) => rows.map(mapConfigDefinitionExplainability)));
  }

  private loadDefinitions(filters?: Parameters<Backend['getAll']>[0]['filters']): Observable<ConfigDefinition[]> {
    return this.backend
      .getAll<ConfigDefinitionRow>({
        table: TABLES.config_definitions,
        filters,
        orderBy: [
          { column: ConfigDefinitionOrderColumn.GovernanceScope },
          { column: ConfigDefinitionOrderColumn.ManagedEntityType },
          { column: ConfigDefinitionOrderColumn.SortOrder },
          { column: ConfigDefinitionOrderColumn.Label },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapConfigDefinition)));
  }
}
