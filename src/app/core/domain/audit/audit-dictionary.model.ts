import { Database } from '../../types/database.types';

export type AuditSeverity = Database['public']['Enums']['audit_severity'];

export interface AuditActionType {
  id: string;
  key: string;
  label: string;
  category: string;
  description: string | null;
  defaultSeverity: AuditSeverity;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntityType {
  id: string;
  key: string;
  label: string;
  category: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditDictionaryData {
  actionTypes: AuditActionType[];
  entityTypes: AuditEntityType[];
}
