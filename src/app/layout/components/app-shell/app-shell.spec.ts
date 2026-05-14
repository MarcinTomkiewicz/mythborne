import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { AppShell } from './app-shell';
import { ActiveServer } from '../../../core/services/server/active-server';
import { signal } from '@angular/core';

describe('AppShell', () => {
  it('does not show game shell chrome on the account entry route', () => {
    const fixture = createFixture('/auth/server-entry');

    expect(fixture.componentInstance.shouldShowShellChrome()).toBeFalse();
  });

  it('keeps game shell chrome for hero routes', () => {
    const fixture = createFixture('/hero/dashboard');

    expect(fixture.componentInstance.shouldShowShellChrome()).toBeTrue();
  });
});

function createFixture(url: string): ComponentFixture<AppShell> {
  const access = signal({ isMembershipBlocked: false });
  const selectedServer = signal(null);

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [AppShell],
    providers: [
      {
        provide: Router,
        useValue: {
          url,
          events: of(new NavigationEnd(1, url, url)),
        },
      },
      {
        provide: ActiveServer,
        useValue: {
          access: access.asReadonly(),
          selectedServer: selectedServer.asReadonly(),
        },
      },
    ],
  });
  TestBed.overrideComponent(AppShell, {
    set: { template: '' },
  });

  return TestBed.createComponent(AppShell);
}
