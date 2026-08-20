import { useState, useCallback } from 'react';
import ListaPedidos from './components/ListaPedidos';
import EditorPedido from './components/EditorPedido';
import CatalogoProdutos from './components/CatalogoProdutos';
import ParamsDVVForm from './components/ParamsDVVForm';
import { useAppData } from './AppDataContext';

type View = 'pedidos' | 'catalogo' | 'params';

export default function App() {
  const { loading, error } = useAppData();
  const [view, setView] = useState<View>('pedidos');
  const [pedidoEditandoId, setPedidoEditandoId] = useState<string | null>(null);

  const abrirEditor = useCallback((id: string | null) => {
    setPedidoEditandoId(id);
  }, []);

  const fecharEditor = useCallback(() => {
    setPedidoEditandoId(undefined as unknown as null);
    setPedidoEditandoId(null);
  }, []);

  const tabs: { key: View; label: string }[] = [
    { key: 'pedidos',  label: 'Pedidos' },
    { key: 'catalogo', label: 'Catálogo' },
    { key: 'params',   label: 'Parâmetros DVV' },
  ];

  const showEditor = view === 'pedidos' && pedidoEditandoId !== null;

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
            style={{ background: '#d4a853', color: '#0f172a' }}
          >
            SP
          </div>
          <span className="font-semibold text-base" style={{ color: '#f1f5f9' }}>
            Simulador de Pedidos
          </span>
        </div>

        <nav className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setView(t.key); fecharEditor(); }}
              className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
              style={{
                background: view === t.key ? '#d4a853' : 'transparent',
                color: view === t.key ? '#0f172a' : '#94a3b8',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="pt-16 px-4 md:px-6 pb-8 max-w-screen-xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center mt-24">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-pulse">⏳</div>
              <p className="font-medium" style={{ color: '#f1f5f9' }}>Carregando dados do servidor...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center mt-24">
            <div
              className="rounded-lg border p-8 max-w-md text-center"
              style={{ background: '#1e293b', borderColor: '#ef4444' }}
            >
              <div className="text-4xl mb-4">⚠️</div>
              <p className="font-semibold mb-2" style={{ color: '#ef4444' }}>Servidor não disponível</p>
              <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>{error}</p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                Verifique se o servidor está rodando com <code style={{ color: '#d4a853' }}>node server.cjs</code> e recarregue a página.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {view === 'pedidos' && !showEditor && (
              <ListaPedidos onNovo={() => abrirEditor('novo')} onEditar={abrirEditor} />
            )}
            {view === 'pedidos' && showEditor && (
              <EditorPedido
                pedidoId={pedidoEditandoId === 'novo' ? null : pedidoEditandoId}
                onFechar={fecharEditor}
              />
            )}
            {view === 'catalogo' && <CatalogoProdutos />}
            {view === 'params'   && <ParamsDVVForm />}
          </>
        )}
      </main>
    </div>
  );
}
