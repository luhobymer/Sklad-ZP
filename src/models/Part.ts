/**
 * Інтерфейс для запчастини
 */
export interface Part {
  id: number;
  articleNumber: string;
  name: string;
  manufacturer: string;
  category: string;
  type?: string;           // Тип запчастини (наприклад, гальмівні колодки, фільтр тощо)
  model?: string;          // Модель запчастини
  dimensions?: string;     // Розміри запчастини (наприклад, "10x5x2 см")
  isNew: boolean;
  quantity: number;
  price: number;
  description: string | null;
  photoPath: string | null;
  compatibleCars: string[] | null;
  analogs?: PartAnalog[];  // Масив аналогічних запчастин
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;    // Чи додана запчастина до обраних
  lastViewed?: Date;       // Дата останнього перегляду
}

/**
 * Інтерфейс для аналогу запчастини (спрощена версія Part)
 */
export interface PartAnalog {
  id: number;
  articleNumber: string;
  name: string;
  manufacturer: string;
  price: number;
  isAvailable: boolean;    // Чи є в наявності
  compatibilityScore?: number; // Оцінка сумісності (0-100%)
  originalPartId: number;  // ID оригінальної запчастини
}

/**
 * Інтерфейс для результатів валідації запчастини
 */
export interface PartValidation {
  articleNumber: { isValid: boolean; message?: string };
  name: { isValid: boolean; message?: string };
  manufacturer: { isValid: boolean; message?: string };
  category: { isValid: boolean; message?: string };
  type?: { isValid: boolean; message?: string };
  model?: { isValid: boolean; message?: string };
  dimensions?: { isValid: boolean; message?: string };
  quantity: { isValid: boolean; message?: string };
  price: { isValid: boolean; message?: string };
}

/**
 * Типи запчастин
 */
export enum PartType {
  BRAKE = 'brake',
  ENGINE = 'engine',
  TRANSMISSION = 'transmission',
  SUSPENSION = 'suspension',
  ELECTRICAL = 'electrical',
  BODY = 'body',
  INTERIOR = 'interior',
  OTHER = 'other'
}

/**
 * Категорії запчастин
 */
export enum PartCategory {
  ORIGINAL = 'original',
  AFTERMARKET = 'aftermarket',
  USED = 'used',
  REFURBISHED = 'refurbished'
}

export const createPart = (data: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>): Omit<Part, 'id'> => {
  const now = new Date();
  return {
    ...data,
    createdAt: now,
    updatedAt: now
  };
};

export const validatePart = (part: Partial<Part>): PartValidation => {
  return {
    articleNumber: {
      isValid: Boolean(part.articleNumber?.trim()),
      message: !part.articleNumber?.trim() ? 'Артикул є обов\'язковим' : undefined
    },
    name: {
      isValid: Boolean(part.name?.trim()),
      message: !part.name?.trim() ? 'Назва є обов\'язковою' : undefined
    },
    manufacturer: {
      isValid: Boolean(part.manufacturer?.trim()),
      message: !part.manufacturer?.trim() ? 'Виробник є обов\'язковим' : undefined
    },
    category: {
      isValid: Boolean(part.category?.trim()),
      message: !part.category?.trim() ? 'Категорія є обов\'язковою' : undefined
    },
    // Необов'язкові поля: вважаємо валідними, навіть якщо порожні
    type: { isValid: true },
    model: { isValid: true },
    dimensions: { isValid: true },
    quantity: {
      isValid: typeof part.quantity === 'number' && part.quantity >= 0,
      message: typeof part.quantity !== 'number' || part.quantity < 0 ? 'Кількість має бути невід\'ємним числом' : undefined
    },
    price: {
      isValid: typeof part.price === 'number' && part.price > 0,
      message: typeof part.price !== 'number' || part.price <= 0 ? 'Ціна має бути додатним числом' : undefined
    }
  };
};

/**
 * Перевіряє, чи є запчастина валідною на основі результатів валідації
 * @param validation Результати валідації
 * @returns true, якщо всі поля валідні
 */
export const isPartValid = (validation: PartValidation): boolean => {
  return Object.values(validation).every(field => field.isValid);
};

/**
 * Перевіряє, чи є об'єкт запчастиною
 * @param obj Об'єкт для перевірки
 * @returns true, якщо об'єкт є запчастиною
 */
export const isPart = (obj: unknown): obj is Part => {
  if (!obj || typeof obj !== 'object') return false;
  
  const part = obj as Partial<Part>;
  return (
    typeof part.id === 'number' &&
    typeof part.articleNumber === 'string' &&
    typeof part.name === 'string' &&
    typeof part.manufacturer === 'string' &&
    typeof part.category === 'string' &&
    typeof part.isNew === 'boolean' &&
    typeof part.quantity === 'number' &&
    typeof part.price === 'number' &&
    (part.createdAt instanceof Date) &&
    (part.updatedAt instanceof Date)
  );
};

/**
 * Перевіряє, чи є об'єкт аналогом запчастини
 * @param obj Об'єкт для перевірки
 * @returns true, якщо об'єкт є аналогом запчастини
 */
export const isPartAnalog = (obj: unknown): obj is PartAnalog => {
  if (!obj || typeof obj !== 'object') return false;
  
  const analog = obj as Partial<PartAnalog>;
  return (
    typeof analog.id === 'number' &&
    typeof analog.articleNumber === 'string' &&
    typeof analog.name === 'string' &&
    typeof analog.manufacturer === 'string' &&
    typeof analog.price === 'number' &&
    typeof analog.isAvailable === 'boolean' &&
    typeof analog.originalPartId === 'number'
  );
};

export const toDatabase = (part: Part): Record<string, unknown> => ({
  id: part.id,
  articleNumber: part.articleNumber,
  name: part.name,
  manufacturer: part.manufacturer,
  category: part.category,
  type: part.type || null,
  model: part.model || null,
  dimensions: part.dimensions || null,
  isNew: part.isNew ? 1 : 0,
  quantity: part.quantity,
  price: part.price,
  description: part.description || null,
  photoPath: part.photoPath || null,
  compatibleCars: part.compatibleCars ? JSON.stringify(part.compatibleCars) : null,
  analogs: part.analogs ? JSON.stringify(part.analogs) : null,
  createdAt: part.createdAt.toISOString(),
  updatedAt: part.updatedAt.toISOString()
});

/**
 * Перетворює дані з бази даних у об'єкт запчастини
 * @param data Дані з бази даних
 * @returns Об'єкт запчастини
 */
export const fromDatabase = (data: Record<string, unknown>): Part => {
  return {
    id: Number(data.id),
    articleNumber: String(data.articleNumber),
    name: String(data.name),
    manufacturer: String(data.manufacturer),
    category: String(data.category),
    type: data.type ? String(data.type) : undefined,
    model: data.model ? String(data.model) : undefined,
    dimensions: data.dimensions ? String(data.dimensions) : undefined,
    isNew: Boolean(data.isNew),
    quantity: Number(data.quantity),
    price: Number(data.price),
    description: data.description ? String(data.description) : null,
    photoPath: data.photoPath ? String(data.photoPath) : null,
    compatibleCars: data.compatibleCars ? JSON.parse(String(data.compatibleCars)) : null,
    analogs: data.analogs ? JSON.parse(String(data.analogs)) : [],
    createdAt: new Date(String(data.createdAt)),
    updatedAt: new Date(String(data.updatedAt)),
    isFavorite: data.isFavorite ? Boolean(data.isFavorite) : false,
    lastViewed: data.lastViewed ? new Date(String(data.lastViewed)) : undefined
  };
};

/**
 * Створює аналог запчастини
 * @param originalPart Оригінальна запчастина
 * @param analogData Дані аналога
 * @returns Об'єкт аналога запчастини
 */
export const createPartAnalog = (originalPart: Part, analogData: Partial<PartAnalog>): PartAnalog => {
  return {
    id: analogData.id || 0,
    articleNumber: analogData.articleNumber || '',
    name: analogData.name || '',
    manufacturer: analogData.manufacturer || '',
    price: analogData.price || 0,
    isAvailable: analogData.isAvailable || false,
    compatibilityScore: analogData.compatibilityScore,
    originalPartId: originalPart.id
  };
};

/**
 * Перевіряє, чи є запчастина в наявності
 * @param part Запчастина для перевірки
 * @returns true, якщо запчастина в наявності
 */
export const isPartInStock = (part: Part): boolean => {
  return part.quantity > 0;
};

/**
 * Перевіряє, чи є запчастина сумісною з вказаною моделлю автомобіля
 * @param part Запчастина для перевірки
 * @param carModel Модель автомобіля
 * @returns true, якщо запчастина сумісна з моделлю автомобіля
 */
export const isPartCompatibleWithCar = (part: Part, carModel: string): boolean => {
  if (!part.compatibleCars) return false;
  return part.compatibleCars.some(car => car.toLowerCase().includes(carModel.toLowerCase()));
};

/**
 * Фільтрує запчастини за різними критеріями
 * @param parts Масив запчастин
 * @param filters Фільтри
 * @returns Відфільтрований масив запчастин
 */
export const filterParts = (parts: Part[], filters: {
  category?: string;
  manufacturer?: string;
  searchTerm?: string;
  inStockOnly?: boolean;
  newOnly?: boolean;
  priceMin?: number;
  priceMax?: number;
}): Part[] => {
  return parts.filter(part => {
    // Фільтр за категорією
    if (filters.category && part.category !== filters.category) {
      return false;
    }
    
    // Фільтр за виробником
    if (filters.manufacturer && part.manufacturer !== filters.manufacturer) {
      return false;
    }
    
    // Фільтр за пошуковим терміном
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesName = part.name.toLowerCase().includes(term);
      const matchesArticle = part.articleNumber.toLowerCase().includes(term);
      const matchesDescription = part.description?.toLowerCase().includes(term) || false;
      
      if (!matchesName && !matchesArticle && !matchesDescription) {
        return false;
      }
    }
    
    // Фільтр за наявністю
    if (filters.inStockOnly && part.quantity <= 0) {
      return false;
    }
    
    // Фільтр за новизною
    if (filters.newOnly && !part.isNew) {
      return false;
    }
    
    // Фільтр за мінімальною ціною
    if (filters.priceMin !== undefined && part.price < filters.priceMin) {
      return false;
    }
    
    // Фільтр за максимальною ціною
    if (filters.priceMax !== undefined && part.price > filters.priceMax) {
      return false;
    }
    
    return true;
  });
};