/**
 * Форматує ціну у гривнях
 * @param price Числове значення ціни
 * @returns Форматований рядок з ціною та валютою
 */
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} грн`;
};

/**
 * Форматує кількість з одиницею вимірювання
 * @param quantity Кількість
 * @returns Форматований рядок з кількістю та одиницею вимірювання
 */
export const formatQuantity = (quantity: number): string => {
  return `${quantity} шт.`;
};

/**
 * Форматує дату у читабельний формат
 * @param date Об'єкт Date або рядок дати
 * @returns Форматований рядок дати
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Форматує розмір файлу у зручному для читання форматі
 * @param bytes Розмір файлу в байтах
 * @param decimals Кількість знаків після коми (за замовчуванням 2)
 * @returns Форматований рядок з розміром файлу
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Б';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};