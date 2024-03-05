export function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}
export function isDebug(param?: string): boolean {
  return getUrlParams().get('debug') !== null && (!param || getUrlParams().get(param) !== null);
}

export function skipMenu(): boolean {
  return getUrlParams().get('skipmenu') !== null;
}
