import {
  HttpException,
  HttpStatus,
  Injectable,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(public readonly errors: { field: string; message: string }[]) {
    super({ errors }, HttpStatus.BAD_REQUEST);
    this.message = 'Validation failed';
  }
}

@Injectable()
export class ClassValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
    });
  }

  public createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      return new ValidationException(
        this.mapFlattenValidationErrors(validationErrors),
      );
    };
  }

  protected mapFlattenValidationErrors(
    validationErrors: ValidationError[],
  ): { field: string; message: string }[] {
    return validationErrors
      .map((error) => this.mapChildrenToValidationErrors(error))
      .flat(1)
      .filter((item) => !!item.constraints)
      .map((item) => ({
        field: item.property,
        message: Object.values(item.constraints || {}).join(''),
      }));
  }
}
