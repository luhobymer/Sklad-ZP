import { Part } from '../models/Part';

export interface DatabasePartRow {
  id: number;
  article_number: string;
  name: string;
  manufacturer: string;
  category: string;
  type: string | null;
  model: string | null;
  dimensions: string | null;
  is_new: number; // 0 або 1, представляє boolean в SQLite
  quantity: number;
  price: number;
  description: string | null;
  photo_path: string | null;
  compatible_cars: string | null; // JSON рядок масиву
  created_at: string; // ISO рядок дати
  updated_at: string; // ISO рядок дати
}

export interface DatabaseResult {
  success: boolean;
  error?: string;
  insertId?: number;
  rowsAffected?: number;
  rows?: any[];
}

export interface DatabaseService {
  initialize(): Promise<void>;
  executeSql(sql: string, params?: any[]): Promise<DatabaseResult>;
  getParts(): Promise<Part[]>;
  getPartById(id: number): Promise<Part | null>;
  insertPart(part: Omit<Part, 'id'>): Promise<number>;
  updatePart(part: Part): Promise<boolean>;
  deletePart(id: number): Promise<boolean>;
  searchParts(query: string): Promise<Part[]>;
  getPartsByCategory(category: string): Promise<Part[]>;
  getPartsByManufacturer(manufacturer: string): Promise<Part[]>;
  getRecentlyViewedParts(limit: number): Promise<Part[]>;
  getFavoriteParts(): Promise<Part[]>;
  addToFavorites(partId: number): Promise<boolean>;
  removeFromFavorites(partId: number): Promise<boolean>;
  findAnalogs(part: Part): Promise<Part[]>;
  backup(): Promise<string>;
  restore(backupData: string): Promise<boolean>;
}
