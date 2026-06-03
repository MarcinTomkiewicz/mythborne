import { Injectable, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import type { IHero } from '../../domain/hero/hero.model';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly _user = signal<User | null>(null);
  private readonly _hero = signal<IHero | null>(null);

  readonly user = this._user.asReadonly();
  readonly hero = this._hero.asReadonly();

  setUser(user: User | null) {
    this._user.set(user);
  }

  setHero(hero: IHero | null) {
    this._hero.set(hero);
  }

  isLoggedIn = () => !!this._user();
}
