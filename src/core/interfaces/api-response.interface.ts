export interface ApiResponse<T> {
  statusCode: number;
  message: string[];
  data?: T;
  error?: string,
}

export interface ApiResponsePaginated<T> extends ApiResponse<T> {
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
