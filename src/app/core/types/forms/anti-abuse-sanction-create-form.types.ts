import { FormControl, FormGroup } from '@angular/forms';

export type AntiAbuseSanctionCreateForm = FormGroup<{
  sanctionTypeKey: FormControl<string | null>;
  reason: FormControl<string | null>;
  targetHeroId: FormControl<string | null>;
  targetUserId: FormControl<string | null>;
  sourceHeroId: FormControl<string | null>;
  durationDays: FormControl<number | null>;
  amountCharacterPoints: FormControl<number | null>;
  operatorNotes: FormControl<string | null>;
}>;
