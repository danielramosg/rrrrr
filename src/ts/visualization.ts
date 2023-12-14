import kebabCase from 'lodash/kebabCase';

import { ModelElementObject } from './model';
import CircularEconomyModel, { Record } from './circular-economy-model';
import { loadSvg } from './util/load-svg';

const svgUrl = new URL('../svg/model.svg', import.meta.url);

const mainFlowIds = [
  'abandon',
  'acquireNewlyProduced',
  'acquireRefurbished',
  'acquireRepaired',
  'acquireUsed',
  'disposeBroken',
  'disposeHibernating',
  'goBroken',
  'landfill',
  'produceFromNaturalResources',
  'produceFromRecycledMaterials',
  'recycle',
  'refurbish',
  'repair',
] as const;

type MainFlowIds = typeof mainFlowIds;

const flowVizSigns: ModelElementObject<MainFlowIds> = {
  abandon: +1,
  acquireNewlyProduced: -1,
  acquireRefurbished: -1,
  acquireRepaired: -1,
  acquireUsed: -1,
  disposeBroken: -1,
  disposeHibernating: -1,
  goBroken: -1,
  landfill: -1,
  produceFromNaturalResources: -1,
  produceFromRecycledMaterials: -1,
  recycle: -1,
  refurbish: -1,
  repair: -1,
};

function guardedQuerySelector<T extends Element>(
  elem: Element | Document,
  selector: string,
  type: { new (...args: unknown[]): T },
): T {
  const result = elem.querySelector(selector);
  if (result === null) {
    throw new Error(`No element found matching selector ${selector}.`);
  }
  if (!(result instanceof type)) {
    throw new Error(
      `Element matching selector ${selector} has the wrong type.`,
    );
  }
  return result;
}

export default class Visualization {
  protected readonly model: CircularEconomyModel;

  public readonly element: HTMLDivElement;

  protected readonly svg: SVGSVGElement;

  protected constructor(model: CircularEconomyModel, svg: SVGSVGElement) {
    this.model = model;
    this.svg = svg;

    this.element = document.createElement('div');
    this.element.append(this.svg);
  }

  protected updateSvgFlows(deltaMs: DOMHighResTimeStamp, record: Record) {
    const { flows } = record;
    const flowVizScale = 5.0 / record.parameters.numberOfUsers;
    const dashGap = 20;
    mainFlowIds.forEach((id) => {
      const flow = flows[id];
      const flowVizSign = flowVizSigns[id];
      const elementId = `${kebabCase(id)}-flow`;
      const element = guardedQuerySelector(
        this.svg,
        `#${elementId}`,
        SVGPathElement,
      );
      const lastDashOffset = parseFloat(
        element.getAttribute('stroke-dashoffset') ?? '0',
      );
      // The dash offset step must not be small compared to the dash gap.
      // Otherwise, the flow animation may appear to move backwards.
      const dashOffsetStep = Math.max(
        -0.3 * dashGap,
        Math.min(flowVizSign * (deltaMs * flow) * flowVizScale, 0.1 * dashGap),
      );
      const dashOffset =
        (Number.isNaN(lastDashOffset) ? 0 : lastDashOffset) + dashOffsetStep;

      element.setAttribute('stroke-dashoffset', `${dashOffset}`);
      element.setAttribute('stroke-dasharray', `0 ${dashGap}`);
    });
  }

  protected updateSvgStocks(deltaMs: DOMHighResTimeStamp, record: Record) {
    const { stocks } = record;
    const stockVizScale = 50000.0 / record.parameters.numberOfUsers;
    this.model.stockIds.forEach((id) => {
      const elementId = kebabCase(id);
      const element = this.svg.getElementById(elementId);
      if (element === null) {
        throw new Error(
          `SVG element with id ${elementId} for stock ${id} not found.`,
        );
      }
      if (!(element instanceof SVGCircleElement)) {
        throw new Error(
          `Stock element for stock ${id} with id ${elementId} is not an SVG circle element.`,
        );
      }
      const stock = stocks[id];
      const radius = Math.sqrt((stock * stockVizScale) / Math.PI);
      element.setAttribute('r', `${radius}`);
    });
  }

  protected updateSvg(deltaMs: DOMHighResTimeStamp, record: Record) {
    this.updateSvgFlows(deltaMs, record);
    this.updateSvgStocks(deltaMs, record);
  }

  public update(deltaMs: DOMHighResTimeStamp, record: Record) {
    this.updateSvg(deltaMs, record);
  }

  public static prepareSvg(model: CircularEconomyModel, svg: SVGSVGElement) {
    const createSVGElement = (tagName: string) =>
      svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', tagName);

    svg.classList.add('model-visualization');
    svg.querySelectorAll('circle, rect, path, text').forEach((element) => {
      element.removeAttribute('style');
    });

    const elementsToRemove = [...svg.children];

    const labelLayer = createSVGElement('g');
    labelLayer.classList.add('labels');

    const supplyLayer = createSVGElement('g');
    supplyLayer.classList.add('supplies');

    const capacityLayer = createSVGElement('g');
    capacityLayer.classList.add('capacities');

    const flowLayer = createSVGElement('g');
    flowLayer.classList.add('flows');
    svg.append(capacityLayer, flowLayer, supplyLayer, labelLayer);

    svg.querySelectorAll('text').forEach((baseElement) => {
      const clone = baseElement.cloneNode(true) as SVGTextElement;
      clone.classList.add('label');
      labelLayer.append(clone);
    });

    svg.querySelectorAll('rect').forEach((baseElement) => {
      const clone = baseElement.cloneNode(false) as SVGRectElement;
      clone.classList.add('capacity');
      capacityLayer.append(clone);
    });

    model.stockIds
      .filter((id) => id.startsWith('supplyOf'))
      .forEach((id) => {
        const baseElementId = kebabCase(id.replace(/^supplyOf/, ''));
        const baseElement = guardedQuerySelector(
          svg,
          `#${baseElementId}`,
          SVGGeometryElement,
        );

        const clone = baseElement.cloneNode(false) as SVGGeometryElement;
        clone.id = `supply-of-${baseElement.id}`;
        clone.classList.add('stock', 'supply');
        supplyLayer.append(clone);
      });
    const phonesInUse = guardedQuerySelector(
      svg,
      '#phones-in-use',
      SVGGeometryElement,
    );
    const phonesInUseClone = phonesInUse.cloneNode(false) as SVGGeometryElement;
    supplyLayer.append(phonesInUseClone);

    model.stockIds
      .filter((id) => id.startsWith('capacityOf'))
      .forEach((id) => {
        const baseElementId = kebabCase(id.replace(/^capacityOf/, ''));
        const baseElement = guardedQuerySelector(
          svg,
          `#${baseElementId}`,
          SVGGeometryElement,
        );

        const clone = baseElement.cloneNode(false) as SVGGeometryElement;
        clone.id = `capacity-of-${baseElementId}`;
        clone.classList.add('stock', 'capacity');
        capacityLayer.append(clone);
      });
    mainFlowIds.forEach((id) => {
      const baseElementId = kebabCase(id);
      const baseElement = guardedQuerySelector(
        svg,
        `#${baseElementId}`,
        SVGGeometryElement,
      );

      const edge = baseElement.cloneNode(false) as SVGGeometryElement;
      edge.id = `${baseElementId}-edge`;
      edge.removeAttribute('style');
      edge.classList.add('flow', 'edge');
      flowLayer.append(edge);

      const flow = baseElement.cloneNode(false) as SVGGeometryElement;
      flow.id = `${baseElementId}-flow`;
      flow.removeAttribute('style');
      flow.classList.add('flow', 'anim-edge');
      flowLayer.append(flow);
    });

    elementsToRemove.forEach((element) => element.remove());
  }

  public static async create(model: CircularEconomyModel) {
    const svg = await loadSvg(svgUrl);
    this.prepareSvg(model, svg);
    return new Visualization(model, svg);
  }
}
