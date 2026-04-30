import { FormControl, FormGroup } from '@angular/forms';
import { AntiAbuseSanctionStatus } from '../../domain/anti-abuse/anti-abuse-sanction.model';

export type AntiAbuseSanctionStatusForm = FormGroup<{
  sanctionId: FormControl<string | null>;
  status: FormControl<AntiAbuseSanctionStatus | null>;
  statusReason: FormControl<string | null>;
}>;
