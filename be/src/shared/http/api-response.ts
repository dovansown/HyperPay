export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  requestId: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}
