export interface AdminSelectOption {
  label: string;
  value: string | number;
}

export type AdminNavigationAccessPolicy =
  | 'adminShell'
  | 'selectedServerManagement'
  | 'selectedServerModeration'
  | 'selectedServerAntiAbuseTriage'
  | 'selectedServerTesting'
  | 'playerGameplay';

export interface AdminTagLink {
  label: string;
  routerLink: string;
  accessPolicy?: AdminNavigationAccessPolicy;
}

export interface AdminDashboardCard {
  legend: string;
  title: string;
  description: string;
  routerLink: string;
  accessPolicy: AdminNavigationAccessPolicy;
}
