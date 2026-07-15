import type { InputDriver } from '../lib/engine';

interface ControlPanelProps {
  driver: InputDriver;
  onDriverChange: (d: InputDriver) => void;
  primaryValue: number;
  onPrimaryChange: (n: number) => void;
  hydration: number;
  onHydrationChange: (n: number) => void;
  pTotal: number;
  mFlour: number;
  totalGrams: number;
  hydrationOutOfRange: boolean;
}

function NumberField({
  label,
  value,
  onChange,
  unit,
  invalid,
  autoFocus,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  unit: string;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.18em] text-slateblue-dim">{label}</span>
      <div
        className={`group flex items-stretch border ${
          invalid
            ? 'border-amber-safety shadow-amber'
            : 'border-charcoal-line focus-within:border-slateblue'
        } bg-charcoal-inset transition-colors`}
      >
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          autoFocus={autoFocus}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          className={`w-full bg-transparent px-3 py-2.5 font-mono text-2xl tracking-tight outline-none ${
            invalid ? 'text-amber-safety' : 'text-ice'
          } placeholder:text-charcoal-line`}
        />
        <span className="flex select-none items-center border-l border-charcoal-line px-3 text-[11px] uppercase tracking-wider text-slateblue-dim">
          {unit}
        </span>
      </div>
    </label>
  );
}

export default function ControlPanel({
  driver,
  onDriverChange,
  primaryValue,
  onPrimaryChange,
  hydration,
  onHydrationChange,
  pTotal,
  mFlour,
  totalGrams,
  hydrationOutOfRange,
}: ControlPanelProps) {
  return (
    <section className="border border-charcoal-line bg-charcoal-panel">
      <header className="flex items-center justify-between border-b border-charcoal-line px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-terminal-green shadow-[0_0_8px_rgba(63,185,80,0.6)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ice-dim">
            Main Control Panel
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slateblue-dim">Input Driver</span>
      </header>

      <div className="space-y-5 p-4">
        {/* Input driver toggle */}
        <div className="grid grid-cols-2 gap-px border border-charcoal-line bg-charcoal-line">
          {(
            [
              { id: 'flour' as const, label: 'Total Flour Mass', sub: 'Pathway A · direct anchor' },
              { id: 'yield' as const, label: 'Target Yield Mass', sub: 'Pathway B · isolate flour' },
            ]
          ).map((opt) => {
            const active = driver === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onDriverChange(opt.id)}
                className={`px-3 py-2.5 text-left transition-colors ${
                  active ? 'bg-charcoal-raised' : 'bg-charcoal-panel hover:bg-charcoal-raised/60'
                }`}
              >
                <div
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    active ? 'text-slateblue-bright' : 'text-ice-dim'
                  }`}
                >
                  {opt.label}
                </div>
                <div className="mt-0.5 text-[9px] uppercase tracking-wider text-slateblue-dim">
                  {opt.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary driver input */}
        <NumberField
          label={driver === 'flour' ? 'Total Flour Mass (M_flour · anchor)' : 'Target Batch Yield (Y_target)'}
          value={primaryValue}
          onChange={onPrimaryChange}
          unit="g"
          autoFocus
        />

        {/* Hydration input */}
        <NumberField
          label="Target Hydration (P_hydration)"
          value={hydration}
          onChange={onHydrationChange}
          unit="%"
          invalid={hydrationOutOfRange}
        />
        {hydrationOutOfRange && (
          <div className="flex items-start gap-2 border border-amber-safety/60 bg-amber-glow px-3 py-2 text-[10px] uppercase tracking-wider text-amber-safety">
            <span className="mt-px font-bold">!</span>
            <span>Guardrail breach: hydration must be 50.0%–105.0%</span>
          </div>
        )}

        {/* Derived anchor readout */}
        <div className="grid grid-cols-3 gap-px border border-charcoal-line bg-charcoal-line">
          <Readout label="P_total" value={`${pTotal.toFixed(1)}%`} />
          <Readout label={driver === 'flour' ? '↳ M_flour' : '↳ isolated M_flour'} value={`${Math.round(mFlour).toLocaleString()} g`} />
          <Readout label="Batch yield" value={`${totalGrams.toLocaleString()} g`} accent />
        </div>
      </div>
    </section>
  );
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-charcoal-panel px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-slateblue-dim">{label}</div>
      <div className={`mt-0.5 font-mono text-sm ${accent ? 'text-slateblue-bright' : 'text-ice'}`}>
        {value}
      </div>
    </div>
  );
}
