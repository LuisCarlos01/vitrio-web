export class ApiError extends Error {
  status: number;

  constructor(status: number, message = 'Request failed') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
