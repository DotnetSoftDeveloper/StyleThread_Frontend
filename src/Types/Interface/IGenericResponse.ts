export interface GenericResponse<TResponse> {
  message?: string;
  error?: string;
  content?: TResponse;
  success: boolean;
}
