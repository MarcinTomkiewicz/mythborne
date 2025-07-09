import { inject, Injectable } from '@angular/core';
import { from, map, of, switchMap, tap } from 'rxjs';
import { TABLES } from '../../core/constants/tables.const';
import { IUserData } from '../../core/interfaces/i-user-data/i-user-data';
import { supabase } from '../../core/supabase/supabase';
import { Insert } from '../../core/types/supabase.types';
import { AuthState } from './auth-state';
import { mapHero } from '../../core/domain/hero/hero.mapper';

@Injectable({ providedIn: 'root' })
export class Auth {
  private supabase = supabase;
  private authState = inject(AuthState);

  initializeAuthState() {
  return from(this.supabase.auth.getSession()).pipe(
    switchMap(({ data, error }) => {
      if (error || !data.session) {
        this.authState.setUser(null);
        this.authState.setHero(null);
        return of(null);
      }

      const user = data.session.user;
      this.authState.setUser(user);

      return from(
        this.supabase
          .from(TABLES.hero)
          .select('*')
          .eq('id', user.id)
          .single()
      ).pipe(
        map(({ data: heroRow, error: heroError }) => {
          if (heroError || !heroRow) {
            console.warn('[Auth] Hero not found for logged in user.');
            this.authState.setHero(null);
            return null;
          }

          this.authState.setHero(mapHero(heroRow));
          return heroRow;
        })
      );
    })
  );
}


  register(email: string, password: string, userData: Omit<IUserData, 'id'>) {
    return from(this.supabase.auth.signUp({ email, password })).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) throw error ?? new Error('User not created');

        return from(
          this.supabase.auth.signInWithPassword({ email, password })
        ).pipe(
          switchMap(({ data: loginData, error: loginError }) => {
            if (loginError || !loginData.session) {
              throw loginError ?? new Error('Auto-login failed after registration');
            }

            const id = loginData.user.id;
            const payload: Insert<'hero'> = { ...userData, id };

            return from(
              this.supabase
                .from(TABLES.hero)
                .insert([payload])
                .select()
                .single()
            ).pipe(
              map(({ data: heroRow, error: insertError }) => {
                if (insertError || !heroRow) {
                  throw insertError ?? new Error('Hero profile not inserted');
                }

                this.authState.setUser(loginData.user);
                this.authState.setHero(mapHero(heroRow));
                return heroRow;
              })
            );
          })
        );
      })
    );
  }

  login(email: string, password: string) {
    return from(
      this.supabase.auth.signInWithPassword({ email, password })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.session) throw error ?? new Error('Login failed');

        const user = data.user;
        this.authState.setUser(user);

        return from(
          this.supabase
            .from(TABLES.hero)
            .select('*')
            .eq('id', user.id)
            .single()
        ).pipe(
          map(({ data: heroRow, error: heroError }) => {
            if (heroError || !heroRow) {
              throw heroError ?? new Error('No hero data found');
            }

            this.authState.setHero(mapHero(heroRow));
            return user;
          })
        );
      })
    );
  }

  logout() {
    return from(this.supabase.auth.signOut()).pipe(
      tap(() => {
        this.authState.setUser(null);
        this.authState.setHero(null);
      })
    );
  }
}
