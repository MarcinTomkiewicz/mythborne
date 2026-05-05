import { Json } from '../../types/database.types';

export interface NotificationHookDiagnostic {
  producerKey: string;
  adminLabelPl: string;
  adminDescriptionPl: string;
  workflowKey: string;
  notificationTypeKeys: string[];
  notificationTypesJson: Json;
  missingNotificationTypeKeys: string[];
  inactiveNotificationTypeKeys: string[];
  producerFunctionNames: string[];
  producerFunctionsJson: Json;
  missingProducerFunctionNames: string[];
  diagnosticsStatus: string;
  diagnosticsStatusLabelPl: string;
  diagnosticsSummaryPl: string;
  helperTextPl: string;
  blockerHelpTextPl: string | null;
  isExplicitNonProducer: boolean;
  metadataJson: Json;
  producerKind: string;
  producerTableExists: boolean;
  producerTableName: string | null;
  producerTriggerName: string | null;
  isActive: boolean;
  isExpected: boolean;
}
