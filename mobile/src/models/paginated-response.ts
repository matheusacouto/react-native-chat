export type PaginationParams = {
  limit?: number;
  cursor?: number | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
};
