import { Combobox } from '@/components/common/combobox';
import { DateField } from '@/components/common/date-field';
import { Input } from '@/components/ui/input';
import { useActiveUserOptions, useConsultantOptions } from '@/features/crm/lookups';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { strings } from '@/constants/strings';
import { PROJECT_DEPARTMENTS } from '@/api/projects/project-enums';

import { PROJECT_STAGES } from './project-actions';
import type {
  ProjectsActiveClosedFilter,
  ProjectsDepartmentFilter,
  ProjectsListFilterState,
  ProjectsStageFilter,
  ProjectsTypeFilter,
} from './projects-list-filters';

interface ProjectsFilterBarProps {
  filters: ProjectsListFilterState;
  onChange: (next: ProjectsListFilterState) => void;
}

export function ProjectsFilterBar({ filters, onChange }: ProjectsFilterBarProps) {
  const consultantOptions = useConsultantOptions();
  const userOptions = useActiveUserOptions();

  const patch = <K extends keyof ProjectsListFilterState>(key: K, value: ProjectsListFilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <div className="space-y-2 sm:col-span-2 xl:col-span-2">
          <Label htmlFor="projects-search">{strings.projects.filterSearch}</Label>
          <Input
            id="projects-search"
            className="h-9 bg-background"
            placeholder={strings.projects.searchPlaceholder}
            value={filters.q}
            onChange={(e) => patch('q', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{strings.projects.filterType}</Label>
          <Select
            value={filters.type}
            onValueChange={(v) => patch('type', v as ProjectsTypeFilter)}
          >
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder={strings.projects.filterType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{strings.common.all}</SelectItem>
              <SelectItem value="Tender">Tender</SelectItem>
              <SelectItem value="In Hand">In Hand</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{strings.projects.filterProjectStatus}</Label>
          <Select
            value={filters.stage}
            onValueChange={(v) => patch('stage', v as ProjectsStageFilter)}
          >
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder={strings.projects.filterProjectStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{strings.common.all}</SelectItem>
              {PROJECT_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{strings.projects.filterActiveClosed}</Label>
          <Select
            value={filters.activeClosed}
            onValueChange={(v) => patch('activeClosed', v as ProjectsActiveClosedFilter)}
          >
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder={strings.projects.filterActiveClosed} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{strings.common.all}</SelectItem>
              <SelectItem value="active_only">{strings.projects.filterActiveOnly}</SelectItem>
              <SelectItem value="archived">{strings.common.archived}</SelectItem>
              <SelectItem value="execution_open">{strings.projects.filterExecutionOpen}</SelectItem>
              <SelectItem value="execution_closed">{strings.projects.filterExecutionClosed}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{strings.projects.filterConsultant}</Label>
          <Combobox
            className="h-9 bg-background"
            options={consultantOptions}
            value={filters.consultantId}
            onChange={(v) => patch('consultantId', v)}
            placeholder={strings.projects.filterConsultant}
            clearable
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="projects-country">{strings.projects.filterCountry}</Label>
          <Input
            id="projects-country"
            className="h-9 bg-background"
            placeholder={strings.projects.filterCountry}
            value={filters.country}
            onChange={(e) => patch('country', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{strings.projects.filterSalesperson}</Label>
          <Combobox
            className="h-9 bg-background"
            options={userOptions}
            value={filters.salesPersonId}
            onChange={(v) => patch('salesPersonId', v)}
            placeholder={strings.projects.filterSalesperson}
            clearable
          />
        </div>
        <div className="space-y-2">
          <Label>{strings.projects.department}</Label>
          <Select
            value={filters.department}
            onValueChange={(v) => patch('department', v as ProjectsDepartmentFilter)}
          >
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder={strings.projects.department} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{strings.common.all}</SelectItem>
              {PROJECT_DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="projects-from">{strings.projects.filterFrom}</Label>
          <DateField
            id="projects-from"
            className="h-9 bg-background"
            value={filters.createdFrom}
            onChange={(e) => patch('createdFrom', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="projects-to">{strings.projects.filterTo}</Label>
          <DateField
            id="projects-to"
            className="h-9 bg-background"
            value={filters.createdTo}
            onChange={(e) => patch('createdTo', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
