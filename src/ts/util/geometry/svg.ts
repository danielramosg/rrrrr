import { strict as assert } from 'assert';

export function getCircleCenter(element: SVGCircleElement) {
  const x = parseFloat(element.getAttribute('cx') ?? '');
  assert(!Number.isNaN(x));
  const y = parseFloat(element.getAttribute('cy') ?? '');
  assert(!Number.isNaN(y));
  return { x, y };
}

export function getRectangleCenter(element: SVGRectElement) {
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
