import { strict as assert } from 'assert';
import { Record } from './circular-economy-model';

class Scores {
  static circularity(record: Record) {
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

export default Scores;
export { Scores };
