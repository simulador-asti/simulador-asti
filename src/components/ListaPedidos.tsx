import type { Pedido } from '../types';
import { useAppData } from '../AppDataContext';
import { calcularItem, calcularTotais } from '../calc';
import { brl, pct, corMC, fmtDate } from '../fmt';

interface Props {
  onNovo: () => void;
  onEditar: (id: string) => void;
}

export default function ListaPedidos({ onNovo, onEditar }: Props) {
  const { pedidos, catalogo, savePedidos } = useAppData();

  const excluir = async (id: string) => {
    if (!confirm('Excluir este pedido?')) return;
    const novos = pedidos.filter(p => p.id !== id);
    await savePedidos(novos);
  };

  const calcTotais = (pedido: Pedido) => {
    const empresa = pedido.empresa ?? 'debelle';
    const itensCalc = pedido.itens
      .map(item => {
        const prod = catalogo.find(p => p.id === item.produtoId);
        if (!prod) return null;
        return calcularItem(item, prod, pedido.params, empresa);
      })
      .filter(Boolean) as ReturnType<typeof calcularItem>[];
    return calcularTotais(itensCalc);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>Pedidos de Venda</h1>
          <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onNovo}
          className="px-4 py-2 rounded font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-75"
          style={{ background: '#d4a853', color: '#0f172a' }}
        >
          + Novo Pedido
        </button>
      </div>

      {pedidos.length === 0 ? (
        <div
          className="rounded-lg border p-12 text-center"
          style={{ background: '#1e293b', borderColor: '#334155' }}
        >
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium mb-1" style={{ color: '#f1f5f9' }}>Nenhum pedido cadastrado</p>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Clique em "Novo Pedido" para começar a simular.
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg border overflow-x-auto"
          style={{ background: '#1e293b', borderColor: '#334155' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Nº', 'Empresa', 'Cliente', 'UF/Cidade', 'Representante', 'Emissão', 'Entrega', 'Fat. Bruto', 'MC R$', 'MC%', ''].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide"
                    style={{ color: '#94a3b8' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidos.map(ped => {
                const tot = calcTotais(ped);
                const empresa = ped.empresa ?? 'debelle';
                return (
                  <tr
                    key={ped.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #1e293b' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#0f172a')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3 font-mono font-medium" style={{ color: '#d4a853' }}>
                      {ped.numero}
                    </td>
                    <td className="px-4 py-3">
                      {empresa === 'asti' ? (
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                          style={{ background: '#3d2e0088', color: '#d4a853', border: '1px solid #d4a85355' }}
                        >
                          ASTI
                        </span>
                      ) : (
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                          style={{ background: '#1e3a5f88', color: '#93c5fd', border: '1px solid #3b82f655' }}
                        >
                          De Belle
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#f1f5f9' }}>
                      {ped.cliente || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>
                      {ped.ufCidade || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>
                      {ped.representante || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>
                      {fmtDate(ped.emissao)}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>
                      {fmtDate(ped.entrega)}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#f1f5f9' }}>
                      {brl(tot.fatBruto)}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: corMC(tot.mcPct) }}>
                      {brl(tot.mcRS)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                          background: corMC(tot.mcPct) + '22',
                          color: corMC(tot.mcPct),
                        }}
                      >
                        {pct(tot.mcPct)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditar(ped.id)}
                          className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ background: '#334155', color: '#f1f5f9' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluir(ped.id)}
                          className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ background: '#ef444422', color: '#ef4444' }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
