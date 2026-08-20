import { useState, useMemo } from 'react';
import type { Pedido, ItemPedido, ParamsDVV, ProdutoCatalogo, Empresa } from '../types';
import { useAppData } from '../AppDataContext';
import { calcularItem, calcularTotais } from '../calc';
import { brl, pct, corMC, hoje } from '../fmt';
import { randomUUID } from '../uuid';

interface Props {
  pedidoId: string | null;
  onFechar: () => void;
}

type QtdeMap = Record<string, { qtdeVenda: number; qtdeBonif: number; precoUnitManual?: number }>;

const CATEGORIA_ORDEM = ['Body Splash', 'Perfume Capilar', 'Pós', 'Body Glow', 'Fixador', 'Outros'];

const PARAMS_DEBELLE: { key: keyof ParamsDVV; label: string; isPct: boolean }[] = [
  { key: 'comissaoPct',        label: 'Comissão',      isPct: true  },
  { key: 'fretePct',           label: 'Frete',         isPct: true  },
  { key: 'marketingPct',       label: 'Marketing',     isPct: true  },
  { key: 'custoFinanceiroPct', label: 'C. Financeiro', isPct: true  },
  { key: 'descontoCanalPct',   label: 'Desc. Canal',   isPct: true  },
  { key: 'fatorNF',            label: 'Fator NF',      isPct: false },
  { key: 'simplesAliq',        label: 'Simples',       isPct: true  },
  { key: 'prazoMedio',         label: 'Prazo (d)',     isPct: false },
];

const PARAMS_ASTI: { key: keyof ParamsDVV; label: string; isPct: boolean }[] = [
  { key: 'comissaoPct',        label: 'Comissão',      isPct: true  },
  { key: 'fretePct',           label: 'Frete',         isPct: true  },
  { key: 'marketingPct',       label: 'Marketing',     isPct: true  },
  { key: 'custoFinanceiroPct', label: 'C. Financeiro', isPct: true  },
  { key: 'descontoCanalPct',   label: 'Desc. Canal',   isPct: true  },
  { key: 'prazoMedio',         label: 'Prazo (d)',     isPct: false },
];

function gerarNumero(): string {
  const d = new Date();
  const ts = String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0');
  return `PED-${ts}`;
}

function initQtdes(itens: ItemPedido[]): QtdeMap {
  const m: QtdeMap = {};
  for (const it of itens) {
    m[it.produtoId] = {
      qtdeVenda: it.qtdeVenda,
      qtdeBonif: it.qtdeBonif,
      precoUnitManual: it.precoUnitManual,
    };
  }
  return m;
}

export default function EditorPedido({ pedidoId, onFechar }: Props) {
  const { catalogo, pedidos, params: paramsPadrao, savePedidos } = useAppData();

  const pedidoExistente = pedidoId ? pedidos.find(p => p.id === pedidoId) : null;

  const [numero,        setNumero]        = useState(pedidoExistente?.numero        ?? gerarNumero());
  const [emissao,       setEmissao]       = useState(pedidoExistente?.emissao       ?? hoje());
  const [entrega,       setEntrega]       = useState(pedidoExistente?.entrega       ?? '');
  const [cliente,       setCliente]       = useState(pedidoExistente?.cliente       ?? '');
  const [ufCidade,      setUfCidade]      = useState(pedidoExistente?.ufCidade      ?? '');
  const [representante, setRepresentante] = useState(pedidoExistente?.representante ?? '');
  const [empresa,       setEmpresa]       = useState<Empresa>(pedidoExistente?.empresa ?? 'debelle');
  const [params,        setParams]        = useState<ParamsDVV>(pedidoExistente?.params ?? paramsPadrao);
  const [qtdes,         setQtdes]         = useState<QtdeMap>(() => initQtdes(pedidoExistente?.itens ?? []));
  const [paramsAberto,  setParamsAberto]  = useState(true);

  const dvvTotal = params.comissaoPct + params.fretePct + params.marketingPct +
    (params.custoFinanceiroPct / 30 * params.prazoMedio);

  // Derive active itens from qtde map
  const itens: ItemPedido[] = useMemo(() =>
    catalogo
      .filter(p => (qtdes[p.id]?.qtdeVenda ?? 0) > 0 || (qtdes[p.id]?.qtdeBonif ?? 0) > 0)
      .map(p => ({
        id: `item-${p.id}`,
        produtoId: p.id,
        qtdeVenda: qtdes[p.id]?.qtdeVenda ?? 0,
        qtdeBonif: qtdes[p.id]?.qtdeBonif ?? 0,
        precoUnitManual: qtdes[p.id]?.precoUnitManual,
      })),
    [catalogo, qtdes]
  );

  // Calculate per-product results (only active products)
  const itensCalcMap = useMemo(() => {
    const m: Record<string, ReturnType<typeof calcularItem>> = {};
    for (const item of itens) {
      const prod = catalogo.find(p => p.id === item.produtoId);
      if (prod) m[item.produtoId] = calcularItem(item, prod, params, empresa);
    }
    return m;
  }, [itens, catalogo, params, empresa]);

  const totais = useMemo(() =>
    calcularTotais(Object.values(itensCalcMap)),
    [itensCalcMap]
  );

  const mcRsUn = useMemo(() => {
    const calcs = Object.values(itensCalcMap);
    const totalUnid = calcs.reduce((a, c) => a + c.qtdeTotal, 0);
    return totalUnid > 0 ? totais.mcRS / totalUnid : 0;
  }, [itensCalcMap, totais.mcRS]);

  // Group products by category in display order
  const categorias = useMemo(() => {
    const grupos: Record<string, ProdutoCatalogo[]> = {};
    for (const cat of CATEGORIA_ORDEM) grupos[cat] = [];
    for (const prod of catalogo) {
      const cat = prod.categoria ?? 'Outros';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(prod);
    }
    return CATEGORIA_ORDEM
      .map(cat => ({ cat, produtos: grupos[cat] ?? [] }))
      .filter(g => g.produtos.length > 0);
  }, [catalogo]);

  const setQtde = (produtoId: string, field: 'qtdeVenda' | 'qtdeBonif', val: number) => {
    setQtdes(prev => ({
      ...prev,
      [produtoId]: { ...(prev[produtoId] ?? { qtdeVenda: 0, qtdeBonif: 0 }), [field]: val },
    }));
  };

  const setPrecoManual = (produtoId: string, val: number | undefined) => {
    setQtdes(prev => ({
      ...prev,
      [produtoId]: { ...(prev[produtoId] ?? { qtdeVenda: 0, qtdeBonif: 0 }), precoUnitManual: val },
    }));
  };

  const setParam = (k: keyof ParamsDVV, v: string) => {
    const numVal = parseFloat(v) || 0;
    setParams(prev => ({ ...prev, [k]: numVal }));
  };

  const salvar = async () => {
    const pedido: Pedido = {
      id: pedidoExistente?.id ?? randomUUID(),
      numero, emissao, entrega, cliente, ufCidade, representante,
      empresa,
      itens,
      params,
      criadoEm: pedidoExistente?.criadoEm ?? new Date().toISOString(),
    };
    const novos = pedidoExistente
      ? pedidos.map(p => p.id === pedido.id ? pedido : p)
      : [...pedidos, pedido];
    await savePedidos(novos);
    onFechar();
  };

  const paramsKeys = empresa === 'asti' ? PARAMS_ASTI : PARAMS_DEBELLE;

  const totaisCards = empresa === 'asti'
    ? [
        { label: 'Fat. Bruto',       value: brl(totais.fatBruto),          hi: false, mc: undefined as number | undefined },
        { label: 'CMP Total',        value: brl(totais.cmpTotal),           hi: false, mc: undefined as number | undefined },
        { label: 'DVV',              value: brl(totais.dvvRS),              hi: false, mc: undefined as number | undefined },
        { label: 'Tributos s/Venda', value: brl(totais.custoTransfTotal),   hi: false, mc: undefined as number | undefined },
        { label: 'Custo Total',      value: brl(totais.custoTotal),         hi: false, mc: undefined as number | undefined },
        { label: 'MC R$',            value: brl(totais.mcRS),               hi: true,  mc: totais.mcPct },
        { label: 'MC R$/un',         value: brl(mcRsUn),                    hi: true,  mc: totais.mcPct },
        { label: 'MC %',             value: pct(totais.mcPct),              hi: true,  mc: totais.mcPct },
      ]
    : [
        { label: 'Fat. Bruto',    value: brl(totais.fatBruto),         hi: false, mc: undefined as number | undefined },
        { label: 'Simples',       value: brl(totais.simplesRS),         hi: false, mc: undefined as number | undefined },
        { label: 'CMP Total',     value: brl(totais.cmpTotal),          hi: false, mc: undefined as number | undefined },
        { label: 'DVV',           value: brl(totais.dvvRS),             hi: false, mc: undefined as number | undefined },
        { label: 'Custo Transf.', value: brl(totais.custoTransfTotal),  hi: false, mc: undefined as number | undefined },
        { label: 'Custo Total',   value: brl(totais.custoTotal),        hi: false, mc: undefined as number | undefined },
        { label: 'MC R$',         value: brl(totais.mcRS),              hi: true,  mc: totais.mcPct },
        { label: 'MC R$/un',      value: brl(mcRsUn),                   hi: true,  mc: totais.mcPct },
        { label: 'MC %',          value: pct(totais.mcPct),             hi: true,  mc: totais.mcPct },
      ];

  return (
    <div className="mt-6 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onFechar} className="text-sm hover:opacity-80" style={{ color: '#94a3b8' }}>
            ← Pedidos
          </button>
          <span style={{ color: '#334155' }}>|</span>
          <h1 className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
            {pedidoExistente ? `Pedido ${numero}` : 'Novo Pedido'}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onFechar}
            className="px-4 py-2 rounded text-sm hover:opacity-80"
            style={{ background: '#334155', color: '#f1f5f9' }}
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            className="px-4 py-2 rounded font-semibold text-sm hover:opacity-90"
            style={{ background: '#d4a853', color: '#0f172a' }}
          >
            Salvar Pedido
          </button>
        </div>
      </div>

      {/* Cabeçalho */}
      <div className="rounded-lg border p-5" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: '#94a3b8' }}>
          Dados do Pedido
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Número</label>
            <input type="text" value={numero} onChange={e => setNumero(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Emissão</label>
            <input type="date" value={emissao} onChange={e => setEmissao(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Entrega</label>
            <input type="date" value={entrega} onChange={e => setEntrega(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Cliente</label>
            <input type="text" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>UF / Cidade</label>
            <input type="text" value={ufCidade} onChange={e => setUfCidade(e.target.value)} placeholder="SP - São Paulo" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Representante</label>
            <input type="text" value={representante} onChange={e => setRepresentante(e.target.value)} placeholder="Nome do representante" />
          </div>
          {/* Seletor de empresa */}
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Empresa</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEmpresa('debelle')}
                className="flex-1 py-1.5 rounded text-sm font-semibold transition-colors"
                style={{
                  background: empresa === 'debelle' ? '#1e3a5f' : '#0f172a',
                  color: empresa === 'debelle' ? '#93c5fd' : '#475569',
                  border: `1px solid ${empresa === 'debelle' ? '#3b82f6' : '#334155'}`,
                }}
              >
                De Belle
              </button>
              <button
                type="button"
                onClick={() => setEmpresa('asti')}
                className="flex-1 py-1.5 rounded text-sm font-semibold transition-colors"
                style={{
                  background: empresa === 'asti' ? '#3d2e00' : '#0f172a',
                  color: empresa === 'asti' ? '#d4a853' : '#475569',
                  border: `1px solid ${empresa === 'asti' ? '#d4a853' : '#334155'}`,
                }}
              >
                ASTI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Parâmetros DVV (colapsável, aberto por padrão) */}
      <div className="rounded-lg border" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <button
          onClick={() => setParamsAberto(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
              Parâmetros DVV
            </span>
            <span className="text-sm font-bold" style={{ color: '#d4a853' }}>
              DVV total: {pct(dvvTotal)}
            </span>
          </div>
          <span style={{ color: '#94a3b8' }}>{paramsAberto ? '▲' : '▼'}</span>
        </button>

        {paramsAberto && (
          <div className="px-5 pb-5 pt-0 border-t" style={{ borderColor: '#334155' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {paramsKeys.map(({ key, label, isPct }) => (
                <div key={key}>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>{label}</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={isPct ? '0.001' : '1'}
                      value={isPct ? ((params[key] as number) * 100).toFixed(3) : params[key]}
                      onChange={e => setParam(key, isPct ? String(parseFloat(e.target.value) / 100) : e.target.value)}
                    />
                    {isPct && <span className="text-xs shrink-0" style={{ color: '#94a3b8' }}>%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grade de produtos por categoria */}
      <div className="rounded-lg border" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: '#334155' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
            Produtos — {itens.length} item{itens.length !== 1 ? 's' : ''} no pedido
          </h2>
        </div>

        <div className="p-5 space-y-6">
          {categorias.map(({ cat, produtos }) => (
            <div key={cat}>
              {/* Cabeçalho da categoria */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4a853' }}>
                  {cat}
                </span>
                <div className="flex-1 h-px" style={{ background: '#334155' }} />
              </div>

              {/* Header da grade */}
              <div
                className="grid text-xs font-medium uppercase tracking-wide mb-1 px-2"
                style={{
                  color: '#64748b',
                  gridTemplateColumns: '1fr 5rem 5rem 7rem 5rem 4rem',
                }}
              >
                <span>Produto</span>
                <span className="text-center">Cx Vda</span>
                <span className="text-center">Cx Bonif</span>
                <span className="text-right">Preço Unit</span>
                <span className="text-right">MC R$/un</span>
                <span className="text-right">MC%</span>
              </div>

              {/* Linhas de produtos */}
              <div className="space-y-1">
                {produtos.map(prod => {
                  const q = qtdes[prod.id];
                  const qtdeVenda = q?.qtdeVenda ?? 0;
                  const qtdeBonif = q?.qtdeBonif ?? 0;
                  const precoManual = q?.precoUnitManual;
                  const calc = itensCalcMap[prod.id];
                  const ativo = qtdeVenda > 0 || qtdeBonif > 0;

                  // Compute default precoUnit for placeholder
                  const precoUnitDefault = prod.unidPorCx > 0
                    ? prod.precoCatalogo * (1 - params.descontoCanalPct) / prod.unidPorCx
                    : 0;

                  return (
                    <div
                      key={prod.id}
                      className="grid items-center gap-2 px-2 py-1.5 rounded transition-all"
                      style={{
                        gridTemplateColumns: '1fr 5rem 5rem 7rem 5rem 4rem',
                        background: ativo ? '#0f172a' : 'transparent',
                        opacity: ativo ? 1 : 0.5,
                      }}
                    >
                      {/* Nome */}
                      <div>
                        <span className="font-mono text-xs" style={{ color: '#d4a853' }}>
                          {prod.codigo}
                        </span>
                        <span className="ml-2 text-xs" style={{ color: '#94a3b8' }}>
                          {prod.descricao.replace(/ BOX C\/\d+.*$/i, '').replace(/ CX C\/\d+.*$/i, '')}
                        </span>
                      </div>

                      {/* Cx Venda */}
                      <input
                        type="number"
                        min="0"
                        value={qtdeVenda || ''}
                        placeholder="0"
                        className="w-16 text-center"
                        onChange={e => setQtde(prod.id, 'qtdeVenda', parseInt(e.target.value) || 0)}
                      />

                      {/* Cx Bonif */}
                      <input
                        type="number"
                        min="0"
                        value={qtdeBonif || ''}
                        placeholder="0"
                        className="w-16 text-center"
                        onChange={e => setQtde(prod.id, 'qtdeBonif', parseInt(e.target.value) || 0)}
                      />

                      {/* Preço Unit manual */}
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={precoManual ?? ''}
                        placeholder={precoUnitDefault.toFixed(4)}
                        className="text-right"
                        onChange={e => setPrecoManual(
                          prod.id,
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )}
                      />

                      {/* MC R$/un */}
                      <div className="text-right">
                        {calc && qtdeVenda > 0 ? (
                          <span className="text-xs font-medium" style={{ color: corMC(calc.mcPct) }}>
                            {brl(calc.qtdeTotal > 0 ? calc.mcRS / calc.qtdeTotal : 0)}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: '#334155' }}>—</span>
                        )}
                      </div>

                      {/* MC% */}
                      <div className="text-right">
                        {calc && qtdeVenda > 0 ? (
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-xs font-bold"
                            style={{
                              background: corMC(calc.mcPct) + '22',
                              color: corMC(calc.mcPct),
                            }}
                          >
                            {pct(calc.mcPct)}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: '#334155' }}>—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {totaisCards.map(card => (
          <div
            key={card.label}
            className="rounded-lg border p-4"
            style={{
              background: '#1e293b',
              borderColor: card.hi ? corMC(card.mc ?? 0) + '55' : '#334155',
            }}
          >
            <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>{card.label}</p>
            <p
              className="text-lg font-bold"
              style={{ color: card.hi ? corMC(card.mc ?? 0) : '#f1f5f9' }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Breakdown tributário por item */}
      {itens.length > 0 && (
        <div className="rounded-lg border p-5" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: '#94a3b8' }}>
            Breakdown Tributário por Item
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {empresa === 'asti'
                    ? ['Produto', 'Qtde Total', 'Fat. Bruto', 'ICMS', 'PIS/COF', 'IRPJ/CSLL', 'IPI', 'Tributos'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: '#94a3b8' }}>{h}</th>
                      ))
                    : ['Produto', 'Qtde Total', 'Fat. NF', 'Simples', 'P. Transf Cx', 'P. Transf Total', 'ICMS', 'PIS/COF', 'IRPJ/CSLL', 'IPI', 'C.Transf'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: '#94a3b8' }}>{h}</th>
                      ))
                  }
                </tr>
              </thead>
              <tbody>
                {itens.map(item => {
                  const c = itensCalcMap[item.produtoId];
                  if (!c) return null;
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #33415544' }}>
                      <td className="px-3 py-1.5 font-mono" style={{ color: '#d4a853' }}>{c.produto.codigo}</td>
                      <td className="px-3 py-1.5 text-right" style={{ color: '#94a3b8' }}>{c.qtdeTotal}</td>
                      {empresa === 'asti' ? (
                        <>
                          <td className="px-3 py-1.5 text-right" style={{ color: '#94a3b8' }}>{brl(c.fatBruto)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-1.5 text-right" style={{ color: '#94a3b8' }}>{brl(c.fatNF)}</td>
                          <td className="px-3 py-1.5 text-right" style={{ color: '#94a3b8' }}>{brl(c.simplesRS)}</td>
                          <td className="px-3 py-1.5 text-right" style={{ color: '#d4a853' }}>{brl(c.transfUnit * c.produto.unidPorCx)}</td>
                          <td className="px-3 py-1.5 text-right" style={{ color: '#d4a853' }}>{brl(c.transfTotal)}</td>
                        </>
                      )}
                      <td className="px-3 py-1.5 text-right" style={{ color: '#94a3b8' }}>{brl(c.icmsRS)}</td>
                      <td className="px-3 py-1.5 text-right" style={{ color: '#94a3b8' }}>{brl(c.pisCofinsRS)}</td>
                      <td className="px-3 py-1.5 text-right" style={{ color: '#94a3b8' }}>{brl(c.irpjCsllRS)}</td>
                      <td className="px-3 py-1.5 text-right" style={{ color: '#94a3b8' }}>{brl(c.ipiRS)}</td>
                      <td className="px-3 py-1.5 text-right font-medium" style={{ color: '#f1f5f9' }}>{brl(c.custoTransfTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
