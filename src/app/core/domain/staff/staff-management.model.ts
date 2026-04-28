import { Database } from '../../types/database.types';
import { Row } from '../../types/supabase.types';

export type ServerStaffRoleKey = Database['public']['Enums']['server_staff_role'];
export type StaffGlobalRoleKey = Row<'roles'>['key'];

export interface StaffRoleDefinition {
  id: number;
  key: StaffGlobalRoleKey;
  name: string;
  description: string | null;
}

export interface StaffUserCandidate {
  userId: string;
  email: string;
  displayName: string;
  globalRoleKey: StaffGlobalRoleKey | null;
  existingStaffAssignmentId: string | null;
  existingStaffRole: ServerStaffRoleKey | null;
  hasHeroOnServer: boolean;
  hasStaffDisqualifyingHistory: boolean;
  isEligibleForServerStaff: boolean;
  eligibilityReason: string | null;
  eligibilityMessage: string;
}

export interface StaffUserAccount {
  id: string;
  email: string;
  name: string;
  roleId: number | null;
  photoUrl: string | null;
}

export interface StaffPermissionScope {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServerStaffAssignment {
  id: string;
  serverId: string;
  userId: string;
  role: ServerStaffRoleKey;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface ServerStaffAssignmentScope {
  id: string;
  staffAssignmentId: string;
  scopeKey: string;
  grantedByUserId: string | null;
  createdAt: string;
}

export interface ServerStaffAssignmentWithScopes extends ServerStaffAssignment {
  scopes: ServerStaffAssignmentScope[];
}

export interface AssignGlobalRoleInput {
  userId: string;
  roleKey: StaffGlobalRoleKey;
  reason: string;
}

export interface AssignServerStaffInput {
  serverId: string;
  userId: string;
  role: ServerStaffRoleKey;
  reason: string;
  notes: string | null;
}

export interface RevokeServerStaffInput {
  staffAssignmentId: string;
  reason: string;
}

export interface SetServerStaffPermissionScopesInput {
  staffAssignmentId: string;
  scopeKeys: string[];
  reason: string;
}
