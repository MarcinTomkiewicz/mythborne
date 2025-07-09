import { inject, Injectable } from '@angular/core';
import { filter, from, map, switchMap, take, throwError } from 'rxjs';

import { supabase } from '../../../core/supabase/supabase';
import { TABLES } from '../../../core/constants/tables.const';

import { IHeroStats } from '../../../core/interfaces/hero/i-hero-stats';
import { AuthState } from '../../../auth/services/auth-state';
import { mapHeroDerived } from '../../domain/hero/hero-derived.mapper';
import { toObservable } from '@angular/core/rxjs-interop';
import { User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class Hero {
  private readonly authState = inject(AuthState);

  private user$ = toObservable(this.authState.user);

  private get userIdOrThrow(): string {
    const user = this.authState.user();
    if (!user) throw new Error('[HeroService] No user in auth state');
    return user.id;
  }

  /**
   * Fetches base hero data (id, name, level, etc.)
   */
  getHeroData() {
    return this.user$.pipe(
      filter((user): user is User => !!user),
      take(1),
      switchMap((user) =>
        from(
          supabase.from(TABLES.hero).select('*').eq('id', user.id).single()
        ).pipe(
          map(({ data, error }) => {
            if (error || !data) throw error ?? new Error('No hero');
            return data;
          })
        )
      )
    );
  }

  /**
   * Fetches base stats like strength, agility, etc.
   */
  getHeroStats() {
    const id = this.userIdOrThrow;

    return from(
      supabase
        .from(TABLES.hero_stats)
        .select('stat_key, value')
        .eq('hero_id', id)
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) throw error ?? new Error('No stats found');

        return data.reduce((acc, row) => {
          acc[row.stat_key as keyof IHeroStats] = row.value;
          return acc;
        }, {} as IHeroStats);
      })
    );
  }

  /**
   * Fetches derived stats (like dmg, hp, crit, etc.)
   */
  getHeroDerived() {
    const id = this.userIdOrThrow;

    return from(
      supabase.from(TABLES.hero_derived).select('*').eq('hero_id', id).single()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) throw error ?? new Error('No derived stats');
        return mapHeroDerived(data);
      })
    );
  }
}
