import type { ProdutoCatalogo } from '../types';

function p(
  codigo: string,
  descricao: string,
  unidade: string,
  unidPorCx: number,
  precoCatalogo: number,
  custoMPUnit: number,
  precoTransfCx: number,
  icmsAliq: number,
  pisCofinsAliq: number,
  irpjCsllAliq: number,
  ipiAliq: number,
  categoria: string
): ProdutoCatalogo {
  return {
    id: codigo, // ID estável = código do produto
    codigo, descricao, unidade, unidPorCx, precoCatalogo,
    custoMPUnit, precoTransfCx, icmsAliq, pisCofinsAliq, irpjCsllAliq, ipiAliq,
    categoria,
  };
}

export const SEED_PRODUTOS: ProdutoCatalogo[] = [
  // custoMPUnit = custo líquido/cx set/2026 ÷ unidPorCx (fonte: Custos_Produtos_Acabados_Mensal.xlsx)
  p('PF-BOX',      'PURE FIX - FIXADOR DE MAQUIAGEM BOX C/12',              'CX', 12, 62.40,  1.3575,   7.8,  0.12, 0.125, 0.0228, 0.143, 'Fixador'),
  p('PBA-01',      'PÓ BANANA BOX C/12 - ASTI COSMÉTICOS',                   'CX', 12, 62.40,  1.560833, 7.8,  0.12, 0.125, 0.0228, 0.143, 'Pós'),
  p('PRMA-03',     'PÓ ROSA MOSQUETA BOX C/12 - ASTI COSMÉTICOS',            'CX', 12, 62.40,  1.583333, 7.8,  0.12, 0.125, 0.0228, 0.143, 'Pós'),
  p('PTLA-02',     'PÓ TRANSLÚCIDO BOX C/12 - ASTI COSMÉTICOS',              'CX', 12, 62.40,  1.5525,   7.8,  0.12, 0.125, 0.0228, 0.143, 'Pós'),
  p('BG-B-CX',     'BODY GLOW BRONZE 100ML CX C/12 - ASTI',                  'CX', 12, 104.40, 2.835833, 9.37, 0.12, 0.125, 0.0228, 0.143, 'Body Glow'),
  p('BG-SH-CX',    'BODY GLOW SHINE 100ML CX C/12 - ASTI',                   'CX', 12, 105.48, 2.9925,   10.40,0.12, 0.125, 0.0228, 0.143, 'Body Glow'),
  p('BS-BC-CX',    'BODY SPLASH BLUE CAPRI 200ML CX C/12',                   'CX', 12, 103.20, 2.878333, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-MB-CX',    'BODY SPLASH MIAMI BEACH 200ML CX C/12',                  'CX', 12, 103.20, 2.945833, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-VS-CX',    'BODY SPLASH VERY SEXY 200ML CX C/12',                    'CX', 12, 103.20, 2.965833, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-VS-CX2',   'BODY SPLASH VANILLA SUGAR 200ML CX C/12',                'CX', 12, 103.20, 2.7375,   10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-DB-CX',    'BODY SPLASH DUBAI 200ML CX C/12',                        'CX', 12, 103.20, 2.7375,   10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-LS-CX',    'BODY SPLASH LOVE SPELL SHINE 200ML CX C/12',             'CX', 12, 107.40, 3.1425,   10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-GW-CX',    'BODY SPLASH WATERMELON C/ GLITTER 200ML CX C/12',        'CX', 12, 107.40, 2.956667, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-PASSIONE', 'BODY SPLASH PASSIONE 200ML CX C/12',                     'CX', 12, 89.40,  2.680,    9.0,  0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-PRINCESS', 'BODY SPLASH PRINCESS 200ML CX C/12',                     'CX', 12, 89.40,  2.6975,   9.0,  0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('PC-BL-CX',    'PERFUME CAPILAR BLOOM 30ML CX C/48 - ASTI',             'CX', 48, 221.28, 1.255625, 4.61, 0.12, 0.125, 0.0228, 0.143, 'Perfume Capilar'),
  p('PC-BC-CX',    'PERFUME CAPILAR BLUE CAPRI 30ML CX C/48 - ASTI',        'CX', 48, 221.28, 1.210208, 4.61, 0.12, 0.125, 0.0228, 0.143, 'Perfume Capilar'),
  p('PC-C-CX',     'PERFUME CAPILAR CANDY 30ML CX C/48 - ASTI',             'CX', 48, 221.28, 1.279167, 4.61, 0.12, 0.125, 0.0228, 0.143, 'Perfume Capilar'),
  p('PC-L-CX',     'PERFUME CAPILAR LOVE 30ML CX C/48 - ASTI',              'CX', 48, 221.28, 1.295208, 4.61, 0.12, 0.125, 0.0228, 0.143, 'Perfume Capilar'),
  p('AL-BOX',      'AURORA LIPS - GLOSS BOX C/24 - ASTI COSMÉTICOS',        'CX', 24, 128.40, 3.272083, 5.35, 0.12, 0.125, 0.0228, 0.143, 'Gloss'),
];
