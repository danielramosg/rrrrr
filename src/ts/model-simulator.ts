import type {
  ModelElementIds,
  ModelElementArray,
  ModelElementObject,
  ModelRecord,
} from './model';
import { Model } from './model';

import { FlowEvaluator } from './box-model/types';

class ModelSimulator<
  S extends ModelElementIds,
  F extends ModelElementIds,
  V extends ModelElementIds,
  P extends ModelElementIds,
> {
  public readonly model: Model<S, F, V, P>;

  public readonly parameters: ModelElementObject<P>;

  public record: ModelRecord<S, F, V, P>;

  public deltaPerSecond: number;

  public maxStepSize: number;

  protected flowPerStockCache: {
    t: number;
    value: readonly [...ModelElementArray<S>];
  } | null;

  protected flowEvaluator: FlowEvaluator<ModelElementArray<S>>;

  protected flowEvaluatorWithCache: FlowEvaluator<ModelElementArray<S>>;

  constructor(
    model: Model<S, F, V, P>,
    stocks: ModelElementObject<S>,
    parameters: ModelElementObject<P>,
    t: number,
    deltaPerSecond: number,
    maxStepSize: number,
  ) {
    this.model = model;
    this.parameters = parameters;
    this.flowPerStockCache = null;
    this.record = this.model.evaluate(stocks, parameters, t);
    this.deltaPerSecond = deltaPerSecond;
    this.maxStepSize = maxStepSize;
    this.flowEvaluator = this.model.createFlowEvaluator(parameters);
    this.flowEvaluatorWithCache = this.evaluateFlowPerStockWithCache.bind(this);
  }

  protected evaluateFlowPerStockWithCache(
    stockArray: readonly [...ModelElementArray<S>],
    t: number,
  ): [...ModelElementArray<S>] {
    if (this.flowPerStockCache !== null && this.flowPerStockCache.t === t)
      return [...this.flowPerStockCache.value];

    return this.flowEvaluator(stockArray, t);
  }

  tick(seconds: number): ModelRecord<S, F, V, P> {
    const targetT = this.record.t + seconds * this.deltaPerSecond;
    while (this.record.t < targetT) {
      const stepSize = Math.min(this.maxStepSize, targetT - this.record.t);
      this.step(stepSize);
    }
    return this.record;
  }

  protected step(h: number): ModelRecord<S, F, V, P> {
    const { stocks, parameters, t } = this.record;
    const newStocks = this.model.step(
      stocks,
      t,
      h,
      this.flowEvaluatorWithCache,
    );
    const newRecord = this.model.evaluate(newStocks, parameters, t + h);
    this.flowPerStockCache = {
      t: newRecord.t,
      value: this.model.stocksToStockArray(
        this.model.accumulateFlowsPerStock(newRecord.flows),
      ),
    };
    this.record = newRecord;
    return newRecord;
  }
}

export { ModelSimulator };
