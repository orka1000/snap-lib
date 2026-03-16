export interface Review {
  author: string;
  source: string;
  text: string;
  type: 'reader' | 'press';
  rating?: number;
  url?: string;
}

export interface Video {
  title: string;
  channel: string;
  url: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  summary?: string;
  description?: string;
  publishedYear?: number;
  pageCount?: number;
  publisher?: string;
  themes?: string[];
  
  // World-class summary fields
  threeSentenceSummary?: string;
  targetAudience?: string;
  keyTakeaways?: { title: string; description: string }[];
  actionableAdvice?: string;
  notableQuote?: string;
  
  // Comprehensive Guide
  comprehensiveGuide?: string;

  // Community & Media
  reviews?: Review[];
  videos?: Video[];

  imageUrl: string;
  coverImageUrl?: string;
  addedAt: number;
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ProcessingTask {
  id: string;
  imageUrl: string;
  status: ProcessingStatus;
  error?: string;
  book?: Book;
}
