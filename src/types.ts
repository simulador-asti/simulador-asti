export type Empresa = 'debelle' | 'asti';

export interface ProdutoCatalogo {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  unidPorCx: number;
  precoCatalogo: number;
  custoMPUnit: number;
  precoTransfCx: number;
  icmsAliq: number;
  pisCofinsAliq: number;
  irpjCsllAliq: number;
  ipiAliq: number;
  categoria?: string;
}

export interface ParamsDVV {
  comissaoPct: number;
  fretePct: number;
  marketingPct: number;
  custoFinanceiroPct: number;
  descontoCanalPct: number;
  fatorNF: number;
  simplesAliq: number;
  prazoMedio: number;
}

export interface ItemPedido {
  id: string;
  produtoId: string;
  qtdeVenda: number;
  qtdeBonif: number;
  precoUnitManual?: number;
}

export interface Pedido {
  id: string;
  numero: string;
  emissao: string;
  entrega: string;
  cliente: string;
  ufCidade: string;
  representante: string;
  empresa: Empresa;
  itens: ItemPedido[];
  params: ParamsDVV;
  criadoEm: string;
}

export interface ItemCalculado {
  item: ItemPedido;
  produto: ProdutoCatalogo;
  qtdeTotal: number;
  precoUnit: number;
  precoVenda: number;
  fatBruto: number;
  fatNF: number;
  simplesRS: number;
  cmpTotal: number;
  dvvPct: number;
  dvvRS: number;
  transfUnit: number;
  transfTotal: number;
  icmsRS: number;
  pisCofinsRS: number;
  irpjCsllRS: number;
  ipiRS: number;
  custoTransfTotal: number;
  custoTotal: number;
  mcRS: number;
  mcPct: number;
}

export interface TotaisPedido {
  fatBruto: number;
  fatNF: number;
  simplesRS: number;
  cmpTotal: number;
  dvvRS: number;
  custoTransfTotal: number;
  custoTotal: number;
  mcRS: number;
  mcPct: number;
}
