import { useState } from 'react';
import type { ParamsDVV } from '../types';
import { useAppData } from '../AppDataContext';
import { pct } from '../fmt';

export default function ParamsDVVForm() {
  const { params: paramsCtx, saveParams } = useAppData();
  const [params, setParams] = useState<ParamsDVV>(paramsCtx);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof ParamsDVV, v: string) => {
    setParams(prev => ({ ...prev, [k]: parseFloat(v) || 0 }));
    setSaved(false);
  };

  const dvvTotal = params.comissaoPct + params.fretePct + params.marketingPct +
    (params.custoFinanceiroPct / 30 * params.prazoMedio);

  const salvar = async () => {
    await saveParams(params);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const campos: { key: keyof ParamsDVV; label: string; isPct: boolean; desc?: string }[] = [
    { key: 'comissaoPct',        label: 'Comissão',             isPct: true  },
    { key: 'fretePct',           label: 'Frete',                isPct: true  },
    { key: 'marketingPct',       label: 'Marketing',            isPct: true  },
    { key: 'custoFinanceiroPct', label: 'Custo Financeiro',     isPct: true, desc: 'ao mês — pro-rata pelo prazo médio' },
    { key: 'descontoCanalPct',   label: 'Desconto Canal',       isPct: true, desc: 'aplicado sobre preço catálogo' },
    { key: 'fatorNF',            label: 'Fator NF',             isPct: false, desc: 'Fat. Bruto ÷ Fator NF = Base Simples' },
    { key: 'simplesAliq',        label: 'Simples Nacional',     isPct: true  },
    { key: 'prazoMedio',         label: 'Prazo Médio (dias)',   isPct: false },
  ];

  return (
    <div className="mt-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>Parâmetros DVV</h1>
        <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
          Valores padrão aplicados a novos pedidos.
        </p>
      </div>

      <div
        className="rounded-lg border p-6"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <div className="grid grid-cols-1 gap-4">
          {campos.map(c => (
            <div key={c.key}>
              <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                {c.label}
                {c.desc && <span className="ml-1 opacity-60">({c.desc})</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={c.isPct ? '0.001' : '1'}
                  value={c.isPct ? (params[c.key] as number * 100).toFixed(3) : params[c.key]}
                  onChange={e => set(c.key, c.isPct ? String(parseFloat(e.target.value) / 100) : e.target.value)}
                  className="max-w-[160px]"
                />
                {c.isPct && <span style={{ color: '#94a3b8' }}>%</span>}
                {c.key === 'prazoMedio' && <span style={{ color: '#94a3b8' }}>dias</span>}
              </div>
            </div>
          ))}
        </div>

        {/* DVV preview */}
        <div
          className="mt-6 p-4 rounded-lg border"
          style={{ background: '#0f172a', borderColor: '#334155' }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>DVV Total estimado</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold" style={{ color: '#d4a853' }}>
              {pct(dvvTotal)}
            </span>
            <span className="text-xs" style={{ color: '#94a3b8' }}>
              sobre Faturamento Bruto
            </span>
          </div>
          <div className="mt-2 text-xs" style={{ color: '#94a3b8' }}>
            Comissão {pct(params.comissaoPct)} + Frete {pct(params.fretePct)} + Marketing {pct(params.marketingPct)} +
            Fin. {pct(params.custoFinanceiroPct / 30 * params.prazoMedio)} ({params.prazoMedio}d)
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={salvar}
            className="px-5 py-2 rounded font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: '#d4a853', color: '#0f172a' }}
          >
            Salvar Parâmetros
          </button>
          {saved && (
            <span className="text-sm font-medium" style={{ color: '#22c55e' }}>
              Salvo!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
