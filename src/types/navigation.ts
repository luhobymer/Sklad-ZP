// navigation types for root stack

/**
 * Типи для параметрів навігації між екранами
 */
export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  PartDetails: { partId: number };
  PartsList: {
    category?: string;
    manufacturer?: string;
    searchTerm?: string;
    filterType?: 'category' | 'manufacturer' | 'search' | 'favorites' | 'all' | 'car';
    carModel?: string;
  };
  PartForm: {
    partId?: number;
  };
  ViewHistory: undefined;
  GoogleDrive: undefined;
};

// Типи для властивостей кожного екрану
type ScreenProps<T extends keyof RootStackParamList> = {
  route: {
    params: RootStackParamList[T];
    key: string;
    name: T;
  };
  navigation: NavigationType;
};

export type DashboardScreenProps = ScreenProps<'Dashboard'>;
export type PartsListScreenProps = ScreenProps<'PartsList'>;
export type PartDetailsScreenProps = ScreenProps<'PartDetails'>;
export type PartFormScreenProps = ScreenProps<'PartForm'>;
export type ViewHistoryScreenProps = ScreenProps<'ViewHistory'>;
export type GoogleDriveScreenProps = ScreenProps<'GoogleDrive'>;

// Тип для навігаційного об'єкту, що може використовуватися в будь-якому компоненті
type NavigationType = {
  navigate: <T extends keyof RootStackParamList>(screen: T, params?: RootStackParamList[T]) => void;
  goBack: () => void;
  // Додайте інші необхідні методи навігації
};

export type NavigationProps = {
  navigation: NavigationType;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
