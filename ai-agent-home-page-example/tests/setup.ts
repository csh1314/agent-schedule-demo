import "@testing-library/jest-dom/vitest";

// Mock IntersectionObserver for useScrollAnimation tests
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "0px";
  readonly thresholds: ReadonlyArray<number> = [0];
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(): void {
    // Trigger callback with isIntersecting: false by default
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  // Helper to simulate intersection
  simulateIntersection(isIntersecting: boolean): void {
    const entry = {
      isIntersecting,
      intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      target: document.createElement("div"),
      time: Date.now(),
    };
    this.callback([entry], this);
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock requestAnimationFrame / cancelAnimationFrame
let rafId = 0;
const rafTimers = new Set<ReturnType<typeof setTimeout>>();

globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number => {
  rafId += 1;
  const id = rafId;
  const timer = setTimeout(() => {
    rafTimers.delete(timer);
    try {
      cb(performance.now());
    } catch {
      // Ignore errors after environment teardown
    }
  }, 16);
  rafTimers.add(timer);
  return id;
};

globalThis.cancelAnimationFrame = (): void => {
  // Clear all pending rAF timers
  for (const timer of rafTimers) {
    clearTimeout(timer);
  }
  rafTimers.clear();
};

// Mock canvas context
HTMLCanvasElement.prototype.getContext = (() => ({
  clearRect: () => {},
  beginPath: () => {},
  arc: () => {},
  fill: () => {},
  moveTo: () => {},
  lineTo: () => {},
  stroke: () => {},
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock scrollIntoView
Element.prototype.scrollIntoView = () => {};
