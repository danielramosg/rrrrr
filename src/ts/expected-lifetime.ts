import {
  IdentityMatrix,
  subSquareMatrix,
  superSquareMatrix,
  subArray,
  math,
} from './matrixFns';

import {
  type Record,
  stocksFlowsMatrix,
  stockIds,
  flowIds,
} from './circular-economy-model';

/* 
We get the stocksFlowsMatrix and we fix it: the Nature and Landfill stocks are missing
*/
// We add two rows/columns corresponding to the two new stocks
const graphMatrix = superSquareMatrix(stocksFlowsMatrix, 2);

// We fill-in the two flows (from-Nature and to-Landfill) by hand
// Flow from Nature
graphMatrix[graphMatrix.length - 2][
  stockIds.indexOf('supplyOfNewlyProducedPhones')
] = flowIds.indexOf('produceFromNaturalResources');

// Flow to Landfill
graphMatrix[stockIds.indexOf('supplyOfDisposedPhones')][
  graphMatrix.length - 1
] = flowIds.indexOf('landfill');

// console.table(stocksFlowsMatrix);
// console.table(graphMatrix);

// Not all the stocks are part of the graph we are interested in (we disregard the Capacity* stocks).
const graphStocks = [
  'phonesInUse',
  'supplyOfBrokenPhones',
  'supplyOfDisposedPhones',
  'supplyOfHibernatingPhones',
  'supplyOfNewlyProducedPhones',
  'supplyOfRecycledMaterials',
  'supplyOfRefurbishedPhones',
  'supplyOfRepairedPhones',
];

// And within our interest graph, we want to compute the expected time spent in some of the stocks
const selectedStocks_all = graphStocks;
const selectedStocks_use = ['phonesInUse'];

// We create the Stock selection vector(s): a 1 for each selected stock, otherwise zero.

const stockSelectionVector_all: number[] = new Array(stockIds.length + 2)
  .fill(null)
  .map((s, i) => (selectedStocks_all.includes(stockIds[i]) ? 1 : 0));

const stockSelectionVector_use: number[] = new Array(stockIds.length + 2)
  .fill(null)
  .map((s, i) => (selectedStocks_use.includes(stockIds[i]) ? 1 : 0));

// We can reduce the dimension of our vectors by removing the entries corresponding to
// unused stocks (capacity*), Nature and Landfill
const deleteIndices: number[] = [];

stockSelectionVector_all.forEach((v, i) => {
  if (v === 0) {
    deleteIndices.push(i);
  }
});

// We create the reduced vectors
const reducedStockSelectionVector_all = subArray(
  stockSelectionVector_all,
  deleteIndices,
);
const reducedStockSelectionVector_use = subArray(
  stockSelectionVector_use,
  deleteIndices,
);

// console.log(stockSelectionVector_all);
// console.log(reducedStockSelectionVector_all);
// console.log(reducedStockSelectionVector_use);
// console.log(deleteIndices);

const IMatrix = IdentityMatrix(graphMatrix.length);

// Create Initial state vector. It has a 1 on the stock where we place an intial phone item.
const initialStateStocks = ['supplyOfNewlyProducedPhones'];
const initialStateVector: (number | null)[] = new Array(stockIds.length)
  .fill(null)
  .map((s, i) => (initialStateStocks.includes(stockIds[i]) ? 1 : 0));

initialStateVector.splice(initialStateVector.length, 0, null, null);

const reducedInitialStateVector = subArray(initialStateVector, deleteIndices);

// console.log(initialStateVector);
// console.log(reducedInitialStateVector);

function expectedLifetime(record: Record) {
  //   console.log('\n New time step');

  // Create transition matrix
  const T = graphMatrix
    .map((r) =>
      r.map((k) =>
        k !== null ? record.flows[flowIds[k] as keyof typeof record.flows] : 0,
      ),
    ) // changed flow ids by flow values from the record
    .map((r, i) => {
      const outFlows = r.reduce((acc, curr) => acc + curr, 0);
      const srcStock = record.stocks[stockIds[i] as keyof typeof record.stocks];

      if (srcStock === undefined) {
        // console.log(`Warning: missing stock value at row ${i} `);
        if (!outFlows) return r.map((_k) => 0);
        return r.map((k) => k / outFlows);
      }

      if (srcStock < outFlows) {
        // console.log(
        //   `Warning: outflows surpassing stock value at row ${i} (stock: ${stockIds[i]})`,
        // );
        return r.map((k, j) => (i === j ? 0 : k / outFlows));
      }

      return r.map((k, j) =>
        i === j ? 1 - outFlows / srcStock : k / srcStock,
      );
    }); // added loops and normalization

  //   console.log('Transition matrix:');
  //   console.table(T);

  // console.log('Record:');
  // console.log(record);

  const L = math.subtract(IMatrix, T);
  const U = subSquareMatrix(L, deleteIndices);

  //   console.table(L);
  //   console.table(U);

  // console.log(math.det(L));
  // console.log(math.det(U));

  try {
    const V = math.inv(U as number[][]);
    // console.table(V);

    const result_all = math.multiply(
      math.multiply(reducedInitialStateVector as number[], V),
      reducedStockSelectionVector_all as number[],
    );

    const result_use = math.multiply(
      math.multiply(reducedInitialStateVector as number[], V),
      reducedStockSelectionVector_use as number[],
    );

    // console.log('\nExpected lifetime: ', result);
    return { all: result_all, use: result_use };
  } catch (error) {
    console.error('Non-invertible matrix in expected-lifetime');
  }

  return null;
}

export { expectedLifetime };
