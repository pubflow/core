/**
 * Schema Validator
 *
 * Provides utilities for validating data against schemas using Zod
 */

import { z } from 'zod';

/**
 * Validation result
 */
export interface ValidationResult<T> {
  /**
   * Whether validation was successful
   */
  success: boolean;

  /**
   * Validated data (only present if success is true)
   */
  data?: T;

  /**
   * Validation errors (only present if success is false)
   */
  errors?: Record<string, string[]>;
}

/**
 * Entity schemas
 */
export interface EntitySchemas<T, U, V> {
  /**
   * Schema for the complete entity
   */
  entity?: z.ZodType<T>;

  /**
   * Schema for creating an entity
   */
  create?: z.ZodType<U>;

  /**
   * Schema for updating an entity
   */
  update?: z.ZodType<V>;
}

/**
 * Validate data against a schema
 *
 * @param schema Zod schema
 * @param data Data to validate
 * @returns Validation result
 */
export function validateWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {};

      error.errors.forEach(err => {
        const path = err.path.join('.') || '_general';
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });

      return {
        success: false,
        errors: formattedErrors
      };
    }

    return {
      success: false,
      errors: { _general: ['Validation failed'] }
    };
  }
}

/**
 * Create schemas for an entity
 *
 * @param schemas Object containing entity, create, and update schemas
 * @returns The schemas object
 */
export function createSchema<
  T extends z.ZodRawShape,
  U extends z.ZodRawShape,
  V extends z.ZodRawShape
>(schemas: {
  entity?: z.ZodObject<T>;
  create?: z.ZodObject<U>;
  update?: z.ZodObject<V>;
}): {
  entity?: z.ZodObject<T>;
  create?: z.ZodObject<U>;
  update?: z.ZodObject<V>;
} {
  return schemas;
}

/**
 * Create an update schema from a create schema
 *
 * Makes all properties optional
 *
 * @param createSchema Create schema
 * @returns Update schema
 */
export function createUpdateSchema<T extends z.ZodRawShape>(
  createSchema: z.ZodObject<T>
): z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }> {
  const shape = createSchema.shape;
  const updateShape: Record<string, z.ZodTypeAny> = {};

  for (const key in shape) {
    updateShape[key] = shape[key].optional();
  }

  return z.object(updateShape) as z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }>;
}
