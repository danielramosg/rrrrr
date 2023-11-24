import {
  Model,
  ModelElementIds,
  ModelElementArray,
  ModelElementObject,
  ModelRecord,
} from './model';
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

  public h: number;

  protected flowPerStockCache: {
    t: number;
    value: ModelElementArray<S>;
  } | null;

  protected flowEvaluator: FlowEvaluator<ModelElementArray<S>>;

  protected flowEvaluatorWithCache: FlowEvaluator<ModelElementArray<S>>;

  constructor(
    model: Model<S, F, V, P>,
    stocks: ModelElementObject<S>,
    parameters: ModelElementObject<P>,
    t: number,
    h: number,
  ) {
    this.model = model;
    this.parameters = parameters;
    this.flowPerStockCache = null;
    this.record = this.model.evaluate(stocks, parameters, t);
    this.h = h;
    this.flowEvaluator = this.model.createFlowEvaluator(parameters);
    // @ts-expect-error FIXME: Generic type inference issue
    this.flowEvaluatorWithCache = this.evaluateFlowPerStockWithCache.bind(this);
  }

  protected evaluateFlowPerStockWithCache(
    stockArray: ModelElementArray<S>,
    t: number,
  ): ModelElementArray<S> {
    if (this.flowPerStockCache !== null && this.flowPerStockCache.t === t)
      return this.flowPerStockCache.value;

    // @ts-expect-error FIXME: Generic type inference issue
    return this.flowEvaluator(stockArray, this.parameters, t);
  }

  step(): ModelRecord<S, F, V, P> {
    const { stocks, parameters, t } = this.record;
    const newStocks = this.model.step(
      stocks,
      t,
      this.h,
      this.flowEvaluatorWithCache,
    );
    const newRecord = this.model.evaluate(newStocks, parameters, t + this.h);
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

export default ModelSimulator;
