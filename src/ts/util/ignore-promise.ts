function ignorePromise<T>(promise: Promise<T>): void {
  void promise;
}

export default ignorePromise;
export { ignorePromise };
