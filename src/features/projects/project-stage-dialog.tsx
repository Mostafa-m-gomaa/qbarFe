import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { Project, ProjectStage } from '@/api/projects/projects.types';
import { StatusChip } from '@/components/common/status-chip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { strings } from '@/constants/strings';
import { getErrorMessage } from '@/lib/get-error-message';

import { PROJECT_STAGES } from './project-actions';
import { useSetProjectStage } from './use-projects';

interface ProjectStageDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectStageDialog({ project, open, onOpenChange }: ProjectStageDialogProps) {
  const [stage, setStage] = useState<ProjectStage>(project.stage);
  const mutation = useSetProjectStage();

  useEffect(() => {
    if (open) setStage(project.stage);
  }, [open, project.stage]);

  const submit = () => {
    mutation.mutate(
      { id: project.id, body: { stage } },
      {
        onSuccess: () => {
          toast.success(strings.projects.stageChanged);
          onOpenChange(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{strings.projects.stageDialogTitle}</DialogTitle>
          <DialogDescription>{project.name}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{strings.projects.stageCurrent}</p>
            <StatusChip kind="projectStage" value={project.stage} />
          </div>
          <ArrowRight className="mt-4 size-4 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{strings.projects.stageNew}</p>
            <StatusChip kind="projectStage" value={stage} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stage-select">{strings.projects.stageNew}</Label>
          <Select value={stage} onValueChange={(v) => setStage(v as ProjectStage)}>
            <SelectTrigger id="stage-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={mutation.isPending || stage === project.stage}>
            {mutation.isPending ? strings.common.saving : strings.common.confirm}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {strings.common.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
