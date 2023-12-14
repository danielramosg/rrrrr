export function guardedQuerySelector<T extends Element>(
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

export function guardedQuerySelectorAll<T extends Element>(
  elem: Element | Document,
  selector: string,
  type: { new (...args: unknown[]): T },
): NodeListOf<T> {
  const results = elem.querySelectorAll(selector);
  results.forEach((result) => {
    if (!(result instanceof type)) {
      throw new Error(
        `An element matching selector ${selector} has the wrong type.`,
      );
    }
  });

  return results as NodeListOf<T>;
}
