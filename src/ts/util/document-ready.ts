export async function documentReady() {
  return new Promise<void>((resolve) => {
    const state = document.readyState;
    if (state === 'complete' || state === 'interactive') {
      setTimeout(resolve, 0);
    }

    document.addEventListener('DOMContentLoaded', () => resolve());
  });
}
