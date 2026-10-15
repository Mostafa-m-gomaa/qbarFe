import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { strings } from '@/constants/strings';
import { useRoles } from '@/features/roles/use-roles';

interface RoleMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/** Checkbox list of roles sourced from GET /roles (never hardcoded). */
export function RoleMultiSelect({ value, onChange }: RoleMultiSelectProps) {
  const { data: roles, isLoading, isError, error, refetch } = useRoles();

  const toggle = (id: string, checked: boolean) => {
    onChange(checked ? [...value, id] : value.filter((roleId) => roleId !== id));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (!roles || roles.length === 0) {
    return <EmptyState title={strings.roles.emptyTitle} description={strings.roles.emptyHint} />;
  }

  return (
    <div className="max-h-48 space-y-1 overflow-auto rounded-md border border-border p-2">
      {roles.map((role) => {
        const checked = value.includes(role.id);
        return (
          <label
            key={role.id}
            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(state) => toggle(role.id, state === true)}
            />
            <span className="flex-1 text-sm">{role.name}</span>
            {role.description && (
              <span className="text-xs text-muted-foreground">{role.description}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}
