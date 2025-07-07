import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { TABLES } from '../../core/constants/tables.const';
import { IUserData } from '../../core/interfaces/i-user-data/i-user-data';
import { supabase } from '../../core/supabase/supabase';
import { Insert } from '../../core/types/supabase.types';

@Injectable({ providedIn: 'root' })
export class Auth {
  private supabase = supabase;

  register(email: string, password: string, userData: Omit<IUserData, 'id'>) {
    return from(this.supabase.auth.signUp({ email, password })).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) throw error ?? new Error('User not created');

        // 👇 Logujemy od razu po rejestracji
        return from(
          this.supabase.auth.signInWithPassword({ email, password })
        ).pipe(
          switchMap(({ data: loginData, error: loginError }) => {
            if (loginError || !loginData.session) {
              throw (
                loginError ?? new Error('Auto-login failed after registration')
              );
            }

            const id = loginData.user.id; // teraz mamy poprawne UID

            const payload: Insert<'user_data'> = { ...userData, id };

            console.log(
              '[auth.register] ✅ Logged in, inserting user_data:',
              payload
            );

            return from(
              this.supabase
                .from(TABLES.user_data)
                .insert([payload])
                .select()
                .single()
            ).pipe(
              map(({ data: userRow, error: insertError }) => {
                if (insertError || !userRow) {
                  throw insertError ?? new Error('User profile not inserted');
                }

                return userRow;
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
