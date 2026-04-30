import { Component, input } from '@angular/core';
import { AuditLogEntry } from '../../../core/domain/audit/audit-log.model';
import { displayValue } from '../../../core/utils/display-value';
import { CollapsedJsonPreview } from '../../../shared/json-preview/collapsed-json-preview';

@Component({
  selector: 'app-anti-abuse-case-audit-section',
  standalone: true,
  imports: [CollapsedJsonPreview],
  templateUrl: './anti-abuse-case-audit-section.html',
})
export class AntiAbuseCaseAuditSection {
  readonly auditLogs = input.required<AuditLogEntry[]>();

  auditActionLabel(log: AuditLogEntry): string {
    return log.actionType?.label ?? log.actionTypeKey;
  }

  auditEntityLabel(log: AuditLogEntry): string {
    return log.entityType?.label ?? log.entityTypeKey;
  }

  value(value: string | null | undefined): string {
    return displayValue(value);
  }
}
