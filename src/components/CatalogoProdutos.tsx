import { useState } from 'react';
import type { ProdutoCatalogo } from '../types';
import { useAppData } from '../AppDataContext';
import { brl, pct } from '../fmt';
import { randomUUID } from '../uuid';

const EMPTY: Omit<ProdutoCatalogo, 'id'> = {
  codigo: '', descricao: '', unidade: 'CX', unidPorCx: 12,
  precoCatalogo: 0, custoMPUnit: 0, precoTransfCx: 0,
  icmsAliq: 0.12, pisCofinsAliq: 0.125, irpjCsllAliq: 0.0228, ipiAliq: 0.143,
};

export default function CatalogoProdutos() {
  const { catalogo, saveCatalogo } = useAppData();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<ProdutoCatalogo | null>(null);
  const [form, setForm] = useState<Omit<ProdutoCatalogo, 'id'>>(EMPTY);

  const filtrado = catalogo.filter(p =>
    p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
    p.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirNovo = () => {
    setEditando(null);
    setForm(EMPTY);
    setModalAberto(true);
  };

  const abrirEditar = (p: ProdutoCatalogo) => {
    setEditando(p);
    setForm({ ...p });
    setModalAberto(true);
  };

  const excluir = async (id: string) => {
    if (!confirm('Excluir produto do catálogo?')) return;
    const novo = catalogo.filter(p => p.id !== id);
    await saveCatalogo(novo);
  };

  const salvar = async () => {
    if (!form.codigo.trim() || !form.descricao.trim()) {
      alert('Código e descrição são obrigatórios.');
      return;
    }
    let novo: ProdutoCatalogo[];
    if (editando) {
      novo = catalogo.map(p => p.id === editando.id ? { ...form, id: editando.id } : p);
    } else {
      novo = [...catalogo, { ...form, id: randomUUID() }];
    }
    await saveCatalogo(novo);
    setModalAberto(false);
  };

  const setF = (k: keyof Omit<ProdutoCatalogo, 'id'>, v: string) => {
    const numFields = ['unidPorCx','precoCatalogo','custoMPUnit','precoTransfCx',
      'icmsAliq','pisCofinsAliq','irpjCsllAliq','ipiAliq'];
    setForm(prev => ({
      ...prev,
      [k]: numFields.includes(k) ? parseFloat(v) || 0 : v,
    }));
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>Catálogo de Produtos</h1>
          <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
            {catalogo.length} produto{catalogo.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={abrirNovo}
          className="px-4 py-2 rounded font-semibold text-sm hover:opacity-90"
          style={{ background: '#d4a853', color: '#0f172a' }}
        >
          + Novo Produto
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por código ou descrição..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div
        className="rounded-lg border overflow-x-auto"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              {['Código', 'Descrição', 'Un', 'Un/Cx', 'P. Catálogo', 'Custo MP', 'P. Transf Cx', 'ICMS', 'PIS/COF', 'IRPJ/CSLL', 'IPI', ''].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide whitespace-nowrap" style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrado.map(p => (
              <tr
                key={p.id}
                style={{ borderBottom: '1px solid #334155' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0f172a')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-3 py-2 font-mono font-medium" style={{ color: '#d4a853' }}>{p.codigo}</td>
                <td className="px-3 py-2 max-w-[220px] truncate" style={{ color: '#f1f5f9' }} title={p.descricao}>{p.descricao}</td>
                <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{p.unidade}</td>
                <td className="px-3 py-2 text-right" style={{ color: '#94a3b8' }}>{p.unidPorCx}</td>
                <td className="px-3 py-2 text-right" style={{ color: '#f1f5f9' }}>{brl(p.precoCatalogo)}</td>
                <td className="px-3 py-2 text-right" style={{ color: '#94a3b8' }}>{brl(p.custoMPUnit)}</td>
                <td className="px-3 py-2 text-right" style={{ color: '#94a3b8' }}>{brl(p.precoTransfCx)}</td>
                <td className="px-3 py-2 text-right" style={{ color: '#94a3b8' }}>{pct(p.icmsAliq)}</td>
                <td className="px-3 py-2 text-right" style={{ color: '#94a3b8' }}>{pct(p.pisCofinsAliq)}</td>
                <td className="px-3 py-2 text-right" style={{ color: '#94a3b8' }}>{pct(p.irpjCsllAliq)}</td>
                <td className="px-3 py-2 text-right" style={{ color: '#94a3b8' }}>{pct(p.ipiAliq)}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="px-2 py-0.5 rounded text-xs hover:opacity-80"
                      style={{ background: '#334155', color: '#f1f5f9' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(p.id)}
                      className="px-2 py-0.5 rounded text-xs hover:opacity-80"
                      style={{ background: '#ef444422', color: '#ef4444' }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtrado.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center" style={{ color: '#94a3b8' }}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setModalAberto(false); }}
        >
          <div
            className="w-full max-w-2xl rounded-xl border p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: '#1e293b', borderColor: '#334155' }}
          >
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#f1f5f9' }}>
              {editando ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Código *</label>
                <input type="text" value={form.codigo} onChange={e => setF('codigo', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Unidade</label>
                <input type="text" value={form.unidade} onChange={e => setF('unidade', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Descrição *</label>
                <input type="text" value={form.descricao} onChange={e => setF('descricao', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Unid por Cx</label>
                <input type="number" value={form.unidPorCx} onChange={e => setF('unidPorCx', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Preço Catálogo (cx)</label>
                <input type="number" step="0.01" value={form.precoCatalogo} onChange={e => setF('precoCatalogo', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Custo MP Unit.</label>
                <input type="number" step="0.0001" value={form.custoMPUnit} onChange={e => setF('custoMPUnit', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Preço Transf. Cx</label>
                <input type="number" step="0.01" value={form.precoTransfCx} onChange={e => setF('precoTransfCx', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>ICMS %</label>
                <input type="number" step="0.001" value={(form.icmsAliq * 100).toFixed(3)} onChange={e => setF('icmsAliq', String(parseFloat(e.target.value) / 100))} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>PIS/COFINS %</label>
                <input type="number" step="0.001" value={(form.pisCofinsAliq * 100).toFixed(3)} onChange={e => setF('pisCofinsAliq', String(parseFloat(e.target.value) / 100))} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>IRPJ/CSLL %</label>
                <input type="number" step="0.001" value={(form.irpjCsllAliq * 100).toFixed(4)} onChange={e => setF('irpjCsllAliq', String(parseFloat(e.target.value) / 100))} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>IPI %</label>
                <input type="number" step="0.001" value={(form.ipiAliq * 100).toFixed(3)} onChange={e => setF('ipiAliq', String(parseFloat(e.target.value) / 100))} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={salvar}
                className="px-5 py-2 rounded font-semibold text-sm hover:opacity-90"
                style={{ background: '#d4a853', color: '#0f172a' }}
              >
                Salvar
              </button>
              <button
                onClick={() => setModalAberto(false)}
                className="px-5 py-2 rounded text-sm hover:opacity-80"
                style={{ background: '#334155', color: '#f1f5f9' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
