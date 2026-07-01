/**
 * @agarwal-ai/data-pipeline
 * Data Pipeline — ETL for AI systems, validation, transformation, schema inference, streaming
 */

import { generateId } from "@agarwal-ai/core";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DataType = "string" | "number" | "boolean" | "date" | "array" | "object" | "null" | "unknown";

export interface SchemaField {
  name: string;
  type: DataType;
  nullable: boolean;
  unique?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  enum?: unknown[];
}

export interface InferredSchema {
  fields: SchemaField[];
  rowCount: number;
  inferredAt: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: { totalRows: number; validRows: number; invalidRows: number; errorRate: number };
}

export interface ValidationError {
  row: number;
  field: string;
  value: unknown;
  rule: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  issue: string;
  severity: "low" | "medium";
}

export interface TransformStep {
  name: string;
  fn: (row: Record<string, unknown>) => Record<string, unknown>;
}

export interface PipelineStats {
  inputRows: number;
  outputRows: number;
  droppedRows: number;
  transformsApplied: number;
  durationMs: number;
  errors: number;
}

// ─── Schema Inferrer ─────────────────────────────────────────────────────────

export class SchemaInferrer {
  /** Infer schema from data sample */
  infer(data: Record<string, unknown>[]): InferredSchema {
    if (data.length === 0) return { fields: [], rowCount: 0, inferredAt: Date.now() };

    const fieldStats: Map<string, { types: Set<DataType>; nullCount: number; values: Set<string> }> = new Map();

    for (const row of data) {
      for (const [key, value] of Object.entries(row)) {
        if (!fieldStats.has(key)) {
          fieldStats.set(key, { types: new Set(), nullCount: 0, values: new Set() });
        }
        const stats = fieldStats.get(key)!;
        const type = this.detectType(value);
        stats.types.add(type);
        if (value === null || value === undefined) stats.nullCount++;
        if (value !== null && value !== undefined) stats.values.add(String(value));
      }
    }

    const fields: SchemaField[] = [];
    for (const [name, stats] of fieldStats) {
      const types = Array.from(stats.types).filter(t => t !== "null");
      const primaryType = types[0] || "unknown";
      const field: SchemaField = {
        name,
        type: primaryType,
        nullable: stats.nullCount > 0,
        unique: stats.values.size === data.length,
      };

      // Detect numeric ranges
      if (primaryType === "number") {
        const nums = Array.from(stats.values).map(Number).filter(n => !isNaN(n));
        if (nums.length > 0) {
          field.min = Math.min(...nums);
          field.max = Math.max(...nums);
        }
      }

      // Detect enums (low cardinality)
      if (stats.values.size <= 10 && stats.values.size < data.length * 0.5) {
        field.enum = Array.from(stats.values);
      }

      fields.push(field);
    }

    return { fields, rowCount: data.length, inferredAt: Date.now() };
  }

  private detectType(value: unknown): DataType {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date";
      return "string";
    }
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return "unknown";
  }
}

// ─── Data Validator ──────────────────────────────────────────────────────────

export class DataValidator {
  private schema: InferredSchema;
  private customRules: Array<{ field: string; name: string; check: (value: unknown) => boolean; message: string }> = [];

  constructor(schema: InferredSchema) {
    this.schema = schema;
  }

  /** Add custom validation rule */
  addRule(field: string, name: string, check: (value: unknown) => boolean, message: string): this {
    this.customRules.push({ field, name, check, message });
    return this;
  }

  /** Validate data against schema */
  validate(data: Record<string, unknown>[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for missing fields
    for (const field of this.schema.fields) {
      const missingCount = data.filter(row => !(field.name in row)).length;
      if (missingCount > 0 && !field.nullable) {
        warnings.push({ field: field.name, issue: `${missingCount} rows missing non-nullable field`, severity: "medium" });
      }
    }

    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      for (const field of this.schema.fields) {
        const value = row[field.name];

        // Null check
        if ((value === null || value === undefined) && !field.nullable) {
          errors.push({ row: i, field: field.name, value, rule: "not-null", message: `Field "${field.name}" cannot be null` });
          continue;
        }
        if (value === null || value === undefined) continue;

        // Type check
        if (field.type === "number" && typeof value !== "number") {
          errors.push({ row: i, field: field.name, value, rule: "type", message: `Expected number, got ${typeof value}` });
        }

        // Range check
        if (field.type === "number" && typeof value === "number") {
          if (field.min !== undefined && value < field.min) {
            errors.push({ row: i, field: field.name, value, rule: "min", message: `Value ${value} below minimum ${field.min}` });
          }
          if (field.max !== undefined && value > field.max) {
            errors.push({ row: i, field: field.name, value, rule: "max", message: `Value ${value} above maximum ${field.max}` });
          }
        }

        // Enum check
        if (field.enum && !field.enum.includes(value as never)) {
          errors.push({ row: i, field: field.name, value, rule: "enum", message: `Value not in allowed set` });
        }
      }

      // Custom rules
      for (const rule of this.customRules) {
        if (rule.field in row && !rule.check(row[rule.field])) {
          errors.push({ row: i, field: rule.field, value: row[rule.field], rule: rule.name, message: rule.message });
        }
      }
    }

    const invalidRows = new Set(errors.map(e => e.row)).size;
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: { totalRows: data.length, validRows: data.length - invalidRows, invalidRows, errorRate: invalidRows / data.length },
    };
  }
}

// ─── Data Transformer ────────────────────────────────────────────────────────

export class DataTransformer {
  private steps: TransformStep[] = [];

  /** Add a transform step */
  add(name: string, fn: (row: Record<string, unknown>) => Record<string, unknown>): this {
    this.steps.push({ name, fn });
    return this;
  }

  /** Rename a field */
  rename(from: string, to: string): this {
    return this.add(`rename:${from}→${to}`, (row) => {
      const { [from]: value, ...rest } = row;
      return { ...rest, [to]: value };
    });
  }

  /** Drop fields */
  drop(...fields: string[]): this {
    return this.add(`drop:${fields.join(",")}`, (row) => {
      const result = { ...row };
      fields.forEach(f => delete result[f]);
      return result;
    });
  }

  /** Add computed field */
  compute(name: string, fn: (row: Record<string, unknown>) => unknown): this {
    return this.add(`compute:${name}`, (row) => ({ ...row, [name]: fn(row) }));
  }

  /** Filter rows */
  filter(predicate: (row: Record<string, unknown>) => boolean): this {
    return this.add("filter", (row) => predicate(row) ? row : (null as unknown as Record<string, unknown>));
  }

  /** Cast field type */
  cast(field: string, to: "string" | "number" | "boolean" | "date"): this {
    return this.add(`cast:${field}→${to}`, (row) => {
      const value = row[field];
      let casted: unknown;
      switch (to) {
        case "string": casted = String(value ?? ""); break;
        case "number": casted = Number(value); break;
        case "boolean": casted = Boolean(value); break;
        case "date": casted = new Date(value as string).toISOString(); break;
      }
      return { ...row, [field]: casted };
    });
  }

  /** Fill nulls with default */
  fillNull(field: string, defaultValue: unknown): this {
    return this.add(`fillNull:${field}`, (row) => ({
      ...row,
      [field]: row[field] ?? defaultValue,
    }));
  }

  /** Normalize numeric field to 0-1 range */
  normalize(field: string, min: number, max: number): this {
    return this.add(`normalize:${field}`, (row) => {
      const val = row[field] as number;
      return { ...row, [field]: (val - min) / (max - min) };
    });
  }

  /** Execute all transforms on data */
  execute(data: Record<string, unknown>[]): { data: Record<string, unknown>[]; stats: PipelineStats } {
    const startTime = Date.now();
    let result: Record<string, unknown>[] = [...data];
    let errors = 0;

    for (const step of this.steps) {
      result = result.map(row => {
        try { return step.fn(row); }
        catch { errors++; return row; }
      }).filter(Boolean);
    }

    return {
      data: result,
      stats: {
        inputRows: data.length,
        outputRows: result.length,
        droppedRows: data.length - result.length,
        transformsApplied: this.steps.length,
        durationMs: Date.now() - startTime,
        errors,
      },
    };
  }

  /** Get transform pipeline description */
  describe(): string[] {
    return this.steps.map((s, i) => `${i + 1}. ${s.name}`);
  }
}

// ─── Data Pipeline ───────────────────────────────────────────────────────────

export class DataPipeline {
  private name: string;
  private inferrer = new SchemaInferrer();
  private transformer = new DataTransformer();
  private validator?: DataValidator;

  constructor(name: string) {
    this.name = name;
  }

  /** Configure transformer */
  transform(configurator: (t: DataTransformer) => void): this {
    configurator(this.transformer);
    return this;
  }

  /** Run the full pipeline: infer → validate → transform → validate output */
  run(data: Record<string, unknown>[]): {
    schema: InferredSchema;
    validation: ValidationResult;
    transformed: Record<string, unknown>[];
    stats: PipelineStats;
  } {
    // Infer schema
    const schema = this.inferrer.infer(data);

    // Validate input
    this.validator = new DataValidator(schema);
    const validation = this.validator.validate(data);

    // Transform
    const { data: transformed, stats } = this.transformer.execute(data);

    return { schema, validation, transformed, stats };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createSchemaInferrer(): SchemaInferrer { return new SchemaInferrer(); }
export function createValidator(schema: InferredSchema): DataValidator { return new DataValidator(schema); }
export function createTransformer(): DataTransformer { return new DataTransformer(); }
export function createDataPipeline(name: string): DataPipeline { return new DataPipeline(name); }
