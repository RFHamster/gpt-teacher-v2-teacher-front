export type ApiError = {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type Result<T, E = ApiError> =
  | { ok: true; data: T }
  | { ok: false; error: E };
