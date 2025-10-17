// Оголошення для глобальних змінних

type ErrorHandlerCallback = (error: any, isFatal?: boolean) => void;

declare global {
  namespace NodeJS {
    interface Global {
      ErrorUtils: {
        getGlobalHandler(): ErrorHandlerCallback;
        setGlobalHandler(handler: ErrorHandlerCallback): void;
        reportError(error: any): void;
      };
    }
  }

  // Для браузерного середовища
  interface Window {
    ErrorUtils: {
      getGlobalHandler(): ErrorHandlerCallback;
      setGlobalHandler(handler: ErrorHandlerCallback): void;
      reportError(error: any): void;
    };
  }

  // Глобальне оголошення для всіх середовищ
  const ErrorUtils: {
    getGlobalHandler(): ErrorHandlerCallback;
    setGlobalHandler(handler: ErrorHandlerCallback): void;
    reportError(error: any): void;
  };
}
