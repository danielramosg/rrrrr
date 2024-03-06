export function isVarName(str: unknown): boolean {
  if (typeof str !== 'string') {
    return false;
  }

  if (str.trim() !== str) {
    return false;
  }

  if (str.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) === null) {
    return false;
  }

  return true;
}
