import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { ConfigDefinitionOrderColumn } from '../../enums/config-governance.enum';
import { FilterOperator } from '../../enums/filter-operators';
import {
  ConfigDefinition,
  ConfigDefinitionRow,
  ConfigManagedEntityType,
} from '../../types/config-governance.types';
import { mapConfigDefinition } from '../../utils/config-governance';
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
