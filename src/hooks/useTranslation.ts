import { useCallback } from 'react';

// Словник перекладів українською мовою
const translations = {
  common: {
    back: 'Назад',
    edit: 'Редагувати',
    delete: 'Видалити',
    save: 'Зберегти',
    cancel: 'Скасувати',
    add: 'Додати',
    search: 'Пошук',
    filter: 'Фільтр',
    scan: 'Сканувати'
  },
  part: {
    articleNumber: 'Артикул',
    name: 'Назва',
    manufacturer: 'Виробник',
    category: 'Категорія',
    isNew: 'Новий',
    used: 'Вживаний',
    quantity: 'Кількість',
    price: 'Ціна',
    description: 'Опис',
    compatibleCars: 'Сумісні автомобілі',
    analogs: 'Аналоги',
    addPart: 'Додати запчастину',
    editPart: 'Редагувати запчастину',
    enterArticle: 'Введіть артикул',
    enterName: 'Введіть назву',
    enterManufacturer: 'Введіть виробника',
    selectCategory: 'Оберіть категорію',
    enterPrice: 'Введіть ціну',
    enterQuantity: 'Введіть кількість',
    addedSuccessfully: 'Запчастину успішно додано',
    updatedSuccessfully: 'Запчастину успішно оновлено',
    deletedSuccessfully: 'Запчастину успішно видалено'
  },
  categories: {
    engine: 'Двигун',
    transmission: 'Трансмісія',
    suspension: 'Підвіска',
    brakes: 'Гальма',
    electrical: 'Електрика',
    body: 'Кузов',
    interior: 'Салон',
    other: 'Інше'
  },
  scanner: {
    takePicture: 'Зробити фото',
    retake: 'Перезняти',
    use: 'Використати',
    recognizing: 'Розпізнавання...',
    recognitionSuccess: 'Успішно розпізнано',
    recognitionFailed: 'Помилка розпізнавання'
  }
};

export const useTranslation = () => {
  // Функція для отримання перекладу за ключем
  const t = useCallback((key: string) => {
    // Розділяємо ключ на частини (наприклад "part.name" -> ["part", "name"])
    const parts = key.split('.');
    
    // Ініціалізуємо результат як весь об'єкт з перекладами
    let result: any = translations;
    
    // Проходимо по частинах ключа
    for (const part of parts) {
      // Якщо поточна частина існує в об'єкті, оновлюємо результат
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        // Якщо переклад не знайдено, повертаємо сам ключ
        return key;
      }
    }
    
    // Повертаємо знайдений переклад або сам ключ, якщо переклад - не рядок
    return typeof result === 'string' ? result : key;
  }, []);

  return { t };
}; 