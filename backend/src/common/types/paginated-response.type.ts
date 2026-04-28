export type PaginatedResponse<T> = {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
};
