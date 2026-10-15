import { getProject, listProjects } from '@/api/projects/projects.api';
import type { ListProjectsParams, ProjectDetail } from '@/api/projects/projects.types';

const PAGE_LIMIT = 100;
const DETAIL_CONCURRENCY = 5;

export async function fetchAllProjectIds(params: ListProjectsParams): Promise<string[]> {
  const ids: string[] = [];
  let page = 1;

  for (;;) {
    const res = await listProjects({ ...params, page, limit: PAGE_LIMIT });
    for (const project of res.items) ids.push(project.id);
    if (page * res.limit >= res.total) break;
    page += 1;
  }

  return ids;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    for (;;) {
      const i = index;
      index += 1;
      if (i >= items.length) return;
      results[i] = await fn(items[i] as T);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function fetchProjectDetails(ids: string[]): Promise<ProjectDetail[]> {
  if (ids.length === 0) return [];
  return mapWithConcurrency(ids, (id) => getProject(id), DETAIL_CONCURRENCY);
}
