export function absoluteBrowserUrl(pathOrUrl: string): string {
  return typeof window === 'undefined' || pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${window.location.origin}${pathOrUrl}`;
}

export async function copyTextToClipboard(value: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
