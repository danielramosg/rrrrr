/**
 * Loads an external SVG file and returns the DOM tree of its first <svg> element.
 *
 * @param {string|URL} uri
 * @param {boolean} clearStyles
 *  If true removes the style elements from the file
 * @return {Promise<SVGSVGElement>}
 */
export async function loadSvg(uri: string | URL, clearStyles = true) {
  const response = await fetch(uri);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Server returned status ${response.status} (${
        response.statusText
      }) loading ${new URL(uri).href}.`,
    );
  }
  const svgText = await response.text();
  const div = document.createElement('div');
  div.innerHTML = svgText;
  const svgDoc = div.querySelector('svg');
  if (svgDoc === null) {
    throw new Error(`No SVG element found in ${new URL(uri).href}.`);
  }

  if (clearStyles) {
    svgDoc.querySelectorAll('style')?.forEach((s) => s.remove());
  }

  return svgDoc;
}
