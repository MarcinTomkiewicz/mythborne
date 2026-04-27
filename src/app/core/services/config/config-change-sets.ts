import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  ConfigChangeEntryOrderColumn,
  ConfigChangeFieldPath,
  ConfigChangeKindKey,
  ConfigChangeSetOrderColumn,
  ConfigChangeStatusKey,
} from '../../enums/config-governance.enum';
import { FilterOperator } from '../../enums/filter-operators';
import {
  ConfigChangeEntry,
  ConfigChangeEntryRow,
  ConfigChangeSet,
  ConfigChangeSetRow,
  ConfigChangeVisibility,
  ConfigDefinition,
} from '../../types/config-governance.types';
import { Json } from '../../types/database.types';
import {
  mapConfigChangeEntry,
  mapConfigChangeSet,
} from '../../utils/config-governance';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ConfigChangeSets {
  private readonly backend = inject(Backend);

  getChangeSets(): Observable<ConfigChangeSet[]> {
    return this.backend
      .getAll<ConfigChangeSetRow>({
        table: TABLES.config_change_sets,
        orderBy: [
          { column: ConfigChangeSetOrderColumn.UpdatedAt, ascending: false },
          { column: ConfigChangeSetOrderColumn.CreatedAt, ascending: false },
          { column: ConfigChangeSetOrderColumn.Title },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapConfigChangeSet)));
  }

  getChangeEntries(changeSetId: string): Observable<ConfigChangeEntry[]> {
    return this.backend
      .getAll<ConfigChangeEntryRow>({
        table: TABLES.config_change_entries,
        filters: {
          changeSetId: { operator: FilterOperator.EQ, value: changeSetId },
        },
        orderBy: [{ column: ConfigChangeEntryOrderColumn.CreatedAt }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapConfigChangeEntry)));
  }

  createDraftChangeSet(input: {
    title: string;
    reason: string;
    changelogVisibility: ConfigChangeVisibility;
    changelogTitle: string | null;
    changelogBody: string | null;
    requestedBy: string | null;
  }): Observable<ConfigChangeSet> {
    return this.backend.create<ConfigChangeSet>(TABLES.config_change_sets, {
      title: input.title,
      reason: input.reason,
      changelogVisibility: input.changelogVisibility,
      changelogTitle: input.changelogTitle,
      changelogBody: input.changelogBody,
      requestedBy: input.requestedBy,
      status: ConfigChangeStatusKey.Draft,
    });
  }

  createConfigValueChangeEntry(input: {
    changeSetId: string;
    changeKind:
      | ConfigChangeKindKey.GlobalValueChange
      | ConfigChangeKindKey.ServerValueChange;
    definition: ConfigDefinition;
    serverId: string | null;
    oldValue: Json | null;
    newValue: Json;
    oldSource: string | null;
    oldSourceLabel: string | null;
  }): Observable<ConfigChangeEntry[]> {
    return this.backend
      .create<object>(TABLES.config_change_entries, {
        changeSetId: input.changeSetId,
        changeKind: input.changeKind,
        configDefinitionId: input.definition.id,
        serverId: input.serverId,
        fieldPath: ConfigChangeFieldPath.ValueJson,
        oldValueJson: input.oldValue,
        newValueJson: input.newValue,
        metadataJson: {
          configKey: input.definition.key,
          valueType: input.definition.valueType,
          oldSource: input.oldSource,
          oldSourceLabel: input.oldSourceLabel,
        },
      })
      .pipe(switchMap(() => this.getChangeEntries(input.changeSetId)));
  }
}
