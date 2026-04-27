import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  ConfigChangeSet,
  ConfigChangeSetRow,
} from '../../types/config-governance.types';
import { mapConfigChangeSet } from '../../utils/config-governance';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ConfigChangeSetWorkflow {
  private readonly backend = inject(Backend);

  markReady(changeSetId: string): Observable<ConfigChangeSet> {
    return this.backend
      .rpc<ConfigChangeSetRow>(RPC.mark_config_change_set_ready, {
        p_change_set_id: changeSetId,
      })
      .pipe(map(mapConfigChangeSet));
  }

  apply(changeSetId: string): Observable<ConfigChangeSet> {
    return this.backend
      .rpc<ConfigChangeSetRow>(RPC.apply_config_change_set, {
        p_change_set_id: changeSetId,
      })
      .pipe(map(mapConfigChangeSet));
  }

  cancel(
    changeSetId: string,
    cancelledReason: string,
  ): Observable<ConfigChangeSet> {
    return this.backend
      .rpc<ConfigChangeSetRow>(RPC.cancel_config_change_set, {
        p_change_set_id: changeSetId,
        p_cancelled_reason: cancelledReason,
      })
      .pipe(map(mapConfigChangeSet));
  }
}
