import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/designSystem';
import { Card } from './Card';
import { useTheme } from '../contexts/ThemeContext';

export type LanguageOption = 'english' | 'hebrew' | 'bilingual';
export type LayoutOption = 'stacked' | 'sideBySide' | 'hebrewFirst';
export type ColorTheme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';

export interface TextReaderSettings {
  language: LanguageOption;
  layout: LayoutOption;
  colorTheme: ColorTheme;
  fontSize: FontSize;
  showVowels: boolean;
}

interface TextReaderToolsProps {
  visible: boolean;
  onClose: () => void;
  settings: TextReaderSettings;
  onSettingsChange: (settings: Partial<TextReaderSettings>) => void;
}

export const TextReaderTools: React.FC<TextReaderToolsProps> = ({
  visible,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const insets = useSafeAreaInsets();

  const languageOptions = [
    { key: 'english' as const, label: 'A', description: 'English' },
    { key: 'bilingual' as const, label: 'Aא', description: 'Both' },
    { key: 'hebrew' as const, label: 'א', description: 'Hebrew' },
  ];

  const layoutOptions = [
    { key: 'stacked' as const, icon: 'align-justify', description: 'Stacked' },
    { key: 'sideBySide' as const, icon: 'columns', description: 'Side by Side' },
    { key: 'hebrewFirst' as const, icon: 'repeat', description: 'Hebrew First' }, // 'repeat' is a valid Feather icon
  ];

  const colorOptions = [
    { key: 'light' as const, color: '#ffffff', borderColor: '#e1e8ed' },
    { key: 'dark' as const, color: '#2c3e50', borderColor: '#34495e' },
  ];

  const fontSizeOptions = [
    { key: 'small' as const, label: 'A', size: 14 },
    { key: 'medium' as const, label: 'A', size: 18 },
    { key: 'large' as const, label: 'A', size: 22 },
  ];

  const vowelOptions = [
    { key: false, label: 'א', description: 'No Vowels' },
    { key: true, label: 'אָ', description: 'With Vowels' },
  ];

  const { isDark, setDarkMode, colors: themeColors } = useTheme();

  // Handle color theme change and sync with global theme
  const handleColorThemeChange = (colorTheme: 'light' | 'dark') => {
    onSettingsChange({ colorTheme });
    setDarkMode(colorTheme === 'dark');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[
        styles.container,
        { 
          backgroundColor: themeColors.systemGroupedBackground,
          paddingTop: insets.top 
        }
      ]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeColors.separator }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.6}
            accessibilityLabel="Close settings"
            accessibilityRole="button"
            accessibilityHint="Closes the reading settings panel"
          >
            <Feather name="x" size={24} color={themeColors.label} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.label }]}>Reading Settings</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView 
          style={[styles.content, { backgroundColor: themeColors.systemGroupedBackground }]} 
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Preview Section */}
          <View style={styles.section}>
            <Card style={{ ...styles.previewCard, backgroundColor: themeColors.secondarySystemGroupedBackground }}
                  padding="lg">
              <Text style={[styles.sectionTitle, { color: themeColors.label, marginBottom: Spacing.sm }]}>Preview</Text>
              {settings.language === 'english' && (
                <Text style={[
                  styles.previewText,
                  { 
                    fontSize: fontSizeOptions.find(f => f.key === settings.fontSize)?.size,
                    color: themeColors.label 
                  }
                ]}>
                  In the beginning God created the heaven and the earth.
                </Text>
              )}
              
              {settings.language === 'hebrew' && (
                <Text style={[
                  styles.previewTextHebrew,
                  { 
                    fontSize: fontSizeOptions.find(f => f.key === settings.fontSize)?.size,
                    color: themeColors.label 
                  }
                ]}>
                  {settings.showVowels 
                    ? 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃'
                    : 'בראשית ברא אלהים את השמים ואת הארץ׃'
                  }
                </Text>
              )}
              
              {settings.language === 'bilingual' && (
                <View style={[
                  styles.bilingualPreview,
                  settings.layout === 'sideBySide' && styles.bilingualSideBySide
                ]}>
                  {settings.layout === 'hebrewFirst' ? (
                    <>
                      <Text style={[
                        styles.previewTextHebrew,
                        { 
                          fontSize: fontSizeOptions.find(f => f.key === settings.fontSize)?.size,
                          color: themeColors.label 
                        },
                        styles.bilingualText
                      ]}>
                        {settings.showVowels 
                          ? 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים'
                          : 'בראשית ברא אלהים'
                        }
                      </Text>
                      <Text style={[
                        styles.previewText,
                        { 
                          fontSize: fontSizeOptions.find(f => f.key === settings.fontSize)?.size,
                          color: themeColors.label 
                        },
                        styles.bilingualText
                      ]}>
                        In the beginning God created
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[
                        styles.previewText,
                        { 
                          fontSize: fontSizeOptions.find(f => f.key === settings.fontSize)?.size,
                          color: themeColors.label 
                        },
                        styles.bilingualText
                      ]}>
                        In the beginning God created
                      </Text>
                      <Text style={[
                        styles.previewTextHebrew,
                        { 
                          fontSize: fontSizeOptions.find(f => f.key === settings.fontSize)?.size,
                          color: themeColors.label 
                        },
                        styles.bilingualText
                      ]}>
                        {settings.showVowels 
                          ? 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים'
                          : 'בראשית ברא אלהים'
                        }
                      </Text>
                    </>
                  )}
                </View>
              )}
            </Card>
          </View>

          {/* Language Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.label }]}>Language</Text>
            <Card style={{ ...styles.settingsCard, backgroundColor: themeColors.secondarySystemGroupedBackground }}
                  padding="md">
              <View style={styles.optionRow}>
                {languageOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.modernOption,
                      { 
                        backgroundColor: settings.language === option.key 
                          ? (isDark ? themeColors.primaryButton : Colors.primary)
                          : themeColors.tertiarySystemGroupedBackground,
                        borderColor: themeColors.separator
                      }
                    ]}
                    onPress={() => onSettingsChange({ language: option.key })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.modernOptionLabel,
                      { 
                        color: settings.language === option.key 
                          ? (isDark ? themeColors.primaryButtonText : Colors.white)
                          : themeColors.label
                      }
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.modernOptionDescription,
                      { 
                        color: settings.language === option.key 
                          ? (isDark ? themeColors.primaryButtonText : Colors.white)
                          : themeColors.secondaryLabel
                      }
                    ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>

          {/* Bilingual Layout Section - Only show when bilingual is selected */}
          {settings.language === 'bilingual' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.label }]}>Bilingual Layout</Text>
              <Card style={{ ...styles.settingsCard, backgroundColor: themeColors.secondarySystemGroupedBackground }}
                    padding="md">
                <View style={styles.optionRow}>
                  {layoutOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.modernOption,
                        { 
                          backgroundColor: settings.layout === option.key 
                            ? (isDark ? themeColors.primaryButton : Colors.primary)
                            : themeColors.tertiarySystemGroupedBackground,
                          borderColor: themeColors.separator
                        }
                      ]}
                      onPress={() => onSettingsChange({ layout: option.key })}
                      activeOpacity={0.7}
                    >
                      <Feather 
                        name={option.icon as any}
                        size={22}
                        color={settings.layout === option.key 
                          ? (isDark ? themeColors.primaryButtonText : Colors.white)
                          : themeColors.label
                        }
                        style={{ marginBottom: 4 }}
                      />
                      <Text style={[
                        styles.modernOptionDescription,
                        { 
                          color: settings.layout === option.key 
                            ? (isDark ? themeColors.primaryButtonText : Colors.white)
                            : themeColors.secondaryLabel
                        }
                      ]}>
                        {option.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            </View>
          )}

          {/* Color Theme Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.label }]}>Appearance</Text>
            <Card style={{ ...styles.settingsCard, backgroundColor: themeColors.secondarySystemGroupedBackground }}
                  padding="md">
              <View style={styles.colorRow}>
                <TouchableOpacity
                  style={[
                    styles.colorOption,
                    { 
                      backgroundColor: Colors.white,
                      borderColor: settings.colorTheme === 'light' ? Colors.primary : themeColors.separator
                    },
                    settings.colorTheme === 'light' && styles.colorOptionSelected,
                  ]}
                  onPress={() => handleColorThemeChange('light')}
                  activeOpacity={0.7}
                >
                  <Feather 
                    name="sun" 
                    size={22} 
                    color={settings.colorTheme === 'light' ? Colors.primary : Colors.gray1} 
                  />
                  <Text style={[
                    styles.colorOptionText,
                    { color: settings.colorTheme === 'light' ? Colors.primary : Colors.gray1 }
                  ]}>
                    Light
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: '#000',
                      borderColor: Colors.white
                    },
                    settings.colorTheme === 'dark' && styles.colorOptionSelected,
                  ]}
                  onPress={() => handleColorThemeChange('dark')}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="moon"
                    size={22}
                    color={Colors.white}
                  />
                  <Text style={[
                    styles.colorOptionText,
                    { color: Colors.white }
                  ]}>
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>

          {/* Font Size Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.label }]}>Font Size</Text>
            <Card style={{ ...styles.settingsCard, backgroundColor: themeColors.secondarySystemGroupedBackground }}
                  padding="md">
              <View style={styles.optionRow}>
                {fontSizeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.modernOption,
                      { 
                        backgroundColor: settings.fontSize === option.key 
                          ? (isDark ? themeColors.primaryButton : Colors.primary)
                          : themeColors.tertiarySystemGroupedBackground,
                        borderColor: themeColors.separator
                      }
                    ]}
                    onPress={() => onSettingsChange({ fontSize: option.key })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.fontSizeLabel,
                      { 
                        fontSize: option.size,
                        color: settings.fontSize === option.key 
                          ? (isDark ? themeColors.primaryButtonText : Colors.white)
                          : themeColors.label
                      }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>

          {/* Vowels Section - Only show when Hebrew is involved */}
          {(settings.language === 'hebrew' || settings.language === 'bilingual') && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.label }]}>Hebrew Vowels</Text>
              <Card style={{ ...styles.settingsCard, backgroundColor: themeColors.secondarySystemGroupedBackground }}
                    padding="md">
                <View style={styles.optionRow}>
                  {vowelOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key.toString()}
                      style={[
                        styles.modernOption,
                        { 
                          backgroundColor: settings.showVowels === option.key 
                            ? (isDark ? themeColors.primaryButton : Colors.primary)
                            : themeColors.tertiarySystemGroupedBackground,
                          borderColor: themeColors.separator
                        }
                      ]}
                      onPress={() => onSettingsChange({ showVowels: option.key })}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.modernOptionLabel,
                        { 
                          color: settings.showVowels === option.key 
                            ? (isDark ? themeColors.primaryButtonText : Colors.white)
                            : themeColors.label
                        }
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={[
                        styles.modernOptionDescription,
                        { 
                          color: settings.showVowels === option.key 
                            ? (isDark ? themeColors.primaryButtonText : Colors.white)
                            : themeColors.secondaryLabel
                        }
                      ]}>
                        {option.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator, // Will be overridden inline for theme
    ...Shadows.small,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    ...Typography.headline,
    fontWeight: '600',
  },
  spacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    justifyContent: 'center',
  },
  modernOption: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  modernOptionLabel: {
    ...Typography.callout,
    fontWeight: '600',
    textAlign: 'center',
  },
  modernOptionDescription: {
    ...Typography.caption2,
    textAlign: 'center',
    marginTop: 1,
  },
  modernOptionIcon: {
    ...Typography.title2,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  colorOption: {
    minWidth: 80,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  colorOptionSelected: {
    borderWidth: 3,
  },
  colorOptionText: {
    ...Typography.footnote,
    fontWeight: '600',
    marginTop: 4,
  },
  fontSizeLabel: {
    fontWeight: '600',
    textAlign: 'center',
  },
  previewText: {
    lineHeight: 24,
  },
  previewTextHebrew: {
    lineHeight: 28,
    textAlign: 'right',
    fontFamily: 'System',
  },
  bilingualPreview: {
    gap: Spacing.sm,
  },
  bilingualSideBySide: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  bilingualText: {
    flex: 1,
  },
  previewCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.card,
  },
  settingsCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.card,
  },
});