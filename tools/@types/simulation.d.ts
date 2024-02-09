declare module 'simulation' {
  type InsightMakerStock = {
    name: string;
    initial: string;
  };

  type InsightMakerFlow = {
    name: string;
    rate: string;
    start: InsightMakerStock;
    end: InsightMakerStock;
  };

  type InsightMakerVariable = {
    name: string;
    value: string;
  };

  type InsightMakerParameter = {
    name: string;
    initialValue: string;
  };

  class InsightMakerModel {
    findStocks(): InsightMakerStock[];
    findFlows(): InsightMakerFlow[];
    findVariables(): InsightMakerVariable[];
  }

  function loadInsightMaker(xml: string): InsightMakerModel;
}
