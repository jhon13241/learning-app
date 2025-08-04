import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Typography } from '../constants/designSystem';
import { TextReaderSettings } from './TextReaderTools';
import { SefariaTextResponse } from '../services/sefariaApi';

interface EnhancedTextDisplayProps {
  data: SefariaTextResponse;
  settings: TextReaderSettings;
  fontSize: number;
  hebrewFontSize: number;
  lineHeight: number;
  hebrewLineHeight: number;
  themeColors: {
    background: string;
    cardBackground: string;
    text: string;
    secondaryText: string;
    border: string;
    accent: string;
  };
}

export const EnhancedTextDisplay: React.FC<EnhancedTextDisplayProps> = ({
  data,
  settings,
  fontSize,
  hebrewFontSize,
  lineHeight,
  hebrewLineHeight,
  themeColors,
}) => {
  const shouldShowEnglish = settings.language === 'english' || settings.language === 'bilingual';
  const shouldShowHebrew = settings.language === 'hebrew' || settings.language === 'bilingual';

  // Clean and process text segments
  const cleanHtmlText = (text: string): string => {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  // Remove Hebrew vowels if setting is disabled
  const processHebrewText = (text: string): string => {
    let processed = cleanHtmlText(text);
    if (!settings.showVowels) {
      // Remove Hebrew vowel points (nikud)
      processed = processed.replace(/[\u0591-\u05C7]/g, '');
    }
    return processed;
  };

  // Render bilingual content based on layout
  const renderBilingualContent = () => {
    if (!data.text || !data.he) return null;
    const maxLength = Math.max(data.text.length, data.he.length);
    const segments = [];
    for (let i = 0; i < maxLength; i++) {
      const englishSegment = data.text[i] ? cleanHtmlText(data.text[i]) : '';
      const hebrewSegment = data.he[i] ? processHebrewText(data.he[i]) : '';
      if (!englishSegment && !hebrewSegment) continue;
      segments.push(
        <View key={i} style={styles.segmentContainerImproved}>
          {data.text.length > 1 && (
            <Text style={styles.segmentNumberImproved}>{i + 1}</Text>
          )}
          <View style={[
            styles.bilingualSegment,
            settings.layout === 'sideBySide' && styles.sideBySideLayoutImproved
          ]}>
            {settings.layout === 'hebrewFirst' ? (
              <>
                {hebrewSegment && (
                  <Text style={[
                    styles.hebrewTextImproved,
                    {
                      fontSize: hebrewFontSize,
                      lineHeight: Math.max(hebrewFontSize * 1.6, 28),
                      color: themeColors.text,
                    }
                  ]}>{hebrewSegment}</Text>
                )}
                {englishSegment && (
                  <Text style={[
                    styles.englishTextImproved,
                    {
                      fontSize: fontSize,
                      lineHeight: Math.max(fontSize * 1.6, 24),
                      color: themeColors.text,
                    }
                  ]}>{englishSegment}</Text>
                )}
              </>
            ) : (
              <>
                {englishSegment && (
                  <Text style={[
                    styles.englishTextImproved,
                    {
                      fontSize: fontSize,
                      lineHeight: Math.max(fontSize * 1.6, 24),
                      color: themeColors.text,
                    },
                    settings.layout === 'sideBySide' && styles.sideBySideTextImproved
                  ]}>{englishSegment}</Text>
                )}
                {hebrewSegment && (
                  <Text style={[
                    styles.hebrewTextImproved,
                    {
                      fontSize: hebrewFontSize,
                      lineHeight: Math.max(hebrewFontSize * 1.6, 28),
                      color: themeColors.text,
                    },
                    settings.layout === 'sideBySide' && styles.sideBySideTextImproved
                  ]}>{hebrewSegment}</Text>
                )}
              </>
            )}
          </View>
        </View>
      );
    }
    return segments;
  };

  // Render single language content
  const renderSingleLanguageContent = (isHebrew: boolean) => {
    const textArray = isHebrew ? data.he : data.text;
    if (!textArray || textArray.length === 0) return null;

    return textArray.map((segment, index) => {
      const cleanedText = isHebrew ? processHebrewText(segment) : cleanHtmlText(segment);
      if (!cleanedText) return null;
      return (
        <View key={index} style={styles.segmentContainerImproved}>
          {textArray.length > 1 && (
            <Text style={styles.segmentNumberImproved}>{index + 1}</Text>
          )}
          <Text style={[
            isHebrew ? styles.hebrewTextImproved : styles.englishTextImproved,
            {
              fontSize: isHebrew ? hebrewFontSize : fontSize,
              lineHeight: Math.max((isHebrew ? hebrewFontSize : fontSize) * 1.6, isHebrew ? 28 : 24),
              color: themeColors.text,
            }
          ]}>
            {cleanedText}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* English Only */}
      {settings.language === 'english' && shouldShowEnglish && (
        <View style={[styles.textSection, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>English</Text>
          {renderSingleLanguageContent(false)}
        </View>
      )}

      {/* Hebrew Only */}
      {settings.language === 'hebrew' && shouldShowHebrew && (
        <View style={[styles.textSection, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Hebrew</Text>
          {renderSingleLanguageContent(true)}
        </View>
      )}

      {/* Bilingual */}
      {settings.language === 'bilingual' && shouldShowEnglish && shouldShowHebrew && (
        <View style={[styles.textSection, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}> 
            {settings.layout === 'hebrewFirst' ? 'Hebrew • English' : 'English • Hebrew'}
          </Text>
          {renderBilingualContent()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textSection: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sectionTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  versionInfo: {
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  segmentContainerImproved: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    paddingLeft: 2,
    paddingRight: 2,
  },
  segmentNumberImproved: {
    fontSize: 11,
    fontWeight: '400',
    color: '#A0A4A8',
    marginRight: 10,
    marginLeft: 2,
    marginTop: 4,
    minWidth: 18,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  englishTextImproved: {
    flex: 1,
    letterSpacing: 0.1,
    textAlign: 'left',
    marginBottom: 0,
  },
  hebrewTextImproved: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'System',
    writingDirection: 'rtl',
    marginBottom: 0,
  },
  bilingualSegment: {
    flex: 1,
    gap: Spacing.sm,
  },
  sideBySideLayoutImproved: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'flex-start',
  },
  sideBySideTextImproved: {
    flex: 1,
  },
});