import React from 'react';
import { Book } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Markdown from 'react-markdown';

interface ComprehensiveGuideViewProps {
  book: Book;
  onClose: () => void;
}

export function ComprehensiveGuideView({ book, onClose }: ComprehensiveGuideViewProps) {
  if (!book.comprehensiveGuide) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-zinc-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 py-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center px-4">
          <h2 className="text-sm font-bold text-zinc-900 truncate">{book.title}</h2>
          <p className="text-xs text-zinc-500 truncate">Comprehensive Guide</p>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 mb-4 font-serif">
            Comprehensive Guide
          </h1>
          <p className="text-xl text-zinc-500 font-medium">
            {book.title} by {book.author}
          </p>
        </div>

        <div className="prose prose-zinc prose-lg mx-auto prose-headings:font-serif prose-headings:text-zinc-900 prose-a:text-orange-600 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-zinc-700">
          <Markdown>{book.comprehensiveGuide}</Markdown>
        </div>
      </div>
    </motion.div>
  );
}
