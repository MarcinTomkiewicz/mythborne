import { ResourceDisplayDefinition } from '../types/resource-display.types';
import { resourceTypeLabel } from '../utils/resource-display';

export const CORE_RESOURCE_DISPLAY_DEFINITIONS: readonly ResourceDisplayDefinition[] = [
  { type: 'drachma', label: resourceTypeLabel('drachma') },
  { type: 'materials', label: resourceTypeLabel('materials') },
  { type: 'workforce', label: resourceTypeLabel('workforce') },
];
