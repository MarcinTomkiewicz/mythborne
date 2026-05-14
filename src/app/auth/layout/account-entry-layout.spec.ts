import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Auth } from '../../core/services/auth/auth';
import { AuthState } from '../../core/services/auth/auth-state';
import { ActiveHero } from '../../core/services/hero/active-hero';
import { ActiveServer } from '../../core/services/server/active-server';
import { AccountEntryLayout } from './account-entry-layout';

describe('AccountEntryLayout', () => {
  it('renders account shell chrome for auth account routes without game navigation', () => {
    const fixture = createFixture();

    fixture.detectChanges();

    const text = textContent(fixture);

    const brand = fixture.debugElement.query(By.css('header img[alt="Mythsworn"]'));

    expect(brand).toBeTruthy();
    expect(brand.nativeElement.getAttribute('src')).toBe('/images/banner.png');
    expect(text).toContain('Zalogowano jako');
    expect(text).toContain('player@example.com');
    expect(text).toContain('Wybrany serwer');
    expect(text).toContain('Sandbox');
    expect(text).toContain('Bohater do wejścia');
    expect(text).toContain('Ariadne');
    expect(text).toContain('Wejdź do gry');
    expect(text).toContain('Stwórz bohatera');
    expect(text).toContain('Ustawienia konta');
    expect(text).toContain('Powiadomienia');
    expect(text).toContain('Wyloguj');
    expect(text).not.toContain('Armory');
    expect(text).not.toContain('World State');
  });
});

function createFixture(): ComponentFixture<AccountEntryLayout> {
  const selectedServer = signal({ id: 'server-1', name: 'Sandbox' });
  const activeHeroState = signal({
    hero: { id: 'hero-1', name: 'Ariadne' },
  });

  TestBed.configureTestingModule({
    imports: [AccountEntryLayout],
    providers: [
      provideRouter([]),
      {
        provide: Auth,
        useValue: jasmine.createSpyObj<Auth>('Auth', {
          logout: of(void 0),
        }),
      },
      {
        provide: AuthState,
        useValue: {
          user: signal({ id: 'user-1', email: 'player@example.com' }).asReadonly(),
        },
      },
      {
        provide: ActiveHero,
        useValue: {
          state: activeHeroState.asReadonly(),
        },
      },
      {
        provide: ActiveServer,
        useValue: {
          selectedServer: selectedServer.asReadonly(),
        },
      },
    ],
  });
  return TestBed.createComponent(AccountEntryLayout);
}

function textContent(fixture: ComponentFixture<AccountEntryLayout>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}
