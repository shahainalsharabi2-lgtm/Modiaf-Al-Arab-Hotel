/** Matches Volo.Abp.Application.Dtos.PagedResultDto<T> from the API. */
export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}

export function extractPagedItems<T>(
  result: (PagedResultDto<T> & { Items?: T[] }) | null | undefined,
): T[] {
  if (!result) {
    return [];
  }
  return result.items ?? result.Items ?? [];
}
