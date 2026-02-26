import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { vi } from "vitest";

/**
 * Frontend test utilities and helpers
 */

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create a mock context value
 */
export function createMockContextValue<T>(overrides: Partial<T> = {}): T {
  return overrides as T;
}

/**
 * Wait for an element to appear in the DOM
 */
export async function waitForElement(
  predicate: () => HTMLElement | null,
  timeout: number = 5000
): Promise<HTMLElement> {
  const startTime = Date.now();
  let element: HTMLElement | null = null;

  while (Date.now() - startTime < timeout) {
    element = predicate();
    if (element) return element;
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  throw new Error("Element not found within timeout");
}

/**
 * Setup React hook testing utilities
 */
export function setupHookTest<T>(
  hook: (props?: any) => T,
  initialProps?: any
) {
  let result: T;
  let renderCount = 0;

  const Component = (props: any) => {
    result = hook(props);
    renderCount++;
    return null;
  };

  const rerenderWith = (newProps: any) => {
    render(<Component {...newProps} />, { rerender: true });
  };

  render(<Component {...initialProps} />);

  return {
    result: () => result,
    renderCount: () => renderCount,
    rerender: rerenderWith,
  };
}

/**
 * Mock window.location
 */
export function createMockLocation(overrides: Partial<Location> = {}) {
  return {
    href: "http://localhost/",
    origin: "http://localhost",
    protocol: "http:",
    host: "localhost",
    hostname: "localhost",
    port: "",
    pathname: "/",
    search: "",
    hash: "",
    ...overrides,
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  } as any;
}

/**
 * Mock window.matchMedia (already in setup but here as reusable)
 */
export function createMockMatchMedia(query: string, matches: boolean = false) {
  return {
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

/**
 * Create a mock IntersectionObserver
 */
export function createMockIntersectionObserver() {
  const observerCallback = vi.fn();

  class MockIntersectionObserver {
    constructor(callback: any) {
      observerCallback.mockImplementation(callback);
    }

    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
}

/**
 * Setup global IntersectionObserver mock
 */
export function setupIntersectionObserverMock() {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as any;
}

/**
 * Create a mock ResizeObserver
 */
export function setupResizeObserverMock() {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any;
}

/**
 * Mock user interaction helpers
 */
export const userInteraction = {
  typeText: (element: HTMLInputElement, text: string) => {
    element.value = text;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  },

  clickButton: (element: HTMLButtonElement) => {
    element.click();
    element.dispatchEvent(new Event("click", { bubbles: true }));
  },

  selectOption: (element: HTMLSelectElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  },
};

/**
 * Mock transition/animation helpers
 */
export const mockAnimations = {
  mockTransitionDuration: (ms: number = 0) => {
    vi.useFakeTimers();
    return {
      runAllTimers: () => vi.runAllTimersAsync(),
      cleanup: () => vi.useRealTimers(),
    };
  },

  mockAnimationFrame: () => {
    let callbacks: FrameRequestCallback[] = [];

    const requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return callbacks.length;
    });

    const cancelAnimationFrame = vi.fn((id: number) => {
      callbacks = callbacks.filter((_, idx) => idx !== id - 1);
    });

    return {
      requestAnimationFrame,
      cancelAnimationFrame,
      flush: (timestamp: number = 0) => {
        callbacks.forEach(cb => cb(timestamp));
        callbacks = [];
      },
    };
  },
};

/**
 * Create a mock localStorage spy
 */
export function spyOnLocalStorage() {
  const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
  const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
  const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");

  return {
    getItem: getItemSpy,
    setItem: setItemSpy,
    removeItem: removeItemSpy,
    cleanup: () => {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    },
  };
}
