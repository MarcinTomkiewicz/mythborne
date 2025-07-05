import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { TABLES } from '../../core/constants/tables.const';
import { IUserData } from '../../core/interfaces/i-user-data/i-user-data';
import { supabase } from '../../core/supabase/supabase';
import { Insert } from '../../core/types/supabase.types';

@Injectable({ providedIn: 'root' })
export class Auth {
  private supabase = supabase;

  register(
    email: string,
    password: string,
    userData: Omit<IUserData, 'id'>
  ) {
    return from(
      this.supabase.auth.signUp({ email, password })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) throw error ?? new Error('User not created');

        const id = data.user.id;
        const payload: Insert<'user_data'> = { ...userData, id };

        return from(
          this.supabase
            .from(TABLES.user_data)
            .insert([payload])
            .select()
            .single()
        ).pipe(
          switchMap(({ data: userRow, error: insertError }) => {
            if (insertError || !userRow) {
              throw insertError ?? new Error('User profile not inserted');
            }

            // Opcjonalnie — ponowny login (jeśli nie jesteśmy zalogowani automatycznie)
            return from(
              this.supabase.auth.signInWithPassword({ email, password })
            ).pipe(
              map(({ data: loginData, error: loginError }) => {
                if (loginError || !loginData.session) {
                  throw loginError ?? new Error('Auto-login failed after registration');
                }
                return userRow; // zwracamy user_data rekord
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
      map(({ data, error }) => {
        if (error || !data.session) throw error ?? new Error('Login failed');
        return data.user;
      })
    );
  }

  logout() {
    return from(this.supabase.auth.signOut());
  }
}
