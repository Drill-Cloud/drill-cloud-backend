import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNumber, ValidateIf, ValidationOptions } from 'class-validator';

export function IsNullableNumber(options?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => (value === null ? null : Number(value))),
    ValidateIf((_, value) => value !== null),
    IsNumber({}, options),
  );
}
