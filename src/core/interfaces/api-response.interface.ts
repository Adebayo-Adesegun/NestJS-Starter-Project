export interface ApiBaseResponse<T> {
  message: string;
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
