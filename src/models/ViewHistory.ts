import { Part } from './Part';

/**
 * Інтерфейс для запису історії перегляду
 */
export interface ViewHistoryItem {
  id: number;
  partId: number;
  part?: Part;
  viewedAt: Date;
}

/**
 * Інтерфейс для історії переглядів
 */
export interface ViewHistory {
  items: ViewHistoryItem[];
  maxItems: number;
}

/**
 * Створює новий запис історії перегляду
 * @param partId ID запчастини
 * @param part Об'єкт запчастини (опціонально)
 * @returns Новий запис історії перегляду
 */
export const createViewHistoryItem = (partId: number, part?: Part): Omit<ViewHistoryItem, 'id'> => {
  return {
    partId,
    part,
    viewedAt: new Date()
  };
};

/**
 * Перевіряє, чи є об'єкт записом історії перегляду
 * @param obj Об'єкт для перевірки
 * @returns true, якщо об'єкт є записом історії перегляду
 */
export const isViewHistoryItem = (obj: unknown): obj is ViewHistoryItem => {
  if (!obj || typeof obj !== 'object') return false;
  
  const item = obj as Partial<ViewHistoryItem>;
  return (
    typeof item.id === 'number' &&
    typeof item.partId === 'number' &&
    (item.viewedAt instanceof Date)
  );
};

/**
 * Додає запис до історії переглядів
 * @param history Історія переглядів
 * @param item Новий запис
 * @returns Оновлена історія переглядів
 */
export const addToViewHistory = (history: ViewHistory, item: ViewHistoryItem): ViewHistory => {
  // Видаляємо попередні записи з тим самим partId
  const filteredItems = history.items.filter(existingItem => existingItem.partId !== item.partId);
  
  // Додаємо новий запис на початок
  const updatedItems = [item, ...filteredItems];
  
  // Обмежуємо кількість записів
  const trimmedItems = updatedItems.slice(0, history.maxItems);
  
  return {
    ...history,
    items: trimmedItems
  };
};

/**
 * Очищає історію переглядів
 * @param history Історія переглядів
 * @returns Очищена історія переглядів
 */
export const clearViewHistory = (history: ViewHistory): ViewHistory => {
  return {
    ...history,
    items: []
  };
};

/**
 * Видаляє запис з історії переглядів
 * @param history Історія переглядів
 * @param itemId ID запису для видалення
 * @returns Оновлена історія переглядів
 */
export const removeFromViewHistory = (history: ViewHistory, itemId: number): ViewHistory => {
  return {
    ...history,
    items: history.items.filter(item => item.id !== itemId)
  };
};

/**
 * Перетворює дані з бази даних у об'єкт запису історії перегляду
 * @param data Дані з бази даних
 * @returns Об'єкт запису історії перегляду
 */
export const fromDatabase = (data: Record<string, unknown>): ViewHistoryItem => {
  return {
    id: Number(data.id),
    partId: Number(data.partId),
    viewedAt: new Date(String(data.viewedAt))
  };
};

/**
 * Перетворює об'єкт запису історії перегляду у формат для зберігання в базі даних
 * @param item Об'єкт запису історії перегляду
 * @returns Об'єкт для зберігання в базі даних
 */
export const toDatabase = (item: ViewHistoryItem): Record<string, unknown> => ({
  id: item.id,
  partId: item.partId,
  viewedAt: item.viewedAt.toISOString()
});
