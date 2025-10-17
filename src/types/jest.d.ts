// Оголошення типів для Jest

declare namespace jest {
  // Розширюємо глобальний об'єкт jest
  interface Matchers<R> {
    // Додаємо кастомні матчери, якщо вони використовуються в тестах
    toBeVisible(): R;
    toHaveTextContent(text: string | RegExp): R;
    toHaveProp(propName: string, propValue?: any): R;
    toBeEnabled(): R;
    toBeDisabled(): R;
  }

  // Додаємо типи для функцій jest
  interface JestInterface {
    fn<T extends (...args: any[]) => any>(implementation?: T): jest.Mock<ReturnType<T>, Parameters<T>>;
    spyOn<T extends {}, M extends keyof T>(object: T, method: M): jest.SpyInstance<T[M] extends (...args: any[]) => any ? ReturnType<T[M]> : T[M], T[M] extends (...args: any[]) => any ? Parameters<T[M]> : []>;
  }
}

// Глобальні типи для тестових функцій
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveProp(propName: string, propValue?: any): R;
      toBeEnabled(): R;
      toBeDisabled(): R;
    }
  }
}