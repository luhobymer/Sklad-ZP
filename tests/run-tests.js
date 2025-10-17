/**
 * Скрипт для запуску тестів з явним виводом
 */
const { spawnSync } = require('child_process');
const fs = require('fs');

console.log('Запускаємо тести FileStorageService з детальним виводом...');

// Додаємо додатковий вивід для діагностики
console.log('Перевіряємо наявність файлу тесту:', fs.existsSync('./tests/FileStorageService.test.ts'));
console.log('Вміст директорії tests:', fs.readdirSync('./tests'));

// Запускаємо Jest з параметрами для детального виводу
console.log('Запускаємо Jest...');

// Спочатку запустимо з виводом у файл для діагностики
const outputFile = './tests/test-output.log';
const resultWithOutput = spawnSync('node', [
  './node_modules/jest/bin/jest.js',
  'tests/FileStorageService.test.ts',
  '--no-cache',
  '--verbose',
  '--detectOpenHandles',
  '--forceExit'
], {
  shell: true,
  env: { ...process.env, FORCE_COLOR: '1' }
});

// Записуємо вивід у файл
fs.writeFileSync(outputFile, resultWithOutput.stdout || '');
fs.appendFileSync(outputFile, resultWithOutput.stderr || '');

console.log('Вивід тестів збережено у файл:', outputFile);
console.log('Вивід тестів:');

// Тепер запускаємо з виводом в консоль
const result = spawnSync('node', [
  './node_modules/jest/bin/jest.js',
  'tests/FileStorageService.test.ts',
  '--no-cache',
  '--verbose',
  '--detectOpenHandles',
  '--forceExit'
], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, FORCE_COLOR: '1' }
});

if (result.status !== 0) {
  console.error(`Тести завершились з помилкою: код ${result.status}`);
  if (resultWithOutput.stdout) {
    console.log('Вивід stdout:', resultWithOutput.stdout.toString());
  }
  if (resultWithOutput.stderr) {
    console.error('Вивід stderr:', resultWithOutput.stderr.toString());
  }
  process.exit(1);
} else {
  console.log('Тести успішно завершені');
  if (resultWithOutput.stdout) {
    console.log('Детальний вивід:', resultWithOutput.stdout.toString());
  }
}
