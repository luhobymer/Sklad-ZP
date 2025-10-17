/**
 * Типи для стану додатку та контексту
 */
import { Part } from '../models/Part';

/**
 * Стан додатку
 */
export interface AppState {
  // Загальний стан
  isLoading: boolean;
  error: string | null;
  
  // Стан авторизації
  isAuthenticated: boolean;
  
  // Стан запчастин
  parts: Part[];
  filteredParts: Part[];
  selectedPart: Part | null;
  
  // Стан фільтрів
  filters: {
    category?: string;
    manufacturer?: string;
    searchTerm?: string;
    filterType?: 'category' | 'manufacturer' | 'search' | 'favorites' | 'all';
    showOnlyNew?: boolean;
    showOnlyInStock?: boolean;
  };
  
  // Стан історії
  viewHistory: {
    partId: number;
    viewedAt: Date;
  }[];
  
  // Стан обраних запчастин
  favorites: number[]; // масив ID обраних запчастин
  
  // Стан резервних копій
  backups: {
    id: string;
    name: string;
    createdAt: Date;
    size: number;
  }[];
}

/**
 * Дії для зміни стану додатку
 */
export enum AppActionType {
  // Загальні дії
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  
  // Дії для запчастин
  LOAD_PARTS = 'LOAD_PARTS',
  ADD_PART = 'ADD_PART',
  UPDATE_PART = 'UPDATE_PART',
  DELETE_PART = 'DELETE_PART',
  SELECT_PART = 'SELECT_PART',
  
  // Дії для фільтрів
  SET_FILTER = 'SET_FILTER',
  CLEAR_FILTERS = 'CLEAR_FILTERS',
  
  // Дії для історії
  ADD_TO_HISTORY = 'ADD_TO_HISTORY',
  CLEAR_HISTORY = 'CLEAR_HISTORY',
  
  // Дії для обраних запчастин
  ADD_TO_FAVORITES = 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES = 'REMOVE_FROM_FAVORITES',
  
  // Дії для резервних копій
  LOAD_BACKUPS = 'LOAD_BACKUPS',
  CREATE_BACKUP = 'CREATE_BACKUP',
  DELETE_BACKUP = 'DELETE_BACKUP',
  RESTORE_BACKUP = 'RESTORE_BACKUP',
}

/**
 * Базовий інтерфейс для дій
 */
export interface AppAction {
  type: AppActionType;
  payload?: any;
}

/**
 * Типи для контексту додатку (якщо буде використовуватись)
 */
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

/**
 * Початковий стан додатку
 */
export const initialAppState: AppState = {
  isLoading: false,
  error: null,
  isAuthenticated: false,
  parts: [],
  filteredParts: [],
  selectedPart: null,
  filters: {},
  viewHistory: [],
  favorites: [],
  backups: [],
};
