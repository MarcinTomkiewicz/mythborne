import { inject, Injectable } from '@angular/core';
import { firstValueFrom, from, map, of, switchMap, tap } from 'rxjs';
import { mapHero } from '../../domain/hero/hero.mapper';
import { TABLES } from '../../constants/tables.const';
import { IUserData } from '../../interfaces/i-user-data/i-user-data';
import { Insert } from '../../types/supabase.types';
import { Platform } from '../platform/platform';
import { SupabaseClientService } from '../supabase/supabase-client';
import { AuthState } from './auth-state';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly authState = inject(AuthState);
  private readonly platform = inject(Platform);
  private initializationPromise: Promise<void> | null = null;
  private authListenerRegistered = false;

  initialize(): Promise<void> {
    this.registerAuthListener();

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

  private registerAuthListener() {
    if (!this.platform.isBrowser || this.authListenerRegistered) {
      return;
    }

    this.supabase.auth.onAuthStateChange(() => {
      void firstValueFrom(this.initializeAuthState());
    });

    this.authListenerRegistered = true;
  }

  register(email: string, password: string) {
    return from(this.supabase.auth.signUp({ email, password })).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) {
          throw error ?? new Error('User not created');
        }

        return from(
          this.supabase.auth.signInWithPassword({ email, password })
        ).pipe(
          switchMap(({ data: loginData, error: loginError }) => {
            if (loginError || !loginData.session) {
              throw loginError ?? new Error('Auto-login failed after registration');
            }

            this.authState.setUser(loginData.user);
            this.authState.setHero(null);

            return of(loginData.user);
          })
        );
      })
    );
  }

  saveUserData(userId: string, userData: Omit<IUserData, 'id'>) {
    const payload: Insert<'user_data'> = {
      id: userId,
      email: userData.email,
      name: userData.name,
      birthday: userData.birthday,
      city: userData.city,
      photo_url: userData.photo_url ?? null,
      bio: userData.bio ?? null,
      facebook: userData.facebook ?? null,
      twitter: userData.twitter ?? null,
      linkedin: userData.linkedin ?? null,
      instagram: userData.instagram ?? null,
      role_id: userData.role_id ?? 3,
      updated_at: new Date().toISOString(),
    };

    return from(
      this.supabase.from(TABLES.user_data).upsert([payload], { onConflict: 'id' })
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }

        return userId;
      })
    );
  }

  login(email: string, password: string) {
    return from(
      this.supabase.auth.signInWithPassword({ email, password })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.session) {
          throw error ?? new Error('Login failed');
        }

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
            if (heroError && heroError.code !== 'PGRST116') {
              throw heroError;
            }

            if (!heroRow) {
              this.authState.setHero(null);
              return user;
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
