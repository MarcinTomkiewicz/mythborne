import { Component, input } from '@angular/core';
import { formatAuditJsonPreview } from '../../core/utils/audit-log';

@Component({
  selector: 'app-collapsed-json-preview',
  standalone: true,
  templateUrl: './collapsed-json-preview.html',
})
export class CollapsedJsonPreview {
  readonly label = input.required<string>();
  readonly value = input.required<unknown>();

  jsonPreview(): string {
    return formatAuditJsonPreview(this.value());
  }
}
