export interface SefariaTextResponse {
  ref: string;
  heRef: string;
  text: string[];
  he: string[];
  book: string;
  categories: string[];
  versions: Array<{
    versionTitle: string;
    language: string;
    versionSource: string;
  }>;
  next?: string;
  prev?: string;
}

export interface Bookmark {
  id: string;
  textTitle: string;
  reference: string;
  passage: string;
  dateCreated: Date;
}

export interface TOCItem {
  title: string;
  reference: string;
}