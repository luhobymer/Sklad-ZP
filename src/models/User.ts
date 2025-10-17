// src/models/User.ts

/**
 * @interface User
 * @description Інтерфейс для представлення користувача.
 */
export interface User {
  id: number;
  username: string;
  email?: string; // Електронна пошта (опціонально)
  role?: 'admin' | 'user'; // Роль користувача (опціонально)
  passwordHash?: string; // Хеш пароля, не зберігати пароль у відкритому вигляді
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @function createUser
 * @description Створює новий об'єкт користувача з мінімально необхідними даними.
 * @param {Partial<User>} data - Дані для нового користувача.
 * @returns {User} Новий об'єкт користувача.
 */
export const createUser = (data: Partial<User>): User => {
  const now = new Date();
  return {
    id: data.id || Date.now(), // Або генерувати на бекенді/БД
    username: data.username || '',
    email: data.email,
    role: data.role || 'user',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    ...data,
  };
};

/**
 * @interface UserValidationError
 * @description Представляє помилку валідації для поля користувача.
 */
export interface UserValidationError {
  field: keyof User;
  message: string;
}

/**
 * @function validateUser
 * @description Валідує дані користувача.
 * @param {Partial<User>} user - Об'єкт користувача для валідації.
 * @returns {UserValidationError[]} Масив помилок валідації. Порожній, якщо дані валідні.
 */
export const validateUser = (user: Partial<User>): UserValidationError[] => {
  const errors: UserValidationError[] = [];

  if (!user.username || user.username.trim().length < 3) {
    errors.push({
      field: 'username',
      message: "Ім'я користувача має містити щонайменше 3 символи.",
    });
  }

  if (user.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(user.email)) {
    errors.push({ field: 'email', message: 'Некоректний формат email.' });
  }
  
  // Додайте інші правила валідації за потребою (наприклад, для пароля)

  return errors;
};

/**
 * @function isUserValid
 * @description Перевіряє, чи є об'єкт користувача валідним.
 * @param {Partial<User>} user - Об'єкт користувача.
 * @returns {boolean} True, якщо користувач валідний, інакше false.
 */
export const isUserValid = (user: Partial<User>): boolean => {
  return validateUser(user).length === 0;
};

// Функції toDatabase та fromDatabase можуть бути специфічними для вашої БД
// Наприклад, якщо дати зберігаються як рядки ISO або числа (timestamps)

/**
 * @function toDatabaseUser
 * @description Перетворює об'єкт User у формат для зберігання в базі даних.
 * @param {User} user - Об'єкт користувача.
 * @returns {any} Об'єкт, готовий для збереження в БД.
 */
export const toDatabaseUser = (user: User): any => {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

/**
 * @function fromDatabaseUser
 * @description Перетворює дані з бази даних в об'єкт User.
 * @param {any} data - Дані з БД.
 * @returns {User} Об'єкт користувача.
 */
export const fromDatabaseUser = (data: any): User => {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
};
