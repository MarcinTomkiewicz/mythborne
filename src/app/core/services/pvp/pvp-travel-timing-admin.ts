import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { FormulaService } from '../formula/formula';

export const PVP_TRAVEL_TIMING_FORMULA_TARGET_KEYS = [
  'pvp_attack_travel_time_seconds',
  'pvp_spy_travel_time_seconds',
  'pvp_manual_fight_window_seconds',
] as const;

@Injectable({ providedIn: 'root' })
export class PvpTravelTimingAdmin {
  private readonly formulas = inject(FormulaService);

  getData(): Observable<FormulaAdminData> {
    return this.formulas.getAdminData().pipe(map((data) => data));
  }
}
