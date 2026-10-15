import type { ProjectCloseWarning } from '@/api/projects/projects.types';
import { scaledToMetersString } from '@/features/manufacturing/manufacturing.utils';

export function pendingProductionMetersFromWarnings(
  warnings: ProjectCloseWarning[] | undefined,
): string | null {
  const warning = warnings?.find((w) => w.code === 'pending_production');
  if (!warning?.quantityScaled) return null;
  return scaledToMetersString(warning.quantityScaled);
}
