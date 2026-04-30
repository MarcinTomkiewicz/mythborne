import { FormControl, FormGroup } from '@angular/forms';
import {
  DirectTradeHeroTarget,
  DirectTradeItemTarget,
} from '../../domain/trade/direct-trade.model';

export type DirectTradeCreateForm = FormGroup<{
  target: FormControl<DirectTradeHeroTarget | null>;
  characterPoints: FormControl<number | null>;
  items: FormControl<DirectTradeItemTarget[]>;
  description: FormControl<string | null>;
}>;

export type DirectTradeRespondForm = FormGroup<{
  offerId: FormControl<string | null>;
  characterPoints: FormControl<number | null>;
  items: FormControl<DirectTradeItemTarget[]>;
  description: FormControl<string | null>;
}>;
