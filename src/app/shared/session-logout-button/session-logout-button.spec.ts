import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Auth } from '../../core/services/auth/auth';
import { SessionLogoutButton } from './session-logout-button';

describe('SessionLogoutButton', () => {
  let auth: jasmine.SpyObj<Auth>;
  let fixture: ComponentFixture<SessionLogoutButton>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<Auth>('Auth', ['logout']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    auth.logout.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [SessionLogoutButton],
      providers: [
        { provide: Auth, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    fixture = TestBed.createComponent(SessionLogoutButton);
    fixture.detectChanges();
  });

  it('renders a visible Polish logout action', () => {
    expect(textContent(fixture)).toContain('Wyloguj');
  });

  it('uses the existing auth logout path and routes to login', () => {
    fixture.componentInstance.logout();

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/auth/login');
  });

  it('shows a visible error when logout fails', () => {
    auth.logout.and.returnValue(
      throwError(() => new Error('Session could not be closed.')),
    );

    fixture.componentInstance.logout();
    fixture.detectChanges();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(textContent(fixture)).toContain('Session could not be closed.');
  });
});

function textContent(fixture: ComponentFixture<SessionLogoutButton>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}
