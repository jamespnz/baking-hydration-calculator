import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { IngredientInput } from '../lib/engine';

interface IngredientLedgerProps {
  ingredients: IngredientInput[];
  onAdd: (preset?: { name: string; percent: number }) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<IngredientInput, 'id'>>) => void;
  warningIds: Set<string>;
}

const PRESETS = [
  { name: 'Salt', percent: 2 },
  { name: 'Yeast', percent: 1.5 },
  { name: 'Olive Oil', percent: 3 },
  { name: 'Sugar', percent: 4 },
];

export default function IngredientLedger({
  ingredients,
  onAdd,
  onRemove,
  onUpdate,
  warningIds,
}: IngredientLedgerProps) {
  return (
    <section className="flex flex-col border border-charcoal-line bg-charcoal-panel">
      <header className="flex items-center justify-between border-b border-charcoal-line px-4 py-2.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ice-dim">
          Ingredient Array Ledger
        </h2>
        <button
          type="button"
          onClick={() => onAdd()}
          className="flex items-center gap-1.5 border border-charcoal-line bg-charcoal-inset px-2.5 py-1 text-[10px] uppercase tracking-wider text-slateblue transition-colors hover:border-slateblue hover:text-slateblue-bright"
        >
          <Plus size={12} strokeWidth={2.5} />
          Add Row
        </button>
      </header>

      {/* Column headers */}
      <div className="grid grid-cols-[1.5rem_1fr_6rem_2rem] gap-2 border-b border-charcoal-line px-3 py-1.5 text-[9px] uppercase tracking-wider text-slateblue-dim">
        <span />
        <span>Ingredient</span>
        <span className="text-right">Baker's %</span>
        <span />
      </div>

      <div className="scrollbar-thin max-h-[340px] overflow-y-auto">
        {ingredients.length === 0 && (
          <div className="px-3 py-6 text-center text-[11px] uppercase tracking-wider text-slateblue-dim">
            No additional ingredients · flour + water only
          </div>
        )}
        {ingredients.map((ing, idx) => {
          const warned = warningIds.has(ing.id);
          return (
            <div
              key={ing.id}
              className={`group grid grid-cols-[1.5rem_1fr_6rem_2rem] items-center gap-2 border-b border-charcoal-line/60 px-3 py-2 ${
                warned ? 'bg-amber-glow' : 'hover:bg-charcoal-raised/40'
              }`}
            >
              <GripVertical size={14} className="text-charcoal-line group-hover:text-slateblue-dim" />
              <input
                type="text"
                value={ing.name}
                placeholder={`Ingredient ${idx + 1}`}
                onChange={(e) => onUpdate(ing.id, { name: e.target.value })}
                className={`w-full bg-transparent px-1 py-1 font-mono text-sm outline-none ${
                  warned ? 'text-amber-safety' : 'text-ice'
                } placeholder:text-charcoal-line`}
              />
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={Number.isFinite(ing.percent) ? ing.percent : ''}
                onChange={(e) =>
                  onUpdate(ing.id, { percent: e.target.value === '' ? 0 : Number(e.target.value) })
                }
                className={`w-full bg-charcoal-inset px-2 py-1 text-right font-mono text-sm outline-none focus:ring-1 focus:ring-slateblue ${
                  warned ? 'text-amber-safety' : 'text-ice'
                }`}
              />
              <button
                type="button"
                onClick={() => onRemove(ing.id)}
                className="flex items-center justify-center text-charcoal-line transition-colors hover:text-terminal-red"
                aria-label={`Remove ${ing.name || 'ingredient'}`}
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick presets */}
      {ingredients.length === 0 && (
        <div className="border-t border-charcoal-line px-3 py-2.5">
          <div className="mb-1.5 text-[9px] uppercase tracking-wider text-slateblue-dim">Quick add</div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => onAdd(p)}
                className="border border-charcoal-line bg-charcoal-inset px-2 py-1 text-[10px] uppercase tracking-wider text-slateblue transition-colors hover:border-slateblue hover:text-slateblue-bright"
                title={`${p.name} @ ${p.percent}%`}
              >
                + {p.name} {p.percent}%
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
