let refreshPromise = null;

export function getRefreshPromise(refreshSession) {
  if (!refreshPromise) {
    refreshPromise = Promise.resolve(refreshSession()).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export function resetRefreshPromiseForTests() {
  refreshPromise = null;
}
