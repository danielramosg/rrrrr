import ChartJs from 'chart.js/auto';
import { CircularEconomyModel, Record } from './circular-economy-model';

class Chart {
  readonly chartJs: ChartJs;

  constructor(canvas: HTMLCanvasElement, initialRecord: Record) {
    const initialChartRecord = Chart.toChartJsRecord(initialRecord);

    this.chartJs = new ChartJs(canvas, {
      type: 'bar',
      data: {
        labels: initialChartRecord.map((row) => row.id),
        datasets: [
          {
            label: 'Values',
            data: initialChartRecord.map((row) => row.value),
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
