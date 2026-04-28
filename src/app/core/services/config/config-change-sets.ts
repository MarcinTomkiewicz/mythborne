import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  ConfigChangeEntryOrderColumn,
  ConfigChangeSetOrderColumn,
} from '../../enums/config-governance.enum';
import { FilterOperator } from '../../enums/filter-operators';
import {
  ConfigChangeEntry,
  ConfigChangeEntryRow,
  ConfigChangeSet,
  ConfigChangeSetRow,
  CreateConfigChangeSetDraftInput,
  CreateConfigValueChangeEntryInput,
} from '../../types/config-governance.types';
import {
  mapConfigChangeEntry,
  mapConfigChangeSet,
} from '../../utils/config-governance';
import {
  toCreateConfigChangeSetDraftRpcArgs,
  toCreateConfigValueChangeEntryRpcArgs,
} from '../../utils/config-governance-rpc';
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

  createDraftChangeSet(
    input: CreateConfigChangeSetDraftInput,
  ): Observable<ConfigChangeSet> {
    return this.backend
      .rpc<ConfigChangeSetRow>(
        RPC.create_config_change_set_draft,
        toCreateConfigChangeSetDraftRpcArgs(input),
      )
      .pipe(map(mapConfigChangeSet));
  }

  createConfigValueChangeEntry(
    input: CreateConfigValueChangeEntryInput,
  ): Observable<ConfigChangeEntry[]> {
    return this.backend
      .rpc<ConfigChangeEntryRow>(
        RPC.create_config_value_change_entry,
        toCreateConfigValueChangeEntryRpcArgs(input),
      )
      .pipe(switchMap(() => this.getChangeEntries(input.changeSetId)));
  }
}
