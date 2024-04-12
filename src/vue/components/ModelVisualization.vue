<script setup lang="ts">
import { strict as assert } from 'assert';
import kebabCase from 'lodash/kebabCase';
import { onMounted, ref } from 'vue';

import type { ModelElementObject } from '../../ts/model';
import type { Record } from '../../ts/circular-economy-model';

import { useAppStore } from '../../ts/stores/app';
import { useModelStore } from '../../ts/stores/model';
import { CircularEconomyModel } from '../../ts/circular-economy-model';
import { loadSvg } from '../../ts/util/load-svg';
import { guardedQuerySelector } from '../../ts/util/guarded-query-selectors';

const svgUrl = new URL('../../svg/model.svg', import.meta.url);

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

const kebabCaseStockIds = [
  'recycled-materials',
  'hibernating-phones',
  'disposed-phones',
  'broken-phones',
  'repaired-phones',
  'phones-in-use',
  'refurbished-phones',
  'newly-produced-phones',
  'natural-resources',
  'landfilled-phones',
];

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

const dashGap = 30; // FIXME: Calculate from CSS
const lineWidth = 10; // FIXME: Calculate from CSS
const dotRadius = 20; // FIXME: Calculate from CSS
const lineSegmentArea = lineWidth * dashGap;
const dotWithoutLineSegmentArea =
  Math.sqrt(dotRadius ** 2 - lineWidth ** 2) * lineWidth;
const averageFlowVizWidth = lineSegmentArea + dotWithoutLineSegmentArea;
console.log(lineSegmentArea, dotWithoutLineSegmentArea, averageFlowVizWidth);
const quantityScaleFactor = 30000.0;
class ModelView {
  protected readonly model: CircularEconomyModel;

  public readonly element: HTMLDivElement;

  protected readonly svg: SVGSVGElement;

  constructor(model: CircularEconomyModel, svg: SVGSVGElement) {
    this.model = model;
    this.svg = svg;

    this.element = document.createElement('div');
    this.element.append(this.svg);
  }

  protected updateSvgFlows(
    deltaMs: DOMHighResTimeStamp,
    stepSize: number,
    record: Record,
  ) {
    const { flows } = record;
    const flowVizScale =
      (stepSize * (quantityScaleFactor / record.parameters.numberOfUsers)) /
      averageFlowVizWidth;
    mainFlowIds.forEach((id) => {
      const flow = flows[id];
      const flowVizSign = flowVizSigns[id];
      const elementId = `${kebabCase(id)}-flow`;
      const element = guardedQuerySelector(
        SVGPathElement,
        `#${elementId}`,
        this.svg,
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

  protected updateSvgStocks(
    deltaMs: DOMHighResTimeStamp,
    stepSize: number,
    record: Record,
  ) {
    const { stocks } = record;
    const stockVizScale = quantityScaleFactor / record.parameters.numberOfUsers;
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

  protected updateSvg(
    deltaMs: DOMHighResTimeStamp,
    stepSize: number,
    record: Record,
  ) {
    this.updateSvgFlows(deltaMs, stepSize, record);
    this.updateSvgStocks(deltaMs, stepSize, record);
  }

  public update(
    deltaMs: DOMHighResTimeStamp,
    stepSize: number,
    record: Record,
  ) {
    this.updateSvg(deltaMs, stepSize, record);
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

    svg.querySelectorAll('text').forEach((element) => {
      elementsToRemove.push(element);
    });

    function createForeignDiv(
      x: number,
      y: number,
      width: number,
      height: number,
    ) {
      const foreignObjectElement = createSVGElement('foreignObject');
      foreignObjectElement.setAttribute('x', `${x}`);
      foreignObjectElement.setAttribute('y', `${y}`);
      foreignObjectElement.setAttribute('width', `${width}`);
      foreignObjectElement.setAttribute('height', `${height}`);

      const divElement = foreignObjectElement.ownerDocument.createElementNS(
        'http://www.w3.org/1999/xhtml',
        'div',
      );

      foreignObjectElement.append(divElement);

      return { foreignObjectElement, divElement };
    }

    function getCircleCenter(element: SVGCircleElement) {
      const x = parseFloat(element.getAttribute('cx') ?? '');
      assert(!Number.isNaN(x));
      const y = parseFloat(element.getAttribute('cy') ?? '');
      assert(!Number.isNaN(y));
      return { x, y };
    }

    function getRectangleCenter(element: SVGRectElement) {
      const x = parseFloat(element.getAttribute('x') ?? '');
      assert(!Number.isNaN(x));
      const y = parseFloat(element.getAttribute('y') ?? '');
      assert(!Number.isNaN(y));
      const width = parseFloat(element.getAttribute('width') ?? '');
      assert(!Number.isNaN(width));
      const height = parseFloat(element.getAttribute('height') ?? '');
      assert(!Number.isNaN(height));
      return { x: x + width / 2, y: y + height / 2 };
    }

    kebabCaseStockIds.forEach((id) => {
      const baseElement = guardedQuerySelector(
        SVGGeometryElement,
        `#${id}`,
        svg,
      );
      assert(
        baseElement.tagName === 'circle' || baseElement.tagName === 'rect',
      );
      const { x, y } =
        baseElement.tagName === 'circle'
          ? getCircleCenter(baseElement as SVGCircleElement)
          : getRectangleCenter(baseElement as SVGRectElement);

      const { foreignObjectElement, divElement } = createForeignDiv(
        x,
        y,
        200,
        50,
      );

      divElement.textContent = id;
      divElement.classList.add('label');
      divElement.style.display = 'var(--dev-mode-label-display)';

      labelLayer.append(foreignObjectElement);
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
          SVGGeometryElement,
          `#${baseElementId}`,
          svg,
        );

        const clone = baseElement.cloneNode(false) as SVGGeometryElement;
        clone.id = `supply-of-${baseElement.id}`;
        clone.classList.add('stock', 'supply');
        supplyLayer.append(clone);
      });
    const phonesInUse = guardedQuerySelector(
      SVGGeometryElement,
      '#phones-in-use',
      svg,
    );
    const phonesInUseClone = phonesInUse.cloneNode(false) as SVGGeometryElement;
    supplyLayer.append(phonesInUseClone);

    model.stockIds
      .filter((id) => id.startsWith('capacityOf'))
      .forEach((id) => {
        const baseElementId = kebabCase(id.replace(/^capacityOf/, ''));
        const baseElement = guardedQuerySelector(
          SVGGeometryElement,
          `#${baseElementId}`,
          svg,
        );

        const clone = baseElement.cloneNode(false) as SVGGeometryElement;
        clone.id = `capacity-of-${baseElementId}`;
        clone.classList.add('stock', 'capacity');
        capacityLayer.append(clone);
      });
    mainFlowIds.forEach((id) => {
      const baseElementId = kebabCase(id);
      const baseElement = guardedQuerySelector(
        SVGGeometryElement,
        `#${baseElementId}`,
        svg,
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
}

const svgPromise = loadSvg(svgUrl);

const appStore = useAppStore();

const modelStore = useModelStore();
const model = new CircularEconomyModel();
const modelView = ref<ModelView | null>(null);

const container = ref<HTMLElement | null>(null);
onMounted(() => {
  svgPromise.then((svg) => {
    ModelView.prepareSvg(model, svg);
    modelView.value = new ModelView(model, svg);
    modelView.value.update(0, 0, modelStore.record);
    assert(container.value !== null);
    container.value.append(modelView.value.element);
  });
});

const update = (
  deltaMs: DOMHighResTimeStamp,
  stepSize: number,
  record: Record,
) => {
  if (modelView.value === null) return;
  modelView.value.update(deltaMs, stepSize, record);
};

defineExpose({ update });
</script>

<template>
  <div
    ref="container"
    class="model-viz-container"
    :style="{
      '--dev-mode-label-display': appStore.isDeveloperModeActive
        ? 'inline'
        : 'none',
    }"
  ></div>
</template>
