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
  // custoMPUnit = custo BOM total / unidPorCx (fonte: ENGENHARIA_COMPOSIÇÃO PRODUTO)
  p('PF-BOX',      'PURE FIX - FIXADOR DE MAQUIAGEM BOX C/12',              'CX', 12, 62.40,  1.036194, 7.8,  0.12, 0.125, 0.0228, 0.143, 'Fixador'),
  p('PBA-01',      'PÓ BANANA BOX C/12 - ASTI COSMÉTICOS',                   'CX', 12, 62.40,  1.679297, 7.8,  0.12, 0.125, 0.0228, 0.143, 'Pós'),
  p('PRMA-03',     'PÓ ROSA MOSQUETA BOX C/12 - ASTI COSMÉTICOS',            'CX', 12, 62.40,  1.600925, 7.8,  0.12, 0.125, 0.0228, 0.143, 'Pós'),
  p('PTLA-02',     'PÓ TRANSLÚCIDO BOX C/12 - ASTI COSMÉTICOS',              'CX', 12, 62.40,  1.568626, 7.8,  0.12, 0.125, 0.0228, 0.143, 'Pós'),
  p('BG-B-CX',     'BODY GLOW BRONZE 100ML CX C/12 - ASTI',                  'CX', 12, 104.40, 3.098187, 9.37, 0.12, 0.125, 0.0228, 0.143, 'Body Glow'),
  p('BG-SH-CX',    'BODY GLOW SHINE 100ML CX C/12 - ASTI',                   'CX', 12, 105.48, 2.900618, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Glow'),
  p('BS-BC-CX',    'BODY SPLASH BLUE CAPRI 200ML CX C/12',                   'CX', 12, 103.20, 3.420170, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-MB-CX',    'BODY SPLASH MIAMI BEACH 200ML CX C/12',                  'CX', 12, 103.20, 3.502134, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-VS-CX',    'BODY SPLASH VERY SEXY 200ML CX C/12',                    'CX', 12, 103.20, 3.529924, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-VS-CX2',   'BODY SPLASH VANILLA SUGAR 200ML CX C/12',                'CX', 12, 103.20, 2.765323, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-DB-CX',    'BODY SPLASH DUBAI 200ML CX C/12',                        'CX', 12, 103.20, 2.741536, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-LS-CX',    'BODY SPLASH LOVE SPELL SHINE 200ML CX C/12',             'CX', 12, 107.40, 3.628537, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-GW-CX',    'BODY SPLASH WATERMELON C/ GLITTER 200ML CX C/12',        'CX', 12, 107.40, 3.408886, 10.40,0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-PASSIONE', 'BODY SPLASH PASSIONE 200ML CX C/12',                     'CX', 12, 89.40,  3.189627, 9.0,  0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('BS-PRINCESS', 'BODY SPLASH PRINCESS 200ML CX C/12',                     'CX', 12, 89.40,  3.209170, 9.0,  0.12, 0.125, 0.0228, 0.143, 'Body Splash'),
  p('PC-BL-CX',    'PERFUME CAPILAR BLOOM 30ML CX C/48 - ASTI',             'CX', 48, 221.28, 1.418462, 4.61, 0.12, 0.125, 0.0228, 0.143, 'Perfume Capilar'),
  p('PC-BC-CX',    'PERFUME CAPILAR BLUE CAPRI 30ML CX C/48 - ASTI',        'CX', 48, 221.28, 1.354470, 4.61, 0.12, 0.125, 0.0228, 0.143, 'Perfume Capilar'),
  p('PC-C-CX',     'PERFUME CAPILAR CANDY 30ML CX C/48 - ASTI',             'CX', 48, 221.28, 1.443144, 4.61, 0.12, 0.125, 0.0228, 0.143, 'Perfume Capilar'),
  p('PC-L-CX',     'PERFUME CAPILAR LOVE 30ML CX C/48 - ASTI',              'CX', 48, 221.28, 1.452722, 4.61, 0.12, 0.125, 0.0228, 0.143, 'Perfume Capilar'),
  p('AL-BOX',      'AURORA LIPS - GLOSS BOX C/24 - ASTI COSMÉTICOS',        'CX', 24, 128.40, 3.136009, 5.35, 0.12, 0.125, 0.0228, 0.143, 'Outros'),
];
