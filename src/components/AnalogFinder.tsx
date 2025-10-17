import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import SafeFlatList from './common/SafeFlatList';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Part } from '../models/Part';
import AnalogService from '../services/AnalogService';
import { colors, spacing } from '../theme/theme';
import Button from './Button';
import { Logger } from '../utils/logger';

// Створюємо логер для AnalogFinder
const logger = new Logger({ name: 'AnalogFinder' });


interface AnalogFinderProps {
  visible: boolean;
  onClose: () => void;
  initialArticle?: string;
  initialPart?: Part;
  onSelectAnalog?: (part: Part) => void;
}

const AnalogFinder: React.FC<AnalogFinderProps> = ({
  visible,
  onClose,
  initialArticle,
  initialPart,
  onSelectAnalog
}) => {
  const [loading, setLoading] = useState(false);
  const [articleNumber, setArticleNumber] = useState(initialArticle || '');
  const [analogs, setAnalogs] = useState<Part[]>([]);
  const [analogsWithSimilarity, setAnalogsWithSimilarity] = useState<{part: Part, similarity: number}[]>([]);
  const [searchMode, setSearchMode] = useState<'article' | 'parameters'>(
    initialArticle ? 'article' : initialPart ? 'parameters' : 'article'
  );
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [searchError, setSearchError] = useState('');
  
  const analogService = AnalogService.getInstance();

  useEffect(() => {
    if (initialArticle) {
      setArticleNumber(initialArticle);
      handleSearchByArticle();
    } else if (initialPart) {
      handleSearchByParameters();
    }
  }, [initialArticle, initialPart]);

  const handleSearchByArticle = async () => {
    if (!articleNumber.trim()) {
      setSearchError('Введіть артикул для пошуку');
      return;
    }

    try {
      setLoading(true);
      setSearchError('');
      const results = await analogService.findAnalogsByArticle(articleNumber.trim());
      setAnalogs(results);
      setAnalogsWithSimilarity([]);
    } catch (error) {
      logger.error('Помилка при пошуку аналогів за артикулом:', error);
      setSearchError('Помилка при пошуку аналогів. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByParameters = async () => {
    if (!initialPart) {
      setSearchError('Не вказана запчастина для пошуку аналогів');
      return;
    }

    try {
      setLoading(true);
      setSearchError('');
      const results = await analogService.findAnalogsByParameters(initialPart, similarityThreshold);
      setAnalogsWithSimilarity(results);
      setAnalogs([]);
    } catch (error) {
      logger.error('Помилка при пошуку аналогів за параметрами:', error);
      setSearchError('Помилка при пошуку аналогів. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnalog = (part: Part) => {
    if (onSelectAnalog) {
      onSelectAnalog(part);
    }
    onClose();
  };

  const renderAnalogItem = ({ item }: { item: Part }) => (
    <TouchableOpacity 
      style={styles.analogItem}
      onPress={() => handleSelectAnalog(item)}
    >
      <View style={styles.analogInfo}>
        <Text style={styles.analogName}>{item.name}</Text>
        <Text style={styles.analogArticle}>Артикул: {item.articleNumber}</Text>
        <Text style={styles.analogManufacturer}>Виробник: {item.manufacturer}</Text>
        <Text style={styles.analogPrice}>Ціна: {item.price} грн</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderAnalogWithSimilarityItem = ({ item }: { item: {part: Part, similarity: number} }) => (
    <TouchableOpacity 
      style={styles.analogItem}
      onPress={() => handleSelectAnalog(item.part)}
    >
      <View style={styles.analogInfo}>
        <Text style={styles.analogName}>{item.part.name}</Text>
        <Text style={styles.analogArticle}>Артикул: {item.part.articleNumber}</Text>
        <Text style={styles.analogManufacturer}>Виробник: {item.part.manufacturer}</Text>
        <Text style={styles.analogPrice}>Ціна: {item.part.price} грн</Text>
        <View style={styles.similarityContainer}>
          <Text style={styles.similarityText}>Схожість: </Text>
          <View style={styles.similarityBar}>
            <View 
              style={[styles.similarityFill, { width: `${item.similarity * 100}%` }]} 
            />
          </View>
          <Text style={styles.similarityPercent}>{Math.round(item.similarity * 100)}%</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, !visible && styles.hidden]}>
      <View style={styles.header}>
        <Text style={styles.title}>Пошук аналогів</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, searchMode === 'article' && styles.activeTab]}
          onPress={() => setSearchMode('article')}
        >
          <Text style={[styles.tabText, searchMode === 'article' && styles.activeTabText]}>За артикулом</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, searchMode === 'parameters' && styles.activeTab]}
          onPress={() => setSearchMode('parameters')}
          disabled={!initialPart}
        >
          <Text 
            style={[
              styles.tabText, 
              searchMode === 'parameters' && styles.activeTabText,
              !initialPart && styles.disabledTabText
            ]}
          >
            За параметрами
          </Text>
        </TouchableOpacity>
      </View>

      {searchMode === 'article' ? (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Введіть артикул запчастини"
            value={articleNumber}
            onChangeText={setArticleNumber}
          />
          <Button 
            title="Знайти аналоги" 
            onPress={handleSearchByArticle} 
            style={styles.searchButton}
          />
        </View>
      ) : (
        <View style={styles.searchContainer}>
          <Text style={styles.parameterTitle}>Пошук аналогів для: {initialPart?.name}</Text>
          <View style={styles.thresholdContainer}>
            <Text style={styles.thresholdLabel}>Мінімальна схожість: {Math.round(similarityThreshold * 100)}%</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity 
                onPress={() => setSimilarityThreshold(Math.max(0.1, similarityThreshold - 0.1))}
                style={styles.sliderButton}
              >
                <Ionicons name="remove" size={24} color={colors.primary} />
              </TouchableOpacity>
              <View style={styles.slider}>
                <View style={[styles.sliderFill, { width: `${similarityThreshold * 100}%` }]} />
              </View>
              <TouchableOpacity 
                onPress={() => setSimilarityThreshold(Math.min(1, similarityThreshold + 0.1))}
                style={styles.sliderButton}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <Button 
            title="Знайти аналоги" 
            onPress={handleSearchByParameters} 
            style={styles.searchButton}
            disabled={!initialPart}
          />
        </View>
      )}

      {searchError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Пошук аналогів...</Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {searchMode === 'article' ? (
            analogs.length > 0 ? (
              <SafeFlatList<Part>
                data={Array.isArray(analogs) ? analogs : []}
                renderItem={renderAnalogItem as unknown as (info: { item: Part; index: number }) => React.ReactElement | null}
                keyExtractor={(item) => item.articleNumber}
                contentContainerStyle={styles.list}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Аналогів не знайдено</Text>
              </View>
            )
          ) : (
            analogsWithSimilarity.length > 0 ? (
              <SafeFlatList<{ part: Part; similarity: number }>
                data={Array.isArray(analogsWithSimilarity) ? analogsWithSimilarity : []}
                renderItem={renderAnalogWithSimilarityItem as unknown as (info: { item: { part: Part; similarity: number }; index: number }) => React.ReactElement | null}
                keyExtractor={(item) => item.part.articleNumber}
                contentContainerStyle={styles.list}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Аналогів не знайдено</Text>
              </View>
            )
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hidden: {
    display: 'none',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  disabledTabText: {
    color: colors.textDisabled,
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  searchButton: {
    width: '100%',
  },
  parameterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text,
  },
  thresholdContainer: {
    marginBottom: spacing.md,
  },
  thresholdLabel: {
    fontSize: 14,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  sliderButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  resultsContainer: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
  },
  analogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  analogInfo: {
    flex: 1,
  },
  analogName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  analogArticle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  analogManufacturer: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  analogPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  similarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  similarityText: {
    fontSize: 14,
    color: colors.textLight,
    marginRight: spacing.xs,
  },
  similarityBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginRight: spacing.xs,
    overflow: 'hidden',
  },
  similarityFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  similarityPercent: {
    fontSize: 14,
    color: colors.textLight,
    width: 40,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: colors.errorBackground,
    borderRadius: 8,
    margin: spacing.md,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
});

export default AnalogFinder;
