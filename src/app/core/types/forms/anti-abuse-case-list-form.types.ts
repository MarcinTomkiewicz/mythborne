import { FormControl, FormGroup } from '@angular/forms';
import { AntiAbuseCaseSource } from '../../domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseCaseStatus,
  AntiAbuseCaseVerdict,
} from '../../domain/anti-abuse/anti-abuse-decision.model';

export type AntiAbuseCaseListFilterForm = FormGroup<{
  status: FormControl<AntiAbuseCaseStatus | null>;
  verdict: FormControl<AntiAbuseCaseVerdict | null>;
  source: FormControl<AntiAbuseCaseSource | null>;
  participantHeroId: FormControl<string | null>;
  participantUserId: FormControl<string | null>;
  createdFrom: FormControl<string | null>;
  createdTo: FormControl<string | null>;
}>;
