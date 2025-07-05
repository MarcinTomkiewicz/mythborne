import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { SupabaseService } from '../supabase/supabase';
import { TableName } from '../../types/supabase.types';
import { TABLES } from '../../constants/tables.const';


@Injectable({ providedIn: 'root' })
export class StatsService {
  private supabase = inject(SupabaseService);

  getStats(): Observable<IStat[]> {
    return this.supabase.getAll<'stats'>(TABLES.stats, {
      orderBy: { column: 'order', ascending: true },
    });
  }
}
