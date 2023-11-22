export async function animationFrame(): Promise<DOMHighResTimeStamp> {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}
