const SEMANTIC_ICON_CLASS_BY_KEY: Readonly<Record<string, string>> = {
  cash: 'pi pi-cash',
  drachma: 'pi pi-cash',
  health: 'pi pi-heart',
  heart: 'pi pi-heart',
  marble: 'pi pi-marble',
  materials: 'pi pi-marble',
  trial: 'pi pi-trial',
  workforce: 'pi pi-workforce',
};
const warnedUnknownSemanticIconKeys = new Set<string>();

export function semanticIconClass(iconKey: string): string | null {
  const key = iconKey.trim();

  if (!key) {
    return null;
  }

  const iconClass = SEMANTIC_ICON_CLASS_BY_KEY[key] ?? null;

  if (!iconClass) {
    warnUnknownSemanticIconKey(key);
  }

  return iconClass;
}

export function requiredSemanticIconClass(iconKey: string, field: string): string {
  const iconClass = semanticIconClass(iconKey);

  if (!iconClass) {
    throw new Error(`${field} has unsupported semantic icon key: ${iconKey}.`);
  }

  return iconClass;
}

export function semanticIconToneClass(tone: 'success' | 'danger'): string {
  if (tone === 'success') {
    return 'success-text';
  }

  return 'error-text';
}

function warnUnknownSemanticIconKey(iconKey: string): void {
  if (warnedUnknownSemanticIconKeys.has(iconKey)) {
    return;
  }

  warnedUnknownSemanticIconKeys.add(iconKey);
  console.warn('Unsupported semantic icon key.', iconKey);
}
