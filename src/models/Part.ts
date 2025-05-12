export interface Part {
  id: number;
  articleNumber: string;
  name: string;
  manufacturer: string;
  category: string;
  isNew: boolean;
  quantity: number;
  price: number;
  description: string | null;
  photoPath: string | null;
  compatibleCars: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartValidation {
  articleNumber: { isValid: boolean; message?: string };
  name: { isValid: boolean; message?: string };
  manufacturer: { isValid: boolean; message?: string };
  category: { isValid: boolean; message?: string };
  quantity: { isValid: boolean; message?: string };
  price: { isValid: boolean; message?: string };
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

export const isPartValid = (validation: PartValidation): boolean => {
  return Object.values(validation).every(field => field.isValid);
};

export const toDatabase = (part: Part): Record<string, unknown> => ({
  id: part.id,
  articleNumber: part.articleNumber,
  name: part.name,
  manufacturer: part.manufacturer,
  category: part.category,
  isNew: part.isNew ? 1 : 0,
  quantity: part.quantity,
  price: part.price,
  description: part.description || null,
  photoPath: part.photoPath || null,
  compatibleCars: part.compatibleCars ? JSON.stringify(part.compatibleCars) : null,
  createdAt: part.createdAt.toISOString(),
  updatedAt: part.updatedAt.toISOString()
});

export const fromDatabase = (data: Record<string, unknown>): Part => ({
  id: data.id,
  articleNumber: data.articleNumber,
  name: data.name,
  manufacturer: data.manufacturer,
  category: data.category,
  isNew: data.isNew === 1,
  quantity: data.quantity,
  price: data.price,
  description: data.description as string | null,
  photoPath: data.photoPath as string | null,
  compatibleCars: data.compatibleCars ? JSON.parse(data.compatibleCars as string) : null,
  createdAt: new Date(data.createdAt as string),
  updatedAt: new Date(data.updatedAt as string)
});