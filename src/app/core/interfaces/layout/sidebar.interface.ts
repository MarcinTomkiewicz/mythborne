export type SidebarBadgeTone = 'muted' | 'success' | 'warn' | 'danger' | 'golden';
export type SidebarActionVariant = SidebarBadgeTone;
export type AccountEntrySidebarContextKey = 'account' | 'server' | 'hero';

export interface SidebarContextRowConfig<Key extends string = string> {
  readonly key: Key;
  readonly label: string;
}

export interface SidebarContextRow {
  readonly label: string;
  readonly value: string;
  readonly badgeLabel?: string | null;
  readonly badgeTone?: SidebarBadgeTone | null;
}

export interface SidebarContextAction {
  readonly label: string;
  readonly route: string;
  readonly actionVariant?: SidebarActionVariant;
}

export type SidebarNavItemKind = 'link' | 'button' | 'logout';

export interface SidebarNavItem {
  readonly kind: SidebarNavItemKind;
  readonly label?: string;
  readonly route?: string;
  readonly iconClass?: string | null;
  readonly iconText?: string | null;
  readonly badgeLabel?: string | null;
  readonly badgeTone?: SidebarBadgeTone | null;
  readonly disabled?: boolean;
  readonly exact?: boolean;
}

export interface SidebarNavGroup {
  readonly title: string;
  readonly items: readonly SidebarNavItem[];
}
