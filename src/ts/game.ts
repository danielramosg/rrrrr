import { ModelView } from './model-view';
import {
  CircularEconomyModel,
  type FlowIds,
  type ParameterIds,
  type StockIds,
  type VariableIds,
} from './circular-economy-model';
import { ModelSimulator } from './model-simulator';
import { Runner } from './util/runner';

type GameConfig = {
  model: {
    initialParameters: typeof CircularEconomyModel.defaultParameters;
    initialStocks: typeof CircularEconomyModel.initialStocks;
  };
  simulation: {
    deltaPerSecond: number;
    maxStepSize: number;
  };
};

type CircularEconomyModelSimulator = ModelSimulator<
  StockIds,
  FlowIds,
  VariableIds,
  ParameterIds
>;

class Game {
  readonly element: HTMLDivElement;

  readonly config: GameConfig;

  readonly runner: Runner;

  readonly modelSimulator: CircularEconomyModelSimulator;

  readonly modelView: ModelView;

  protected constructor(
    element: HTMLDivElement,
    model: CircularEconomyModel,
    modelView: ModelView,
    config: GameConfig,
  ) {
    this.element = element;
    this.config = config;

    this.modelSimulator = new ModelSimulator<
      StockIds,
      FlowIds,
      VariableIds,
      ParameterIds
    >(
      model,
      { ...config.model.initialStocks },
      { ...config.model.initialParameters },
      0.0,
      config.simulation.deltaPerSecond,
      config.simulation.maxStepSize,
    );
    this.modelView = modelView;
    this.element.append(this.modelView.element);

    this.runner = new Runner();
    this.runner.on('tick', this.tick.bind(this));
  }

  tick(deltaMs: DOMHighResTimeStamp) {
    const { t: lastT } = this.modelSimulator.record;
    this.modelSimulator.tick(deltaMs);
    const { t: currentT } = this.modelSimulator.record;
    const deltaT = currentT - lastT;

    this.modelView.update(deltaMs, deltaT, this.modelSimulator.record);
  }

  static async create(element: HTMLDivElement, config: GameConfig) {
    const model = new CircularEconomyModel();
    const modelView = await ModelView.create(model);
    return new Game(element, model, modelView, config);
  }
}

export { Game };
export type { GameConfig, CircularEconomyModelSimulator };
