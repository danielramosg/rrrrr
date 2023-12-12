// This AGPL-licensed tool only runs during development for code generation and is not part of the final distribution.
// TODO: Separate from the code that is redistributed to avoid any license conflicts.
import { loadInsightMaker, Model } from 'simulation';
import lodash from 'lodash';
import insightMakerModelXml from 'bundle-text:./../../CircularEconomyOfSmartPhones.InsightMaker';
import { Flows, Stocks } from './circular-economy-model';

window.lodash = lodash;

console.log(lodash);

const im = loadInsightMaker(insightMakerModelXml);
window.Model = Model;
window.im = im;

function transformNameToJs(name: string): string {
  return lodash.camelCase(name);
}

function transformFormulaToJs(expression: string): string {
  const identifiers = [...expression.matchAll(/\[([\w- ]+)\]/g)];
  let f = expression;
  identifiers.forEach((i) => {
    f = f.replaceAll(`[${i[1]}]`, `[${transformNameToJs(i[1])}]`);
  });
  f = f.replaceAll(/\s/g, '');
  f = f.replaceAll('Min(', 'Math.min(');
  f = f.replaceAll('Max(', 'Math.max(');

  f = f.replaceAll(/[[\]]/g, '');

  return f;
}

function getNamesFromExpression(expression: string): string[] {
  return lodash.uniq(
    [...expression.matchAll(/\[([\w- ]+)\]/g)].map(([match, capture]) =>
      transformNameToJs(capture),
    ),
  );
}

type Stock = {
  type: 'stock';
  name: string;
  initialValue: string;
  arcs: [];
};

type Flow = {
  type: 'flow';
  name: string;
  formula: string;
  arcs: string[];
  start: string;
  end: string;
};

type Variable = {
  type: 'variable';
  name: string;
  formula: string;
  arcs: string[];
};

type Parameter = {
  type: 'parameter';
  name: string;
  initialValue: string;
  arcs: [];
};

type GraphNode = Stock | Flow | Variable | Parameter;
type Graph = GraphNode[];

function isStock(node: GraphNode): node is Stock {
  return node.type === 'stock';
}

function isFlow(node: GraphNode): node is Flow {
  return node.type === 'flow';
}

function isVariable(node: GraphNode): node is Variable {
  return node.type === 'variable';
}

function isParameter(node: GraphNode): node is Parameter {
  return node.type === 'parameter';
}

function topSortKahn(graph: Graph): GraphNode[] {
  type GraphNodeTopSort = {
    node: GraphNode;
    temporaryMark: boolean;
    permanentMark: boolean;
  };
  const G: GraphNodeTopSort[] = graph.map((node) => ({
    node,
    temporaryMark: false,
    permanentMark: false,
  }));
  const graphNameToNode = new Map<string, GraphNodeTopSort>(
    G.map((topSortNode) => [topSortNode.node.name, topSortNode]),
  );
  const L: GraphNode[] = [];

  function visit(n: GraphNodeTopSort) {
    /* eslint-disable no-param-reassign */
    // console.log(`visiting ${n.node.name}`);
    if (n.permanentMark) return;
    if (n.temporaryMark) throw new Error('Cycle detected: Not a DAG!');

    n.temporaryMark = true;

    n.node.arcs
      .map((mName) => graphNameToNode.get(mName))
      .forEach((m) => visit(m));

    n.temporaryMark = false;
    n.permanentMark = true;
    L.push(n.node);
  }

  let n = [...graphNameToNode.values()].find(
    (node) => !node.temporaryMark && !node.permanentMark,
  );
  while (typeof n !== 'undefined') {
    visit(n);
    n = [...graphNameToNode.values()].find(
      (node) => !node.temporaryMark && !node.permanentMark,
    );
  }

  return L;
}

function toIdArray(prefix: string, suffix: string, ids: string[]) {
  return `${prefix}[\n  ${ids.map((s) => `'${s}'`).join(',\n  ')},\n]${suffix}`;
}

function toInitialValueObject(
  prefix: string,
  suffix: string,
  elements: Stock[] | Parameter[],
) {
  return `${prefix}{\n  ${elements
    .map((e) => `${e.name}: ${e.initialValue}`)
    .join(',\n  ')},\n}${suffix}`;
}

function indent(s: string) {
  return s
    .split('\n')
    .map((l) => `  ${l}`)
    .join('\n');
}
function toModelEvaluator(graph: Graph) {
  const stocks: Stock[] = graph.filter((e) => isStock(e)) as Stock[];
  const flows: Flow[] = graph.filter((e) => isFlow(e)) as Flow[];
  const variables: Variable[] = graph.filter((e) =>
    isVariable(e),
  ) as Variable[];
  const parameters: Parameter[] = graph.filter((e) =>
    isParameter(e),
  ) as Parameter[];

  const topSort = topSortKahn(graph);
  console.log(topSort);
  const variablesAndFlowsTopSort: (Flow | Variable)[] = topSort.filter(
    (e) => isFlow(e) || isVariable(e),
  ) as (Flow | Variable)[];

  const prefix = `// eslint-disable-next-line class-methods-use-this
public evaluate(stocks: Stocks, parameters: Parameters, t: number): Record {`;

  const stockDestructuring = `const { ${stocks
    .map((e) => e.name)
    .join(', ')} } = stocks;`;
  const parameterDestructuring = `const { ${parameters
    .map((e) => e.name)
    .join(', ')} } = parameters;`;
  const variableAndStockEvaluation = variablesAndFlowsTopSort
    .map((e) => `const ${e.name} = ${e.formula};`)
    .join('\n');

  const variableRestructuring = `const variables = { ${variables
    .map((v) => v.name)
    .join(', ')} };`;
  const flowRestructuring = `const flows = { ${flows
    .map((f) => f.name)
    .join(', ')} };`;

  const suffix = `  return { t, stocks, parameters, variables, flows };
}`;

  return `${prefix}
${indent(stockDestructuring)}
${indent(parameterDestructuring)}

${indent(variableAndStockEvaluation)}

${indent(variableRestructuring)}
${indent(flowRestructuring)}
  
${suffix}
`;
}

function toFlowPerStockAccumulator(stocks: Stock[], flows: Flow[]) {
  const stockInOut = new Map(
    stocks.map((s) => [s.name, { in: [] as string[], out: [] as string[] }]),
  );
  flows.forEach((f) => {
    stockInOut.get(f.start)?.out.push(f.name);
    stockInOut.get(f.end)?.in.push(f.name);
  });
  const stockStrings = [...stockInOut.entries()]
    .map(([name, inOuts]) => {
      let sumString = '';
      if (inOuts.in.length === 0 && inOuts.out.length === 0) {
        sumString = '0.0';
      } else {
        if (inOuts.in.length > 0) sumString += `( ${inOuts.in.join(' + ')} )`;
        if (inOuts.out.length > 0) {
          sumString += `${
            sumString.length === 0 ? '' : ' '
          }- ( ${inOuts.out.join(' + ')} )`;
        }
      }
      return `${name}: ${sumString},`;
    })
    .join('\n');

  const flowDestructuring = `const { ${flows
    .map((e) => e.name)
    .join(', ')} } = flows;`;

  return `// eslint-disable-next-line class-methods-use-this
public accumulateFlowsPerStock(flows: Flows): Stocks {
  ${flowDestructuring}
  
  const flowPerStock: Stocks = {
${indent(indent(stockStrings))}
  };
  
  return flowPerStock;
}
  `;
}

function compareByName(a: GraphNode, b: GraphNode) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }

  // names must be equal
  return 0;
}

const stocks: Stock[] = (
  im.findStocks() as { name: string; initial: string }[]
).map(
  (s): Stock => ({
    type: 'stock',
    name: transformNameToJs(s.name),
    initialValue: s.initial,
    arcs: [],
  }),
);
stocks.sort(compareByName);

const flows: Flow[] = (
  im.findFlows() as { name: string; rate: string; start: string; end: string }[]
).map(
  (f): Flow => ({
    type: 'flow',
    name: transformNameToJs(f.name),
    formula: transformFormulaToJs(f.rate),
    arcs: getNamesFromExpression(f.rate),
    start: transformNameToJs(f.start?.name),
    end: transformNameToJs(f.end?.name),
  }),
);
flows.sort(compareByName);

const variables: Variable[] = (
  im.findVariables() as { name: string; value: string }[]
)
  .filter((v) => v.value.includes('['))
  .map((v: { name: string; value: string }) => ({
    type: 'variable',
    name: transformNameToJs(v.name),
    formula: transformFormulaToJs(v.value),
    arcs: getNamesFromExpression(v.value),
  }));
variables.sort(compareByName);

const parameters: Parameter[] = (
  im.findVariables() as { name: string; value: string }[]
)
  .filter((v) => !v.value.includes('['))
  .map((p: { name: string; value: string }) => ({
    type: 'parameter',
    name: transformNameToJs(p.name),
    initialValue: transformFormulaToJs(p.value),
    arcs: [],
  }));
parameters.sort(compareByName);

console.log({ stocks, flows, variables, parameters });

const graph: Graph = [...stocks, ...flows, ...variables, ...parameters];

const stockIdsString = toIdArray(
  'const stockIds = ',
  ' as const;',
  stocks.map(({ name }) => name),
);

const flowIdsString = toIdArray(
  'const flowIds = ',
  ' as const;',
  flows.map(({ name }) => name),
);

const variableIdsString = toIdArray(
  'const variableIds = ',
  ' as const;',
  variables.map(({ name }) => name),
);

const parameterIdsString = toIdArray(
  'const parameterIds = ',
  ' as const;',
  parameters.map(({ name }) => name),
);

const initialStocksString = toInitialValueObject(
  'public static readonly initialStocks: Readonly<Stocks> = ',
  ';',
  stocks,
);

const initialParametersString = toInitialValueObject(
  'public static readonly defaultParameters: Readonly<Parameters> = ',
  ';',
  parameters,
);

const modelEvaluatorString = toModelEvaluator(graph);

const flowPerStockAccumulatorString = toFlowPerStockAccumulator(stocks, flows);

console.log(graph);

console.log(`
${stockIdsString}

${flowIdsString}

${variableIdsString}

${parameterIdsString}

${initialStocksString}

${initialParametersString}

${modelEvaluatorString}

${flowPerStockAccumulatorString}
`);
