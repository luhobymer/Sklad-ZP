import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import SafeFlatList from './common/SafeFlatList';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Part } from '../models/Part';
import { colors, spacing } from '../theme/theme';
import Button from './Button';
import PartCard from './PartCard';
import FileStorageService from '../services/FileStorageService';
import AnalogService from '../services/AnalogService';
import { Logger } from '../utils/logger';

const logger = new Logger({ name: 'AnalogSearchView' });

interface AnalogSearchViewProps {
  part: Part;
  isVisible: boolean;
  onClose: () => void;
  onAnalogSelect: (analog: Part) => void;
}

interface AnalogWithScore {
  part: Part;
  compatibilityScore: number;
  matchReasons: string[];
}

const AnalogSearchView: React.FC<AnalogSearchViewProps> = ({
  part,
  isVisible,
  onClose,
  onAnalogSelect
}) => {
  const [analogs, setAnalogs] = useState<AnalogWithScore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      findAnalogs();
    }
  }, [isVisible, part]);

  const findAnalogs = async () => {
    try {
      setLoading(true);
      const storageService = FileStorageService.getInstance();
      const analogService = AnalogService.getInstance();
      
      if (!storageService) {
        throw new Error('Сховище не ініціалізовано');
      }

      const allParts = await storageService.getAllParts();
      const analogsWithScore: AnalogWithScore[] = [];

      // Знаходимо потенційні аналоги
      for (const potentialAnalog of allParts) {
        if (potentialAnalog.id === part.id || potentialAnalog.quantity <= 0) {
          continue; // Пропускаємо ту ж запчастину та недоступні
        }

        const score = calculateCompatibilityScore(part, potentialAnalog);
        const matchReasons = getMatchReasons(part, potentialAnalog);

        if (score > 0) {
          analogsWithScore.push({
            part: potentialAnalog,
            compatibilityScore: score,
            matchReasons
          });
        }
      }

      // Сортуємо за рейтингом сумісності
      analogsWithScore.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      // Обмежуємо до топ-20 аналогів
      setAnalogs(analogsWithScore.slice(0, 20));
    } catch (error) {
      logger.error('Помилка при пошуку аналогів:', error);
      Alert.alert('Помилка', 'Не вдалося знайти аналоги');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompatibilityScore = (originalPart: Part, potentialAnalog: Part): number => {
    let score = 0;

    // Точна відповідність категорії (40 балів)
    if (originalPart.category === potentialAnalog.category) {
      score += 40;
    }

    // Точна відповідність виробника (30 балів)
    if (originalPart.manufacturer === potentialAnalog.manufacturer) {
      score += 30;
    }

    // Точна відповідність типу (20 балів)
    if (originalPart.type && potentialAnalog.type && originalPart.type === potentialAnalog.type) {
      score += 20;
    }

    // Сумісність з тими ж автомобілями (25 балів)
    if (originalPart.compatibleCars && potentialAnalog.compatibleCars) {
      const commonCars = originalPart.compatibleCars.filter(car1 =>
        potentialAnalog.compatibleCars!.some(car2 =>
          car1.toLowerCase().includes(car2.toLowerCase()) ||
          car2.toLowerCase().includes(car1.toLowerCase())
        )
      );
      if (commonCars.length > 0) {
        score += Math.min(25, commonCars.length * 5);
      }
    }

    // Схожість розмірів (15 балів)
    if (originalPart.dimensions && potentialAnalog.dimensions) {
      if (originalPart.dimensions === potentialAnalog.dimensions) {
        score += 15;
      } else if (originalPart.dimensions.toLowerCase().includes(potentialAnalog.dimensions.toLowerCase()) ||
                 potentialAnalog.dimensions.toLowerCase().includes(originalPart.dimensions.toLowerCase())) {
        score += 8;
      }
    }

    // Схожість моделі (10 балів)
    if (originalPart.model && potentialAnalog.model) {
      if (originalPart.model === potentialAnalog.model) {
        score += 10;
      } else if (originalPart.model.toLowerCase().includes(potentialAnalog.model.toLowerCase()) ||
                 potentialAnalog.model.toLowerCase().includes(originalPart.model.toLowerCase())) {
        score += 5;
      }
    }

    // Схожість назви (10 балів)
    const nameSimilarity = calculateNameSimilarity(originalPart.name, potentialAnalog.name);
    score += Math.round(nameSimilarity * 10);

    return Math.min(100, score); // Максимум 100 балів
  };

  const calculateNameSimilarity = (name1: string, name2: string): number => {
    const words1 = name1.toLowerCase().split(/\s+/);
    const words2 = name2.toLowerCase().split(/\s+/);
    
    let commonWords = 0;
    for (const word1 of words1) {
      if (words2.some(word2 => word1.includes(word2) || word2.includes(word1))) {
        commonWords++;
      }
    }
    
    return commonWords / Math.max(words1.length, words2.length);
  };

  const getMatchReasons = (originalPart: Part, analog: Part): string[] => {
    const reasons: string[] = [];

    if (originalPart.category === analog.category) {
      reasons.push('Та ж категорія');
    }

    if (originalPart.manufacturer === analog.manufacturer) {
      reasons.push('Той же виробник');
    }

    if (originalPart.type && analog.type && originalPart.type === analog.type) {
      reasons.push('Той же тип');
    }

    if (originalPart.compatibleCars && analog.compatibleCars) {
      const commonCars = originalPart.compatibleCars.filter(car1 =>
        analog.compatibleCars!.some(car2 =>
          car1.toLowerCase().includes(car2.toLowerCase()) ||
          car2.toLowerCase().includes(car1.toLowerCase())
        )
      );
      if (commonCars.length > 0) {
        reasons.push(`Сумісність з ${commonCars.length} авто`);
      }
    }

    if (originalPart.dimensions && analog.dimensions && originalPart.dimensions === analog.dimensions) {
      reasons.push('Ті ж розміри');
    }

    return reasons;
  };

  const handleAnalogPress = (analog: Part) => {
    onAnalogSelect(analog);
    onClose();
  };

  const renderAnalogItem = ({ item }: { item: AnalogWithScore }) => (
    <TouchableOpacity
      style={styles.analogItem}
      onPress={() => handleAnalogPress(item.part)}
    >
      <View style={styles.analogContent}>
        <PartCard
          part={item.part}
          onPress={() => handleAnalogPress(item.part)}
          showImage={false}
        />
        <View style={styles.analogMeta}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Сумісність:</Text>
            <Text style={[styles.scoreValue, getScoreColor(item.compatibilityScore)]}>
              {item.compatibilityScore}%
            </Text>
          </View>
          {item.matchReasons.length > 0 && (
            <View style={styles.reasonsContainer}>
              {item.matchReasons.map((reason, index) => (
                <Text key={index} style={styles.reasonText}>
                  • {reason}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: colors.success };
    if (score >= 60) return { color: colors.warning };
    return { color: colors.error };
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Аналоги на складі</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Аналоги для "{part.name}" ({part.articleNumber})
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Пошук аналогів...</Text>
          </View>
        ) : analogs.length > 0 ? (
          <SafeFlatList<AnalogWithScore>
            data={Array.isArray(analogs) ? analogs : []}
            renderItem={renderAnalogItem as unknown as (info: { item: AnalogWithScore; index: number }) => React.ReactElement | null}
            keyExtractor={(item) => item.part.id.toString()}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Аналоги не знайдені на складі
            </Text>
            <Text style={styles.emptySubtext}>
              Спробуйте змінити критерії пошуку або додати нові запчастини
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Button
            title="Закрити"
            onPress={onClose}
            variant="secondary"
            size="medium"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: spacing.xl,
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
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  analogItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  analogContent: {
    padding: spacing.sm,
  },
  analogMeta: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reasonsContainer: {
    marginTop: spacing.xs,
  },
  reasonText: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textLight,
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
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
});

export default AnalogSearchView;