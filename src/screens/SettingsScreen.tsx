import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Switch, useTheme, Text, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme as useAppTheme } from '../theme/ThemeContext';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { isDark, toggleTheme } = useAppTheme();

  // Workaround for TS prop inference issue with react-native-paper HOCs
  const RNListItem = List.Item as any;
  const RNDivider = Divider as any;

  const handleBackupPress = useCallback(() => {
    navigation.navigate('GoogleDrive');
  }, [navigation]);

  const handleAboutPress = useCallback(() => {
    // TODO: Navigate to About screen
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <List.Section>
        <List.Subheader style={[styles.sectionHeader, { color: colors.primary }]}>
          Зовнішній вигляд
        </List.Subheader>
        <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <RNListItem
            title="Темна тема"
            left={(props: any) => <List.Icon {...props} icon="moon" />}
            right={() => (
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                color={colors.primary}
              />
            )}
          />
        </View>
      </List.Section>

      <RNDivider style={styles.divider} />

      <List.Section>
        <List.Subheader style={[styles.sectionHeader, { color: colors.primary }]}>
          Резервне копіювання
        </List.Subheader>
        <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <RNListItem
            title="Керування резервними копіями"
            description="Створення та відновлення резервних копій"
            left={(props: any) => <List.Icon {...props} icon="cloud-upload" />}
            right={(props: any) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleBackupPress}
          />
        </View>
      </List.Section>

      <RNDivider style={styles.divider} />

      <List.Section>
        <List.Subheader style={[styles.sectionHeader, { color: colors.primary }]}>
          Додатково
        </List.Subheader>
        <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <RNListItem
            title="Про додаток"
            left={(props: any) => <List.Icon {...props} icon="information" />}
            right={(props: any) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleAboutPress}
          />
        </View>
      </List.Section>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.onSurfaceVariant }]}>
          Версія 1.0.0
        </Text>
        <Text style={[styles.copyright, { color: colors.onSurfaceVariant }]}>
          © 2023 Склад Автозапчастин
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 0,
    paddingLeft: 0,
  },
  settingItem: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  divider: {
    marginVertical: 16,
    height: 1,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default SettingsScreen;
