// The Baker's Scaling & Hydration Engine — pure, deterministic, client-side.
// No I/O, no side effects. All masses are computed at full floating precision
// and only rounded to the single gram at the final display boundary. The
// reconciled total is derived from the rounded row grams so the ledger always
// adds up exactly (no cumulative rounding drift across high-volume batches).

export type InputDriver = 'flour' | 'yield';

export interface IngredientInput {
  id: string;
  name: string;
  percent: number;
}

export interface EngineInput {
  driver: InputDriver;
  flourMass: number;
  targetYield: number;
  hydration: number;
  ingredients: IngredientInput[];
}

export type WarningKind =
  | 'hydration-range'
  | 'negative-percent'
  | 'zero-anchor'
  | 'empty-name';

export interface Warning {
  kind: WarningKind;
  message: string;
  refId?: string;
}

export type RowKind = 'flour' | 'water' | 'ingredient';

export interface ComputedRow {
  id: string;
  name: string;
  percent: number;
  mass: number; // full precision grams
  grams: number; // rounded to single gram
  kind: RowKind;
}

export interface EngineResult {
  rows: ComputedRow[];
  pTotal: number;
  mFlour: number;
  totalMass: number; // full precision
  totalGrams: number; // reconciled sum of rounded grams
  warnings: Warning[];
  valid: boolean;
}

export const HYDRATION_GUARDRAIL = { min: 50, max: 105 } as const;

const { min: HYD_MIN, max: HYD_MAX } = HYDRATION_GUARDRAIL;

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `ing-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Two-pass calculation matrix.
 * Pass 1 — total percentage summation: P_total = 100 + P_hydration + SUM(P_i)
 * Pass 2 — mass isolation loop: resolve the flour anchor, then M_i = M_flour * P_i / 100
 */
export function computeRecipe(input: EngineInput): EngineResult {
  const warnings: Warning[] = [];

  if (input.hydration < HYD_MIN || input.hydration > HYD_MAX) {
    warnings.push({
      kind: 'hydration-range',
      message: `Hydration ${input.hydration}% outside guardrail [${HYD_MIN}.0–${HYD_MAX}.0]%`,
    });
  }

  for (const ing of input.ingredients) {
    if (ing.percent < 0) {
      warnings.push({
        kind: 'negative-percent',
        message: `Ingredient "${ing.name || 'unnamed'}" has a negative percentage`,
        refId: ing.id,
      });
    }
    if (!ing.name.trim()) {
      warnings.push({ kind: 'empty-name', message: 'An ingredient is missing a name', refId: ing.id });
    }
  }

  // Pass 1 — total percentage summation relative to the 100% flour anchor.
  const ingredientPercentSum = input.ingredients.reduce((s, i) => s + i.percent, 0);
  const pTotal = 100 + input.hydration + ingredientPercentSum;

  // Pass 2 precondition — isolate the hidden flour anchor mass.
  let mFlour = 0;
  if (input.driver === 'flour') {
    mFlour = input.flourMass;
  } else if (pTotal > 0) {
    mFlour = (input.targetYield / pTotal) * 100;
  }

  if (mFlour <= 0) {
    warnings.push({
      kind: 'zero-anchor',
      message:
        input.driver === 'flour'
          ? 'Flour mass must be greater than 0 g'
          : 'Target yield must be greater than 0 g',
    });
  }

  const massFor = (pct: number): number => (mFlour * pct) / 100;

  const rows: ComputedRow[] = [
    { id: 'flour', name: 'Flour', percent: 100, mass: massFor(100), grams: 0, kind: 'flour' },
    { id: 'water', name: 'Water', percent: input.hydration, mass: massFor(input.hydration), grams: 0, kind: 'water' },
    ...input.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name.trim() || '—',
      percent: ing.percent,
      mass: massFor(ing.percent),
      grams: 0,
      kind: 'ingredient' as const,
    })),
  ];

  // Two-pass rounding: each row to the single gram, total reconciled from rounded grams.
  for (const r of rows) r.grams = Math.round(r.mass);
  const totalGrams = rows.reduce((s, r) => s + r.grams, 0);
  const totalMass = rows.reduce((s, r) => s + r.mass, 0);

  return { rows, pTotal, mFlour, totalMass, totalGrams, warnings, valid: warnings.length === 0 };
}
