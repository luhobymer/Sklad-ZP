import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';

type SafeFlatListProps<T> = {
  data?: readonly T[] | T[];
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  refreshing?: boolean;
  onRefresh?: () => void;
  horizontal?: boolean;
  ListEmptyComponent?: React.ReactElement | null;
  ListHeaderComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
  ItemSeparatorComponent?: React.ReactElement | null;
  // use any to avoid RN type incompat issues across versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentContainerStyle?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export default function SafeFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  refreshing,
  onRefresh,
  horizontal,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  contentContainerStyle,
  style,
  showsVerticalScrollIndicator,
  showsHorizontalScrollIndicator,
}: SafeFlatListProps<T>) {
  const safeData = Array.isArray(data) ? data : [];
  const safeKeyExtractor = keyExtractor ?? ((_: T, index: number) => String(index));

  return (
    <ScrollView
      horizontal={!!horizontal}
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={!!showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={!!showsHorizontalScrollIndicator}
      refreshControl={
        onRefresh && !horizontal
          ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
          : undefined
      }
    >
      {ListHeaderComponent ?? null}
      {safeData.length > 0 ? (
        safeData.map((item, index) => (
          <React.Fragment key={safeKeyExtractor(item, index)}>
            {renderItem({ item, index })}
            {ItemSeparatorComponent ?? null}
          </React.Fragment>
        ))
      ) : (
        ListEmptyComponent ?? null
      )}
      {ListFooterComponent ?? null}
    </ScrollView>
  );
}
