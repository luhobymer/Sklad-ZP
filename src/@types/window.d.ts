// Розширюємо глобальний інтерфейс Window
declare global {
  interface Window {
    // Додаємо властивості до глобального об'єкта window
    onerror: (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ) => void;
  }
}

export {}; // Важливо для модульного режиму TypeScript
