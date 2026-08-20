import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Pedido, ProdutoCatalogo, ParamsDVV } from './types';
import { fetchAppData, saveAppData } from './api';
import { SEED_PRODUTOS } from './data/seed';
import { PARAMS_PADRAO } from './storage';

interface AppDataCtx {
  loading: boolean;
  error: string | null;
  pedidos: Pedido[];
  catalogo: ProdutoCatalogo[];
  params: ParamsDVV;
  savePedidos: (p: Pedido[]) => Promise<void>;
  saveCatalogo: (c: ProdutoCatalogo[]) => Promise<void>;
  saveParams: (p: ParamsDVV) => Promise<void>;
}

const Ctx = createContext<AppDataCtx | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [catalogo, setCatalogo] = useState<ProdutoCatalogo[]>([]);
  const [params, setParams] = useState<ParamsDVV>(PARAMS_PADRAO);

  useEffect(() => {
    fetchAppData()
      .then(data => {
        setPedidos(data.pedidos ?? []);
        // Merge catalogo com seed (adiciona novos, atualiza custos)
        const raw = data.catalogo && data.catalogo.length > 0 ? data.catalogo : SEED_PRODUTOS;
        const seedMap = new Map(SEED_PRODUTOS.map(p => [p.codigo, p]));
        const merged = raw.map(p => {
          const s = seedMap.get(p.codigo);
          return s ? { ...p, custoMPUnit: s.custoMPUnit, precoTransfCx: s.precoTransfCx, categoria: s.categoria } : p;
        });
        const existingCodigos = new Set(raw.map(p => p.codigo));
        const novos = SEED_PRODUTOS.filter(p => !existingCodigos.has(p.codigo));
        setCatalogo([...merged, ...novos]);
        setParams(data.params ?? PARAMS_PADRAO);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const savePedidosFn = useCallback(async (p: Pedido[]) => {
    setPedidos(p);
    await saveAppData({ pedidos: p });
  }, []);

  const saveCatalogoFn = useCallback(async (c: ProdutoCatalogo[]) => {
    setCatalogo(c);
    await saveAppData({ catalogo: c });
  }, []);

  const saveParamsFn = useCallback(async (p: ParamsDVV) => {
    setParams(p);
    await saveAppData({ params: p });
  }, []);

  return (
    <Ctx.Provider value={{
      loading, error, pedidos, catalogo, params,
      savePedidos: savePedidosFn,
      saveCatalogo: saveCatalogoFn,
      saveParams: saveParamsFn,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
