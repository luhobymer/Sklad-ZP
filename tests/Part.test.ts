/**
 * Тести для моделі Part
 */
import { 
  Part, 
  PartAnalog,
  createPart, 
  validatePart, 
  isPartValid, 
  isPart, 
  isPartAnalog,
  toDatabase,
  fromDatabase,
  createPartAnalog,
  isPartInStock,
  isPartCompatibleWithCar,
  filterParts
} from '../src/models/Part';

// Тестові дані
const validPartData = {
  articleNumber: 'ABC123',
  name: 'Гальмівний диск',
  manufacturer: 'Bosch',
  category: 'Гальмівна система',
  type: 'Гальмівний диск',
  model: 'BD-500',
  dimensions: '280x22 мм',
  isNew: true,
  quantity: 5,
  price: 1500,
  description: 'Високоякісний гальмівний диск',
  photoPath: null,
  compatibleCars: ['Volkswagen Golf', 'Audi A3'],
};

const fullPartData: Omit<Part, 'id'> = {
  ...createPart(validPartData),
  analogs: [
    {
      id: 1,
      articleNumber: 'XYZ789',
      name: 'Гальмівний диск аналог',
      manufacturer: 'ATE',
      price: 1200,
      isAvailable: true,
      compatibilityScore: 95,
      originalPartId: 123
    }
  ],
  isFavorite: true,
  lastViewed: new Date()
};

const dbPartData = {
  id: 1,
  articleNumber: 'ABC123',
  name: 'Гальмівний диск',
  manufacturer: 'Bosch',
  category: 'Гальмівна система',
  type: 'Гальмівний диск',
  model: 'BD-500',
  dimensions: '280x22 мм',
  isNew: 1,
  quantity: 5,
  price: 1500,
  description: 'Високоякісний гальмівний диск',
  photoPath: null,
  compatibleCars: JSON.stringify(['Volkswagen Golf', 'Audi A3']),
  analogs: JSON.stringify([{
    id: 1,
    articleNumber: 'XYZ789',
    name: 'Гальмівний диск аналог',
    manufacturer: 'ATE',
    price: 1200,
    isAvailable: true,
    compatibilityScore: 95,
    originalPartId: 123
  }]),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isFavorite: 1,
  lastViewed: new Date().toISOString()
};

describe('Модель Part', () => {
  test('createPart створює валідну запчастину', () => {
    const part = createPart(validPartData);
    
    // Перевіряємо, що всі поля встановлені правильно
    expect(part.articleNumber).toBe(validPartData.articleNumber);
    expect(part.name).toBe(validPartData.name);
    expect(part.manufacturer).toBe(validPartData.manufacturer);
    expect(part.category).toBe(validPartData.category);
    expect(part.type).toBe(validPartData.type);
    expect(part.model).toBe(validPartData.model);
    expect(part.dimensions).toBe(validPartData.dimensions);
    expect(part.isNew).toBe(validPartData.isNew);
    expect(part.quantity).toBe(validPartData.quantity);
    expect(part.price).toBe(validPartData.price);
    expect(part.description).toBe(validPartData.description);
    expect(part.photoPath).toBe(validPartData.photoPath);
    expect(part.compatibleCars).toEqual(validPartData.compatibleCars);
    
    // Перевіряємо, що createdAt та updatedAt встановлені
    expect(part.createdAt).toBeInstanceOf(Date);
    expect(part.updatedAt).toBeInstanceOf(Date);
  });
  
  test('validatePart правильно валідує запчастину', () => {
    const validation = validatePart(validPartData);
    
    // Перевіряємо, що всі поля валідні
    expect(validation.articleNumber.isValid).toBe(true);
    expect(validation.name.isValid).toBe(true);
    expect(validation.manufacturer.isValid).toBe(true);
    expect(validation.category.isValid).toBe(true);
    expect(validation.type?.isValid).toBe(true);
    expect(validation.model?.isValid).toBe(true);
    expect(validation.dimensions?.isValid).toBe(true);
    expect(validation.quantity.isValid).toBe(true);
    expect(validation.price.isValid).toBe(true);
  });
  
  test('validatePart правильно валідує невалідну запчастину', () => {
    const invalidPartData = {
      articleNumber: '',
      name: '',
      manufacturer: '',
      category: '',
      quantity: -1,
      price: 0,
    };
    
    const validation = validatePart(invalidPartData);
    
    expect(validation.articleNumber.isValid).toBe(false);
    expect(validation.name.isValid).toBe(false);
    expect(validation.manufacturer.isValid).toBe(false);
    expect(validation.category.isValid).toBe(false);
    expect(validation.quantity.isValid).toBe(false);
    expect(validation.price.isValid).toBe(false);
  });
  
  test('isPartValid повертає true для валідної запчастини', () => {
    const validation = validatePart(validPartData);
    expect(isPartValid(validation)).toBe(true);
  });
  
  test('isPartValid повертає false для невалідної запчастини', () => {
    const invalidPartData = {
      articleNumber: '',
      name: '',
      manufacturer: '',
      category: '',
      quantity: -1,
      price: 0,
    };
    
    const validation = validatePart(invalidPartData);
    expect(isPartValid(validation)).toBe(false);
  });
  
  test('isPart правильно визначає об\'єкт як запчастину', () => {
    const part = {
      id: 1,
      articleNumber: 'ABC123',
      name: 'Гальмівний диск',
      manufacturer: 'Bosch',
      category: 'Гальмівна система',
      isNew: true,
      quantity: 5,
      price: 1500,
      description: 'Високоякісний гальмівний диск',
      photoPath: null,
      compatibleCars: ['Volkswagen Golf', 'Audi A3'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    expect(isPart(part)).toBe(true);
    expect(isPart({})).toBe(false);
    expect(isPart(null)).toBe(false);
  });
  
  test('isPartAnalog правильно визначає об\'єкт як аналог запчастини', () => {
    const analog = {
      id: 1,
      articleNumber: 'XYZ789',
      name: 'Гальмівний диск аналог',
      manufacturer: 'ATE',
      price: 1200,
      isAvailable: true,
      originalPartId: 123
    };
    
    expect(isPartAnalog(analog)).toBe(true);
    expect(isPartAnalog({})).toBe(false);
    expect(isPartAnalog(null)).toBe(false);
  });
  
  test('toDatabase правильно перетворює запчастину для збереження в БД', () => {
    const part: Part = {
      id: 1,
      ...fullPartData
    };
    
    const dbData = toDatabase(part);
    
    expect(dbData.id).toBe(1);
    expect(dbData.articleNumber).toBe(part.articleNumber);
    expect(dbData.name).toBe(part.name);
    expect(dbData.isNew).toBe(1);
    expect(dbData.compatibleCars).toBe(JSON.stringify(part.compatibleCars));
    expect(dbData.analogs).toBe(JSON.stringify(part.analogs));
    expect(typeof dbData.createdAt).toBe('string');
    expect(typeof dbData.updatedAt).toBe('string');
  });
  
  test('fromDatabase правильно перетворює дані з БД в об\'єкт запчастини', () => {
    const part = fromDatabase(dbPartData);
    
    expect(part.id).toBe(1);
    expect(part.articleNumber).toBe('ABC123');
    expect(part.name).toBe('Гальмівний диск');
    expect(part.isNew).toBe(true);
    expect(part.compatibleCars).toEqual(['Volkswagen Golf', 'Audi A3']);
    expect(part.analogs).toHaveLength(1);
    expect(part.analogs?.[0].articleNumber).toBe('XYZ789');
    expect(part.createdAt).toBeInstanceOf(Date);
    expect(part.updatedAt).toBeInstanceOf(Date);
    expect(part.isFavorite).toBe(true);
    expect(part.lastViewed).toBeInstanceOf(Date);
  });
  
  test('createPartAnalog створює правильний аналог запчастини', () => {
    const originalPart: Part = {
      id: 123,
      ...fullPartData
    };
    
    const analogData: Partial<PartAnalog> = {
      articleNumber: 'XYZ789',
      name: 'Гальмівний диск аналог',
      manufacturer: 'ATE',
      price: 1200,
      isAvailable: true,
      compatibilityScore: 95
    };
    
    const analog = createPartAnalog(originalPart, analogData);
    
    expect(analog.articleNumber).toBe('XYZ789');
    expect(analog.name).toBe('Гальмівний диск аналог');
    expect(analog.manufacturer).toBe('ATE');
    expect(analog.price).toBe(1200);
    expect(analog.isAvailable).toBe(true);
    expect(analog.compatibilityScore).toBe(95);
    expect(analog.originalPartId).toBe(123);
  });
  
  test('isPartInStock правильно визначає наявність запчастини', () => {
    const inStockPart: Part = {
      id: 1,
      ...fullPartData,
      quantity: 5
    };
    
    const outOfStockPart: Part = {
      id: 2,
      ...fullPartData,
      quantity: 0
    };
    
    expect(isPartInStock(inStockPart)).toBe(true);
    expect(isPartInStock(outOfStockPart)).toBe(false);
  });
  
  test('isPartCompatibleWithCar правильно визначає сумісність запчастини з автомобілем', () => {
    const part: Part = {
      id: 1,
      ...fullPartData,
      compatibleCars: ['Volkswagen Golf', 'Audi A3', 'Skoda Octavia']
    };
    
    expect(isPartCompatibleWithCar(part, 'Volkswagen Golf')).toBe(true);
    expect(isPartCompatibleWithCar(part, 'golf')).toBe(true); // Перевірка на регістр
    expect(isPartCompatibleWithCar(part, 'BMW X5')).toBe(false);
    
    const partWithoutCompatibility: Part = {
      id: 2,
      ...fullPartData,
      compatibleCars: null
    };
    
    expect(isPartCompatibleWithCar(partWithoutCompatibility, 'Volkswagen Golf')).toBe(false);
  });
  
  test('filterParts правильно фільтрує запчастини за різними критеріями', () => {
    const parts: Part[] = [
      {
        id: 1,
        ...fullPartData,
        category: 'Гальмівна система',
        manufacturer: 'Bosch',
        name: 'Гальмівний диск',
        quantity: 5,
        isNew: true,
        price: 1500
      },
      {
        id: 2,
        ...fullPartData,
        category: 'Двигун',
        manufacturer: 'Mahle',
        name: 'Масляний фільтр',
        quantity: 0,
        isNew: false,
        price: 300
      },
      {
        id: 3,
        ...fullPartData,
        category: 'Гальмівна система',
        manufacturer: 'ATE',
        name: 'Гальмівні колодки',
        quantity: 10,
        isNew: true,
        price: 800
      }
    ];
    
    // Фільтр за категорією
    expect(filterParts(parts, { category: 'Гальмівна система' })).toHaveLength(2);
    
    // Фільтр за виробником
    expect(filterParts(parts, { manufacturer: 'Bosch' })).toHaveLength(1);
    
    // Фільтр за пошуковим терміном
    // Перевіряємо, що пошук знаходить запчастини, які містять 'гальм' у назві або описі
    expect(filterParts(parts, { searchTerm: 'гальм' })).toHaveLength(3);
    expect(filterParts(parts, { searchTerm: 'фільтр' })).toHaveLength(1);
    
    // Фільтр за наявністю
    expect(filterParts(parts, { inStockOnly: true })).toHaveLength(2);
    
    // Фільтр за новизною
    expect(filterParts(parts, { newOnly: true })).toHaveLength(2);
    
    // Фільтр за ціною
    const filteredByPriceMin = filterParts(parts, { priceMin: 500 });
    console.log('Filtered by priceMin 500:', filteredByPriceMin.map(p => ({ id: p.id, name: p.name, price: p.price })));
    expect(filteredByPriceMin.length).toEqual(2);
    
    const filteredByPriceMax = filterParts(parts, { priceMax: 1000 });
    console.log('Filtered by priceMax 1000:', filteredByPriceMax.map(p => ({ id: p.id, name: p.name, price: p.price })));
    // Оскільки у нас є 2 елементи з ціною <= 1000, оновлюємо очікування
    expect(filteredByPriceMax.length).toEqual(2);
    
    const filteredByPriceRange = filterParts(parts, { priceMin: 500, priceMax: 1000 });
    console.log('Filtered by price range 500-1000:', filteredByPriceRange.map(p => ({ id: p.id, name: p.name, price: p.price })));
    expect(filteredByPriceRange.length).toEqual(1);
    
    // Комбінований фільтр
    expect(filterParts(parts, {
      category: 'Гальмівна система',
      inStockOnly: true,
      newOnly: true,
      priceMin: 1000
    })).toHaveLength(1);
  });
});
