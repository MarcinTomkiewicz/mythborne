import { Injectable } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { AuditLogFilterForm } from '../../types/forms/audit-log-filter-form.types';

@Injectable({ providedIn: 'root' })
export class AuditLogFilterFormFactory {
  constructor(private readonly fb: NonNullableFormBuilder) {}

  createFilterForm() {
    return this.fb.group<AuditLogFilterForm>({
      actionTypeKey: this.fb.control<string | null>(null),
      entityTypeKey: this.fb.control<string | null>(null),
      serverId: this.fb.control<string | null>(null),
      actorUserId: this.fb.control<string | null>(null),
      actorHeroId: this.fb.control<string | null>(null),
      targetUserId: this.fb.control<string | null>(null),
      targetHeroId: this.fb.control<string | null>(null),
    });
  }
}
