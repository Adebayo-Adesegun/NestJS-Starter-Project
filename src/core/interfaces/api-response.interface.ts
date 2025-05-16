export interface ApiBaseResponse<T> {
  statusCode: number;
  message: string | string[];
  data?: T;
}

export interface ApiResponsePaginated<T> extends ApiBaseResponse<T> {
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
