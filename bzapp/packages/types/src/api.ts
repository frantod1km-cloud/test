export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
  total?: number;
}
