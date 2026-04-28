import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { AuditWriteRequest } from '../../domain/audit/audit-write.model';
import { toWriteAuditLogRpcArgs } from '../../utils/audit-write';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class AuditWriter {
  private readonly backend = inject(Backend);

  write(request: AuditWriteRequest): Observable<string> {
    return this.backend.rpc<string>(
      RPC.write_audit_log,
      toWriteAuditLogRpcArgs(request),
    );
  }
}
