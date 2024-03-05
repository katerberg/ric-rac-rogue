export function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}
export function isDebug(): boolean {
  return getUrlParams().get('debug') !== null;
}

export function skipMenu(): boolean {
  return getUrlParams().get('skipmenu') !== null;
}
