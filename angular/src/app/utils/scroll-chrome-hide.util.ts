const SCROLL_TOP_EXPAND_AT = 20;
const SCROLL_DELTA_COMPACT = 4;

export type ScrollChromeCompactState = {
  compact: boolean;
  lastScrollTop: number;
};

export function createScrollChromeCompactState(): ScrollChromeCompactState {
  return { compact: false, lastScrollTop: 0 };
}

export function resetScrollChromeCompactState(state: ScrollChromeCompactState): boolean {
  state.lastScrollTop = 0;
  if (state.compact) {
    state.compact = false;
    return true;
  }
  return false;
}

export function readMaxScrollTop(
  hostEl: HTMLElement,
  mainSelector = '.rooms-dev-main',
): number {
  let scrollTop = 0;
  if (typeof window !== 'undefined') {
    scrollTop = Math.max(
      scrollTop,
      window.scrollY || 0,
      document.documentElement.scrollTop || 0,
      document.body.scrollTop || 0,
    );
  }
  const appContentEl = hostEl.closest('.app-content') as HTMLElement | null;
  if (appContentEl) {
    scrollTop = Math.max(scrollTop, appContentEl.scrollTop);
  }
  const mainEl = hostEl.querySelector(mainSelector) as HTMLElement | null;
  if (mainEl) {
    scrollTop = Math.max(scrollTop, mainEl.scrollTop);
  }
  return scrollTop;
}

/** يُصغّر الشريط العلوي إلى زر عند التمرير لأسفل — لا يعود تلقائياً إلا عند أعلى الصفحة */
export function updateScrollChromeCompact(
  state: ScrollChromeCompactState,
  scrollTop: number,
  onCompactChange: (compact: boolean) => void,
): void {
  if (scrollTop <= SCROLL_TOP_EXPAND_AT) {
    state.lastScrollTop = scrollTop;
    if (state.compact) {
      state.compact = false;
      onCompactChange(false);
    }
    return;
  }

  const delta = scrollTop - state.lastScrollTop;
  state.lastScrollTop = scrollTop;

  if (delta > SCROLL_DELTA_COMPACT && !state.compact) {
    state.compact = true;
    onCompactChange(true);
  }
}
