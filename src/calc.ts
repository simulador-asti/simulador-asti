import type { ItemPedido, ProdutoCatalogo, ParamsDVV, ItemCalculado, TotaisPedido, Empresa } from './types';

export function calcularItem(
  item: ItemPedido,
  produto: ProdutoCatalogo,
  params: ParamsDVV,
  empresa: Empresa = 'debelle'
): ItemCalculado {
  const { qtdeVenda, qtdeBonif } = item;
  const {
    unidPorCx, precoCatalogo, custoMPUnit, precoTransfCx,
    icmsAliq, pisCofinsAliq, irpjCsllAliq, ipiAliq,
  } = produto;
  const {
    descontoCanalPct, fatorNF, simplesAliq, comissaoPct,
    fretePct, marketingPct, custoFinanceiroPct, prazoMedio,
  } = params;

  const qtdeTotal  = unidPorCx * qtdeVenda;
  const precoUnit  = item.precoUnitManual != null
    ? item.precoUnitManual
    : (unidPorCx > 0 ? precoCatalogo * (1 - descontoCanalPct) / unidPorCx : 0);
  const precoVenda = precoUnit * unidPorCx;
  const fatBruto   = qtdeVenda * precoVenda;
  const dvvPct     = comissaoPct + fretePct + marketingPct + (custoFinanceiroPct / 30 * prazoMedio);
  const dvvRS      = dvvPct * fatBruto;
  const cmpTotal   = custoMPUnit * (qtdeVenda + qtdeBonif) * unidPorCx;

  let fatNF: number, simplesRS: number, transfUnit: number, transfTotal: number,
      icmsRS: number, pisCofinsRS: number, irpjCsllRS: number, ipiRS: number,
      custoTransfTotal: number, custoTotal: number;

  if (empresa === 'asti') {
    // Lucro Presumido — tributos sobre fatBruto, sem simples/transferência
    fatNF          = fatBruto;
    simplesRS      = 0;
    transfUnit     = 0;
    transfTotal    = 0;
    icmsRS         = fatBruto * icmsAliq;
    pisCofinsRS    = fatBruto * pisCofinsAliq;
    irpjCsllRS     = fatBruto * irpjCsllAliq;
    ipiRS          = 0; // preço ASTI já informado sem IPI
    custoTransfTotal = icmsRS + pisCofinsRS + irpjCsllRS;
    custoTotal     = cmpTotal + dvvRS + custoTransfTotal;
  } else {
    // De Belle — Simples Nacional + tributos sobre preço de transferência
    fatNF          = fatorNF > 0 ? fatBruto / fatorNF : 0;
    simplesRS      = simplesAliq * fatNF;
    transfUnit     = unidPorCx > 0 ? precoTransfCx / unidPorCx : 0;
    transfTotal    = transfUnit * (qtdeVenda + qtdeBonif) * unidPorCx;
    icmsRS         = transfTotal * icmsAliq;
    pisCofinsRS    = transfTotal * pisCofinsAliq;
    irpjCsllRS     = transfTotal * irpjCsllAliq;
    ipiRS          = transfTotal * ipiAliq;
    custoTransfTotal = icmsRS + pisCofinsRS + irpjCsllRS + ipiRS;
    custoTotal     = simplesRS + cmpTotal + dvvRS + custoTransfTotal;
  }

  const mcRS  = fatBruto - custoTotal;
  const mcPct = fatBruto > 0 ? mcRS / fatBruto : 0;

  return {
    item, produto, qtdeTotal, precoUnit, precoVenda, fatBruto, fatNF,
    simplesRS, cmpTotal, dvvPct, dvvRS, transfUnit, transfTotal,
    icmsRS, pisCofinsRS, irpjCsllRS, ipiRS, custoTransfTotal,
    custoTotal, mcRS, mcPct,
  };
}

export function calcularTotais(itens: ItemCalculado[]): TotaisPedido {
  const soma = (fn: (i: ItemCalculado) => number) =>
    itens.reduce((a, i) => a + fn(i), 0);
  const fatBruto   = soma(i => i.fatBruto);
  const custoTotal = soma(i => i.custoTotal);
  const mcRS       = fatBruto - custoTotal;
  return {
    fatBruto,
    fatNF:           soma(i => i.fatNF),
    simplesRS:       soma(i => i.simplesRS),
    cmpTotal:        soma(i => i.cmpTotal),
    dvvRS:           soma(i => i.dvvRS),
    custoTransfTotal: soma(i => i.custoTransfTotal),
    custoTotal,
    mcRS,
    mcPct: fatBruto > 0 ? mcRS / fatBruto : 0,
  };
}
