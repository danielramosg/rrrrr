import { strict as assert } from 'assert';
import {
  Record,
  stocksFlowsMatrix,
  stockIds,
  flowIds,
} from './circular-economy-model';

console.log(stocksFlowsMatrix);

// Create Stock selection vector

const selectedStocks = [
  'phonesInUse',
  'supplyOfBrokenPhones',
  'supplyOfDisposedPhones',
  'supplyOfHibernatingPhones',
  'supplyOfNewlyProducedPhones',
  'supplyOfRecycledMaterials',
  'supplyOfRefurbishedPhones',
  'supplyOfRepairedPhones',
];
const stockSelectionVector: (number | null)[] = new Array(stockIds.length)
  .fill(null)
  .map((s, i) => (selectedStocks.includes(stockIds[i]) ? 1 : 0));

console.log(stockSelectionVector);

// Create Initial state vector
const initialStateStocks = ['supplyOfNewlyProducedPhones'];
const stockStateVector: (number | null)[] = new Array(stockIds.length)
  .fill(null)
  .map((s, i) => (initialStateStocks.includes(stockIds[i]) ? 1 : 0));

console.log(stockStateVector);

class Scores {
  static circularity(record: Record) {
    console.log('\n New time step');

    // Create transition matrix
    const T = stocksFlowsMatrix
      .map((r) =>
        r.map((k) =>
          k !== null
            ? record.flows[flowIds[k] as keyof typeof record.flows]
            : 0,
        ),
      ) // changed flow ids by flow values from the record
      .map((r, i) => {
        const outFlows = r.reduce((acc, curr) => acc + curr, 0);
        const srcStock =
          record.stocks[stockIds[i] as keyof typeof record.stocks];

        if (srcStock < outFlows) {
          console.log(
            `Warning: outflows surpassing stock value at row ${i} (stock: ${stockIds[i]})`,
          );
          return r.map((k, j) => (i === j ? 0 : k / outFlows));
        }

        return r.map((k, j) =>
          i === j ? 1 - outFlows / srcStock : k / srcStock,
        );
      }); // added loops and normalization

    console.log('Transition matrix:');
    console.log(T);

    console.log('Record:');
    console.log(record);

    return 0.5;
  }

  static circularity_bak(record: Record) {
    const {
      produceFromNaturalResources,
      acquireNewlyProduced,
      acquireUsed,
      acquireRepaired,
      acquireRefurbished,
      disposeHibernating,
      disposeBroken,
      landfill,
    } = record.flows;

    const naturalResourcesShare = Math.min(
      1.0,
      produceFromNaturalResources /
        (acquireNewlyProduced +
          acquireUsed +
          acquireRepaired +
          acquireRefurbished),
    );
    const landfillShare = Math.min(
      1.0,
      landfill / (disposeHibernating + disposeBroken),
    );
    const circularity = Math.min(
      1.0 - naturalResourcesShare,
      1.0 - landfillShare,
    );

    if (!Number.isFinite(circularity) || Number.isNaN(circularity)) return 0;

    assert(
      circularity >= 0 && circularity <= 1,
      'circularity should be between 0 and 1',
    );

    return circularity;
  }

  static userSatifaction(record: Record) {
    const { phonesInUse } = record.stocks;
    const { phoneGoal } = record.variables;

    const userSatisfaction =
      phonesInUse < phoneGoal
        ? phonesInUse / phoneGoal
        : phoneGoal / phonesInUse;

    if (!Number.isFinite(userSatisfaction) || Number.isNaN(userSatisfaction))
      return 0;

    assert(
      userSatisfaction >= 0 && userSatisfaction <= 1,
      'userSatisfaction should be between 0 and 1',
    );

    return userSatisfaction;
  }

  static all(record: Record) {
    const circularity = Scores.circularity(record);
    const userSatisfaction = Scores.userSatifaction(record);

    return { circularity, userSatisfaction };
  }
}

export { Scores };
