import { FormControl, FormGroup } from '@angular/forms';
import { AntiAbuseCaseStatus } from '../../domain/anti-abuse/anti-abuse-decision.model';

export type AntiAbuseCaseStatusTransitionForm = FormGroup<{
  status: FormControl<AntiAbuseCaseStatus | null>;
  statusReason: FormControl<string | null>;
}>;
