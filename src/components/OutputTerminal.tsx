import { Printer, Download } from 'lucide-react';
import type { EngineResult, InputDriver } from '../lib/engine';
import { fmtGrams, fmtPercent } from '../lib/format';

interface OutputTerminalProps {
  result: EngineResult;
  driver: InputDriver;
}

function kindAccent(kind: string): string {
  switch (kind) {
    case 'flour':
      return 'text-slateblue-bright';
    case 'water':
      return 'text-slateblue';
    default:
      return 'text-ice';
  }
}

export default function OutputTerminal({ result, driver }: OutputTerminalProps) {
  const { rows, pTotal, mFlour, totalGrams, warnings, valid } = result;

  const handlePrint = () => window.print();

  const handleExport = () => {
    const lines = [
      "THE BAKER'S SCALING & HYDRATION ENGINE",
      `Driver: ${driver === 'flour' ? 'Flour Mass (Pathway A)' : 'Target Yield (Pathway B)'}`,
      `Hydration: ${rows[1]?.percent ?? 0}%`,
      `P_total: ${pTotal.toFixed(1)}%`,
      `M_flour: ${Math.round(mFlour)} g`,
      '',
      'INGREDIENT              %        GRAMS',
      '─'.repeat(46),
      ...rows.map(
        (r) =>
          `${r.name.padEnd(20)} ${fmtPercent(r.percent).padStart(7)} ${fmtGrams(r.grams).padStart(10)} g`,
      ),
      '─'.repeat(46),
      `TOTAL                 ${fmtPercent(pTotal).padStart(7)} ${fmtGrams(totalGrams).padStart(10)} g`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakers-batch-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex flex-col border border-charcoal-line bg-charcoal-panel print:border-0">
      <header className="flex items-center justify-between border-b border-charcoal-line px-4 py-2.5 print:hidden">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2 w-2 rounded-full ${
              valid ? 'bg-terminal-green shadow-[0_0_8px_rgba(63,185,80,0.6)]' : 'bg-amber-safety shadow-[0_0_8px_rgba(255,176,32,0.6)]'
            }`}
          />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ice-dim">
            Live Output Terminal
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 border border-charcoal-line bg-charcoal-inset px-2.5 py-1 text-[10px] uppercase tracking-wider text-slateblue transition-colors hover:border-slateblue hover:text-slateblue-bright"
          >
            <Download size={12} strokeWidth={2.5} />
            Export
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 border border-charcoal-line bg-charcoal-inset px-2.5 py-1 text-[10px] uppercase tracking-wider text-slateblue transition-colors hover:border-slateblue hover:text-slateblue-bright"
          >
            <Printer size={12} strokeWidth={2.5} />
            Print
          </button>
        </div>
      </header>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_5rem_6.5rem] gap-3 border-b border-charcoal-line px-4 py-1.5 text-[9px] uppercase tracking-wider text-slateblue-dim">
        <span>Ingredient</span>
        <span className="text-right">Baker's %</span>
        <span className="text-right">Weight (g)</span>
      </div>

      {/* Data rows */}
      <div className="font-mono">
        {rows.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[1fr_5rem_6.5rem] items-center gap-3 border-b border-charcoal-line/40 px-4 py-2.5"
          >
            <span className="flex items-center gap-2.5 truncate">
              <span className={`h-1.5 w-1.5 ${r.kind === 'flour' ? 'bg-slateblue-bright' : r.kind === 'water' ? 'bg-slateblue' : 'bg-ice-dim/50'}`} />
              <span className={kindAccent(r.kind)}>{r.name}</span>
              {r.kind === 'flour' && (
                <span className="text-[9px] uppercase tracking-wider text-slateblue-dim">anchor</span>
              )}
            </span>
            <span className="text-right text-ice-dim">{fmtPercent(r.percent)}</span>
            <span className={`text-right tabular-nums ${kindAccent(r.kind)}`}>{fmtGrams(r.grams)}</span>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-[1fr_5rem_6.5rem] items-center gap-3 bg-charcoal-inset px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ice-dim">
          Total Batch
        </span>
        <span className="text-right text-sm font-semibold text-slateblue-bright">{fmtPercent(pTotal)}</span>
        <span className="text-right text-base font-bold tabular-nums text-slateblue-bright">
          {fmtGrams(totalGrams)}
        </span>
      </div>

      {/* Parameter digest */}
      <div className="grid grid-cols-2 gap-px border-t border-charcoal-line bg-charcoal-line sm:grid-cols-4">
        <DigestCell label="Input driver" value={driver === 'flour' ? 'Flour Mass' : 'Target Yield'} />
        <DigestCell label="M_flour anchor" value={`${fmtGrams(Math.round(mFlour))} g`} />
        <DigestCell label="Hydration" value={fmtPercent(rows[1]?.percent ?? 0)} />
        <DigestCell label="Status" value={valid ? 'NOMINAL' : 'WARN'} accent={!valid} />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="border-t border-amber-safety/40 bg-amber-glow px-4 py-2.5 print:hidden">
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-amber-deep">
            Validation warnings
          </div>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-amber-safety">
                <span className="mt-px font-bold">›</span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function DigestCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-charcoal-panel px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-slateblue-dim">{label}</div>
      <div className={`mt-0.5 font-mono text-sm ${accent ? 'text-amber-safety' : 'text-ice'}`}>
        {value}
      </div>
    </div>
  );
}
