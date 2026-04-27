import { FormControl } from '@angular/forms';

export interface AuditLogFilterForm {
  actionTypeKey: FormControl<string | null>;
  entityTypeKey: FormControl<string | null>;
  serverId: FormControl<string | null>;
  actorUserId: FormControl<string | null>;
  actorHeroId: FormControl<string | null>;
  targetUserId: FormControl<string | null>;
  targetHeroId: FormControl<string | null>;
}
