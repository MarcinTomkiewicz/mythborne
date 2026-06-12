const SEMANTIC_ICON_CLASS_BY_KEY: Readonly<Record<string, string>> = {
  cash: 'pi pi-cash',
  drachma: 'pi pi-cash',
  health: 'pi pi-heart',
  heart: 'pi pi-heart',
  marble: 'pi pi-marble',
  materials: 'pi pi-marble',
  buff: 'pi pi-report-buff',
  combat: 'pi pi-report-combat',
  debuff: 'pi pi-report-debuff',
  exploration: 'pi pi-report-exploration',
  'report-buff': 'pi pi-report-buff',
  'report-combat': 'pi pi-report-combat',
  'report-debuff': 'pi pi-report-debuff',
  'report-exploration': 'pi pi-report-exploration',
  'report-resource': 'pi pi-report-resource',
  'spy': 'pi pi-report-spy',
  'report-trial': 'pi pi-report-trial',
  resource: 'pi pi-report-resource',
  trial: 'pi pi-trial',
  workforce: 'pi pi-workforce',
};

export function semanticIconClass(iconKey: string): string | null {
  const key = iconKey.trim();
  if (!key) {
    return null;
  }

  const iconClass = SEMANTIC_ICON_CLASS_BY_KEY[key] ?? null;

  return iconClass;
}

export function requiredSemanticIconClass(iconKey: string, field: string): string {
  const iconClass = semanticIconClass(iconKey);

  if (!iconClass) {
    throw new Error(`${field} has unsupported semantic icon key: ${iconKey}.`);
  }

  return iconClass;
}

export function semanticIconToneClass(
  tone: 'success' | 'danger' | 'warn' | 'info' | 'neutral',
): string {
  if (tone === 'success') {
    return 'success-text';
  }

  if (tone === 'danger') {
    return 'error-text';
  }

  if (tone === 'warn') {
    return 'warn-text';
  }

  if (tone === 'info') {
    return 'info-text';
  }

  return 'color-heading';
}
