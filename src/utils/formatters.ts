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