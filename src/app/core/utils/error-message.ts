export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const message =
      typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : null;
    const details =
      typeof (error as { details?: unknown }).details === 'string'
        ? (error as { details: string }).details
        : null;
    const hint =
      typeof (error as { hint?: unknown }).hint === 'string'
        ? (error as { hint: string }).hint
        : null;
    const code =
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : null;

    const parts = [message, details, hint].filter(
      (value): value is string => !!value && value.trim().length > 0
    );

    if (parts.length > 0) {
      return code ? `[${code}] ${parts.join(' ')}` : parts.join(' ');
    }
  }

  return fallback;
}
