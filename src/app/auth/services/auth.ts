import { inject, Injectable } from '@angular/core';
import { firstValueFrom, from, map, of, switchMap, tap } from 'rxjs';
import { TABLES } from '../../core/constants/tables.const';
import { IUserData } from '../../core/interfaces/i-user-data/i-user-data';
import { Insert } from '../../core/types/supabase.types';
import { AuthState } from './auth-state';
import { mapHero } from '../../core/domain/hero/hero.mapper';
import { Platform } from '../../core/services/platform/platform';
import { SupabaseClientService } from '../../core/services/supabase/supabase-client';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly authState = inject(AuthState);
  private readonly platform = inject(Platform);
  private initializationPromise: Promise<void> | null = null;

  initialize(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = firstValueFrom(this.initializeAuthState());
    }

    return this.initializationPromise;
  }

  initializeAuthState() {
    const authSource$ = this.platform.isServer
      ? from(this.supabase.auth.getUser()).pipe(
          map(({ data, error }) => ({
            error,
            user: data.user,
          }))
        )
      : from(this.supabase.auth.getSession()).pipe(
          map(({ data, error }) => ({
            error,
            user: data.session?.user ?? null,
          }))
        );

    return authSource$.pipe(
      switchMap(({ error, user }) => {
        if (error || !user) {
          this.authState.setUser(null);
          this.authState.setHero(null);
          return of(void 0);
        }

        this.authState.setUser(user);

        return from(
          this.supabase.from(TABLES.hero).select('*').eq('id', user.id).single()
        ).pipe(
          map(({ data: heroRow, error: heroError }) => {
            if (heroError || !heroRow) {
              this.authState.setHero(null);
              return;
            }

            this.authState.setHero(mapHero(heroRow));
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
