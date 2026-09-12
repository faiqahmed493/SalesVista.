/**
 * Runtime config validator for `VisualizationConfig`.
 *
 * Security guarantees:
 *   1. Never calls `eval()` or `new Function()` on any input.
 *   2. Field names (`xKey`, `series[].key`) must match a strict safe-identifier
 *      pattern — blocking prototype pollution via `__proto__`, `constructor`, etc.
 *   3. Color values are validated against hex / CSS named-color patterns.
 *   4. All fields are checked by type; no implicit coercion is trusted.
 *   5. `isLoading`, `description`, and other optional booleans/strings
 *      are validated but never executed.
 *
 * Call this function on EVERY config object that originates outside your
 * own code (e.g. AI responses, user input, external APIs).
 */

import type { ValidationResult } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_CHART_TYPES = [
  "line",
  "bar",
  "area",
  "pie",
  "donut",
  "composed",
  "scatter",
  "radar",
  "funnel",
  "boxplot",
] as const;
const ALLOWED_SERIES_CHART_TYPES = ["line", "bar", "area"] as const;

/**
 * Safe field-name pattern.
 *
 * Allows:
 *   - Simple identifiers: `temperature`, `feelsLike`
 *   - Dot-notation: `metrics.value`, `data.nested.field`
 *   - Underscores and digits (not at start)
 *
 * Blocks:
 *   - `__proto__`, `constructor`, `prototype` (prototype pollution)
 *   - Spaces, brackets, parentheses (code injection)
 *   - Names longer than 64 characters
 */
const SAFE_KEY_PATTERN =
  /^(?!__proto__$|constructor$|prototype$)[a-zA-Z_][a-zA-Z0-9_.]{0,63}$/;

/**
 * Valid color pattern.
 * Accepts: `#rgb`, `#rrggbb`, `#rrggbbaa`, CSS named colors, `rgb(...)`, `hsl(...)`.
 */
const VALID_COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{2,30}|rgb\([^)]{1,50}\)|hsl\([^)]{1,50}\))$/;

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validates a raw (unknown) object as a `VisualizationConfig`.
 *
 * Returns `{ valid: true }` on success.
 * Returns `{ valid: false, errors: string[] }` listing every problem found.
 *
 * @example
 * ```ts
 * const result = validateConfig(aiJsonOutput);
 * if (!result.valid) {
 *   console.error("Invalid config:", result.errors);
 *   return;
 * }
 * // safe to pass to <ChartRenderer>
 * ```
 */
export function validateConfig(config: unknown): ValidationResult {
  const errors: string[] = [];

  // ── Top-level type check ─────────────────────────────────────────────
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    return { valid: false, errors: ["Config must be a plain non-null object"] };
  }

  const c = config as Record<string, unknown>;

  // ── type ─────────────────────────────────────────────────────────────
  if (!ALLOWED_CHART_TYPES.includes(c.type as never)) {
    errors.push(
      `Invalid chart type "${String(c.type)}". Allowed: ${ALLOWED_CHART_TYPES.join(", ")}`
    );
  }

  // ── title ────────────────────────────────────────────────────────────
  if (typeof c.title !== "string" || c.title.trim().length === 0) {
    errors.push("title must be a non-empty string");
  } else if (c.title.length > 200) {
    errors.push("title must be ≤ 200 characters");
  }

  // ── description (optional) ───────────────────────────────────────────
  if (c.description !== undefined) {
    if (typeof c.description !== "string") {
      errors.push("description must be a string if provided");
    } else if (c.description.length > 500) {
      errors.push("description must be ≤ 500 characters");
    }
  }

  // ── xKey ─────────────────────────────────────────────────────────────
  if (typeof c.xKey !== "string" || c.xKey.trim().length === 0) {
    errors.push("xKey must be a non-empty string");
  } else if (!SAFE_KEY_PATTERN.test(c.xKey)) {
    errors.push(
      `xKey "${c.xKey}" contains invalid characters or is a reserved identifier`
    );
  }

  // ── series ───────────────────────────────────────────────────────────
  if (!Array.isArray(c.series) || c.series.length === 0) {
    errors.push("series must be a non-empty array");
  } else {
    (c.series as unknown[]).forEach((s, idx) => {
      if (typeof s !== "object" || s === null || Array.isArray(s)) {
        errors.push(`series[${idx}] must be an object`);
        return;
      }

      const ser = s as Record<string, unknown>;

      // series[i].key
      if (typeof ser.key !== "string" || ser.key.trim().length === 0) {
        errors.push(`series[${idx}].key must be a non-empty string`);
      } else if (!SAFE_KEY_PATTERN.test(ser.key)) {
        errors.push(
          `series[${idx}].key "${ser.key}" contains invalid characters or is a reserved identifier`
        );
      }

      // series[i].label
      if (typeof ser.label !== "string" || ser.label.trim().length === 0) {
        errors.push(`series[${idx}].label must be a non-empty string`);
      } else if (ser.label.length > 100) {
        errors.push(`series[${idx}].label must be ≤ 100 characters`);
      }

      // series[i].color (optional)
      if (ser.color !== undefined) {
        if (typeof ser.color !== "string") {
          errors.push(`series[${idx}].color must be a string`);
        } else if (!VALID_COLOR_PATTERN.test(ser.color)) {
          errors.push(
            `series[${idx}].color "${ser.color}" is not a valid color value`
          );
        }
      }

      // series[i].chartType (optional, only for "composed")
      if (
        ser.chartType !== undefined &&
        !ALLOWED_SERIES_CHART_TYPES.includes(ser.chartType as never)
      ) {
        errors.push(
          `series[${idx}].chartType must be one of: ${ALLOWED_SERIES_CHART_TYPES.join(", ")}`
        );
      }

      // series[i].fillOpacity (optional)
      if (ser.fillOpacity !== undefined) {
        const op = Number(ser.fillOpacity);
        if (isNaN(op) || op < 0 || op > 1) {
          errors.push(`series[${idx}].fillOpacity must be a number between 0 and 1`);
        }
      }

      // series[i].stackId (optional string)
      if (ser.stackId !== undefined && typeof ser.stackId !== "string") {
        errors.push(`series[${idx}].stackId must be a string`);
      }

      // series[i].dashed (optional boolean)
      if (ser.dashed !== undefined && typeof ser.dashed !== "boolean") {
        errors.push(`series[${idx}].dashed must be a boolean`);
      }
    });
  }

  // ── unit (optional string) ───────────────────────────────────────────
  if (c.unit !== undefined) {
    if (typeof c.unit !== "string") {
      errors.push("unit must be a string if provided");
    } else if (c.unit.length > 20) {
      errors.push("unit must be ≤ 20 characters");
    }
  }

  // ── height (optional positive integer) ───────────────────────────────
  if (c.height !== undefined) {
    const h = Number(c.height);
    if (!Number.isFinite(h) || h < 60 || h > 1200) {
      errors.push("height must be a number between 60 and 1200");
    }
  }

  // ── stacked (optional boolean) ───────────────────────────────────────
  if (c.stacked !== undefined && typeof c.stacked !== "boolean") {
    errors.push("stacked must be a boolean if provided");
  }

  // ── legend (optional boolean) ────────────────────────────────────────
  if (c.legend !== undefined && typeof c.legend !== "boolean") {
    errors.push("legend must be a boolean if provided");
  }

  // ── isLoading (optional boolean) ─────────────────────────────────────
  if (c.isLoading !== undefined && typeof c.isLoading !== "boolean") {
    errors.push("isLoading must be a boolean if provided");
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
