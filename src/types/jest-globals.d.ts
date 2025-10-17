// Оголошення типів для @jest/globals

declare module '@jest/globals' {
  export const describe: (name: string, fn: () => void) => void;
  export const test: (name: string, fn: () => void, timeout?: number) => void;
  export const it: typeof test;
  export const expect: <T>(actual: T) => {
    toBe: (expected: T) => void;
    toEqual: (expected: T) => void;
    toBeDefined: () => void;
    toBeUndefined: () => void;
    toBeNull: () => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toContain: (expected: any) => void;
    toHaveLength: (expected: number) => void;
    toThrow: (expected?: any) => void;
    toBeGreaterThan: (expected: number) => void;
    toBeLessThan: (expected: number) => void;
    toBeGreaterThanOrEqual: (expected: number) => void;
    toBeLessThanOrEqual: (expected: number) => void;
    toBeCloseTo: (expected: number, precision?: number) => void;
    toMatch: (expected: string | RegExp) => void;
    toMatchObject: (expected: object) => void;
    toHaveProperty: (keyPath: string, value?: any) => void;
    toBeInstanceOf: (expected: any) => void;
    not: any;
    resolves: any;
    rejects: any;
  };
  export const beforeAll: (fn: () => void, timeout?: number) => void;
  export const afterAll: (fn: () => void, timeout?: number) => void;
  export const beforeEach: (fn: () => void, timeout?: number) => void;
  export const afterEach: (fn: () => void, timeout?: number) => void;
  export const jest: any;
}