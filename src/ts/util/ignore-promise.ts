function ignorePromise<T>(promise: Promise<T>): void {
  void promise;
}

export { ignorePromise };
