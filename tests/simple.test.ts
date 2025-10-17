/**
 * Простий тест для перевірки роботи Jest
 */

import { describe, test, expect } from '@jest/globals';

describe('Простий тест', () => {
  test('1 + 1 = 2', () => {
    expect(1 + 1).toBe(2);
    console.log('Тест виконано успішно');
  });
});
