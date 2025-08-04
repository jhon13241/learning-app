import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius, Shadows, Colors } from '../constants/designSystem';
import { useTheme } from '../contexts/ThemeContext';
import { ErrorMessage } from './ErrorMessage';

interface TOCItem {
    id: string;
    title: string;
    reference: string;
    level: number;
    type: 'introduction' | 'part' | 'section' | 'chapter';
    isCollapsible: boolean;
    isExpanded: boolean;
    children: TOCItem[];
    chapterRange?: string;
}

interface EnhancedTableOfContentsProps {
    bookTitle: string;
    onSectionPress?: (reference: string) => void;
    themeColors?: {
        background: string;
        cardBackground: string;
        text: string;
        secondaryText: string;
        border: string;
        accent: string;
    };
}

/**
 * Fetches index information from Sefaria API
 * Based on documented endpoint from .kiro/knowledge-base/sefaria-api/endpoints.md
 */
const fetchSefariaIndex = async (title: string) => {
    if (process.env.NODE_ENV !== 'production') console.log('Fetching enhanced index for title:', title);

    try {
        const response = await fetch(`https://www.sefaria.org/api/v2/index/${title}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Index not found for this text.');
            }
            if (response.status === 429) {
                throw new Error('Too many requests. Please wait and try again.');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`API Error: ${data.error}`);
        }

        return data;
    } catch (error) {
        console.error('Error fetching enhanced index:', error);
        throw error;
    }
};

/**
 * Extracts chapter number from reference string
 */
const extractChapterNumber = (ref: string): number => {
    const match = ref.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
};

/**
 * Gets chapter range string for display
 */
const getChapterRange = (refs: string[]): string => {
    if (!refs || refs.length === 0) return '';

    const firstChapter = extractChapterNumber(refs[0]);
    const lastChapter = extractChapterNumber(refs[refs.length - 1]);

    if (firstChapter === lastChapter) {
        return `Chapter ${firstChapter}`;
    }

    return `Chapters ${firstChapter}-${lastChapter} (${refs.length} chapters)`;
};

/**
 * Generates TOC for texts with Topic structure (like Chayei Moharan)
 */
const generateTopicBasedTOC = (indexData: any): TOCItem[] => {
    const items: TOCItem[] = [];
    const title = indexData.title || '';
    const topicNodes = indexData.alts.Topic.nodes;

    if (process.env.NODE_ENV !== 'production') {
      console.log('Generating Topic-based TOC with', topicNodes.length, 'nodes');
      console.log('Topic nodes:', topicNodes.map((n: any, i: number) => ({
        index: i,
        title: n.title,
        nodeType: n.nodeType,
        hasNodes: !!n.nodes,
        nodeCount: n.nodes?.length || 0
      })));
    }

    topicNodes.forEach((node: any, nodeIndex: number) => {
        if (process.env.NODE_ENV !== 'production') console.log(`Processing node ${nodeIndex}:`, {
            title: node.title,
            nodeType: node.nodeType,
            hasNodes: !!node.nodes,
            nodeCount: node.nodes?.length || 0
        });

        // Handle all nodes, not just ArrayMapNode types
        if (node.nodeType === 'ArrayMapNode' || node.title) {
            // Handle introduction
            if (node.title === 'Introduction' || node.heTitle === 'הקדמה') {
                if (process.env.NODE_ENV !== 'production') console.log('Adding Introduction');
                items.push({
                    id: `intro-${nodeIndex}`,
                    title: node.title || 'Introduction',
                    reference: node.wholeRef || `${title}, Introduction`,
                    level: 0,
                    type: 'introduction',
                    isCollapsible: false,
                    isExpanded: false,
                    children: []
                });
            }
            // Handle parts (Part I, Part II) - check for both title patterns
            else if (node.title && (
                node.title.includes('Part') ||
                node.heTitle?.includes('חלק') ||
                node.title.includes('I') ||
                node.title.includes('II')
            )) {
                if (process.env.NODE_ENV !== 'production') console.log('Adding Part:', node.title);
                const partItem: TOCItem = {
                    id: `part-${nodeIndex}`,
                    title: node.title,
                    reference: '',
                    level: 0,
                    type: 'part',
                    isCollapsible: true,
                    isExpanded: false,
                    children: []
                };

                // Add sections within the part
                if (node.nodes && Array.isArray(node.nodes)) {
                    if (process.env.NODE_ENV !== 'production') console.log(`Processing ${node.nodes.length} sections in ${node.title}`);
                    node.nodes.forEach((sectionNode: any, sectionIndex: number) => {
                        if (process.env.NODE_ENV !== 'production') console.log(`Section ${sectionIndex}:`, {
                            title: sectionNode.title,
                            nodeType: sectionNode.nodeType,
                            hasRefs: !!sectionNode.refs,
                            refCount: sectionNode.refs?.length || 0
                        });

                        if (sectionNode.nodeType === 'ArrayMapNode') {
                            const sectionTitle = sectionNode.title?.replace(/\n/g, '').trim() || `Section ${sectionIndex + 1}`;
                            const sectionItem: TOCItem = {
                                id: `section-${nodeIndex}-${sectionIndex}`,
                                title: sectionTitle,
                                reference: sectionNode.wholeRef || '',
                                level: 1,
                                type: 'section',
                                isCollapsible: true,
                                isExpanded: false,
                                children: [],
                                chapterRange: getChapterRange(sectionNode.refs)
                            };

                            // Add all chapters as children (no see-more logic)
                            if (sectionNode.refs && Array.isArray(sectionNode.refs)) {
                                for (let i = 0; i < sectionNode.refs.length; i++) {
                                    const ref = sectionNode.refs[i];
                                    const chapterNumber = extractChapterNumber(ref);
                                    sectionItem.children.push({
                                        id: `chapter-${nodeIndex}-${sectionIndex}-${i}`,
                                        title: `Chapter ${chapterNumber}`,
                                        reference: ref,
                                        level: 2,
                                        type: 'chapter',
                                        isCollapsible: false,
                                        isExpanded: false,
                                        children: []
                                    });
                                }
                            }

                            partItem.children.push(sectionItem);
                        }
                    });
                }

                items.push(partItem);
            }
            // Handle any other nodes that might be parts but don't match our pattern
            else if (node.nodes && Array.isArray(node.nodes) && node.nodes.length > 0) {
                if (process.env.NODE_ENV !== 'production') console.log('Adding other structured node:', node.title);
                const partItem: TOCItem = {
                    id: `other-${nodeIndex}`,
                    title: node.title || `Section ${nodeIndex + 1}`,
                    reference: node.wholeRef || '',
                    level: 0,
                    type: 'section',
                    isCollapsible: true,
                    isExpanded: false,
                    children: []
                };

                // Process child nodes
                node.nodes.forEach((childNode: any, childIndex: number) => {
                    if (childNode.nodeType === 'ArrayMapNode') {
                        const childTitle = childNode.title?.replace(/\n/g, '').trim() || `Subsection ${childIndex + 1}`;
                        partItem.children.push({
                            id: `child-${nodeIndex}-${childIndex}`,
                            title: childTitle,
                            reference: childNode.wholeRef || '',
                            level: 1,
                            type: 'section',
                            isCollapsible: false,
                            isExpanded: false,
                            children: [],
                            chapterRange: getChapterRange(childNode.refs)
                        });
                    }
                });

                items.push(partItem);
            }
        }
    });

    if (process.env.NODE_ENV !== 'production') console.log(`Generated ${items.length} topic-based TOC items`);
    return items;
};

/**
 * Generates TOC for Likutei Halakhot with its complex Shulchan Arukh structure
 * Based on comprehensive testing results from test-enhanced-toc.js
 */
const generateLikuteiHalakhotTOC = (indexData: any): TOCItem[] => {
    const items: TOCItem[] = [];
    const title = indexData.title || '';
    const schemaNodes = indexData.schema.nodes;

    if (process.env.NODE_ENV !== 'production') console.log('Generating Likutei Halakhot TOC with', schemaNodes.length, 'nodes');

    schemaNodes.forEach((node: any, nodeIndex: number) => {
        if (process.env.NODE_ENV !== 'production') console.log(`Processing node ${nodeIndex}:`, {
            title: node.title,
            heTitle: node.heTitle,
            hasNodes: !!node.nodes,
            nodeCount: node.nodes?.length || 0
        });

        // Handle Author's Introduction
        if (node.title === "Author's Introduction" || node.heTitle === "הקדמת המחבר") {
            items.push({
                id: `intro-${nodeIndex}`,
                title: node.title || "Author's Introduction",
                reference: `${title}, Author's Introduction`,
                level: 0,
                type: 'introduction',
                isCollapsible: false,
                isExpanded: false,
                children: []
            });
        }
        // Handle main sections (Orach Chaim, Yoreh Deah, etc.)
        else if (node.nodes && Array.isArray(node.nodes)) {
            const sectionItem: TOCItem = {
                id: `section-${nodeIndex}`,
                title: node.title || `Section ${nodeIndex + 1}`,
                reference: '',
                level: 0,
                type: 'section',
                isCollapsible: true,
                isExpanded: false,
                children: [],
                chapterRange: `${node.nodes.length} subsections`
            };

            // Add subsections
            node.nodes.forEach((subsection: any, subIndex: number) => {
                if (process.env.NODE_ENV !== 'production') console.log(`  Subsection ${subIndex}:`, {
                    title: subsection.title,
                    heTitle: subsection.heTitle
                });

                // Create reference using the pattern: Likutei_Halakhot,_{SECTION},_{SUBSECTION}.1.1
                const sectionName = node.title.replace(/\s+/g, '_');
                const subsectionName = subsection.title.replace(/\s+/g, '_');
                const subsectionRef = `${title},_${sectionName},_${subsectionName}.1.1`;

                sectionItem.children.push({
                    id: `subsection-${nodeIndex}-${subIndex}`,
                    title: subsection.title || `Subsection ${subIndex + 1}`,
                    reference: subsectionRef,
                    level: 1,
                    type: 'chapter',
                    isCollapsible: false,
                    isExpanded: false,
                    children: []
                });
            });

            items.push(sectionItem);
        }
    });

    if (process.env.NODE_ENV !== 'production') console.log(`Generated ${items.length} Likutei Halakhot TOC items`);
    return items;
};

/**
 * Generates TOC for texts with schema nodes (like Likutei Moharan)
 */
const generateSchemaBasedTOC = (indexData: any): TOCItem[] => {
    const items: TOCItem[] = [];
    const title = indexData.title || '';
    const schemaNodes = indexData.schema.nodes;

    if (process.env.NODE_ENV !== 'production') console.log('Generating Schema-based TOC with', schemaNodes.length, 'nodes');

    schemaNodes.forEach((node: any, nodeIndex: number) => {
        if (node.nodeType === 'JaggedArrayNode') {
            const nodeTitle = node.title || node.key || `Section ${nodeIndex + 1}`;

            // Handle special sections like Introduction
            if (nodeTitle === 'Introduction' || node.key === 'Introduction') {
                items.push({
                    id: `intro-${nodeIndex}`,
                    title: nodeTitle,
                    reference: `${title}, Introduction`,
                    level: 0,
                    type: 'introduction',
                    isCollapsible: false,
                    isExpanded: false,
                    children: []
                });
            }
            // Handle main content sections (Torah teachings)
            else if (node.default || (node.depth >= 2 && node.sectionNames)) {
                const sectionItem: TOCItem = {
                    id: `section-${nodeIndex}`,
                    title: nodeTitle || 'Torah Teachings',
                    reference: '',
                    level: 0,
                    type: 'section',
                    isCollapsible: true,
                    isExpanded: false,
                    children: []
                };

                // For Torah sections, show structure info
                if (node.sectionNames && node.sectionNames.includes('Torah')) {
                    sectionItem.chapterRange = `286 ${node.sectionNames[0]}s`;

                    // Add all Torah teachings as children (no see-more logic)
                    for (let i = 1; i <= 286; i++) {
                        sectionItem.children.push({
                            id: `torah-${i}`,
                            title: `${node.sectionNames[0]} ${i}`,
                            reference: `${title}.${i}`,
                            level: 1,
                            type: 'chapter',
                            isCollapsible: false,
                            isExpanded: false,
                            children: []
                        });
                    }
                }

                items.push(sectionItem);
            }
            // Handle Part II and other sections
            else if (node.title) {
                items.push({
                    id: `section-${nodeIndex}`,
                    title: node.title,
                    reference: node.wholeRef || `${title}, ${node.title}`,
                    level: 0,
                    type: 'section',
                    isCollapsible: false,
                    isExpanded: false,
                    children: [],
                    chapterRange: node.title.includes('Part II') ? 'Torah teachings 1-125' : undefined
                });
            }
        }
    });

    return items;
};

/**
 * Generates TOC for simple texts (like Sichot HaRan)
 */
const generateSimpleTOC = (indexData: any): TOCItem[] => {
    const items: TOCItem[] = [];
    const title = indexData.title || '';
    const schema = indexData.schema;

    if (process.env.NODE_ENV !== 'production') console.log('Generating Simple TOC for:', title);

    // For simple texts, create chapter-based structure
    if (schema.sectionNames && schema.sectionNames[0]) {
        const sectionName = schema.sectionNames[0]; // e.g., "Chapter"

        // Create a main section that can be expanded to show chapters
        const mainSection: TOCItem = {
            id: 'main-content',
            title: `All ${sectionName}s`,
            reference: '',
            level: 0,
            type: 'section',
            isCollapsible: true,
            isExpanded: false,
            children: [],
            chapterRange: `${sectionName}s 1-307` // Sichot HaRan has 307 chapters
        };

        // Add all chapters as children (no see-more logic)
        for (let i = 1; i <= 307; i++) {
            mainSection.children.push({
                id: `chapter-${i}`,
                title: `${sectionName} ${i}`,
                reference: `${title}.${i}`,
                level: 1,
                type: 'chapter',
                isCollapsible: false,
                isExpanded: false,
                children: []
            });
        }

        items.push(mainSection);
    }

    return items;
};

/**
 * Main function to generate hierarchical table of contents
 * Handles different text structures for all 9 Breslov texts
 */
const generateHierarchicalTOC = (indexData: any): TOCItem[] => {
    const title = indexData?.title || '';

    if (process.env.NODE_ENV !== 'production') {
      console.log('Processing index data for:', title);
      console.log('Has alts.Topic:', !!indexData?.alts?.Topic);
      console.log('Schema type:', indexData?.schema?.nodeType);
      console.log('Schema nodes count:', indexData?.schema?.nodes?.length || 0);
    }

    // Handle Likutei Halakhot specifically (complex Shulchan Arukh structure)
    if (title === 'Likutei Halakhot' || title === 'Likutei_Halakhot') {
        if (process.env.NODE_ENV !== 'production') console.log('Using Likutei Halakhot specific structure for:', title);
        return generateLikuteiHalakhotTOC(indexData);
    }

    // Handle texts with Topic structure (like Chayei Moharan)
    if (indexData?.alts?.Topic?.nodes) {
        if (process.env.NODE_ENV !== 'production') console.log('Using Topic structure for:', title);
        return generateTopicBasedTOC(indexData);
    }

    // Handle texts with schema nodes (like Likutei Moharan, Likutei Tefilot, etc.)
    if (indexData?.schema?.nodes && Array.isArray(indexData.schema.nodes)) {
        if (process.env.NODE_ENV !== 'production') console.log('Using schema nodes structure for:', title);
        return generateSchemaBasedTOC(indexData);
    }

    // Handle simple texts (like Sichot HaRan, Shivchei HaRan)
    if (indexData?.schema?.nodeType === 'JaggedArrayNode') {
        if (process.env.NODE_ENV !== 'production') console.log('Using simple JaggedArrayNode structure for:', title);
        return generateSimpleTOC(indexData);
    }

    if (process.env.NODE_ENV !== 'production') console.log('No recognized structure for:', title, 'returning empty TOC');
    return [];
};

// Debounce utility
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  } as T;
}

// Add pagination constants
const SEE_MORE_PAGE_SIZE = 20;

// Helper to chunk an array into rows for grid display
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function EnhancedTableOfContents({ bookTitle, onSectionPress, themeColors }: EnhancedTableOfContentsProps) {
    const [tocItems, setTocItems] = useState<TOCItem[]>([]);
    const { colors: themeContextColors, isDark } = useTheme();
    const [retryKey, setRetryKey] = useState(0);

    // Use theme colors from props, theme context, or fallback to default colors
    const colors = themeColors || {
        background: themeContextColors.systemGroupedBackground,
        cardBackground: themeContextColors.secondarySystemGroupedBackground,
        text: themeContextColors.label,
        secondaryText: themeContextColors.secondaryLabel,
        border: themeContextColors.separator,
        accent: themeContextColors.primary,
    };

    // Create dynamic styles that respond to theme changes
    const dynamicStyles = StyleSheet.create({
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: Spacing.screenPadding,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            alignItems: 'center',
            maxWidth: 300,
        },
        loadingText: {
            ...Typography.headline,
            color: colors.text,
            marginTop: Spacing.md,
            textAlign: 'center',
        },
        loadingSubtext: {
            ...Typography.subheadline,
            color: colors.secondaryText,
            marginTop: Spacing.xs,
            textAlign: 'center',
        },
        errorContainer: {
            alignItems: 'center',
            maxWidth: 300,
        },
        errorText: {
            ...Typography.title3,
            color: themeContextColors.error,
            textAlign: 'center',
            marginBottom: Spacing.md,
        },
        errorDetails: {
            ...Typography.body,
            color: colors.secondaryText,
            textAlign: 'center',
            lineHeight: 24,
        },
        scrollContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        contentContainer: {
            paddingHorizontal: Spacing.screenPadding,
            paddingBottom: Spacing.xl,
        },
        tocItem: {
            backgroundColor: colors.cardBackground,
            borderRadius: BorderRadius.card,
            marginBottom: Spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: 'transparent',
            overflow: 'hidden',
        },
        tocMainItem: {
            // No extra shadow for minimalist look
        },
        tocSubItem: {
            // Remove marginLeft for even alignment
            backgroundColor: colors.cardBackground,
        },
        tocChapterItem: {
            // Remove marginLeft for even alignment
            backgroundColor: colors.cardBackground,
        },
        tocIntroItem: {
            borderLeftWidth: 2,
            borderLeftColor: typeof colors.accent === 'string' ? colors.accent + '4D' : colors.accent, // 0.3 opacity if hex, fallback otherwise
        },
        tocPartItem: {
            borderLeftWidth: 2,
            borderLeftColor: typeof colors.accent === 'string' ? colors.accent + '4D' : colors.accent, // 0.3 opacity if hex, fallback otherwise
        },
        tocSeeMoreItem: {
            backgroundColor: isDark ? themeContextColors.tertiarySystemBackground : themeContextColors.systemFill,
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: colors.border,
        },
        tocItemContent: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: Spacing.xl,
            paddingHorizontal: Spacing.xl,
        },
        expandIconContainer: {
            width: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: Spacing.sm,
        },
        expandIconContainerMain: {
            backgroundColor: colors.accent,
            borderRadius: 12,
        },
        expandIconContainerSub: {
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
        },
        expandIcon: {
            fontSize: 12,
            color: colors.accent,
            fontWeight: '600',
        },
        expandIconMain: {
            color: isDark ? themeContextColors.black : themeContextColors.white,
        },
        expandIconSub: {
            color: colors.secondaryText,
        },
        tocTextContainer: {
            flex: 1,
        },
        tocItemText: {
            ...Typography.body,
            color: colors.text,
            fontWeight: '500',
        },
        tocMainItemText: {
            ...Typography.headline,
            fontWeight: '600',
            color: colors.text,
        },
        tocSubItemText: {
            ...Typography.callout,
            fontWeight: '600',
            color: colors.text,
        },
        tocChapterItemText: {
            ...Typography.subheadline,
            fontWeight: '600',
            color: colors.text,
        },
        tocSeeMoreText: {
            ...Typography.subheadline,
            color: colors.accent,
            fontWeight: '500',
        },
        chapterRangeContainer: {
            marginTop: Spacing.xs,
        },
        chapterRange: {
            ...Typography.caption1,
            color: colors.secondaryText,
        },
        navigateIconContainer: {
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: Spacing.sm,
        },
        navigateIcon: {
            fontSize: 16,
            color: colors.accent,
            fontWeight: '600',
        },
        childrenContainer: {
            backgroundColor: colors.background,
            paddingTop: Spacing.sm,
            paddingBottom: Spacing.sm,
            paddingHorizontal: Spacing.md,
        },
    });

    const { data: indexData, isLoading, error } = useQuery({
        queryKey: ['sefaria-enhanced-index', bookTitle, retryKey],
        queryFn: () => fetchSefariaIndex(bookTitle),
        enabled: !!bookTitle,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
            if (error?.message?.includes('404')) return false;
            return failureCount < 2;
        },
    });

    useEffect(() => {
        if (indexData) {
            const hierarchicalTOC = generateHierarchicalTOC(indexData);
            setTocItems(hierarchicalTOC);
        }
    }, [indexData]);

    // Update toggleExpansion to only handle regular expansion/collapse
    const _toggleExpansion = (itemId: string) => {
        setTocItems(prevItems => {
            const updateItem = (items: TOCItem[]): TOCItem[] => {
                return items.map(item => {
                    if (item.id === itemId) {
                        return { ...item, isExpanded: !item.isExpanded };
                    }
                    if (item.children.length > 0) {
                        return { ...item, children: updateItem(item.children) };
                    }
                    return item;
                });
            };
            return updateItem(prevItems);
        });
    };
    // Debounced version
    const toggleExpansion = debounce(_toggleExpansion, 200);

    const handleSectionPress = (item: TOCItem) => {
        if (item.isCollapsible) {
            toggleExpansion(item.id);
        } else if (item.reference) {
            if (onSectionPress) {
                onSectionPress(item.reference);
            } else {
                const encodedRef = encodeURIComponent(item.reference);
                router.push(`/text/${encodedRef}`);
            }
        }
    };

    // Update renderTOCItem to support grid layout for chapters/sections
    const renderTOCItem = (item: TOCItem) => {
        const hasChildren = item.children.length > 0;
        const isExpanded = item.isExpanded;
        const canNavigate = !!item.reference;

        // Show grid if all children are chapters, there are more than 5, and all titles are numbers or end with a number, and average title length is short
        const gridTitlePattern = /\d+$/;
        const avgTitleLength = hasChildren ? item.children.reduce((sum, child) => sum + child.title.length, 0) / item.children.length : 0;
        const isGridSection = hasChildren && isExpanded && item.children.length > 5 && item.children.every(child => child.type === 'chapter' && ( /^\d+$/.test(child.title) || gridTitlePattern.test(child.title) )) && avgTitleLength <= 12;

        // Helper to extract just the number for grid display (fallback to title if not found)
        const getGridNumber = (title: string) => {
          const match = title.match(/(\d+)$/);
          return match ? match[1] : title;
        };

        return (
            <View key={item.id}>
                <TouchableOpacity
                    style={[
                        dynamicStyles.tocItem,
                        item.level === 0 && dynamicStyles.tocMainItem,
                        item.level === 1 && dynamicStyles.tocSubItem,
                        item.level === 2 && dynamicStyles.tocChapterItem,
                        item.type === 'introduction' && dynamicStyles.tocIntroItem,
                        item.type === 'part' && dynamicStyles.tocPartItem,
                        // see-more removed
                    ]}
                    onPress={() => handleSectionPress(item)}
                    activeOpacity={0.6}
                    accessibilityLabel={item.title}
                    accessibilityRole="button"
                    accessibilityHint={item.isCollapsible ? (item.isExpanded ? 'Collapse section' : 'Expand section') : 'Navigate to section'}
                >
                    <View style={dynamicStyles.tocItemContent}>
                        {hasChildren && (
                            <View style={[
                                dynamicStyles.expandIconContainer,
                                item.level === 0 && dynamicStyles.expandIconContainerMain,
                                item.level === 1 && dynamicStyles.expandIconContainerSub
                            ]}>
                                <Feather
                                    name={isExpanded ? "chevron-down" : "chevron-right"}
                                    size={14}
                                    color={item.level === 0 ? (isDark ? themeContextColors.black : themeContextColors.white) : colors.secondaryText}
                                />
                            </View>
                        )}

                        <View style={dynamicStyles.tocTextContainer}>
                            <Text style={[
                                dynamicStyles.tocItemText,
                                { color: colors.text },
                                item.level === 0 && dynamicStyles.tocMainItemText,
                                item.level === 1 && dynamicStyles.tocSubItemText,
                                item.level === 2 && dynamicStyles.tocChapterItemText,
                                // see-more removed
                            ]}>
                                {item.title}
                            </Text>

                            {item.chapterRange && (
                                <View style={dynamicStyles.chapterRangeContainer}>
                                    <Text style={dynamicStyles.chapterRange}>
                                        {item.chapterRange}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {canNavigate && !hasChildren && (
                            <View style={dynamicStyles.navigateIconContainer}>
                                <Feather name="chevron-right" size={16} color={colors.secondaryText} />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {isExpanded && hasChildren && (
                    <View style={dynamicStyles.childrenContainer}>
                        {isGridSection ? (
                            chunkArray(item.children, 6).map((row, rowIdx) => (
                                <View key={rowIdx} style={{ flexDirection: 'row', marginBottom: 8 }}>
                                    {row.map(child => (
                                        <Pressable
                                            key={child.id}
                                            style={({ pressed }) => ({
                                                flex: 1,
                                                marginHorizontal: 2,
                                                minHeight: 44,
                                                backgroundColor: pressed ? Colors.primaryLight : colors.cardBackground,
                                                borderRadius: BorderRadius.md,
                                                borderWidth: 1,
                                                borderColor: pressed ? Colors.primary : colors.border,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                shadowColor: pressed ? Colors.primary : 'transparent',
                                                shadowOffset: { width: 0, height: pressed ? 2 : 0 },
                                                shadowOpacity: pressed ? 0.12 : 0,
                                                shadowRadius: pressed ? 4 : 0,
                                                elevation: pressed ? 2 : 0,
                                            })}
                                            onPress={() => handleSectionPress(child)}
                                            accessibilityLabel={`Go to ${item.title} ${child.title}`}
                                            accessibilityRole="button"
                                        >
                                            <Text style={{
                                                ...Typography.body,
                                                color: Colors.primary,
                                                fontWeight: '600',
                                            }}>{getGridNumber(child.title)}</Text>
                                        </Pressable>
                                    ))}
                                    {/* Fill out the row if not enough columns */}
                                    {row.length < 6 && Array.from({ length: 6 - row.length }).map((_, i) => (
                                        <View key={`empty-${i}`} style={{ flex: 1, marginHorizontal: 2 }} />
                                    ))}
                                </View>
                            ))
                        ) : (
                            item.children.map(renderTOCItem)
                        )}
                        {/* See More pagination removed: all children shown in grid */}
                    </View>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={dynamicStyles.centerContainer}>
                <View style={dynamicStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={dynamicStyles.loadingText}>Loading table of contents...</Text>
                    <Text style={dynamicStyles.loadingSubtext}>Organizing your study materials</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={dynamicStyles.centerContainer}>
                <ErrorMessage
                    title="Unable to Load Contents"
                    message={error instanceof Error ? error.message : 'Please check your connection and try again'}
                    onRetry={() => setRetryKey(k => k + 1)}
                />
            </View>
        );
    }

    if (tocItems.length === 0) {
        return (
            <View style={dynamicStyles.centerContainer}>
                <View style={dynamicStyles.errorContainer}>
                    <Text style={dynamicStyles.errorText}>No Contents Available</Text>
                    <Text style={dynamicStyles.errorDetails}>
                        This text may not have a structured table of contents yet.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={dynamicStyles.contentContainer}>
                {tocItems.map(renderTOCItem)}
            </View>
        </ScrollView>
    );
}


