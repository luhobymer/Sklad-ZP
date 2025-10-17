// @ts-nocheck

test('Простий тест для перевірки роботи Jest', () => {
  expect(1 + 1).toBe(2);
});

test('Другий простий тест', () => {
  const obj = { one: 1 };
  obj['two'] = 2;
  expect(obj).toEqual({ one: 1, two: 2 });
});
