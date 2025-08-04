export interface BreslovText {
  id: string;
  title: string;
  apiReference: string;
  sampleReference: string; // Tested working reference from knowledge base
  isComplex: boolean; // Whether this text requires specific section references
  languages: string[]; // Available languages, e.g., ['en', 'he']
}

// Based on tested API results from .kiro/knowledge-base/sefaria-api/breslov-texts-testing-results.md
export const BRESLOV_TEXTS: BreslovText[] = [
  { 
    id: 'chayei-moharan', 
    title: 'Chayei Moharan', 
    apiReference: 'Chayei_Moharan.1.1',
    sampleReference: 'Chayei Moharan 1:1',
    isComplex: true,
    languages: ['en', 'he']
  },
  { 
    id: 'likkutei-etzot', 
    title: 'Likkutei Etzot', 
    apiReference: 'Likkutei_Etzot,_Truth_and_Faith',
    sampleReference: 'Likkutei Etzot, Truth and Faith',
    isComplex: true,
    languages: ['en', 'he']
  },
  { 
    id: 'likutei-halakhot', 
    title: 'Likutei Halakhot', 
    apiReference: 'Likutei_Halakhot,_Orach_Chaim,_Laws_of_Morning_Conduct.1.1',
    sampleReference: 'Likutei Halakhot, Orach Chaim, Laws of Morning Conduct 1:1',
    isComplex: true,
    languages: ['en', 'he']
  },
  { 
    id: 'likutei-moharan', 
    title: 'Likutei Moharan', 
    apiReference: 'Likutei_Moharan.1.1',
    sampleReference: 'Likutei Moharan 1:1',
    isComplex: true,
    languages: ['en', 'he']
  },
  { 
    id: 'likutei-tefilot', 
    title: 'Likutei Tefilot', 
    apiReference: 'Likutei_Tefilot,_Volume_I.1.1',
    sampleReference: 'Likutei Tefilot, Volume I 1:1',
    isComplex: true,
    languages: ['en', 'he']
  },
  { 
    id: 'sefer-hamiddot', 
    title: 'Sefer HaMiddot', 
    apiReference: 'Sefer_HaMiddot,_Truth,_Part_I.1',
    sampleReference: 'Sefer HaMiddot, Truth, Part I 1',
    isComplex: true,
    languages: ['en', 'he']
  },
  { 
    id: 'shivchei-haran', 
    title: 'Shivchei HaRan', 
    apiReference: 'Shivchei_HaRan.1',
    sampleReference: 'Shivchei HaRan 1',
    isComplex: false,
    languages: ['en', 'he']
  },
  { 
    id: 'sichot-haran', 
    title: 'Sichot HaRan', 
    apiReference: 'Sichot_HaRan.1',
    sampleReference: 'Sichot HaRan 1',
    isComplex: false,
    languages: ['en', 'he']
  },
  { 
    id: 'sippurei-maasiyot', 
    title: 'Sippurei Maasiyot', 
    apiReference: 'Sippurei_Maasiyot.1.1',
    sampleReference: 'Sippurei Maasiyot 1:1',
    isComplex: true,
    languages: ['en', 'he']
  },
];