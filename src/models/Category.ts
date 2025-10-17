/**
 * Інтерфейс для категорії запчастин
 */
export interface Category {
  id: number;
  name: string;
  description: string | null;
  parentId: number | null;
  iconName?: string;
  count?: number; // кількість запчастин у категорії
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Перелік стандартних категорій запчастин
 */
export enum StandardCategory {
  ENGINE = 'Двигун',
  TRANSMISSION = 'Трансмісія',
  SUSPENSION = 'Підвіска',
  BRAKE = 'Гальмівна система',
  ELECTRICAL = 'Електрика',
  BODY = 'Кузов',
  INTERIOR = 'Салон',
  COOLING = 'Система охолодження',
  FUEL = 'Паливна система',
  EXHAUST = 'Вихлопна система',
  OTHER = 'Інше'
}

/**
 * Створює нову категорію
 * @param data Дані для створення категорії
 * @returns Нова категорія без ID
 */
export const createCategory = (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Omit<Category, 'id'> => {
  const now = new Date();
  return {
    ...data,
    createdAt: now,
    updatedAt: now
  };
};

/**
 * Перевіряє, чи є об'єкт категорією
 * @param obj Об'єкт для перевірки
 * @returns true, якщо об'єкт є категорією
 */
export const isCategory = (obj: unknown): obj is Category => {
  if (!obj || typeof obj !== 'object') return false;
  
  const category = obj as Partial<Category>;
  return (
    typeof category.id === 'number' &&
    typeof category.name === 'string' &&
    (category.createdAt instanceof Date) &&
    (category.updatedAt instanceof Date)
  );
};

/**
 * Перетворює дані з бази даних у об'єкт категорії
 * @param data Дані з бази даних
 * @returns Об'єкт категорії
 */
export const fromDatabase = (data: Record<string, unknown>): Category => {
  return {
    id: Number(data.id),
    name: String(data.name),
    description: data.description ? String(data.description) : null,
    parentId: data.parentId ? Number(data.parentId) : null,
    iconName: data.iconName ? String(data.iconName) : undefined,
    count: data.count ? Number(data.count) : undefined,
    createdAt: new Date(String(data.createdAt)),
    updatedAt: new Date(String(data.updatedAt))
  };
};

/**
 * Перетворює об'єкт категорії у формат для зберігання в базі даних
 * @param category Об'єкт категорії
 * @returns Об'єкт для зберігання в базі даних
 */
export const toDatabase = (category: Category): Record<string, unknown> => ({
  id: category.id,
  name: category.name,
  description: category.description || null,
  parentId: category.parentId || null,
  iconName: category.iconName || null,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString()
});

/**
 * Отримує повний шлях категорії (включаючи батьківські категорії)
 * @param category Категорія
 * @param allCategories Всі категорії
 * @returns Масив категорій, що утворюють шлях
 */
export const getCategoryPath = (category: Category, allCategories: Category[]): Category[] => {
  const path: Category[] = [category];
  let currentCategory = category;
  
  while (currentCategory.parentId !== null) {
    const parentCategory = allCategories.find(c => c.id === currentCategory.parentId);
    if (!parentCategory) break;
    
    path.unshift(parentCategory);
    currentCategory = parentCategory;
  }
  
  return path;
};

/**
 * Отримує всі підкатегорії вказаної категорії
 * @param categoryId ID категорії
 * @param allCategories Всі категорії
 * @returns Масив підкатегорій
 */
export const getSubcategories = (categoryId: number, allCategories: Category[]): Category[] => {
  return allCategories.filter(category => category.parentId === categoryId);
};
