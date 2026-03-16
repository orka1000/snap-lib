import React, { useState, useEffect, useCallback } from 'react';
import { Book, ProcessingTask } from './types';
import { CameraView } from './components/CameraView';
import { LibraryView } from './components/LibraryView';
import { BookProfileView } from './components/BookProfileView';
import { extractBookDetails, generateComprehensiveGuide, fetchReviewsAndVideos } from './services/gemini';
import { fetchBookCover } from './services/books';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [tasks, setTasks] = useState<ProcessingTask[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Load books from local storage on mount
  useEffect(() => {
    const storedBooks = localStorage.getItem('snaplib_books');
    if (storedBooks) {
      try {
        setBooks(JSON.parse(storedBooks));
      } catch (e) {
        console.error('Failed to parse stored books', e);
      }
    }
  }, []);

  // Save books to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('snaplib_books', JSON.stringify(books));
  }, [books]);

  const handleCapture = useCallback((imageSrc: string) => {
    const taskId = uuidv4();
    const newTask: ProcessingTask = {
      id: taskId,
      imageUrl: imageSrc,
      status: 'pending',
    };

    setTasks((prev) => [...prev, newTask]);
    setIsScannerOpen(false);

    // Process the image asynchronously
    processImage(newTask);
  }, []);

  const processImage = async (task: ProcessingTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'processing' } : t))
    );

    try {
      const details = await extractBookDetails(task.imageUrl);
      
      // Fetch high-quality cover from Google Books API
      const coverImageUrl = await fetchBookCover(details.title || '', details.author || '');
      
      const newBook: Book = {
        id: uuidv4(),
        title: details.title || 'Unknown Title',
        author: details.author || 'Unknown Author',
        genre: details.genre,
        summary: details.summary,
        description: details.description,
        publishedYear: details.publishedYear,
        pageCount: details.pageCount,
        publisher: details.publisher,
        themes: details.themes,
        threeSentenceSummary: details.threeSentenceSummary,
        targetAudience: details.targetAudience,
        keyTakeaways: details.keyTakeaways,
        actionableAdvice: details.actionableAdvice,
        notableQuote: details.notableQuote,
        imageUrl: task.imageUrl,
        coverImageUrl: coverImageUrl || undefined,
        addedAt: Date.now(),
      };

      setBooks((prev) => [newBook, ...prev]);
      
      // Remove task after success
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error('Processing failed:', error);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: 'failed', error: String(error) }
            : t
        )
      );
      
      // Remove failed task after a delay
      setTimeout(() => {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      }, 5000);
    }
  };

  const handleRemoveBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBookId === id) {
      setSelectedBookId(null);
    }
  }, [selectedBookId]);

  const handleGenerateGuide = async (id: string) => {
    const book = books.find(b => b.id === id);
    if (!book) return;

    try {
      const guideText = await generateComprehensiveGuide(book.title, book.author);
      setBooks(prev => prev.map(b => b.id === id ? { ...b, comprehensiveGuide: guideText } : b));
    } catch (error) {
      console.error('Failed to generate comprehensive guide:', error);
      throw error;
    }
  };

  const handleFetchReviewsAndVideos = async (id: string) => {
    const book = books.find(b => b.id === id);
    if (!book) return;

    try {
      const { reviews, videos } = await fetchReviewsAndVideos(book.title, book.author);
      setBooks(prev => prev.map(b => b.id === id ? { ...b, reviews, videos } : b));
    } catch (error) {
      console.error('Failed to fetch reviews and videos:', error);
      throw error;
    }
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <LibraryView
        books={books}
        tasks={tasks}
        onOpenScanner={() => setIsScannerOpen(true)}
        onRemoveBook={handleRemoveBook}
        onSelectBook={setSelectedBookId}
      />

      <AnimatePresence>
        {isScannerOpen && (
          <CameraView
            onCapture={handleCapture}
            onClose={() => setIsScannerOpen(false)}
          />
        )}
        {selectedBook && (
          <BookProfileView
            book={selectedBook}
            onClose={() => setSelectedBookId(null)}
            onRemoveBook={handleRemoveBook}
            onGenerateGuide={handleGenerateGuide}
            onFetchReviewsAndVideos={handleFetchReviewsAndVideos}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
