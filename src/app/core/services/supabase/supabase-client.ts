import { isPlatformBrowser } from '@angular/common';
import {
  inject,
  Injectable,
  PLATFORM_ID,
  REQUEST,
  RESPONSE_INIT,
} from '@angular/core';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';
import { Database } from '../../supabase/database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  private browserClient: SupabaseClient<Database> | null = null;
  private serverClient: SupabaseClient<Database> | null = null;

  get client(): SupabaseClient<Database> {
    return isPlatformBrowser(this.platformId)
      ? this.getBrowserClient()
      : this.getServerClient();
  }

  private getBrowserClient(): SupabaseClient<Database> {
    if (!this.browserClient) {
      this.browserClient = createBrowserClient<Database>(
        environment.supabaseUrl,
        environment.supabaseKey,
        {
          isSingleton: true,
        }
      );
    }

    return this.browserClient;
  }

  private getServerClient(): SupabaseClient<Database> {
    if (!this.serverClient) {
      this.serverClient = createServerClient<Database>(
        environment.supabaseUrl,
        environment.supabaseKey,
        {
          cookies: {
            getAll: () => this.getRequestCookies(),
            setAll: (cookiesToSet, headersToSet) =>
              this.setResponseCookies(cookiesToSet, headersToSet),
          },
        }
      );
    }

    return this.serverClient;
  }

  private getRequestCookies(): { name: string; value: string }[] {
    const cookieHeader = this.request?.headers.get('cookie');

    if (!cookieHeader) {
      return [];
    }

    return cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf('=');
        const name = separatorIndex >= 0 ? part.slice(0, separatorIndex) : part;
        const value = separatorIndex >= 0 ? part.slice(separatorIndex + 1) : '';

        return {
          name,
          value: this.safeDecodeCookieValue(value),
        };
      });
  }

  private setResponseCookies(
    cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[],
    headersToSet: Record<string, string>
  ): void {
    if (!this.responseInit) {
      return;
    }

    const headers = new Headers(this.responseInit.headers ?? undefined);

    Object.entries(headersToSet).forEach(([key, value]) => {
      headers.set(key, value);
    });

    cookiesToSet.forEach(({ name, value, options }) => {
      headers.append('Set-Cookie', this.serializeCookie(name, value, options));
    });

    this.responseInit.headers = headers;
  }

  private safeDecodeCookieValue(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  private serializeCookie(
    name: string,
    value: string,
    options: Record<string, unknown>
  ): string {
    const segments = [`${name}=${encodeURIComponent(value)}`];
    const path = typeof options['path'] === 'string' ? options['path'] : '/';

    segments.push(`Path=${path}`);

    if (typeof options['maxAge'] === 'number') {
      segments.push(`Max-Age=${Math.floor(options['maxAge'])}`);
    }

    if (options['expires'] instanceof Date) {
      segments.push(`Expires=${options['expires'].toUTCString()}`);
    }

    if (typeof options['domain'] === 'string') {
      segments.push(`Domain=${options['domain']}`);
    }

    if (options['secure']) {
      segments.push('Secure');
    }

    if (options['httpOnly']) {
      segments.push('HttpOnly');
    }

    if (options['partitioned']) {
      segments.push('Partitioned');
    }

    const sameSite = options['sameSite'];

    if (sameSite === true) {
      segments.push('SameSite=Strict');
    } else if (typeof sameSite === 'string') {
      segments.push(`SameSite=${this.normalizeSameSite(sameSite)}`);
    }

    return segments.join('; ');
  }

  private normalizeSameSite(value: string): string {
    switch (value.toLowerCase()) {
      case 'lax':
        return 'Lax';
      case 'strict':
        return 'Strict';
      case 'none':
        return 'None';
      default:
        return value;
    }
  }
}
