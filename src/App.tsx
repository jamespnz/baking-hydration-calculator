import { useMemo, useState } from 'react';
import { Wheat, Scale, AlertTriangle } from 'lucide-react';
import ControlPanel from './components/ControlPanel';
import IngredientLedger from './components/IngredientLedger';
import OutputTerminal from './components/OutputTerminal';
import {
  computeRecipe,
  newId,
  HYDRATION_GUARDRAIL,
  type InputDriver,
  type IngredientInput,
} from './lib/engine';

function App() {
  const [driver, setDriver] = useState<InputDriver>('flour');
  const [flourMass, setFlourMass] = useState(1000);
  const [targetYield, setTargetYield] = useState(1800);
  const [hydration, setHydration] = useState(65);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { id: newId(), name: 'Salt', percent: 2 },
    { id: newId(), name: 'Yeast', percent: 1.5 },
  ]);

  const result = useMemo(
    () => computeRecipe({ driver, flourMass, targetYield, hydration, ingredients }),
    [driver, flourMass, targetYield, hydration, ingredients],
  );

  const primaryValue = driver === 'flour' ? flourMass : targetYield;
  const onPrimaryChange = (n: number) =>
    driver === 'flour' ? setFlourMass(n) : setTargetYield(n);

  const warningIds = useMemo(
    () => new Set(result.warnings.filter((w) => w.refId).map((w) => w.refId!)),
    [result.warnings],
  );

  const addIngredient = (preset?: { name: string; percent: number }) =>
    setIngredients((prev) => [
      ...prev,
      { id: newId(), name: preset?.name ?? '', percent: preset?.percent ?? 0 },
    ]);

  const removeIngredient = (id: string) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));

  const updateIngredient = (
    id: string,
    patch: Partial<Omit<IngredientInput, 'id'>>,
  ) => setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const hydrationOutOfRange =
    hydration < HYDRATION_GUARDRAIL.min || hydration > HYDRATION_GUARDRAIL.max;

  return (
    <div className="grid-noise min-h-screen bg-charcoal-base text-ice">
      {/* Top status bar */}
      <header className="sticky top-0 z-10 border-b border-charcoal-line bg-charcoal-base/95 backdrop-blur supports-[backdrop-filter]:bg-charcoal-base/80 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-slateblue/40 bg-charcoal-inset">
              <Wheat size={16} className="text-slateblue-bright" strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-ice">
                Baker's Scaling &amp; Hydration Engine
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slateblue-dim">
                Two-pass matrix · client-side · real-time preview
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <StatusChip
              label="Engine"
              value="LIVE"
              dotClass="bg-terminal-green shadow-[0_0_8px_rgba(63,185,80,0.6)]"
            />
            <StatusChip
              label="Rounding"
              value="1 g"
              dotClass="bg-slateblue"
            />
            <StatusChip
              label="State"
              value={result.valid ? 'NOMINAL' : 'WARN'}
              dotClass={
                result.valid
                  ? 'bg-terminal-green'
                  : 'bg-amber-safety shadow-[0_0_8px_rgba(255,176,32,0.6)]'
              }
              valueClass={result.valid ? 'text-ice' : 'text-amber-safety'}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5">
        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          {/* Left column: control + ledger */}
          <div className="space-y-4">
            <ControlPanel
              driver={driver}
              onDriverChange={setDriver}
              primaryValue={primaryValue}
              onPrimaryChange={onPrimaryChange}
              hydration={hydration}
              onHydrationChange={setHydration}
              pTotal={result.pTotal}
              mFlour={result.mFlour}
              totalGrams={result.totalGrams}
              hydrationOutOfRange={hydrationOutOfRange}
            />
            <IngredientLedger
              ingredients={ingredients}
              onAdd={addIngredient}
              onRemove={removeIngredient}
              onUpdate={updateIngredient}
              warningIds={warningIds}
            />
          </div>

          {/* Right column: output terminal */}
          <div className="space-y-4">
            <OutputTerminal result={result} driver={driver} />
            <FormulaCard driver={driver} pTotal={result.pTotal} />
          </div>
        </div>
      </main>

      <footer className="border-t border-charcoal-line px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[9px] uppercase tracking-wider text-slateblue-dim">
          <span className="flex items-center gap-1.5">
            <Scale size={11} strokeWidth={2} />
            Flour = 100% anchor · all masses derived client-side
          </span>
          <span>P_total = 100 + P_hydration + Σ(P_i)</span>
        </div>
      </footer>
    </div>
  );
}

function StatusChip({
  label,
  value,
  dotClass,
  valueClass = 'text-ice',
}: {
  label: string;
  value: string;
  dotClass: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 border border-charcoal-line bg-charcoal-inset px-2.5 py-1">
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      <span className="text-[9px] uppercase tracking-wider text-slateblue-dim">{label}</span>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${valueClass}`}>{value}</span>
    </div>
  );
}

function FormulaCard({ driver, pTotal }: { driver: InputDriver; pTotal: number }) {
  return (
    <section className="border border-charcoal-line bg-charcoal-panel/60 p-4 print:hidden">
      <div className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ice-dim">
        <AlertTriangle size={12} className="text-slateblue-dim" strokeWidth={2.2} />
        Active pathway
      </div>
      <div className="space-y-1.5 font-mono text-[12px] leading-relaxed text-ice-dim">
        <div>
          <span className="text-slateblue-dim">Pass 1 ›</span>{' '}
          <span className="text-ice">P_total = 100 + P_hydration + Σ(P_i)</span>{' '}
          <span className="text-slateblue-bright">= {pTotal.toFixed(1)}%</span>
        </div>
        {driver === 'flour' ? (
          <div>
            <span className="text-slateblue-dim">Pass 2 ›</span>{' '}
            <span className="text-ice">M_i = (M_flour × P_i) / 100</span>
            <span className="ml-2 text-[10px] uppercase tracking-wider text-slateblue-dim">Pathway A</span>
          </div>
        ) : (
          <>
            <div>
              <span className="text-slateblue-dim">Pass 2 ›</span>{' '}
              <span className="text-ice">M_flour = (Y_target / P_total) × 100</span>
            </div>
            <div>
              <span className="text-slateblue-dim">   ↳</span>{' '}
              <span className="text-ice">M_i = (M_flour × P_i) / 100</span>
              <span className="ml-2 text-[10px] uppercase tracking-wider text-slateblue-dim">Pathway B</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default App;
