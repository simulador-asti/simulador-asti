import type { Pedido, ProdutoCatalogo, ParamsDVV } from './types';

export interface AppData {
  pedidos: Pedido[];
  catalogo: ProdutoCatalogo[];
  params: ParamsDVV | null;
}

const ENDPOINT = '/api/data';

let _cache: AppData | null = null;

export async function fetchAppData(): Promise<AppData> {
  const r = await fetch(ENDPOINT);
  if (!r.ok) throw new Error('Servidor não disponível');
  _cache = await r.json();
  return _cache!;
}

export async function saveAppData(patch: Partial<AppData>): Promise<void> {
  const current = _cache ?? await fetchAppData();
  const next = { ...current, ...patch };
  _cache = next;
  await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(next),
  });
}
