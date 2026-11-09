export type DomainErrorCode =
  | "VALIDATION_ERROR"
  | "POLICY_NOT_CONFIGURED"
  | "DRIVER_NOT_ELIGIBLE"
  | "CAR_UNAVAILABLE"
  | "BOOKING_CONFLICT"
  | "INVALID_STATUS_TRANSITION"
  | "DUPLICATE_SLUG"
  | "NOT_FOUND";

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const validationError = (message: string, field?: string) =>
  new DomainError("VALIDATION_ERROR", message, 422, field ? { [field]: [message] } : undefined);

