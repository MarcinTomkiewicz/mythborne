import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('keeps account entry routes on the lightweight public shell', () => {
    const fixture = createFixture('/auth/server-entry');

    expect(fixture.componentInstance.currentUrl()).toBe('/auth/server-entry');
  });
});

function createFixture(url: string): ComponentFixture<AppShell> {
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
    ],
  });
  TestBed.overrideComponent(AppShell, {
    set: { template: '' },
  });

  return TestBed.createComponent(AppShell);
}
