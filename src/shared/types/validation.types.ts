// shared/types/validation.types.ts

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface Validator<T = unknown> {
  validate(value: T): ValidationError[];
}
