import FileStorageService from './FileStorageService';
import { Part } from '../models/Part';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface InventoryReport {
  totalParts: number;
  totalValue: number;
  lowStockParts: Part[];
  categorySummary: { [key: string]: { count: number; value: number } };
  analogsSummary?: { [articleNumber: string]: Part[] };
  salesStatistics?: {
    totalSales: number;
    monthlySales: { [month: string]: number };
  };
}

export interface OperationHistoryReport {
  startDate: Date;
  endDate: Date;
  operations: {
    date: Date;
    type: 'add' | 'remove' | 'update' | 'sale';
    partId: number;
    quantity: number;
    details: string;
    price?: number;
    customer?: string;
  }[];
}

export class ReportService {
  private static instance: ReportService;
  private storageService: FileStorageService;

  private constructor() {
    this.storageService = FileStorageService.getInstance();
  }

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  public async generateInventoryReport(): Promise<InventoryReport> {
    try {
      // Отримуємо всі запчастини
      const allParts = await this.storageService.getAllParts();
      
      // Загальна кількість запчастин
      const totalParts = allParts.length;
      
      // Загальна вартість запчастин
      const totalValue = allParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
      
      // Запчастини з низьким запасом (менше 5)
      const lowStockParts = allParts.filter(part => part.quantity <= 5);
      
      // Підсумок за категоріями
      const categorySummary: { [key: string]: { count: number; value: number } } = {};
      
      allParts.forEach(part => {
        if (!categorySummary[part.category]) {
          categorySummary[part.category] = { count: 0, value: 0 };
        }
        
        categorySummary[part.category].count += 1;
        categorySummary[part.category].value += part.price * part.quantity;
      });
      
      // Аналоги запчастин
      const analogsSummary: { [key: string]: Part[] } = {};
      
      // Групуємо запчастини за назвою, але з різними виробниками
      allParts.forEach(part => {
        const similars = allParts.filter(p => 
          p.name === part.name && p.manufacturer !== part.manufacturer
        );
        
        if (similars.length > 0) {
          analogsSummary[part.articleNumber] = [part, ...similars];
        }
      });
      
      // Формуємо звіт
      return {
        totalParts,
        totalValue,
        lowStockParts,
        categorySummary,
        analogsSummary
      };
    } catch (error) {
      console.error('Помилка при генерації звіту про інвентар:', error);
      throw error;
    }
  }

  public async generateOperationHistory(startDate: Date, endDate: Date): Promise<OperationHistoryReport> {
    // Оскільки в даній версії не маємо таблиці операцій, повертаємо пустий звіт
    return {
      startDate,
      endDate,
      operations: []
    };
  }

  public async exportReport(report: InventoryReport | OperationHistoryReport, format: 'csv' | 'pdf' | 'xlsx' = 'csv'): Promise<void> {
    try {
      let fileName = `report_${new Date().toISOString()}.${format}`;
      let filePath = `${FileSystem.documentDirectory}${fileName}`;
      let content: string | Buffer;

      if (format === 'csv') {
        content = this.generateCSVContent(report);
        await FileSystem.writeAsStringAsync(filePath, content, {
          encoding: FileSystem.EncodingType.UTF8
        });
      } else if (format === 'xlsx') {
        const workbook = XLSX.utils.book_new();
        const worksheet = this.generateXLSXWorksheet(report);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Звіт');
        content = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        await FileSystem.writeAsStringAsync(filePath, content.toString('base64'), {
          encoding: FileSystem.EncodingType.Base64
        });
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        this.generatePDFContent(doc, report);
        content = doc.output();
        await FileSystem.writeAsStringAsync(filePath, content, {
          encoding: FileSystem.EncodingType.Base64
        });
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        throw new Error('Функція поширення файлів недоступна на цьому пристрої');
      }
    } catch (error) {
      console.error('Помилка при експорті звіту:', error);
      throw error;
    }
  }

  private generateCSVContent(report: InventoryReport | OperationHistoryReport): string {
    let csvContent = '';
    
    if ('operations' in report) {
      csvContent = 'Дата,Тип,ID запчастини,Кількість,Ціна,Клієнт,Деталі\n';
      report.operations.forEach(op => {
        csvContent += `${op.date.toISOString()},${op.type},${op.partId},${op.quantity},${op.price || ''},${op.customer || ''},${op.details}\n`;
      });
    } else {
      csvContent = 'Категорія,Кількість,Вартість\n';
      Object.entries(report.categorySummary).forEach(([category, data]) => {
        csvContent += `${category},${data.count},${data.value}\n`;
      });
      csvContent += `\nЗагальна кількість,${report.totalParts},${report.totalValue}\n`;
      
      if (report.salesStatistics) {
        csvContent += '\nСтатистика продажів\n';
        csvContent += `Загальні продажі,${report.salesStatistics.totalSales}\n`;
        csvContent += '\nПродажі по місяцях\n';
        Object.entries(report.salesStatistics.monthlySales).forEach(([month, sales]) => {
          csvContent += `${month},${sales}\n`;
        });
      }
    }
    
    return csvContent;
  }

  private generateXLSXWorksheet(report: InventoryReport | OperationHistoryReport): XLSX.WorkSheet {
    if ('operations' in report) {
      const data = report.operations.map(op => ({
        'Дата': op.date.toISOString(),
        'Тип': op.type,
        'ID запчастини': op.partId,
        'Кількість': op.quantity,
        'Ціна': op.price || '',
        'Клієнт': op.customer || '',
        'Деталі': op.details
      }));
      return XLSX.utils.json_to_sheet(data);
    } else {
      const data = Object.entries(report.categorySummary).map(([category, data]) => ({
        'Категорія': category,
        'Кількість': data.count,
        'Вартість': data.value
      }));
      return XLSX.utils.json_to_sheet(data);
    }
  }

  private generatePDFContent(doc: jsPDF, report: InventoryReport | OperationHistoryReport): void {
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Звіт', 14, 20);
    
    if ('operations' in report) {
      const tableData = report.operations.map(op => [
        op.date.toISOString(),
        op.type,
        op.partId.toString(),
        op.quantity.toString(),
        op.price?.toString() || '',
        op.customer || '',
        op.details
      ]);
      
      doc.autoTable({
        head: [['Дата', 'Тип', 'ID запчастини', 'Кількість', 'Ціна', 'Клієнт', 'Деталі']],
        body: tableData,
        startY: 30
      });
    } else {
      const tableData = Object.entries(report.categorySummary).map(([category, data]) => [
        category,
        data.count.toString(),
        data.value.toString()
      ]);
      
      doc.autoTable({
        head: [['Категорія', 'Кількість', 'Вартість']],
        body: tableData,
        startY: 30
      });
      
      if (report.salesStatistics) {
        doc.addPage();
        doc.text('Статистика продажів', 14, 20);
        
        const salesData = Object.entries(report.salesStatistics.monthlySales).map(([month, sales]) => [
          month,
          sales.toString()
        ]);
        
        doc.autoTable({
          head: [['Місяць', 'Продажі']],
          body: salesData,
          startY: 30
        });
      }
    }
  }
}