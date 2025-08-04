/**
 * Text Navigation Service
 * Provides navigation functionality for Breslov texts
 * Based on Sefaria API documentation from .kiro/knowledge-base/sefaria-api/
 */

export interface NavigationInfo {
  current: string;
  next: string | null;
  previous: string | null;
  hasNext: boolean;
  hasPrevious: boolean;
  nextTitle?: string;
  previousTitle?: string;
}

export interface TextStructure {
  title: string;
  totalChapters?: number;
  totalSections?: number;
  currentChapter?: number;
  currentSection?: number;
  currentSubsection?: number;
}

/**
 * Parses a text reference to extract structure information
 * Handles various Breslov text reference formats
 */
export const parseTextReference = (ref: string): TextStructure => {
  if (!ref) return { title: '' };

  // Handle different reference formats
  const parts = ref.split('.');
  const title = parts[0];
  
  // Remove complex title parts (everything after comma)
  const cleanTitle = title.split(',')[0];
  
  const structure: TextStructure = {
    title: cleanTitle
  };

  if (parts.length >= 2) {
    structure.currentChapter = parseInt(parts[1], 10);
  }
  
  if (parts.length >= 3) {
    structure.currentSection = parseInt(parts[2], 10);
  }
  
  if (parts.length >= 4) {
    structure.currentSubsection = parseInt(parts[3], 10);
  }

  return structure;
};

/**
 * Generates next reference based on current reference and text structure
 * Uses Sefaria API shape data to determine valid next references
 */
export const generateNextReference = async (currentRef: string): Promise<string | null> => {
  try {
    const structure = parseTextReference(currentRef);
    const parts = currentRef.split('.');
    
    if (parts.length === 1) {
      // Book level - go to first chapter
      return `${currentRef}.1`;
    }
    
    if (parts.length === 2) {
      // Chapter level - try next chapter or first section
      const chapterNum = parseInt(parts[1], 10);
      
      // First try to go to first section of current chapter
      const sectionRef = `${currentRef}.1`;
      if (await isValidReference(sectionRef)) {
        return sectionRef;
      }
      
      // Otherwise try next chapter
      const nextChapterRef = `${parts[0]}.${chapterNum + 1}`;
      if (await isValidReference(nextChapterRef)) {
        return nextChapterRef;
      }
    }
    
    if (parts.length === 3) {
      // Section level - try next section or next chapter
      const chapterNum = parseInt(parts[1], 10);
      const sectionNum = parseInt(parts[2], 10);
      
      // Try next section in same chapter
      const nextSectionRef = `${parts[0]}.${chapterNum}.${sectionNum + 1}`;
      if (await isValidReference(nextSectionRef)) {
        return nextSectionRef;
      }
      
      // Try first section of next chapter
      const nextChapterRef = `${parts[0]}.${chapterNum + 1}.1`;
      if (await isValidReference(nextChapterRef)) {
        return nextChapterRef;
      }
      
      // Try next chapter without section
      const nextChapterOnlyRef = `${parts[0]}.${chapterNum + 1}`;
      if (await isValidReference(nextChapterOnlyRef)) {
        return nextChapterOnlyRef;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating next reference:', error);
    return null;
  }
};

/**
 * Generates previous reference based on current reference
 */
export const generatePreviousReference = async (currentRef: string): Promise<string | null> => {
  try {
    const parts = currentRef.split('.');
    
    if (parts.length === 1) {
      // Book level - no previous
      return null;
    }
    
    if (parts.length === 2) {
      // Chapter level - try previous chapter
      const chapterNum = parseInt(parts[1], 10);
      
      if (chapterNum <= 1) {
        return null; // No previous chapter
      }
      
      const prevChapterRef = `${parts[0]}.${chapterNum - 1}`;
      if (await isValidReference(prevChapterRef)) {
        return prevChapterRef;
      }
    }
    
    if (parts.length === 3) {
      // Section level - try previous section or previous chapter
      const chapterNum = parseInt(parts[1], 10);
      const sectionNum = parseInt(parts[2], 10);
      
      if (sectionNum > 1) {
        // Try previous section in same chapter
        const prevSectionRef = `${parts[0]}.${chapterNum}.${sectionNum - 1}`;
        if (await isValidReference(prevSectionRef)) {
          return prevSectionRef;
        }
      }
      
      if (chapterNum > 1) {
        // Try previous chapter
        const prevChapterRef = `${parts[0]}.${chapterNum - 1}`;
        if (await isValidReference(prevChapterRef)) {
          return prevChapterRef;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating previous reference:', error);
    return null;
  }
};

/**
 * Checks if a reference is valid by making a quick API call
 * Uses HEAD request or lightweight GET to minimize data transfer
 */
export const isValidReference = async (ref: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://www.sefaria.org/api/texts/${ref}`, {
      method: 'HEAD'
    });
    
    // If HEAD is not supported, try a quick GET
    if (response.status === 405) {
      const getResponse = await fetch(`https://www.sefaria.org/api/texts/${ref}`);
      return getResponse.ok && !getResponse.url.includes('error');
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error validating reference:', error);
    return false;
  }
};

/**
 * Gets comprehensive navigation information for a text reference
 */
export const getNavigationInfo = async (currentRef: string): Promise<NavigationInfo> => {
  const [next, previous] = await Promise.all([
    generateNextReference(currentRef),
    generatePreviousReference(currentRef)
  ]);

  return {
    current: currentRef,
    next,
    previous,
    hasNext: next !== null,
    hasPrevious: previous !== null,
    nextTitle: next ? formatReferenceForDisplay(next) : undefined,
    previousTitle: previous ? formatReferenceForDisplay(previous) : undefined
  };
};

/**
 * Gets text structure information from Sefaria API
 * Uses shape endpoint to get comprehensive structure data
 */
export const getTextStructureInfo = async (title: string): Promise<TextStructure | null> => {
  try {
    const response = await fetch(`https://www.sefaria.org/api/shape/${title}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    const bookData = data[0];
    const structure: TextStructure = {
      title
    };
    
    if (bookData.chapters && Array.isArray(bookData.chapters)) {
      structure.totalChapters = bookData.chapters.length;
      
      // Calculate total sections across all chapters
      structure.totalSections = bookData.chapters.reduce((total: number, chapter: any) => {
        return total + (Array.isArray(chapter) ? chapter.length : 0);
      }, 0);
    }
    
    return structure;
  } catch (error) {
    console.error('Error fetching text structure:', error);
    return null;
  }
};

/**
 * Formats a reference for display
 * Converts API format to human-readable format
 */
export const formatReferenceForDisplay = (ref: string): string => {
  if (!ref) return '';
  
  const parts = ref.split('.');
  const title = parts[0].replace(/_/g, ' ');
  
  if (parts.length === 1) {
    return title;
  }
  
  if (parts.length === 2) {
    return `${title} ${parts[1]}`;
  }
  
  if (parts.length === 3) {
    return `${title} ${parts[1]}:${parts[2]}`;
  }
  
  return ref.replace(/\./g, ':').replace(/_/g, ' ');
};

/**
 * Converts human-readable reference to API format
 * Handles various Sefaria reference formats properly
 */
export const formatReferenceForAPI = (ref: string): string => {
  if (!ref) return '';
  
  let apiRef = ref;
  
  // Handle the main title and section separation
  // Examples: "Likutei Moharan 1:2" -> "Likutei_Moharan.1.2"
  const match = apiRef.match(/^(.+?)\s+(\d+(?::\d+)*)$/);
  
  if (match) {
    const title = match[1].replace(/\s+/g, '_');
    const sections = match[2].replace(/:/g, '.');
    apiRef = `${title}.${sections}`;
  } else {
    // Fallback: replace spaces with underscores and colons with dots
    apiRef = apiRef
      .replace(/\s+/g, '_')
      .replace(/:/g, '.');
  }
  
  return apiRef;
};