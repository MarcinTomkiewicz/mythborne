import { inject, Injectable } from '@angular/core';
import { from, map, of, switchMap, take, tap } from 'rxjs';
import { mapHero } from '../../domain/hero/hero.mapper';
import { TABLES } from '../../constants/tables.const';
import { IUserData } from '../../interfaces/i-user-data/i-user-data';
import { Insert, Row } from '../../types/supabase.types';
import { Platform } from '../platform/platform';
import { SupabaseClientService } from '../supabase/supabase-client';
import { AuthState } from './auth-state';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly backend = inject(Backend);
  private readonly authState = inject(AuthState);
  private readonly platform = inject(Platform);
  private initializationStarted = false;
  private authListenerRegistered = false;

  initialize() {
    this.registerAuthListener();

    if (!this.initializationStarted) {
      this.initializationStarted = true;
      return this.initializeAuthState().pipe(take(1));
    }

    return of(void 0);
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

        return this.getHeroRow(user.id).pipe(
          map((heroRow) => {
            if (!heroRow) {
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
      this.initializeAuthState().pipe(take(1)).subscribe();
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

    return this.backend
      .upsert<Insert<'user_data'>>(TABLES.user_data, payload, 'id')
      .pipe(map(() => userId));
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

        return this.getHeroRow(user.id).pipe(
          map((heroRow) => {
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

  private getHeroRow(userId: string) {
    return this.backend
      .getAll<Row<'hero'>>({
        table: TABLES.hero,
        filters: { userId: { operator: FilterOperator.EQ, value: userId } },
        range: { from: 0, to: 0 },
        camelCase: false,
      })
      .pipe(map((rows) => rows[0] ?? null));
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
