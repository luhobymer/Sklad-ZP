// Файл для налаштування звітування про тести
const { DefaultReporter } = require('@jest/reporters');

class CustomReporter extends DefaultReporter {
  constructor(globalConfig) {
    super(globalConfig);
  }

  onRunComplete(contexts, results) {
    console.log('\n=== РЕЗУЛЬТАТИ ТЕСТІВ ===');
    console.log(`Загальна кількість тестів: ${results.numTotalTests}`);
    console.log(`Успішно: ${results.numPassedTests}`);
    console.log(`Невдало: ${results.numFailedTests}`);
    console.log(`Пропущено: ${results.numPendingTests}`);
    console.log('========================\n');

    if (results.testResults && results.testResults.length > 0) {
      results.testResults.forEach(testResult => {
        console.log(`Файл: ${testResult.testFilePath}`);
        console.log(`Статус: ${testResult.numFailingTests === 0 ? 'УСПІШНО' : 'НЕВДАЛО'}`);
        
        if (testResult.testResults && testResult.testResults.length > 0) {
          testResult.testResults.forEach(test => {
            console.log(`  - ${test.title}: ${test.status.toUpperCase()}`);
          });
        }
        
        console.log('------------------------');
      });
    }

    super.onRunComplete(contexts, results);
  }
}

module.exports = CustomReporter;
