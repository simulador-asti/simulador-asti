import type { ParamsDVV, ProdutoCatalogo, Pedido } from './types';
import { SEED_PRODUTOS } from './data/seed';

const KEYS = {
  params:   'x3_sim_params_default',
  catalogo: 'x3_sim_catalogo_default',
  pedidos:  'x3_sim_pedidos_default',
} as const;

export const PARAMS_PADRAO: ParamsDVV = {
  comissaoPct:      0.05,
  fretePct:         0.03,
  marketingPct:     0.03,
  custoFinanceiroPct: 0.03,
  descontoCanalPct: 0.25,
  fatorNF:          4,
  simplesAliq:      0.10,
  prazoMedio:       30,
};

// ── Params ──────────────────────────────────────────────────────────────────

export function loadParams(): ParamsDVV {
  try {
    const raw = localStorage.getItem(KEYS.params);
    if (raw) return JSON.parse(raw) as ParamsDVV;
  } catch { /* ignore */ }
  return { ...PARAMS_PADRAO };
}

export function saveParams(p: ParamsDVV): void {
  localStorage.setItem(KEYS.params, JSON.stringify(p));
}

// ── Catálogo ─────────────────────────────────────────────────────────────────

export function loadCatalogo(): ProdutoCatalogo[] {
  try {
    const raw = localStorage.getItem(KEYS.catalogo);
    if (raw) {
      const parsed = JSON.parse(raw) as ProdutoCatalogo[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge: adiciona novos + atualiza custoMPUnit/precoTransfCx dos existentes
        const seedMap = new Map(SEED_PRODUTOS.map(p => [p.codigo, p]));
        let changed = false;
        const updated = parsed.map(p => {
          const s = seedMap.get(p.codigo);
          if (!s) return p;
          if (p.custoMPUnit !== s.custoMPUnit || p.precoTransfCx !== s.precoTransfCx || p.categoria !== s.categoria) {
            changed = true;
            return { ...p, custoMPUnit: s.custoMPUnit, precoTransfCx: s.precoTransfCx, categoria: s.categoria };
          }
          return p;
        });
        const codigos = new Set(parsed.map(p => p.codigo));
        const novos = SEED_PRODUTOS.filter(p => !codigos.has(p.codigo));
        if (novos.length > 0 || changed) {
          const merged = [...updated, ...novos];
          saveCatalogo(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch { /* ignore */ }
  saveCatalogo(SEED_PRODUTOS);
  return SEED_PRODUTOS;
}

export function saveCatalogo(c: ProdutoCatalogo[]): void {
  localStorage.setItem(KEYS.catalogo, JSON.stringify(c));
}

// ── Pedidos ──────────────────────────────────────────────────────────────────

export function loadPedidos(): Pedido[] {
  try {
    const raw = localStorage.getItem(KEYS.pedidos);
    if (raw) return JSON.parse(raw) as Pedido[];
  } catch { /* ignore */ }
  return [];
}

export function savePedidos(p: Pedido[]): void {
  localStorage.setItem(KEYS.pedidos, JSON.stringify(p));
}
