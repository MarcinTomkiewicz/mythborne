import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { supabase } from '../../../core/supabase/supabase';
import { IHeroStats } from '../../../core/interfaces/hero/i-hero-stats';
import { TABLES } from '../../../core/constants/tables.const';

@Injectable({
  providedIn: 'root'
})
export class Hero {

getHeroData() {
    return from(supabase.auth.getUser()).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) throw error ?? new Error('No user');
        return from(
          supabase.from(TABLES.hero).select('*').eq('id', data.user.id).single()
        );
      }),
      map(({ data, error }) => {
        if (error || !data) throw error ?? new Error('No hero');
        return data;
      })
    );
  }

  getHeroStats() {
    return from(supabase.auth.getUser()).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) throw error ?? new Error('No user');
        return from(
          supabase.from(TABLES.hero_stats)
            .select('stat_key, value')
            .eq('hero_id', data.user.id)
        );
      }),
      map(({ data, error }) => {
        if (error || !data) throw error ?? new Error('No stats');
        return data.reduce((acc, row) => {
          acc[row.stat_key as keyof IHeroStats] = row.value;
          return acc;
        }, {} as IHeroStats);
      })
    );
  }
}
