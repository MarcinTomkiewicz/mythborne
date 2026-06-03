import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, shareReplay, switchMap, take, tap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { IUserData } from '../../interfaces/i-user-data/i-user-data';
import { AccountRegistrationResult } from '../../interfaces/auth/account-registration-result.interface';
import { Insert } from '../../types/supabase.types';
import { Platform } from '../platform/platform';
import { SupabaseClientService } from '../supabase/supabase-client';
import { AuthState } from './auth-state';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly backend = inject(Backend);
  private readonly authState = inject(AuthState);
  private readonly activeHero = inject(ActiveHero);
  private readonly platform = inject(Platform);
  private initialization$: Observable<void> | null = null;
  private authListenerRegistered = false;

  initialize(): Observable<void> {
    this.registerAuthListener();

    if (!this.initialization$) {
      this.initialization$ = this.initializeAuthState().pipe(
        take(1),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.initialization$;
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
      map(({ error, user }) => {
        if (error || !user) {
          this.authState.setUser(null);
          this.activeHero.clear();
          return;
        }

        this.authState.setUser(user);
      }),
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
            this.activeHero.clear();

            return of(loginData.user);
          })
        );
      })
    );
  }

  registerAccount(email: string, password: string): Observable<AccountRegistrationResult> {
    return from(this.supabase.auth.signUp({ email, password })).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) {
          throw error ?? new Error('User not created');
        }

        this.activeHero.clear();

        if (!data.session) {
          return of({
            userId: data.user.id,
            email: data.user.email ?? email,
            isSignedIn: false,
            requiresEmailConfirmation: true,
          });
        }

        this.authState.setUser(data.user);

        return of({
          userId: data.user.id,
          email: data.user.email ?? email,
          isSignedIn: true,
          requiresEmailConfirmation: false,
        });
      }),
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

        return of(user);
      })
    );
  }

  logout() {
    return from(this.supabase.auth.signOut()).pipe(
      tap(({ error }) => {
        if (error) {
          throw error;
        }

        this.authState.setUser(null);
        this.activeHero.clear();
      }),
      map(() => void 0),
    );
  }
}
