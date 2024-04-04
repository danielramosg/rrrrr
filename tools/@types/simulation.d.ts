declare module 'simulation' {
  type InsightMakerStock = {
    name: string;
    initial: string;
    id: number;
  };

  type InsightMakerFlow = {
    name: string;
    rate: string;
    start: InsightMakerStock;
    end: InsightMakerStock;
    id: number;
  };

  type InsightMakerVariable = {
    name: string;
    value: string;
    id: number;
  };

  type InsightMakerParameter = {
    name: string;
    initialValue: string;
    id: number;
  };

  class InsightMakerModel {
    findStocks(): InsightMakerStock[];
    findFlows(): InsightMakerFlow[];
    findVariables(): InsightMakerVariable[];
  }

  function loadInsightMaker(xml: string): InsightMakerModel;
}
