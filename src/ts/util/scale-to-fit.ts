import { strict as assert } from 'assert';

export class ScaleToFitParent {
  protected observer: ResizeObserver;

  constructor(
    element: HTMLElement,
    targetSize: { width: number; height: number },
  ) {
    const { parentElement } = element;
    assert(parentElement !== null, 'element must have a parent');
    this.observer = new ResizeObserver(() =>
      ScaleToFitParent.fit(element, parentElement, targetSize),
    );
    this.observer.observe(element.parentElement);
    ScaleToFitParent.fit(element, parentElement, targetSize);
  }

  disconnect() {
    this.observer.disconnect();
  }

  static fit(
    innerElement: HTMLElement,
    outerElement: HTMLElement,
    targetSize: { width: number; height: number },
  ) {
    const outerRect = outerElement.getBoundingClientRect();
    const scale = Math.min(
      outerRect.width / targetSize.width,
      outerRect.height / targetSize.height,
    );
    const innerStyle = innerElement.style;
    innerStyle.width = `${targetSize.width}px`;
    innerStyle.height = `${targetSize.height}px`;
    innerStyle.transformOrigin = 'top left';
    innerStyle.transform = `translate(${outerRect.width / 2}px, ${outerRect.height / 2}px) scale(${scale}) translate(-50%, -50%)`;
  }
}
