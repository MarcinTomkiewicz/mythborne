import { FormControl, FormGroup } from '@angular/forms';
import { AntiAbuseCaseVerdict } from '../../domain/anti-abuse/anti-abuse-decision.model';

export type AntiAbuseCaseVerdictForm = FormGroup<{
  verdict: FormControl<AntiAbuseCaseVerdict | null>;
  verdictReason: FormControl<string | null>;
  sanctionRequired: FormControl<boolean | null>;
  noSanctionReason: FormControl<string | null>;
}>;
