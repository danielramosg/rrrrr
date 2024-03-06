import ChartJs from 'chart.js/auto';
import {
  CircularEconomyModel,
  stockIds,
  flowIds,
  variableIds,
  parameterIds,
  Record,
} from './circular-economy-model';

class Chart {
  readonly chartJs: ChartJs;

  constructor(canvas: HTMLCanvasElement) {
    const labels = {
      stocks: stockIds,
      flows: flowIds,
      variables: variableIds,
      parameters: parameterIds,
    };
    const labelsArray = Object.values(labels).flat();

    this.chartJs = new ChartJs(canvas, {
      type: 'bar',
      data: {
        labels: labelsArray,
        datasets: [
          {
            label: 'Values',
            data: new Array<number>(labelsArray.length).fill(0),
          },
        ],
      },
      options: { animation: false },
    });
  }

  update(record: Record) {
    const chartRecord = Chart.toChartJsRecord(record);
    this.chartJs.data.datasets[0].data = chartRecord.map((row) => row.value);
    this.chartJs.update();
  }

  protected static toChartJsRecord(
    record: Record,
  ): { id: string; value: number }[] {
    return CircularEconomyModel.elementIds
      .map((key) =>
        Object.entries(record[key]).map(([id, value]) => ({ id, value })),
      )
      .reduce((cur, acc) => [...cur, ...acc], []);
  }
}

export default Chart;
export { Chart };
